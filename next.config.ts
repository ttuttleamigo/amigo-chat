import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.myamigo.com',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
