const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: true,  // 允许所有域名，开发阶段使用
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// 模拟数据存储（内存中）
let users = [
  {
    id: 1,
    username: 'yangzhen',
    email: 'yangzhen@example.com',
    password: '$2a$12$IwQec7LCzgEUmJ/PGSIz7uW8D.sXpO0g6HdjqHGX4kLwxhh8SsP5G', // admin123456
    role: 'ADMIN',
    createdAt: new Date().toISOString()
  }
];

let posts = [
  {
    id: 1,
    title: '欢迎来到 YangZhen 个人博客',
    slug: 'welcome-to-yangzhen-blog',
    content: `# 欢迎来到我的个人博客

这是一个使用现代技术栈构建的个人博客网站。

## 技术栈

- **前端**: Next.js + TypeScript + Tailwind CSS
- **后端**: Node.js + Express
- **部署**: Railway + Vercel

## 功能特性

- 📝 文章发布与管理
- 🔍 全文搜索功能
- 🏷️ 分类和标签系统
- 💬 评论互动功能
- 👤 用户认证系统
- 📱 响应式设计
- ⚡ 性能优化

感谢您的访问！`,
    excerpt: '欢迎来到我的个人博客，这里分享我的技术学习心得和项目经验。',
    published: true,
    authorId: 1,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let categories = [
  { id: 1, name: '前端开发', slug: 'frontend', description: '前端技术分享' },
  { id: 2, name: '后端开发', slug: 'backend', description: '后端技术分享' },
  { id: 3, name: '全栈开发', slug: 'fullstack', description: '全栈开发经验' }
];

let tags = [
  { id: 1, name: 'JavaScript', slug: 'javascript' },
  { id: 2, name: 'React', slug: 'react' },
  { id: 3, name: 'Node.js', slug: 'nodejs' }
];

let nextId = { users: 2, posts: 2, categories: 4, tags: 4 };

// 认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '需要访问令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的令牌' });
    }
    req.user = user;
    next();
  });
};

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: 'YangZhen Blog API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'in-memory (demo mode)'
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'in-memory',
    port: PORT,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// API状态
app.get('/api/status', (req, res) => {
  res.json({
    database: 'in-memory',
    timestamp: new Date().toISOString(),
    users: users.length,
    posts: posts.length,
    categories: categories.length,
    tags: tags.length
  });
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码都是必需的' });
    }

    // 检查用户是否已存在
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = {
      id: nextId.users++,
      username,
      email,
      password: hashedPassword,
      role: 'USER',
      createdAt: new Date().toISOString()
    };

    users.push(user);

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必需的' });
    }

    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取所有文章
app.get('/api/posts', (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const skip = (page - 1) * limit;

    let filteredPosts = posts.filter(post => post.published);

    if (search) {
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filteredPosts.length;
    const paginatedPosts = filteredPosts.slice(skip, skip + parseInt(limit));

    // 添加作者信息
    const postsWithAuthor = paginatedPosts.map(post => {
      const author = users.find(u => u.id === post.authorId);
      return {
        ...post,
        author: author ? { id: author.id, username: author.username } : null,
        category: categories.find(c => c.id === post.categoryId) || null,
        tags: [],
        _count: { comments: 0, likes: 0 }
      };
    });

    res.json({
      posts: postsWithAuthor,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取单篇文章
app.get('/api/posts/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const post = posts.find(p => p.slug === slug && p.published);

    if (!post) {
      return res.status(404).json({ error: '文章未找到' });
    }

    // 增加浏览量
    post.views++;

    const author = users.find(u => u.id === post.authorId);
    const postWithDetails = {
      ...post,
      author: author ? { id: author.id, username: author.username } : null,
      category: categories.find(c => c.id === post.categoryId) || null,
      tags: [],
      comments: [],
      _count: { likes: 0 }
    };

    res.json(postWithDetails);
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取分类
app.get('/api/categories', (req, res) => {
  try {
    const categoriesWithCount = categories.map(category => ({
      ...category,
      _count: {
        posts: posts.filter(p => p.categoryId === category.id && p.published).length
      }
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取标签
app.get('/api/tags', (req, res) => {
  try {
    res.json(tags);
  } catch (error) {
    console.error('获取标签错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'API端点未找到',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/status',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/posts',
      'GET /api/posts/:slug',
      'GET /api/categories',
      'GET /api/tags'
    ]
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📝 API文档: http://0.0.0.0:${PORT}/`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 内存使用: ${JSON.stringify(process.memoryUsage())}`);
  console.log(`💾 数据库模式: 内存存储 (演示模式)`);
});

// 优雅关闭
const gracefulShutdown = (signal) => {
  console.log(`收到${signal}信号，正在优雅关闭...`);
  server.close(() => {
    console.log('HTTP服务器已关闭');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});