import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 🚀 هذا الإعداد يحل مشكلة Dockerfile ويُنشئ مجلد .next/standalone
  output: 'standalone',

  // يُبقي إعداد React Compiler الذي أضفته
  reactCompiler: true, 
};

export default nextConfig;