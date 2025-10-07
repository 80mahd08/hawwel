import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["zvcc245l-3000.euw.devtunnels.ms", "localhost:3000"],
    },
  },
};

export default nextConfig;
