import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: false,

  outputFileTracingRoot: process.cwd(),

  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },

  async headers() {
    const publicHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=0, s-maxage=60, must-revalidate",
      },
    ];

    return [
      { source: "/", headers: publicHeaders },
      { source: "/products", headers: publicHeaders },
      { source: "/products/:path*", headers: publicHeaders },
      { source: "/categories", headers: publicHeaders },
      { source: "/categories/:path*", headers: publicHeaders },
    ];
  },
};

export default nextConfig;