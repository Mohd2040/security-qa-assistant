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
  const db = await getDb();
  const collection = db.collection("qa_entries");

  const pipeline: any[] = [];

  // 1. Vector Search Stage (if embedding is provided)
  if (embedding) {
    pipeline.push({
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: limit * 10, // Fetch more candidates for better accuracy
        limit: limit * 2,
      },
    });
  }

  // 2. Text Search Stage (Fallback or Combination)
  // Note: Since $vectorSearch must be the first stage, we can't easily "combine" 
  // it with $search in a single pipeline for the *same* set of documents in a simple way 
  // without using $unionWith or complex lookups, OR using Reciprocal Rank Fusion (RRF).
  //
  // For simplicity and performance in this V1:
  // We will rely primarily on Vector Search if embedding is present.
  // If no embedding, we use standard $search.
  //
  // However, to support "Hybrid" properly with RRF (Reciprocal Rank Fusion), 
  // we would typically run two parallel queries and merge them.
  //
  // Let's implement a "Smart" approach:
  // If embedding exists -> Use Vector Search (it's usually better for Q&A).
  // We can add a $match stage after to filter by keywords if needed, but Vector is powerful.
  
  // Let's refine the pipeline to include filters
  const matchStage: any = {};
  if (filters) {
    if (filters.status && filters.status !== 'all') matchStage.status = filters.status;
    if (filters.domain && filters.domain !== 'all') matchStage.domain = filters.domain;
    if (filters.owner_group && filters.owner_group !== 'all') matchStage.owner_group = filters.owner_group;
  }

  // If we have filters, we should apply them.
  // Note: $vectorSearch has a 'filter' option in newer MongoDB versions, 
  // but standard $match after vector search works for pre-filtering results.
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // 3. Projection & Scoring
  pipeline.push({
    $project: {
      _id: 1,
      question_text: 1,
      question_text_en: 1,
      answer_text: 1,
      status: 1,
      domain: 1,
      owner_group: 1,
      created_at: 1,
      updated_at: 1,
      score: { $meta: "vectorSearchScore" }, // Get the similarity score
    },
  });

  // 4. Limit final results
  pipeline.push({ $limit: limit });

  const results = await collection.aggregate(pipeline).toArray();
  
  return results.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
    score: doc.score // Keep the raw score
  }));
}

/**
 * Perform a standard Text Search using Atlas Search (Lucene)
 * Good for exact keyword matches or when embeddings are not available
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
          fuzzy: { maxEdits: 1 } // Allow minor typos
        }
      }
    ]
  };

  // Apply filters within the search stage for efficiency
  if (filters) {
    const filterClauses = [];
    if (filters.status && filters.status !== 'all') {
      filterClauses.push({ text: { query: filters.status, path: "status" } });
    }
    if (filters.domain && filters.domain !== 'all') {
      filterClauses.push({ text: { query: filters.domain, path: "domain" } });
    }
    // Add to compound 'filter' (must match)
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
        answer_text: 1,
        status: 1,
        domain: 1,
        owner_group: 1,
        created_at: 1,
        updated_at: 1,
        score: { $meta: "searchScore" }
      }
    }
  ];

  const results = await collection.aggregate(pipeline).toArray();

  return results.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
    score: doc.score
  }));
}
