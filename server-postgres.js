const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3005;

// 初始化Prisma客户端
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// 中间件
app.use(cors());
app.use(express.json());

console.log('PostgreSQL博客服务器启动中...');

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
    version: '3.0.0-postgresql',
    storage: 'postgresql',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', async (req, res) => {
  try {
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      storage: 'postgresql',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      storage: 'postgresql',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API状态
app.get('/api/status', async (req, res) => {
  try {
    const [userCount, postCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count()
    ]);

    res.json({
      database: 'postgresql',
      timestamp: new Date().toISOString(),
      users: userCount,
      posts: postCount,
      categories: await prisma.category.count(),
      tags: await prisma.tag.count()
    });
  } catch (error) {
    console.error('获取状态错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码都是必需的' });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER'
      }
    });

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
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
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
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
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

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
          _count: {
            select: { comments: true, likes: true }
          }
        }
      }),
      prisma.post.count({ where: { published: true } })
    ]);

    const postsWithDetails = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag)
    }));

    res.json({
      posts: postsWithDetails,
      pagination: {
        page,
        limit,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit)
      }
    });
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 创建文章 (需要认证)
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, categoryId, tagIds } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容都是必需的' });
    }

    // 生成slug
    const baseSlug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 确保slug唯一
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 150),
        published: true,
        authorId: req.user.userId,
        categoryId: categoryId || null
      },
      include: {
        author: {
          select: { id: true, username: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: { comments: true, likes: true }
        }
      }
    });

    res.status(201).json({
      ...post,
      tags: []
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
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!existingPost) {
      return res.status(404).json({ error: '文章未找到' });
    }

    // 检查权限：只有作者或管理员可以编辑
    if (existingPost.authorId !== req.user.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ error: '没有权限编辑此文章' });
      }
    }

    // 如果标题改变，重新生成slug
    let newSlug = existingPost.slug;
    if (title !== existingPost.title) {
      const baseSlug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      newSlug = baseSlug;
      let counter = 1;
      while (await prisma.post.findFirst({
        where: {
          slug: newSlug,
          id: { not: postId }
        }
      })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug: newSlug,
        content,
        excerpt: excerpt || content.substring(0, 150),
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, username: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: { comments: true, likes: true }
        }
      }
    });

    res.json({
      ...updatedPost,
      tags: []
    });
  } catch (error) {
    console.error('更新文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取单篇文章
app.get('/api/posts/:slug', async (req, res) => {
  try {
    let { slug } = req.params;
    slug = decodeURIComponent(slug);

    const post = await prisma.post.findUnique({
      where: {
        slug,
        published: true
      },
      include: {
        author: {
          select: { id: true, username: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: '文章未找到' });
    }

    // 增加浏览量
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    const postWithDetails = {
      ...post,
      views: post.views + 1,
      tags: post.tags.map(pt => pt.tag)
    };

    res.json(postWithDetails);
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取分类列表
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ categories });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取标签列表
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ tags });
  } catch (error) {
    console.error('获取标签错误:', error);
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
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/posts',
      'POST /api/posts (需要认证)',
      'PUT /api/posts/:id (需要认证)',
      'GET /api/posts/:slug',
      'GET /api/categories',
      'GET /api/tags'
    ]
  });
});

// 优雅关闭
async function gracefulShutdown() {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

app.listen(PORT, () => {
  console.log(`PostgreSQL服务器运行在端口 ${PORT}`);
  console.log('数据库连接：PostgreSQL + Prisma ORM');
  console.log('服务器启动成功！');
});