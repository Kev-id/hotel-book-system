const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking'
});

async function checkUserFavorites() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // 查找有收藏数据的用户
    const [users] = await conn.query(`
      SELECT user_id, COUNT(*) as count
      FROM favorites
      GROUP BY user_id
      ORDER BY count DESC
      LIMIT 5
    `);
    
    console.log('📊 有收藏数据的用户:');
    users.forEach(u => {
      console.log(`  用户ID: ${u.user_id}, 收藏数: ${u.count}`);
    });
    
    if (users.length > 0) {
      const userId = users[0].user_id;
      console.log(`\n🔍 查看用户 ${userId} 的收藏分类:`);
      
      const [categories] = await conn.query(`
        SELECT category, COUNT(*) as count
        FROM favorites
        WHERE user_id = ?
        GROUP BY category
      `, [userId]);
      
      categories.forEach(cat => {
        console.log(`  - "${cat.category}": ${cat.count} 条`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

checkUserFavorites();
