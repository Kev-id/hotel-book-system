const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking'
});

async function checkCategories() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🔍 检查收藏表中的分类数据...\n');
    
    // 查询所有不同的分类
    const [categories] = await conn.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM favorites
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('📊 数据库中的分类：');
    categories.forEach(cat => {
      console.log(`  - "${cat.category}" (${cat.count} 条)`);
      console.log(`    字节长度: ${Buffer.byteLength(cat.category, 'utf8')}`);
      console.log(`    字符编码: ${cat.category.split('').map(c => c.charCodeAt(0).toString(16)).join(' ')}`);
    });
    
    console.log('\n📝 前端使用的分类：');
    const frontendCategories = ['全部', '🏢 商务出行', '🏖️ 度假休闲', '💰 性价比之选', '👨‍👩‍👧 亲子家庭'];
    frontendCategories.forEach(cat => {
      console.log(`  - "${cat}"`);
      console.log(`    字节长度: ${Buffer.byteLength(cat, 'utf8')}`);
    });
    
    // 查询一些示例数据
    console.log('\n📋 示例收藏数据：');
    const [samples] = await conn.query(`
      SELECT f.id, f.category, f.ai_reason, h.name
      FROM favorites f
      JOIN hotels h ON f.hotel_id = h.id
      LIMIT 5
    `);
    
    samples.forEach(s => {
      console.log(`  ID: ${s.id}, 分类: "${s.category}", 酒店: ${s.name}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

checkCategories();
