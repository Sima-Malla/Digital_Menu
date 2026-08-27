import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.ucarecd.net",
      },
      {
        protocol: "https",
        hostname: "*.ucarecdn.com",
      },
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
    ],
  },
};

export default nextConfig;