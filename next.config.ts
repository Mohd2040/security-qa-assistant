import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ ضروري إذا كنت تستخدم الصور في Next.js
  images: {
    unoptimized: true,
  },

  // Required for GitHub Pages deployment
  output: "export",

  // ✅ SECURITY: Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  /* ملاحظة أمنية: 
     دالة headers() لا تعمل مع output: 'export'. 
     لحماية موقعك على GitHub Pages، يفضل استخدام إضافة 
     أو ضبط الإعدادات من داخل لوحة تحكم الاستضافة إذا كانت تدعم ذلك.
  */
};

export default nextConfig;
