// lib/mongodb.ts

import { MongoClient, Db } from "mongodb";

// 1. تحديد متغيرات البيئة
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "security_qa";

// 2. التحقق من وجود URI
if (!uri) {
  // ⚠️ يفضل ترك هذا الفحص، لأنه يجبرك على تذكر وضع المتغيرات
  throw new Error("❌ MONGODB_URI is not set. Check your .env.local file (local) or Render variables (production).");
}

// 3. تعريف Typescript Global Variable (مهم لـ Next.js Dev Mode)
declare global {
  // المتغير الذي سيخزن وعد الاتصال في الوضع المحلي
  // هذا لمنع إعادة الاتصال المتكررة عند التحديث السريع
  var _mongoClientPromise: Promise<MongoClient> | undefined; 
}

let clientPromise: Promise<MongoClient>;
let cachedDb: Db;

// 4. تطبيق نمط Singleton
if (process.env.NODE_ENV === "development") {
  // في وضع التطوير (Local Development):
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = MongoClient.connect(uri);
  }
  clientPromise = global._mongoClientPromise;
} else {
  // في وضع الإنتاج (Render):
  clientPromise = MongoClient.connect(uri);
}

// 5. دالة الحصول على الاتصال بقاعدة البيانات
export async function getDb(): Promise<Db> {
  // لو الكاش موجود، رجّع مباشرة
  if (cachedDb) return cachedDb;

  // انتظار الاتصال الأوحد 
  const client = await clientPromise;
  
  // حفظ قاعدة البيانات في الكاش
  cachedDb = client.db(dbName);
  
  return cachedDb;
}