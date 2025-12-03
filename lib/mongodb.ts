// lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not set in .env.local");
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "security_qa";

let client: MongoClient | null = null;
let db: Db | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;

  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri!);
  }

  client = await clientPromise;
  return client;
}

export async function getDb(): Promise<Db> {
  if (db) return db;

  const client = await getMongoClient();
  db = client.db(dbName);
  return db;
}
