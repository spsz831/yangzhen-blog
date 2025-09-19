// 数据库连接测试脚本
const { Client } = require('pg');

async function testConnection() {
  console.log('🔍 测试PostgreSQL连接...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL连接成功！');

    // 测试基本查询
    const result = await client.query('SELECT version();');
    console.log('📊 PostgreSQL版本:', result.rows[0].version);

    // 列出现有表
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('📋 现有表:', tables.rows.map(row => row.table_name));

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('🔧 请检查以下配置:');
    console.log('- DATABASE_URL环境变量是否设置');
    console.log('- PostgreSQL服务是否正常运行');
    console.log('- 网络连接是否正常');
  } finally {
    await client.end();
  }
}

testConnection();