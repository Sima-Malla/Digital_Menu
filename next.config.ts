import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@uploadcare/react-uploader"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ucarecdn.net",
      },
      {
        protocol: "https",
        hostname: "*.ucarecd.net",
      },
    ],
  },
};

export default nextConfig;
