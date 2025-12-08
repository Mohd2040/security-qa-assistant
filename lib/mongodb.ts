// lib/mongodb.ts

import { MongoClient, Db } from "mongodb";

// 1. تحديد متغيرات البيئة الأساسية
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "security_qa";

// 2. التحقق من وجود المتغير (يجب أن يكون موجوداً محلياً وفي Render)
if (!uri) {
  // هذا الخطأ سيظهر إذا لم يتم العثور على المتغير في أي بيئة
  throw new Error("❌ MONGODB_URI is not set. Please ensure it's in .env.local (local) and Render settings (production).");
}

// 3. تعريف Typescript Global Variable (لتخزين الاتصال المؤقت)
declare global {
  // المتغير الذي سيخزن وعد الاتصال في الوضع المحلي
  var _mongoClientPromise: Promise<MongoClient> | undefined; 
}

let clientPromise: Promise<MongoClient>;
let cachedDb: Db;

// 4. تطبيق نمط Singleton للاتصال
if (process.env.NODE_ENV === "development") {
  // في وضع التطوير (npm run dev):
  // نستخدم global object لتخزين وعد الاتصال
  // هذا يمنع إنشاء اتصالات جديدة في كل مرة يتم فيها تحديث الكود (Hot Reload)
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = MongoClient.connect(uri);
  }
  clientPromise = global._mongoClientPromise;
} else {
  // في وضع الإنتاج (Render):
  // نبني وعد الاتصال بشكل طبيعي
  clientPromise = MongoClient.connect(uri);
}

// 5. دالة الحصول على الاتصال بقاعدة البيانات
export async function getDb(): Promise<Db> {
  // لو الكاش (cachedDb) موجود، رجّع مباشرة
  if (cachedDb) return cachedDb;

  // انتظار الاتصال الأوحد (The single connection promise)
  const client = await clientPromise;
  
  // حفظ قاعدة البيانات في الكاش
  cachedDb = client.db(dbName);
  
  return cachedDb;
}