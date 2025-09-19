# 杨振个人博客

> 一个现代化的全栈博客系统，支持高级Markdown编辑和实时预览

## ✨ 特性

- 🎨 **现代化UI设计** - 响应式布局，支持深色模式
- ✏️ **高级Markdown编辑器** - 分屏实时预览，工具栏快捷操作
- 🔐 **安全认证系统** - JWT认证，管理员权限控制
- 💾 **企业级数据存储** - PostgreSQL数据库，数据持久化
- ⚡ **高性能架构** - 前后端分离，连接池优化
- 📱 **全设备适配** - 移动端友好的响应式设计

## 🏗️ 技术栈

### 前端
- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown + 语法高亮
- **HTTP Client**: Axios

### 后端
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (原生pg驱动)
- **Authentication**: JWT + bcryptjs
- **Deployment**: Railway

### 部署
- **Frontend**: Vercel (https://yangzhen-blog.vercel.app)
- **Backend**: Railway (自动CI/CD)

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/spsz831/yangzhen-blog.git
   cd yangzhen-blog
   ```

2. **安装后端依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库连接
   ```

4. **启动后端服务**
   ```bash
   npm start
   ```

5. **安装前端依赖**
   ```bash
   cd fullstack/frontend
   npm install
   ```

6. **启动前端开发服务器**
   ```bash
   npm run dev
   ```

访问 `http://localhost:3000` 查看博客，`http://localhost:3000/admin` 进入管理后台。

## 📝 使用说明

### 博客管理
1. 访问 `/admin` 进入管理后台
2. 使用管理员账户登录
3. 使用高级编辑器创建和编辑文章
4. 支持Markdown语法和实时预览

### 编辑器功能
- **分屏预览**: 左边编辑，右边实时渲染
- **工具栏操作**: 标题、粗体、斜体、链接、代码、列表
- **键盘快捷键**: Ctrl+B(粗体)、Ctrl+I(斜体)、Ctrl+K(链接)
- **多行格式化**: 选中多行文本批量应用格式

## 🗂️ 项目结构

```
yangzhen-blog/
├── fullstack/frontend/          # Next.js前端应用
│   ├── src/app/                # App Router路由
│   ├── src/components/         # React组件
│   └── public/                 # 静态资源
├── docs/                       # 项目文档
├── server-postgres-native.js   # Express后端服务
├── package.json               # 后端依赖配置
└── railway.json               # Railway部署配置
```

## 📚 API文档

### 认证
- `POST /api/auth/login` - 用户登录

### 文章管理
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:slug` - 获取单篇文章
- `POST /api/posts` - 创建文章 (需要认证)
- `PUT /api/posts/:id` - 更新文章 (需要认证)

### 系统
- `GET /health` - 健康检查
- `GET /api/status` - 系统状态

## 🔧 配置说明

### 环境变量
```env
# 数据库配置
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_URL=postgresql://user:password@host:port/database

# JWT密钥
JWT_SECRET=your-secret-key

# 运行环境
NODE_ENV=production
PORT=3005
```

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

⭐ 如果这个项目对你有帮助，请给一个 Star！