import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/amigo-chat',
  assetPrefix: '/amigo-chat',
  trailingSlash: true,
  images: {
    unoptimized: true,
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
