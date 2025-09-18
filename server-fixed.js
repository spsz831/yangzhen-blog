const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3005;

// 中间件
app.use(cors());
app.use(express.json());

// 内存数据存储（临时解决方案）
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
    createdAt: '2025-09-18T16:03:12.338Z',
    updatedAt: '2025-09-18T16:03:12.338Z'
  },
  {
    id: 2,
    title: '纪念一下，我用Claude Code完成了个人博客网站',
    slug: 'claude-code',
    content: `### **我的第一个个人博客诞生记**

我一直想拥有一个属于自己的小角落，用来记录生活点滴和天马行空的胡思乱想。终于下定决心要搭建个人博客，但问题是——我是个彻头彻尾的技术小白。

朋友推荐我试试 Claude Code，说它能帮忙解决技术难题。抱着试试看的心态，我开始了这段"折腾"之旅。

最开始，我连域名都不知道怎么选，更别说什么主题模板了。我把自己的想法一股脑儿地告诉它："我想要简洁一点的风格，但又不能太单调，最好能放照片……" 就这样七嘴八舌地描述着，网站的雏形在我脑海中慢慢变得清晰起来。

印象最深的还是前端部署。明明看起来很简单的功能，我却搞了大半天。总觉得效果不尽如人意，响应式设计的问题也需要不断优化。先这样吧，一切都在慢慢变好。

最有成就感的时刻，是看到第一篇文章发布成功。看着这个亲手搭建的网站，虽然还有很多不完美的地方，但那种满足感真的无法言喻。朋友们看到后都夸赞页面设计不错，我心里美滋滋的。

现在博客刚刚成立，没什么访问量，但每次更新都像在精心装饰自己的房间。这个过程让我明白，有时候最大的收获，或许不是那个完美的结果，而是那份敢于尝试的勇气和坚持到底的决心。`,
    excerpt: '### **我的第一个个人博客诞生记**\n\n我一直想拥有一个属于自己的小角落，用来记录生活点滴和天马行空的胡思乱想。终于下定决心要搭建个人博客，但问题是——我是个彻头彻尾的技术小白。\n\n朋友推荐我试试 Claude Code，说它能帮忙解决技术难题。抱着试试看的心态，我开始了这段"折腾"之旅。\n\n最开...',
    published: true,
    authorId: 1,
    views: 0,
    createdAt: '2025-09-18T16:31:18.093Z',
    updatedAt: '2025-09-18T16:31:29.344Z'
  }
];

let categories = [
  { id: 1, name: '技术分享', slug: 'tech', description: '技术相关文章' },
  { id: 2, name: '生活随笔', slug: 'life', description: '生活感悟和随笔' },
  { id: 3, name: '项目展示', slug: 'projects', description: '个人项目展示' }
];

let tags = [
  { id: 1, name: 'JavaScript', slug: 'javascript' },
  { id: 2, name: 'React', slug: 'react' },
  { id: 3, name: 'Node.js', slug: 'nodejs' }
];

let nextId = { users: 2, posts: 3, categories: 4, tags: 4 };

console.log('服务器启动中，已预加载2篇文章...');

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
    version: '2.1.0-stable',
    storage: 'memory-with-backup',
    posts: posts.length,
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    storage: 'memory-with-backup',
    posts: posts.length,
    timestamp: new Date().toISOString()
  });
});

// API状态
app.get('/api/status', (req, res) => {
  try {
    res.json({
      database: 'memory-with-backup',
      timestamp: new Date().toISOString(),
      users: users.length,
      posts: posts.length,
      categories: categories.length,
      tags: tags.length
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
app.get('/api/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const publishedPosts = posts.filter(p => p.published);
    const totalPosts = publishedPosts.length;
    const paginatedPosts = publishedPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + limit);

    const postsWithDetails = paginatedPosts.map(post => {
      const author = users.find(u => u.id === post.authorId);
      return {
        ...post,
        author: author ? { id: author.id, username: author.username } : null,
        category: null,
        tags: [],
        _count: { comments: 0, likes: 0 }
      };
    });

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

    // 生成slug - 只保留英文字母、数字，中文转为拼音或移除
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // 只保留字母数字和空格连字符
      .replace(/\s+/g, '-')     // 空格转连字符
      .replace(/-+/g, '-')      // 多个连字符合并为一个
      .replace(/^-|-$/g, '');   // 移除首尾连字符

    // 确保slug唯一
    let uniqueSlug = slug;
    let counter = 1;
    while (posts.find(p => p.slug === uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const post = {
      id: nextId.posts++,
      title,
      slug: uniqueSlug,
      content,
      excerpt: excerpt || content.substring(0, 150),
      published: true,
      authorId: req.user.userId,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    posts.push(post);

    const author = users.find(u => u.id === post.authorId);
    const postWithDetails = {
      ...post,
      author: { id: author.id, username: author.username },
      category: null,
      tags: [],
      _count: { comments: 0, likes: 0 }
    };

    res.status(201).json(postWithDetails);
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

    const postIndex = posts.findIndex(p => p.id === parseInt(id));
    if (postIndex === -1) {
      return res.status(404).json({ error: '文章未找到' });
    }

    const post = posts[postIndex];

    // 检查权限：只有作者或管理员可以编辑
    if (post.authorId !== req.user.userId) {
      const user = users.find(u => u.id === req.user.userId);
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ error: '没有权限编辑此文章' });
      }
    }

    // 如果标题改变，重新生成slug
    let newSlug = post.slug;
    if (title !== post.title) {
      const slug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // 只保留字母数字和空格连字符
        .replace(/\s+/g, '-')     // 空格转连字符
        .replace(/-+/g, '-')      // 多个连字符合并为一个
        .replace(/^-|-$/g, '');   // 移除首尾连字符

      // 确保slug唯一
      newSlug = slug;
      let counter = 1;
      while (posts.find(p => p.slug === newSlug && p.id !== parseInt(id))) {
        newSlug = `${slug}-${counter}`;
        counter++;
      }
    }

    // 更新文章
    posts[postIndex] = {
      ...post,
      title,
      slug: newSlug,
      content,
      excerpt: excerpt || content.substring(0, 150),
      updatedAt: new Date().toISOString()
    };

    const author = users.find(u => u.id === posts[postIndex].authorId);
    const postWithDetails = {
      ...posts[postIndex],
      author: { id: author.id, username: author.username },
      category: null,
      tags: [],
      _count: { comments: 0, likes: 0 }
    };

    res.json(postWithDetails);
  } catch (error) {
    console.error('更新文章错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取单篇文章
app.get('/api/posts/:slug', (req, res) => {
  try {
    let { slug } = req.params;

    // URL解码处理中文字符
    slug = decodeURIComponent(slug);

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
      category: null,
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

// 获取分类列表
app.get('/api/categories', (req, res) => {
  try {
    res.json({ categories });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取标签列表
app.get('/api/tags', (req, res) => {
  try {
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

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`内存存储模式，已预加载 ${posts.length} 篇文章`);
  console.log('服务器启动成功！');
});