import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片优化配置 - 优化为支持部署平台
  images: {
    domains: ['localhost', 'railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // 压缩配置
  compress: true,

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // 环境变量配置
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/blog/:path*',
        destination: '/posts/:path*',
        permanent: true,
      },
    ];
  },

  // Headers 配置 - 简化版本
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
