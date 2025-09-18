const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 模拟用户数据
const users = [{
  id: 1,
  username: 'yangzhen',
  password: '$2a$12$IwQec7LCzgEUmJ/PGSIz7uW8D.sXpO0g6HdjqHGX4kLwxhh8SsP5G', // admin123456
  role: 'ADMIN'
}];

let posts = [{
  id: 1,
  title: '欢迎来到 YangZhen 个人博客',
  content: '# 欢迎来到我的个人博客\n\n这是第一篇文章！',
  excerpt: '欢迎来到我的个人博客，这里分享技术心得。',
  authorId: 1,
  createdAt: new Date().toISOString()
}];

// 基础路由
app.get('/api', (req, res) => {
  res.json({ message: 'YangZhen Blog API - Local Version', status: 'running' });
});

// 登录路由
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('收到登录请求:', { username, password: '***' });

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必需的' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      'local-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取文章
app.get('/api/posts', (req, res) => {
  res.json({ posts });
});

// 发布文章
app.post('/api/posts', (req, res) => {
  const { title, content, excerpt } = req.body;

  const newPost = {
    id: posts.length + 1,
    title,
    content,
    excerpt,
    authorId: 1,
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  res.json({ message: '文章发布成功', post: newPost });
});

app.listen(PORT, () => {
  console.log(`🚀 本地API服务器启动: http://localhost:${PORT}/api`);
});