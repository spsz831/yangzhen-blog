#!/bin/bash

# GitHub仓库清理脚本
# 删除过时和不必要的文件

echo "🧹 开始清理GitHub仓库..."

# 1. 删除过时的服务器文件 (保留当前使用的)
echo "清理过时的服务器文件..."
rm -f server.js server-simple.js server-persistent.js server-fixed.js local-server.js
rm -f server-postgres.js  # 保留 server-postgres-native.js

# 2. 删除测试和备份文件
echo "清理测试和备份文件..."
rm -f test-db-connection.js
rm -f backup-posts.json initial-posts.json
rm -f rollback.sh start.sh

# 3. 删除过时的文档 (保留主要的)
echo "清理过时文档..."
rm -f FULLSTACK-DEPLOY-GUIDE.md VERCEL-DEPLOY-GUIDE.md
rm -f POSTGRESQL-UPGRADE.md  # 保留 POSTGRESQL-NATIVE-UPGRADE.md
rm -f PROJECT-INFO.md

# 4. 删除Prisma相关文件 (现在使用原生PostgreSQL)
echo "清理Prisma文件..."
rm -rf prisma/
rm -rf fullstack/src/generated/
rm -rf fullstack/backend/src/generated/

# 5. 删除Next.js构建文件
echo "清理构建文件..."
rm -rf fullstack/frontend/.next/
rm -rf simple-frontend/

# 6. 删除重复的配置文件
echo "清理重复配置..."
rm -f fullstack/railway.json fullstack/vercel.json
rm -f fullstack/tsconfig.json fullstack/package.json
rm -f fullstack/railway-start.sh

# 7. 整理文档目录
echo "整理文档..."
mkdir -p docs
mv fullstack/docs/* docs/ 2>/dev/null || true
mv fullstack/部署指南-免费方案.md docs/ 2>/dev/null || true
rm -rf fullstack/docs/

# 8. 替换README
echo "更新README..."
mv README-NEW.md README.md

# 9. 更新.gitignore
echo "更新.gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Generated files
prisma/generated/
.prisma/

# Backup files
*.backup
*.bak
backup-*.json
EOF

echo "✅ 仓库清理完成！"
echo ""
echo "📋 清理总结："
echo "- 删除了6个过时的服务器文件"
echo "- 删除了测试和备份文件"
echo "- 删除了Prisma相关文件"
echo "- 删除了构建文件和缓存"
echo "- 整理了文档结构"
echo "- 更新了README和.gitignore"
echo ""
echo "🚀 提交更改："
echo "git add ."
echo "git commit -m 'Clean up repository structure and update documentation'"
echo "git push origin main"