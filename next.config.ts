import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // proxy.ts buffers request bodies (to let both proxy and the route handler
  // read them) capped at 10MB by default — too small for real PDF catalogue
  // uploads (/api/upload allows up to 50MB). See proxyClientMaxBodySize docs.
  experimental: {
    proxyClientMaxBodySize: "55mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
