const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充种子数据...');

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123456', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'yangzhen' },
    update: {},
    create: {
      username: 'yangzhen',
      email: 'yangzhen@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ 管理员用户创建完成:', admin.username);

  // 创建分类
  const categories = [
    { name: '前端开发', slug: 'frontend', description: '前端技术分享' },
    { name: '后端开发', slug: 'backend', description: '后端技术分享' },
    { name: '全栈开发', slug: 'fullstack', description: '全栈开发经验' },
    { name: '工具分享', slug: 'tools', description: '开发工具推荐' },
    { name: '学习笔记', slug: 'notes', description: '学习心得记录' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
    console.log('✅ 分类创建完成:', category.name);
  }

  // 创建标签
  const tags = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js',
    'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Prisma',
    'Docker', 'AWS', 'Git', 'Linux', 'API'
  ];

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: {
        name: tagName,
        slug: tagName.toLowerCase().replace('.', '')
      }
    });
    console.log('✅ 标签创建完成:', tagName);
  }

  // 创建示例文章
  const frontendCategory = await prisma.category.findUnique({
    where: { slug: 'frontend' }
  });

  const reactTag = await prisma.tag.findUnique({
    where: { name: 'React' }
  });

  const samplePost = await prisma.post.upsert({
    where: { slug: 'welcome-to-yangzhen-blog' },
    update: {},
    create: {
      title: '欢迎来到 YangZhen 个人博客',
      slug: 'welcome-to-yangzhen-blog',
      content: `# 欢迎来到我的个人博客

这是一个使用现代技术栈构建的个人博客网站。

## 技术栈

- **前端**: Next.js + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + Prisma
- **数据库**: PostgreSQL (Supabase)
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
      authorId: admin.id,
      categoryId: frontendCategory?.id,
      tags: {
        connect: [{ id: reactTag?.id }]
      }
    }
  });

  console.log('✅ 示例文章创建完成:', samplePost.title);
  console.log('🎉 种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });