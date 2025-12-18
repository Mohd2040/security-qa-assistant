import { getDb } from "@/lib/mongodb";
import { QaEntry } from "@/lib/types";

export interface AtlasSearchParams {
  query: string;
  embedding?: number[];
  limit?: number;
  filters?: {
    status?: string;
    domain?: string;
    owner_group?: string;
  };
}

/**
 * Perform a hybrid search using MongoDB Atlas Search
 * Combines Vector Search (Semantic) and Text Search (Keyword)
 */
export async function searchAtlasHybrid(params: AtlasSearchParams) {
  const { query, embedding, limit = 20, filters } = params;

  // If no embedding is provided, fall back to text search
  if (!embedding) {
    console.log("[Atlas Hybrid] No embedding, using text search");
    return searchAtlasText(params);
  }

  const db = await getDb();
  const collection = db.collection("qa_entries");

  // 1. Vector Search Stage
  const pipeline: any[] = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: limit * 10,
        limit: limit,
      },
    },
  ];

  // 2. Filter Stage (if any)
  const matchStage: any = {};
  if (filters) {
    if (filters.status && filters.status !== "all") {
      matchStage.status = filters.status;
    }
    if (filters.domain && filters.domain !== "all") {
      matchStage.domain = filters.domain;
    }
    if (filters.owner_group && filters.owner_group !== "all") {
      matchStage.owner_group = filters.owner_group;
    }
  }

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // 3. Projection & Scoring
  pipeline.push({
    $project: {
      _id: 1,
      question_text: 1,
      question_text_en: 1,
      question_text_ar: 1, // Added
      answer_text: 1,
      status: 1,
      domain: 1,
      owner_group: 1,
      client_name: 1, // Added
      category: 1, // Added
      security_area: 1, // Added
      explanation_ar: 1, // Added
      created_at: 1,
      updated_at: 1,
      score: { $meta: "vectorSearchScore" },
    },
  });

  // 4. Limit final results
  pipeline.push({ $limit: limit });

  const results = await collection.aggregate(pipeline).toArray();

  return results.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
    score: doc.score
  }));
}

/**
 * Perform standard Text Search using Atlas Search (Lucene)
 */
export async function searchAtlasText(params: AtlasSearchParams) {
  const { query, limit = 20, filters } = params;
  const db = await getDb();
  const collection = db.collection("qa_entries");

  const compound: any = {
    should: [
      {
        text: {
          query: query,
          path: ["question_text", "question_text_en", "answer_text"],
          fuzzy: { maxEdits: 1 }
        }
      }
    ]
  };

  //Apply filters
  if (filters) {
    const filterClauses = [];
    if (filters.status && filters.status !== 'all') {
      filterClauses.push({ text: { query: filters.status, path: "status" } });
    }
    if (filters.domain && filters.domain !== 'all') {
      filterClauses.push({ text: { query: filters.domain, path: "domain" } });
    }
    if (filterClauses.length > 0) {
      compound.filter = filterClauses;
    }
  }

  const pipeline = [
    {
      $search: {
        index: "default",
        compound: compound
      }
    },
    {
      $limit: limit
    },
    {
      $project: {
        _id: 1,
        question_text: 1,
        question_text_en: 1,
        question_text_ar: 1, // Added
        answer_text: 1,
        status: 1,
        domain: 1,
        owner_group: 1,
        client_name: 1, // Added
        category: 1, // Added
        security_area: 1, // Added
        explanation_ar: 1, // Added
        created_at: 1,
        updated_at: 1,
        score: { $meta: "searchScore" }
      }
    }
  ];

  try {
    const results = await collection.aggregate(pipeline).toArray();
    console.log(`[Atlas Text] "${query}" → ${results.length} results`);

    return results.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      score: doc.score
    }));
  } catch (error) {
    console.error("[Atlas Text] Error:", error);
    throw error;
  }
}
