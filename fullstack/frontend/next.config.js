/** @type {import('next').NextConfig} */
const nextConfig = {
  // 简化配置，确保构建成功
  experimental: {
    // 移除可能导致问题的实验性功能
  },

  // 基础环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://yangzhen-blog-railway-production.up.railway.app/api',
  },

  // 允许外部图片域名
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.vgy.me',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig