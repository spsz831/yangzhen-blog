#!/bin/bash
echo "🔧 Starting Railway deployment..."

# 确保Prisma客户端生成
echo "📦 Generating Prisma client..."
npx prisma generate

# 检查数据库连接
echo "🔍 Checking database connection..."
npx prisma db pull --force || echo "⚠️ Database connection issue, continuing anyway..."

# 启动服务器
echo "🚀 Starting server..."
node server.js