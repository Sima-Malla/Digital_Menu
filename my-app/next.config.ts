import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.254.18"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: ["*"],
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
