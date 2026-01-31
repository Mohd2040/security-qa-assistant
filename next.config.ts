import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ المطلوب لـ GitHub Pages
  output: 'export',

  // ✅ ضروري إذا كنت تستخدم الصور في Next.js
  images: {
    unoptimized: true,
  },

  // ✅ تفعيل الكومبايلر الجديد
  reactCompiler: true,

  /* ملاحظة أمنية: 
     دالة headers() لا تعمل مع output: 'export'. 
     لحماية موقعك على GitHub Pages، يفضل استخدام إضافة 
     أو ضبط الإعدادات من داخل لوحة تحكم الاستضافة إذا كانت تدعم ذلك.
  */
};

export default nextConfig;
