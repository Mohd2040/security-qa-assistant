// app/api/admin/qa/match-answers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import * as XLSX from "xlsx";
import { normalizeArabic, looksArabic } from "@/lib/arabic";
import { logEmbeddingCacheStats } from "@/lib/embeddings";
import { getBatchEmbeddings } from "@/lib/batch-embeddings";
import { generateAnswer } from "@/lib/ai";
import { checkRateLimit, getClientIdentifier, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limiter";

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
    decision_required: boolean;
    recommendation: string;
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
 * Upload Excel with questions → Find similar questions in DB using Atlas Vector Search → Return Excel with matched answers
 */
export async function POST(req: NextRequest) {
    try {
        // ✅ SECURITY: Check Rate Limit (5 requests/hour)
        const clientId = getClientIdentifier(req);
        const rateLimit = checkRateLimit(clientId, RATE_LIMITS.match);

        if (!rateLimit.allowed) {
            return rateLimitResponse(rateLimit.resetTime);
        }

        // Log rate limit info in response headers
        const headers = {
            'X-RateLimit-Limit': RATE_LIMITS.match.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        };

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

        console.log(`[Match API] Processing ${questions.length} questions using Atlas Vector Search`);

        // Connect to database
        const db = await getDb();
        const collection = db.collection("qa_entries");

        // ✅ PHASE 2: Batch generate embeddings for ALL questions at once
        console.log(`[Match API] Generating embeddings for ${questions.length} questions...`);
        const startTime = Date.now();
        const questionEmbeddings = await getBatchEmbeddings(questions);
        const embeddingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Match API] Embeddings generated in ${embeddingTime}s`);

        const matches: MatchedAnswer[] = [];
        let highMatches = 0;
        let mediumMatches = 0;
        let lowMatches = 0;
        let noMatches = 0;

        // Process each question using Atlas Vector Search
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const questionEmbedding = questionEmbeddings[i];

            let bestMatch: any = null;
            let bestScore = 0;

            const trimmedQuestion = question.trim();

            // 1. Try exact match first (fastest)
            const exactMatch = await collection.findOne({
                $or: [
                    { question_text: trimmedQuestion },
                    { question_text_en: trimmedQuestion }
                ]
            });

            if (exactMatch) {
                bestMatch = exactMatch;
                bestScore = 1.0;
                console.log(`[Match] "${trimmedQuestion.substring(0, 50)}..." → Exact match found`);
            } else if (questionEmbedding && questionEmbedding.length > 0) {
                // 2. Use Atlas Vector Search for semantic matching
                try {
                    const vectorResults = await collection.aggregate([
                        {
                            $vectorSearch: {
                                index: "vector_index",
                                path: "embedding",
                                queryVector: questionEmbedding,
                                numCandidates: 100,
                                limit: 10
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                question_text: 1,
                                question_text_en: 1,
                                answer_text: 1,
                                status: 1,
                                domain: 1,
                                created_at: 1,
                                updated_at: 1,
                                score: { $meta: "vectorSearchScore" }
                            }
                        }
                    ]).toArray();

                    if (vectorResults.length > 0) {
                        bestMatch = vectorResults[0];
                        // Normalize vector search score (0-1 range)
                        bestScore = Math.min(1.0, Math.max(0, bestMatch.score));

                        console.log(`[Match] "${trimmedQuestion.substring(0, 50)}..." → Vector match: ${(bestScore * 100).toFixed(0)}%`);
                    } else {
                        console.log(`[Match] "${trimmedQuestion.substring(0, 50)}..." → No vector matches found`);
                    }
                } catch (error: any) {
                    console.error(`[Match] Vector search error for "${trimmedQuestion.substring(0, 30)}...":`, error.message);
                }
            } else {
                // 3. Fallback to text search if no embedding
                console.log(`[Match] "${trimmedQuestion.substring(0, 50)}..." → No embedding, using text search`);

                try {
                    const textResults = await collection.aggregate([
                        {
                            $search: {
                                index: "default",
                                text: {
                                    query: trimmedQuestion,
                                    path: ["question_text", "question_text_en", "answer_text"],
                                    fuzzy: { maxEdits: 1 }
                                }
                            }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $project: {
                                _id: 1,
                                question_text: 1,
                                question_text_en: 1,
                                answer_text: 1,
                                status: 1,
                                domain: 1,
                                created_at: 1,
                                updated_at: 1,
                                score: { $meta: "searchScore" }
                            }
                        }
                    ]).toArray();

                    if (textResults.length > 0) {
                        bestMatch = textResults[0];
                        // Normalize text search score (typically 1-10 range)
                        bestScore = Math.min(1.0, bestMatch.score / 10);
                    }
                } catch (error: any) {
                    console.error(`[Match] Text search error:`, error.message);
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

            // Determine if decision is required (< 60% threshold)
            const decisionRequired = bestScore < 0.6;

            // Generate recommendation based on score
            let recommendation = "";
            if (bestScore >= 0.85) {
                recommendation = "High confidence - Auto-apply recommended";
            } else if (bestScore >= 0.6) {
                recommendation = "Medium confidence - Review recommended";
            } else {
                recommendation = "Low match - Manual decision required";
            }

            // Build matched answer object
            const matchedAnswer: MatchedAnswer = {
                question_text: question,
                // Only assign status if similarity >= 60%
                status: (bestScore >= 0.6 && bestMatch)
                    ? bestMatch.status || "unknown"
                    : "NEEDS_REVIEW",
                answer_text: bestMatch ? bestMatch.answer_text || "" : "",
                source_question: bestMatch ? bestMatch.question_text || "" : "",
                source_id: bestMatch ? bestMatch._id.toString() : "",
                similarity_score: bestScore,
                domain: bestMatch ? bestMatch.domain || "application" : "application",
                ai_suggestion: aiSuggestion,
                match_confidence: matchConfidence,
                decision_required: decisionRequired,
                recommendation: recommendation,
            };

            matches.push(matchedAnswer);
        }

        // Log cache statistics for monitoring
        logEmbeddingCacheStats();

        console.log(`[Match API] Completed: ${highMatches} high, ${mediumMatches} medium, ${lowMatches} low, ${noMatches} none`);

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

        // Generate Excel output with new fields
        const outputData = matches.map((m) => ({
            question_text: m.question_text,
            status: m.status,
            decision_required: m.decision_required ? "YES - Manual Decision Required" : "NO",
            recommendation: m.recommendation,
            answer_text: m.answer_text,
            source_question: m.source_question,
            similarity_score: (m.similarity_score * 100).toFixed(0) + "%",
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
            { wch: 18 }, // status
            { wch: 30 }, // decision_required
            { wch: 45 }, // recommendation
            { wch: 40 }, // answer_text
            { wch: 40 }, // source_question
            { wch: 12 }, // similarity_score
            { wch: 15 }, // match_confidence
            { wch: 15 }, // domain
            { wch: 30 }, // ai_suggestion
            { wch: 25 }, // source_id
        ];

        // Apply cell colors based on decision_required / match_confidence
        const range = XLSX.utils.decode_range(outputSheet['!ref'] || 'A1');

        for (let rowIdx = 0; rowIdx < matches.length; rowIdx++) {
            const m = matches[rowIdx];
            const excelRow = rowIdx + 2; // +2 because row 1 is header, and rowIdx is 0-based

            // Determine color based on decision_required and match_confidence
            let fillColor = "";
            if (m.decision_required) {
                fillColor = "FFFF0000"; // Red
            } else if (m.match_confidence === "low") {
                fillColor = "FFFF9900"; // Orange
            } else if (m.match_confidence === "medium") {
                fillColor = "FFFFFF00"; // Yellow
            } else if (m.match_confidence === "high") {
                fillColor = "FF00FF00"; // Green
            }

            // Apply color to all cells in this row
            if (fillColor) {
                for (let colIdx = range.s.c; colIdx <= range.e.c; colIdx++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: excelRow - 1, c: colIdx });
                    if (!outputSheet[cellAddress]) continue;

                    outputSheet[cellAddress].s = {
                        fill: {
                            fgColor: { rgb: fillColor }
                        }
                    };
                }
            }
        }

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
