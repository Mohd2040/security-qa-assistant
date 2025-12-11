# خطة دمج MongoDB Atlas Search & Vector Search 🚀

## نظرة عامة
بما أنك تستخدم **MongoDB Atlas**، فإن الانتقال إلى **Atlas Search** و **Vector Search** هو الخطوة الطبيعية الأفضل. هذا سينقل عبء المعالجة من الخادم (Next.js) إلى قاعدة البيانات مباشرة، مما يوفر سرعة فائقة وقابلية توسع غير محدودة.

---

## الخطوة 1: إعداد الفهارس في MongoDB Atlas (مهمة يدوية) ⚙️

يجب عليك الدخول إلى لوحة تحكم MongoDB Atlas وتنفيذ الخطوات التالية:

### 1. إعداد Vector Search Index (للبحث الدلالي)
هذا الفهرس يسمح بالبحث عن "المعنى" باستخدام الـ Embeddings.

1. اذهب إلى **Atlas UI** -> **Database** -> **Collections**.
2. اختر قاعدة البيانات والـ Collection الخاصة بك (`qa_entries`).
3. اذهب إلى تبويب **Atlas Search** (أو **Search Indexes**).
4. اضغط **Create Search Index**.
5. اختر **Vector Search** (JSON Editor).
6. استخدم الإعدادات التالية:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```
*ملاحظة: `1536` هو حجم embeddings الخاص بـ OpenAI (text-embedding-3-small).*

### 2. إعداد Search Index (للبحث النصي)
هذا الفهرس بديل لـ Fuse.js و BM25، يستخدم Lucene القوي جداً.

1. في نفس المكان، اضغط **Create Search Index**.
2. اختر **Search Index** (Visual or JSON).
3. سمّه `default`.
4. استخدم الإعدادات الافتراضية (Dynamic Mapping) أو خصصها كالتالي لأداء أفضل:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "question_text": {
        "type": "string",
        "analyzer": "lucene.arabic"
      },
      "question_text_en": {
        "type": "string",
        "analyzer": "lucene.english"
      },
      "answer_text": {
        "type": "string",
        "analyzer": "lucene.standard"
      }
    }
  }
}
```

---

## الخطوة 2: طريقة الاستعلام (Aggregation Pipeline) 💻

بدلاً من الكود المعقد الحالي في `route.ts`، سنستخدم Aggregation Pipeline بسيط وقوي.

### مثال على Hybrid Search (بحث هجين):

```typescript
const pipeline = [
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "embedding",
      "queryVector": queryEmbedding,
      "numCandidates": 100,
      "limit": 20
    }
  },
  {
    "$project": {
      "question_text": 1,
      "answer_text": 1,
      "score": { "$meta": "vectorSearchScore" }
    }
  }
];
```

---

## الخطوة 3: الفوائد المتوقعة 📈

1. **سرعة خارقة**: البحث يتم داخل قاعدة البيانات، لا حاجة لجلب آلاف السجلات للمعالجة في الكود.
2. **توفير الذاكرة**: الخادم لن يحتاج لتحميل كل البيانات في الذاكرة (كما يفعل Fuse.js).
3. **دقة أعلى**: Atlas Search يدعم Analyzers للغة العربية بشكل ممتاز (Stemming, Stop words) مدمجاً.
4. **Scalability**: يعمل بكفاءة سواء كان لديك 1,000 أو 1,000,000 سؤال.

---

## هل نبدأ التنفيذ؟

إذا كنت جاهزاً، يرجى:
1. **تأكيد إنشاء الفهارس (Indexes)** في Atlas كما هو موضح أعلاه.
2. سأقوم أنا بكتابة كود `lib/atlas-search.ts` والـ API الجديد.
