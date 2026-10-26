import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/api/v2/:path*',
        destination: `${backendUrl}/api/v2/:path*`,
      },
      {
        source: '/api/v13/:path*',
        destination: `${backendUrl}/api/v13/:path*`,
      },
      {
        source: '/api/v14/:path*',
        destination: `${backendUrl}/api/v14/:path*`,
      },
      {
        source: '/api/v15/:path*',
        destination: `${backendUrl}/api/v15/:path*`,
      },
    ];
  },
};

export default nextConfig;
