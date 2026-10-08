import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard/finance',
        destination: '/dashboard/finances',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
