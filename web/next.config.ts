import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: 'https://docs.binboi.com/docs', 
      },
      {
        source: '/docs/:path*',
        destination: 'https://docs.binboi.com/docs/:path*',
      },
    ]
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
