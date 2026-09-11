import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storyhour.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.fablecdn.net",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/trailer",
        destination: "/trailers",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/storytellers",
        permanent: true,
      },
      {
        source: "/storyteller",
        destination: "/storytellers",
        permanent: true,
      },
      {
        source: "/books",
        destination: "/stories",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
