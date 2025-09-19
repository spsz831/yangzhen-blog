const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据迁移...');

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123456', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'yangzhen' },
    update: {},
    create: {
      username: 'yangzhen',
      email: 'yangzhen@example.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('管理员用户已创建:', admin.username);

  // 创建默认分类
  const categories = [
    { name: '技术分享', slug: 'tech', description: '技术相关文章' },
    { name: '生活随笔', slug: 'life', description: '生活感悟和随笔' },
    { name: '项目展示', slug: 'projects', description: '个人项目展示' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  console.log('默认分类已创建');

  // 创建默认标签
  const tags = [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'React', slug: 'react' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'Claude Code', slug: 'claude-code' },
    { name: '博客', slug: 'blog' }
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag
    });
  }

  console.log('默认标签已创建');

  // 迁移现有文章
  const posts = [
    {
      title: '欢迎来到 YangZhen 个人博客',
      slug: 'welcome-to-yangzhen-blog',
      content: `# 欢迎来到我的个人博客

这是一个使用现代技术栈构建的个人博客网站。

## 技术栈

- **前端**: Next.js + TypeScript + Tailwind CSS
- **后端**: Node.js + Express
- **数据库**: PostgreSQL + Prisma ORM
- **部署**: Railway + Vercel

## 功能特性

- 📝 文章发布与管理
- 🔍 全文搜索功能
- 🏷️ 分类和标签系统
- 💬 评论互动功能
- 👤 用户认证系统
- 📱 响应式设计
- ⚡ 性能优化
- 💾 持久化数据存储

感谢您的访问！`,
      excerpt: '欢迎来到我的个人博客，这里分享我的技术学习心得和项目经验。',
      authorId: admin.id,
      views: 0
    },
    {
      title: '纪念一下，我用Claude Code完成了个人博客网站',
      slug: 'claude-code',
      content: `### **我的第一个个人博客诞生记**

我一直想拥有一个属于自己的小角落，用来记录生活点滴和天马行空的胡思乱想。终于下定决心要搭建个人博客，但问题是——我是个彻头彻尾的技术小白。

朋友推荐我试试 Claude Code，说它能帮忙解决技术难题。抱着试试看的心态，我开始了这段"折腾"之旅。

最开始，我连域名都不知道怎么选，更别说什么主题模板了。我把自己的想法一股脑儿地告诉它："我想要简洁一点的风格，但又不能太单调，最好能放照片……" 就这样七嘴八舌地描述着，网站的雏形在我脑海中慢慢变得清晰起来。

印象最深的还是前端部署。明明看起来很简单的功能，我却搞了大半天。总觉得效果不尽如人意，响应式设计的问题也需要不断优化。先这样吧，一切都在慢慢变好。

最有成就感的时刻，是看到第一篇文章发布成功。看着这个亲手搭建的网站，虽然还有很多不完美的地方，但那种满足感真的无法言喻。朋友们看到后都夸赞页面设计不错，我心里美滋滋的。

现在博客刚刚成立，没什么访问量，但每次更新都像在精心装饰自己的房间。这个过程让我明白，有时候最大的收获，或许不是那个完美的结果，而是那份敢于尝试的勇气和坚持到底的决心。

## 技术升级

现在我们已经升级到了真正的持久化存储：

- ✅ **PostgreSQL数据库**：企业级数据存储
- ✅ **Prisma ORM**：类型安全的数据库操作
- ✅ **自动备份**：Railway原生支持
- ✅ **数据永久保存**：再也不用担心文章丢失！

这个博客现在真正成为了一个可靠的个人空间。`,
      excerpt: '### **我的第一个个人博客诞生记**\n\n我一直想拥有一个属于自己的小角落，用来记录生活点滴和天马行空的胡思乱想。终于下定决心要搭建个人博客，但问题是——我是个彻头彻尾的技术小白。\n\n朋友推荐我试试 Claude Code，说它能帮忙解决技术难题。抱着试试看的心态，我开始了这段"折腾"之旅。',
      authorId: admin.id,
      views: 0
    }
  ];

  for (const postData of posts) {
    await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt
      },
      create: postData
    });
  }

  console.log('现有文章已迁移到PostgreSQL');
  console.log('数据迁移完成！');
}

main()
  .catch((e) => {
    console.error('数据迁移失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });