import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ ضروري إذا كنت تستخدم الصور في Next.js
  images: {
    unoptimized: true,
  },

  /* ملاحظة أمنية: 
     دالة headers() لا تعمل مع output: 'export'. 
     لحماية موقعك على GitHub Pages، يفضل استخدام إضافة 
     أو ضبط الإعدادات من داخل لوحة تحكم الاستضافة إذا كانت تدعم ذلك.
  */
};

export default nextConfig;
