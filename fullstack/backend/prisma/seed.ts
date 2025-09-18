import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充种子数据...');

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123456', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@yangzhen.blog' },
    update: {},
    create: {
      email: 'admin@yangzhen.blog',
      username: 'yangzhen',
      displayName: 'YangZhen',
      password: hashedPassword,
      bio: '全栈开发工程师，专注于现代Web技术栈。热爱分享技术知识和开发经验。',
      role: 'ADMIN',
    },
  });

  console.log('✅ 管理员用户创建完成:', admin.username);

  // 创建分类
  const categories = [
    {
      name: '前端开发',
      slug: 'frontend',
      description: 'React、Vue、JavaScript、TypeScript等前端技术',
      color: '#61DAFB'
    },
    {
      name: '后端开发',
      slug: 'backend',
      description: 'Node.js、Python、数据库、API设计等后端技术',
      color: '#68D391'
    },
    {
      name: '全栈开发',
      slug: 'fullstack',
      description: '全栈项目实践、架构设计、开发流程',
      color: '#9F7AEA'
    },
    {
      name: '工具分享',
      slug: 'tools',
      description: '开发工具、编程技巧、效率提升',
      color: '#F6AD55'
    },
    {
      name: '学习笔记',
      slug: 'notes',
      description: '技术学习心得、读书笔记、经验总结',
      color: '#FC8181'
    }
  ];

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData,
    });
    console.log('✅ 分类创建完成:', category.name);
  }

  // 创建标签
  const tags = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js',
    'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Prisma',
    'Docker', 'AWS', 'Git', 'Linux', 'API', 'GraphQL',
    'Tailwind CSS', 'Webpack', 'Vite', '性能优化'
  ];

  for (const tagName of tags) {
    const tag = await prisma.tag.upsert({
      where: { slug: tagName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '') },
      update: {},
      create: {
        name: tagName,
        slug: tagName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, ''),
      },
    });
    console.log('✅ 标签创建完成:', tag.name);
  }

  // 创建示例文章
  const frontendCategory = await prisma.category.findUnique({
    where: { slug: 'frontend' }
  });

  const reactTag = await prisma.tag.findUnique({
    where: { slug: 'react' }
  });

  const nextjsTag = await prisma.tag.findUnique({
    where: { slug: 'nextjs' }
  });

  if (frontendCategory && reactTag && nextjsTag) {
    const samplePost = await prisma.post.upsert({
      where: { slug: 'welcome-to-yangzhen-blog' },
      update: {},
      create: {
        title: '欢迎来到 YangZhen 个人博客',
        slug: 'welcome-to-yangzhen-blog',
        content: `# 欢迎来到我的个人博客

## 关于这个博客

这是我使用 Next.js + Node.js + PostgreSQL 构建的全栈个人博客系统。在这里，我会分享：

- 前端开发技术和最佳实践
- 后端架构设计和数据库优化
- 全栈项目开发经验
- 编程工具和效率技巧
- 技术学习心得和思考

## 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: Shadcn/ui + Radix UI
- **状态管理**: React Context + Tanstack Query

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: JWT

### 部署
- **前端**: Vercel
- **后端**: Railway
- **数据库**: Supabase

## 功能特性

✅ 用户认证系统 (注册/登录/权限管理)
✅ 文章管理 (CRUD、分类、标签)
✅ 评论系统 (嵌套回复、点赞)
✅ 搜索和筛选
✅ 响应式设计
✅ SEO 优化
✅ 性能优化

感谢访问我的博客，希望这里的内容对你有所帮助！`,
        excerpt: '欢迎来到我的个人博客！这里分享前端、后端、全栈开发的技术文章和经验心得。',
        published: true,
        featured: true,
        authorId: admin.id,
        categoryId: frontendCategory.id,
        views: 128,
      },
    });

    // 关联标签
    await prisma.postTag.createMany({
      data: [
        { postId: samplePost.id, tagId: reactTag.id },
        { postId: samplePost.id, tagId: nextjsTag.id },
      ],
      skipDuplicates: true,
    });

    console.log('✅ 示例文章创建完成:', samplePost.title);
  }

  console.log('🎉 种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });