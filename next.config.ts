import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
<<<<<<< HEAD
<<<<<<< HEAD
};

export default nextConfig;
=======
  
=======

>>>>>>> security-qa-assistance/devops3
  // 🚀 هذا الإعداد يحل مشكلة Dockerfile ويُنشئ مجلد .next/standalone
  output: 'standalone',

  // يُبقي إعداد React Compiler الذي أضفته
  reactCompiler: true,

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
        ],
      },
    ];
  },
};

export default nextConfig;
>>>>>>> devops3
