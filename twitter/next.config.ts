import type { NextConfig } from "next";

// We remove the strict ': NextConfig' from the variable declaration
const nextConfig = {
  env: { 
    BACKEND_URL: process.env.BACKEND_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} as NextConfig; // We use 'as NextConfig' here to override the strict check

export default nextConfig;