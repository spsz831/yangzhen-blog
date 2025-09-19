#!/bin/bash

# PostgreSQL部署回滚脚本

echo "🔄 回滚到稳定版本..."

# 修改package.json切换回稳定版本
sed -i 's/"main": "server-postgres-native.js"/"main": "server-fixed.js"/' package.json
sed -i 's/"start": "node server-postgres-native.js"/"start": "node server-fixed.js"/' package.json

echo "✅ package.json已切换回稳定版本"

# 提交回滚
git add package.json
git commit -m "Rollback: Switch back to stable server-fixed.js

Emergency rollback from PostgreSQL native version to stable version.

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main

echo "🚀 回滚完成！Railway将自动重新部署稳定版本。"