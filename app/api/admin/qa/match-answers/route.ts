// app/api/admin/qa/match-answers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import * as XLSX from "xlsx";
import Fuse from "fuse.js";
import { normalizeArabic, looksArabic } from "@/lib/arabic";
import { cosineSimilarity, getEmbedding } from "@/lib/embeddings";
import { generateAnswer } from "@/lib/ai";

export const runtime = "nodejs";

interface MatchedAnswer {
    question_text: string;
    status: string;
    answer_text: string;
    source_question: string;
    source_id: string;
    similarity_score: number;
    domain: string;
    ai_suggestion: string;
    match_confidence: "high" | "medium" | "low" | "none";
}

interface MatchResult {
    totalQuestions: number;
    highMatches: number;
    mediumMatches: number;
    lowMatches: number;
    noMatches: number;
    matches: MatchedAnswer[];
}

/**
 * POST /api/admin/qa/match-answers
 * 
 * Upload Excel with questions → Find similar questions in DB → Return Excel with matched answers
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const thresholdRaw = formData.get("threshold") || "0.7";
        const includeAiSuggestions = formData.get("includeAi") !== "false";
        const mode = (formData.get("mode") || "download").toString(); // preview | download

        const threshold = parseFloat(thresholdRaw.toString());

        if (!file || typeof file === "string") {
            return NextResponse.json(
                { ok: false, error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Parse Excel file
        const blob = file as Blob;
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            return NextResponse.json(
                { ok: false, error: "No sheets found in Excel file" },
                { status: 400 }
            );
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows || rows.length === 0) {
            return NextResponse.json(
                { ok: false, error: "Sheet is empty" },
                { status: 400 }
            );
        }

        // Extract questions (support various column names)
        const questions: string[] = rows.map((row) => {
            const q =
                row["question_text"] ||
                row["Question"] ||
                row["question"] ||
                row["السؤال"] ||
                row["Q"] ||
                "";
            return q.toString().trim();
        }).filter(Boolean);

        if (questions.length === 0) {
            return NextResponse.json(
                { ok: false, error: "No valid questions found in file" },
                { status: 400 }
            );
        }

        // Connect to database
        const db = await getDb();
        const collection = db.collection("qa_entries");

        // Get all existing Q&A entries
        const existingEntries = await collection.find({}).toArray();

        // Initialize Fuse.js for Fuzzy Search
        const fuseOptions = {
            includeScore: true,
            threshold: 0.45,
            keys: [
                {
                    name: "question_text",
                    getFn: (doc: any) => normalizeArabic(doc.question_text || "")
                },
                {
                    name: "question_text_en",
                    getFn: (doc: any) => normalizeArabic(doc.question_text_en || "")
                },
                {
                    name: "answer_text",
                    getFn: (doc: any) => normalizeArabic(doc.answer_text || "")
                }
            ]
        };
        const fuse = new Fuse(existingEntries, fuseOptions);

        const matches: MatchedAnswer[] = [];
        let highMatches = 0;
        let mediumMatches = 0;
        let lowMatches = 0;
        let noMatches = 0;

        // Process each question
        for (const question of questions) {
            let bestMatch: any = null;
            let bestScore = 0;

            const trimmedQuestion = question.trim();
            const isArabic = looksArabic(trimmedQuestion);
            const normalizedQuestion = isArabic ? normalizeArabic(trimmedQuestion) : trimmedQuestion;

            // 1. Exact Match (Fastest)
            const exactMatch = existingEntries.find(e =>
                (e.question_text === trimmedQuestion) ||
                (e.question_text_en === trimmedQuestion)
            );

            if (exactMatch) {
                bestMatch = exactMatch;
                bestScore = 1.0;
            } else {
                // 2. Hybrid Search (Fuzzy + Semantic)

                // A. Fuzzy Search Candidates
                // We use normalized question for better Arabic matching
                const fuseResults = fuse.search(normalizedQuestion);
                const candidates = fuseResults.slice(0, 20); // Top 20 candidates

                // B. Semantic Search (Reranking)
                let questionEmbedding: number[] | null = null;
                try {
                    questionEmbedding = await getEmbedding(trimmedQuestion);
                } catch (e) {
                    // Ignore embedding errors
                }

                for (const result of candidates) {
                    const doc = result.item;
                    const fuzzyScore = result.score != null ? (1 - result.score) : 0; // Convert distance to similarity

                    let semanticScore = 0;
                    if (questionEmbedding && doc.embedding && Array.isArray(doc.embedding)) {
                        semanticScore = cosineSimilarity(questionEmbedding, doc.embedding);
                        // Normalize to 0-1
                        semanticScore = Math.max(0, Math.min(1, (semanticScore + 1) / 2));
                    }

                    // Hybrid Score Calculation
                    // If we have semantic score, weight it higher (60%)
                    // If not, rely on fuzzy score
                    let finalScore = fuzzyScore;
                    if (semanticScore > 0) {
                        finalScore = (semanticScore * 0.6) + (fuzzyScore * 0.4);
                    }

                    if (finalScore > bestScore) {
                        bestScore = finalScore;
                        bestMatch = doc;
                    }
                }
            }

            // Determine match confidence
            let matchConfidence: "high" | "medium" | "low" | "none";
            if (bestScore >= 0.85) {
                matchConfidence = "high";
                highMatches++;
            } else if (bestScore >= threshold) {
                matchConfidence = "medium";
                mediumMatches++;
            } else if (bestScore >= 0.5) {
                matchConfidence = "low";
                lowMatches++;
            } else {
                matchConfidence = "none";
                noMatches++;
            }

            // Generate AI suggestion for low/no matches
            let aiSuggestion = "";
            if (
                includeAiSuggestions &&
                (matchConfidence === "low" || matchConfidence === "none")
            ) {
                try {
                    aiSuggestion = await generateAnswer(question);
                } catch (e) {
                    console.error("Failed to generate AI answer", e);
                }
            }

            // Build matched answer object
            const matchedAnswer: MatchedAnswer = {
                question_text: question,
                status: bestMatch ? bestMatch.status || "unknown" : "unknown",
                answer_text: bestMatch ? bestMatch.answer_text || "" : "",
                source_question: bestMatch ? bestMatch.question_text || "" : "",
                source_id: bestMatch ? bestMatch._id.toString() : "",
                similarity_score: bestScore,
                domain: bestMatch ? bestMatch.domain || "application" : "application",
                ai_suggestion: aiSuggestion,
                match_confidence: matchConfidence,
            };

            matches.push(matchedAnswer);
        }

        // IF MODE IS PREVIEW, RETURN JSON
        if (mode === "preview") {
            const result: MatchResult = {
                totalQuestions: matches.length,
                highMatches,
                mediumMatches,
                lowMatches,
                noMatches,
                matches,
            };
            return NextResponse.json({ ok: true, ...result }, { status: 200 });
        }

        // Generate Excel output
        const outputData = matches.map((m) => ({
            question_text: m.question_text,
            status: m.status,
            answer_text: m.answer_text,
            source_question: m.source_question,
            similarity_score: m.similarity_score.toFixed(2),
            match_confidence: m.match_confidence,
            domain: m.domain,
            ai_suggestion: m.ai_suggestion,
            source_id: m.source_id,
        }));

        const outputWorkbook = XLSX.utils.book_new();
        const outputSheet = XLSX.utils.json_to_sheet(outputData);

        // Set column widths for better readability
        outputSheet["!cols"] = [
            { wch: 50 }, // question_text
            { wch: 15 }, // status
            { wch: 40 }, // answer_text
            { wch: 40 }, // source_question
            { wch: 12 }, // similarity_score
            { wch: 15 }, // match_confidence
            { wch: 15 }, // domain
            { wch: 30 }, // ai_suggestion
            { wch: 25 }, // source_id
        ];

        XLSX.utils.book_append_sheet(outputWorkbook, outputSheet, "Matched Answers");

        // Convert to buffer
        const excelBuffer = XLSX.write(outputWorkbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        // Return Excel file
        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": 'attachment; filename="matched_answers.xlsx"',
            },
        });
    } catch (err: any) {
        console.error("Error in /api/admin/qa/match-answers:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
