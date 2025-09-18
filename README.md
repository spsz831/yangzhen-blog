# YangZhen Blog - Railway优化版

这是专门为Railway部署优化的版本，去除了复杂的TypeScript配置。

## 项目结构
```
yangzhen-blog/
├── server.js          # 主服务器文件（JavaScript）
├── package.json       # 简化的依赖配置
├── prisma/
│   ├── schema.prisma  # 数据库模式
│   └── seed.js        # 种子数据
└── .env.example       # 环境变量示例
```

## 快速部署到Railway

1. 推送到GitHub
2. 在Railway中连接仓库
3. 添加环境变量
4. 自动部署成功

## 环境变量

```bash
DATABASE_URL=your_supabase_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=3001
```

## 本地开发

```bash
npm install
npm start
```