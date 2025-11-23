import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dvlanrmphynbijwnqtmy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["zvcc245l-3000.euw.devtunnels.ms", "localhost:3000"],
    },
  },
};

export default nextConfig;
