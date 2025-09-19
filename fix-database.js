const { Client } = require('pg');

async function fixDatabase() {
  console.log('🔧 开始修复数据库...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ 连接数据库成功');

    // 1. 检查现有表结构
    console.log('🔍 检查现有表...');
    const tables = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    console.log('现有表结构:');
    tables.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name} (${row.data_type})`);
    });

    // 2. 删除现有表（如果存在）
    console.log('🗑️ 清理现有表...');
    await client.query('DROP TABLE IF EXISTS posts CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');

    // 3. 重新创建用户表
    console.log('👤 创建用户表...');
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. 重新创建文章表
    console.log('📝 创建文章表...');
    await client.query(`
      CREATE TABLE posts (
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

    // 5. 创建管理员用户
    console.log('👑 创建管理员用户...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    const adminResult = await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, ['yangzhen', 'yangzhen@example.com', hashedPassword, 'ADMIN']);

    const adminId = adminResult.rows[0].id;
    console.log(`✅ 管理员用户创建完成 (ID: ${adminId})`);

    // 6. 创建默认文章
    console.log('📄 创建默认文章...');
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

    console.log(`✅ 创建了 ${posts.length} 篇默认文章`);

    // 7. 验证修复结果
    console.log('🔍 验证修复结果...');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const postCount = await client.query('SELECT COUNT(*) FROM posts');
    const samplePost = await client.query(`
      SELECT p.title, u.username as author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LIMIT 1
    `);

    console.log(`✅ 用户数量: ${userCount.rows[0].count}`);
    console.log(`✅ 文章数量: ${postCount.rows[0].count}`);
    console.log(`✅ 示例文章: ${samplePost.rows[0].title} (作者: ${samplePost.rows[0].author_name})`);

    console.log('🎉 数据库修复完成！');

  } catch (error) {
    console.error('❌ 数据库修复失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixDatabase()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { fixDatabase };