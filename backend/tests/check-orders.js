const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking'
});

async function checkOrders() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🔍 检查订单数据...\n');
    
    // 1. 检查订单总数
    const [countResult] = await conn.query('SELECT COUNT(*) as total FROM orders');
    console.log(`📊 订单总数: ${countResult[0].total}`);
    
    // 2. 查看最近的订单
    console.log('\n📋 最近的5条订单:');
    const [recentOrders] = await conn.query(`
      SELECT o.id, o.user_id, o.hotel_id, o.status, o.create_time,
             u.username, h.name as hotel_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN hotels h ON o.hotel_id = h.id
      ORDER BY o.create_time DESC
      LIMIT 5
    `);
    
    if (recentOrders.length === 0) {
      console.log('  ❌ 没有订单数据');
    } else {
      recentOrders.forEach(order => {
        console.log(`  ID: ${order.id}, 用户: ${order.username} (ID: ${order.user_id}), 酒店: ${order.hotel_name}, 状态: ${order.status}, 时间: ${order.create_time}`);
      });
    }
    
    // 3. 按用户统计订单
    console.log('\n👥 按用户统计订单:');
    const [userStats] = await conn.query(`
      SELECT o.user_id, u.username, COUNT(*) as order_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      GROUP BY o.user_id
      ORDER BY order_count DESC
      LIMIT 10
    `);
    
    userStats.forEach(stat => {
      console.log(`  用户: ${stat.username} (ID: ${stat.user_id}), 订单数: ${stat.order_count}`);
    });
    
    // 4. 检查订单表结构
    console.log('\n🔧 订单表结构:');
    const [columns] = await conn.query('SHOW COLUMNS FROM orders');
    console.log('  字段列表:');
    columns.forEach(col => {
      console.log(`    - ${col.Field} (${col.Type}) ${col.Key ? '[' + col.Key + ']' : ''} ${col.Extra}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

checkOrders();
