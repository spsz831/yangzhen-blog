const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client, Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3005;

// 中间件
app.use(cors());
app.use(express.json());

console.log('PostgreSQL博客服务器启动中...');

// 数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 数据库初始化
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 正在初始化数据库架构...');

    // 检查用户表是否存在并有正确结构
    const userTableCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
    `);

    const postTableCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'posts' AND table_schema = 'public'
    `);

    // 如果表结构不完整，重新创建
    if (userTableCheck.rows.length === 0 || postTableCheck.rows.length === 0) {
      console.log('⚠️ 检测到表结构问题，重新创建...');

      // 删除现有表
      await client.query('DROP TABLE IF EXISTS posts CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
    }

    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建文章表
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        published BOOLEAN DEFAULT true,
        views INTEGER DEFAULT 0,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 检查是否需要初始化数据
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('🔧 初始化默认数据...');

      // 创建管理员用户
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      const adminResult = await client.query(`
        INSERT INTO users (username, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, ['yangzhen', 'yangzhen@example.com', hashedPassword, 'ADMIN']);

      const adminId = adminResult.rows[0].id;

      // 创建默认文章
      const posts = [
        {
          title: '欢迎来到 YangZhen 个人博客',
          slug: 'welcome-to-yangzhen-blog',
          content: `# 欢迎来到我的个人博客

这是一个使用现代技术栈构建的个人博客网站。

## 技术栈

- **前端**: Next.js + TypeScript + Tailwind CSS
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **部署**: Railway + Vercel

## 功能特性

- 📝 文章发布与管理
- 🔍 全文搜索功能
- 🏷️ 分类和标签系统
- 💬 评论互动功能
- 👤 用户认证系统
- 📱 响应式设计
- ⚡ 性能优化
- 💾 PostgreSQL持久化数据存储

感谢您的访问！`,
          excerpt: '欢迎来到我的个人博客，这里分享我的技术学习心得和项目经验。'
        },
        {
          title: '纪念一下，我用Claude Code完成了个人博客网站',
          slug: 'claude-code-blog-journey',
          content: `### **我的第一个个人博客诞生记**

我一直想拥有一个属于自己的小角落，用来记录生活点滴和天马行空的胡思乱想。终于下定决心要搭建个人博客，但问题是——我是个彻头彻尾的技术小白。

朋友推荐我试试 Claude Code，说它能帮忙解决技术难题。抱着试试看的心态，我开始了这段"折腾"之旅。

## 技术升级历程

现在我们已经完成了重大技术升级：

- ✅ **PostgreSQL数据库**：企业级数据存储
- ✅ **原生SQL操作**：高性能数据库查询
- ✅ **连接池管理**：优化数据库连接
- ✅ **自动初始化**：Railway自动部署支持
- ✅ **数据永久保存**：再也不用担心文章丢失！

这个博客现在真正成为了一个可靠的个人空间，支持企业级的数据持久化和高并发访问。`,
          excerpt: '记录我使用Claude Code搭建个人博客的历程，从技术小白到完成PostgreSQL企业级升级的成长故事。'
        }
      ];

      for (const post of posts) {
        await client.query(`
          INSERT INTO posts (title, slug, content, excerpt, author_id, views)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [post.title, post.slug, post.content, post.excerpt, adminId, 0]);
      }

      console.log('✅ 默认数据初始化完成');
    }

    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供访问令牌' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: '无效的令牌' });
  }
};

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '杨振的个人博客 API',
    version: '3.0.0-postgresql-native',
    storage: 'postgresql',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    res.json({
      status: 'healthy',
      storage: 'postgresql-native',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      storage: 'postgresql-native',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API状态
app.get('/api/status', async (req, res) => {
  try {
    const client = await pool.connect();
    const [userCount, postCount] = await Promise.all([
      client.query('SELECT COUNT(*) FROM users'),
      client.query('SELECT COUNT(*) FROM posts')
    ]);
    client.release();

    res.json({
      database: 'postgresql-native',
      timestamp: new Date().toISOString(),
      users: parseInt(userCount.rows[0].count),
      posts: parseInt(postCount.rows[0].count)
    });
  } catch (error) {
    console.error('获取状态错误:', error);
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

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取文章列表
app.get('/api/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const client = await pool.connect();

    const [posts, totalCount] = await Promise.all([
      client.query(`
        SELECT p.*, u.username as author_name
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.published = true
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
      client.query('SELECT COUNT(*) FROM posts WHERE published = true')
    ]);

    client.release();

    const postsWithDetails = posts.rows.map(post => ({
      ...post,
      author: {
        id: post.author_id,
        username: post.author_name
      },
      tags: [],
      _count: {
        comments: 0,
        likes: 0
      }
    }));

    res.json({
      posts: postsWithDetails,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(parseInt(totalCount.rows[0].count) / limit)
      }
    });
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取单篇文章
app.get('/api/posts/:slug', async (req, res) => {
  try {
    let { slug } = req.params;
    slug = decodeURIComponent(slug);

    const client = await pool.connect();

    const result = await client.query(`
      SELECT p.*, u.username as author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1 AND p.published = true
    `, [slug]);

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: '文章未找到' });
    }

    // 增加浏览量
    await client.query('UPDATE posts SET views = views + 1 WHERE slug = $1', [slug]);

    client.release();

    const post = result.rows[0];
    const postWithDetails = {
      ...post,
      views: post.views + 1,
      author: {
        id: post.author_id,
        username: post.author_name
      },
      tags: [],
      comments: [],
      _count: {
        likes: 0
      }
    };

    res.json(postWithDetails);
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 创建文章 (需要认证)
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容都是必需的' });
    }

    // 生成slug
    const baseSlug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const client = await pool.connect();

    // 确保slug唯一
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await client.query('SELECT id FROM posts WHERE slug = $1', [slug]);
      if (existing.rows.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await client.query(`
      INSERT INTO posts (title, slug, content, excerpt, published, author_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, slug, content, excerpt || content.substring(0, 150), true, req.user.userId]);

    // 获取作者信息
    const userResult = await client.query('SELECT username FROM users WHERE id = $1', [req.user.userId]);
    client.release();

    const newPost = result.rows[0];
    res.status(201).json({
      ...newPost,
      author: {
        id: newPost.author_id,
        username: userResult.rows[0].username
      },
      tags: [],
      _count: {
        comments: 0,
        likes: 0
      }
    });
  } catch (error) {
    console.error('创建文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 更新文章 (需要认证)
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容都是必需的' });
    }

    const postId = parseInt(id);
    const client = await pool.connect();

    // 检查文章是否存在和权限
    const existingPost = await client.query(`
      SELECT p.*, u.role FROM posts p
      JOIN users u ON u.id = $1
      WHERE p.id = $2
    `, [req.user.userId, postId]);

    if (existingPost.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: '文章未找到' });
    }

    const post = existingPost.rows[0];
    if (post.author_id !== req.user.userId && post.role !== 'ADMIN') {
      client.release();
      return res.status(403).json({ error: '没有权限编辑此文章' });
    }

    // 如果标题改变，重新生成slug
    let newSlug = post.slug;
    if (title !== post.title) {
      const baseSlug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      newSlug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await client.query('SELECT id FROM posts WHERE slug = $1 AND id != $2', [newSlug, postId]);
        if (existing.rows.length === 0) break;
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const result = await client.query(`
      UPDATE posts
      SET title = $1, slug = $2, content = $3, excerpt = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [title, newSlug, content, excerpt || content.substring(0, 150), postId]);

    // 获取作者信息
    const userResult = await client.query('SELECT username FROM users WHERE id = $1', [post.author_id]);
    client.release();

    const updatedPost = result.rows[0];
    res.json({
      ...updatedPost,
      author: {
        id: updatedPost.author_id,
        username: userResult.rows[0].username
      },
      tags: [],
      _count: {
        comments: 0,
        likes: 0
      }
    });
  } catch (error) {
    console.error('更新文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 错误处理中间件
app.use((req, res) => {
  res.status(404).json({
    error: 'API端点未找到',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/status',
      'POST /api/auth/login',
      'GET /api/posts',
      'POST /api/posts (需要认证)',
      'PUT /api/posts/:id (需要认证)',
      'GET /api/posts/:slug'
    ]
  });
});

// 优雅关闭
async function gracefulShutdown() {
  console.log('正在关闭服务器...');
  await pool.end();
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 启动服务器
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`PostgreSQL原生服务器运行在端口 ${PORT}`);
      console.log('数据库连接：PostgreSQL + 原生pg驱动');
      console.log('服务器启动成功！');
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();