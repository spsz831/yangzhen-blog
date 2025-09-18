# 项目结构文档

## 目录结构

```
个人博客网站YangZhen/
├── frontend/                    # Next.js 前端应用
│   ├── src/
│   │   ├── app/                # App Router 页面
│   │   ├── components/         # React 组件
│   │   │   └── ui/             # UI 组件库
│   │   ├── lib/                # 工具函数
│   │   └── types/              # TypeScript 类型定义
│   ├── public/                 # 静态资源
│   ├── package.json
│   └── next.config.js
│
├── backend/                    # Node.js + Express 后端
│   ├── src/
│   │   ├── controllers/        # 控制器
│   │   ├── routes/             # 路由定义
│   │   ├── middleware/         # 中间件
│   │   ├── models/             # 数据模型
│   │   ├── utils/              # 工具函数
│   │   ├── types/              # TypeScript 类型
│   │   └── index.ts            # 入口文件
│   ├── .env.example           # 环境变量示例
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                     # 共享类型和工具
│   └── types.ts               # 共享类型定义
│
├── docs/                      # 项目文档
│   └── project-structure.md   # 本文档
│
├── 产品需求文档PRD.pdf         # 产品需求文档
└── README.md                  # 项目说明
```

## 技术栈说明

### 前端 (Frontend)
- **Next.js 14**: React 全栈框架，使用 App Router
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 原子化 CSS 框架
- **Radix UI**: 无样式组件库
- **React Hook Form**: 表单处理
- **Tanstack Query**: 数据获取和缓存
- **Zod**: 数据验证
- **Lucide React**: 图标库

### 后端 (Backend)
- **Node.js**: JavaScript 运行时
- **Express.js**: Web 框架
- **TypeScript**: 类型安全
- **JWT**: 身份认证
- **bcryptjs**: 密码加密
- **Prisma**: ORM 数据库操作
- **Helmet**: 安全中间件
- **CORS**: 跨域处理
- **Morgan**: 日志记录

### 数据库
- **PostgreSQL**: 关系型数据库

## 开发流程

1. **环境搭建**: 项目初始化和依赖安装 ✅
2. **数据库设计**: Prisma 模型定义
3. **后端 API**: RESTful API 开发
4. **前端界面**: React 组件和页面
5. **功能集成**: 前后端联调
6. **测试部署**: 测试和生产部署

## 下一步计划

- [ ] 数据库 Schema 设计
- [ ] Prisma 配置和模型定义
- [ ] 用户认证系统
- [ ] 文章管理功能
- [ ] 前端页面开发