# 部署配置文档

## 部署架构

### 推荐部署方案

#### 方案一：Vercel + Railway (推荐)
- **前端**: Vercel (优秀的 Next.js 支持)
- **后端**: Railway (简单易用的后端托管)
- **数据库**: Supabase PostgreSQL (免费层足够使用)

#### 方案二：全云服务
- **前端**: Netlify
- **后端**: Render
- **数据库**: PlanetScale 或 MongoDB Atlas

#### 方案三：自托管
- **服务器**: VPS (Linode, DigitalOcean)
- **容器**: Docker + Docker Compose
- **反向代理**: Nginx
- **数据库**: PostgreSQL

## 环境变量配置

### 前端环境变量 (.env.local)
```bash
# 站点配置
NEXT_PUBLIC_SITE_URL=https://yangzhen.blog
NEXT_PUBLIC_API_URL=https://api.yangzhen.blog

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# 网站验证
GOOGLE_SITE_VERIFICATION=your-verification-code
```

### 后端环境变量 (.env)
```bash
# 环境配置
NODE_ENV=production
PORT=3001

# JWT 配置
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# 数据库
DATABASE_URL=postgresql://username:password@host:port/database

# CORS
FRONTEND_URL=https://yangzhen.blog

# 可选：邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Vercel 部署配置

### vercel.json
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SITE_URL": "https://yangzhen.blog",
    "NEXT_PUBLIC_API_URL": "https://api.yangzhen.blog"
  }
}
```

## Railway 部署配置

### railway.json
```json
{
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "startCommand": "npm start"
  }
}
```

### Dockerfile (后端)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

## Docker 部署配置

### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/yangzhen_blog
      - JWT_SECRET=your-jwt-secret
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=yangzhen_blog
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## CI/CD 配置

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Build
        run: cd frontend && npm run build
        env:
          NEXT_PUBLIC_SITE_URL: ${{ secrets.SITE_URL }}
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Build
        run: cd backend && npm run build

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 数据库迁移

### Prisma 生产环境设置
```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 可选：填充种子数据
npx prisma db seed
```

### 种子数据 (prisma/seed.ts)
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建默认分类
  const techCategory = await prisma.category.upsert({
    where: { slug: 'tech' },
    update: {},
    create: {
      name: '技术',
      slug: 'tech',
      description: '技术相关文章',
      color: '#3B82F6'
    }
  });

  // 创建默认标签
  const jsTag = await prisma.tag.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: {
      name: 'JavaScript',
      slug: 'javascript'
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 域名和SSL配置

### DNS 设置
```
# A 记录
@ → Vercel IP
www → Vercel IP

# CNAME 记录
api → Railway 提供的域名

# 可选：邮件记录
MX → 邮件服务提供商
```

### SSL证书
- Vercel: 自动提供免费SSL证书
- Railway: 自动HTTPS支持
- 自托管: Let's Encrypt + Certbot

## 监控和日志

### 错误监控
```bash
# 安装 Sentry
npm install @sentry/nextjs @sentry/node

# 前端配置
# sentry.client.config.js
# sentry.server.config.js

# 后端配置
# 在 app.js 中集成 Sentry
```

### 性能监控
- Vercel Analytics
- Google Analytics
- Lighthouse CI
- Uptime 监控服务

## 备份策略

### 数据库备份
```bash
# PostgreSQL 备份脚本
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 上传到云存储 (AWS S3, Google Cloud Storage)
aws s3 cp backup_*.sql s3://your-backup-bucket/
```

### 定时备份
```yaml
# GitHub Actions 定时备份
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨2点

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          pg_dump ${{ secrets.DATABASE_URL }} > backup.sql
          # 上传备份文件
```

## 部署检查清单

### 部署前检查
- [ ] 所有环境变量已配置
- [ ] 数据库连接测试成功
- [ ] JWT 密钥已更换为生产环境密钥
- [ ] CORS 设置正确
- [ ] SSL 证书配置完成

### 部署后检查
- [ ] 网站可正常访问
- [ ] API 接口响应正常
- [ ] 用户注册/登录功能正常
- [ ] 数据库连接稳定
- [ ] 静态资源加载正常
- [ ] SEO 元标签显示正确

### 性能检查
- [ ] Lighthouse 评分 > 90
- [ ] 页面加载时间 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 数据库查询优化
- [ ] CDN 缓存配置正确