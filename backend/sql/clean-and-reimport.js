const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

async function cleanAndReimport() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🧹 开始清理旧数据...\n');

    // 删除ID > 64的酒店和相关评论
    const [reviews] = await conn.query('SELECT COUNT(*) as count FROM reviews WHERE hotel_id > 64');
    console.log(`  - 删除 ${reviews[0].count} 条评论`);
    await conn.query('DELETE FROM reviews WHERE hotel_id > 64');

    const [hotels] = await conn.query('SELECT COUNT(*) as count FROM hotels WHERE id > 64');
    console.log(`  - 删除 ${hotels[0].count} 家酒店`);
    await conn.query('DELETE FROM hotels WHERE id > 64');

    console.log('\n✅ 清理完成！');
    console.log('\n现在请运行: node sql/import-new-hotels.js');

  } catch (error) {
    console.error('\n❌ 清理失败:', error.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

cleanAndReimport();
