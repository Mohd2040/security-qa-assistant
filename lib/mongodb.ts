// lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  // لو الكاش موجود، رجّع مباشرة
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "security_qa";

  if (!uri) {
    // هنا فقط نرمي Error عندما نحاول فعلاً الاتصال بالـ DB
    // وليس عند مجرد import للملف
    throw new Error(
      "MONGODB_URI is not set in environment variables. Please configure it in .env.local (local) or service env (Render)."
    );
  }

  if (!client) {
    client = new MongoClient(uri);
  }

  if (!db) {
    await client.connect();
    db = client.db(dbName);
  }

  return db;
}
