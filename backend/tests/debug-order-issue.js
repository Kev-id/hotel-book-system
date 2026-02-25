const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking'
});

async function debugOrderIssue() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🔍 调试订单查询问题...\n');
    
    // 1. 查看最近创建的订单
    console.log('1️⃣ 最近创建的5条订单:');
    const [recentOrders] = await conn.query(`
      SELECT id, user_id, hotel_id, status, create_time
      FROM orders
      ORDER BY create_time DESC
      LIMIT 5
    `);
    
    recentOrders.forEach(order => {
      console.log(`  订单ID: ${order.id}, 用户ID: ${order.user_id}, 创建时间: ${order.create_time}`);
    });
    
    if (recentOrders.length === 0) {
      console.log('  ❌ 没有订单');
      return;
    }
    
    // 2. 使用最新订单的用户ID测试查询
    const latestOrder = recentOrders[0];
    const testUserId = latestOrder.user_id;
    
    console.log(`\n2️⃣ 测试查询用户 ${testUserId} 的订单:`);
    
    // 直接SQL查询
    const [userOrders] = await conn.query(`
      SELECT o.*, h.name as hotelName
      FROM orders o
      LEFT JOIN hotels h ON o.hotel_id = h.id
      WHERE o.user_id = ?
      ORDER BY o.create_time DESC
    `, [testUserId]);
    
    console.log(`  SQL查询结果: ${userOrders.length} 条订单`);
    
    // 3. 通过API查询
    console.log(`\n3️⃣ 通过API查询用户 ${testUserId} 的订单:`);
    
    // 获取用户信息
    const [users] = await conn.query('SELECT * FROM users WHERE id = ?', [testUserId]);
    if (users.length === 0) {
      console.log('  ❌ 用户不存在');
      return;
    }
    
    const user = users[0];
    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    console.log(`  用户信息:`, userInfo);
    
    const token = Buffer.from(JSON.stringify(userInfo)).toString('base64');
    
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`  API查询结果: ${response.data.orders?.length || 0} 条订单`);
      console.log(`  总数: ${response.data.total}`);
      
      if (response.data.orders && response.data.orders.length > 0) {
        console.log(`  最新订单ID: ${response.data.orders[0].id}`);
      }
    } catch (error) {
      console.log(`  ❌ API请求失败:`, error.response?.data || error.message);
    }
    
    // 4. 检查是否有孤立的订单（user_id不存在）
    console.log(`\n4️⃣ 检查孤立订单（用户不存在）:`);
    const [orphanOrders] = await conn.query(`
      SELECT o.id, o.user_id, o.create_time
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE u.id IS NULL
      LIMIT 5
    `);
    
    if (orphanOrders.length > 0) {
      console.log(`  ⚠️  发现 ${orphanOrders.length} 条孤立订单:`);
      orphanOrders.forEach(order => {
        console.log(`    订单ID: ${order.id}, 用户ID: ${order.user_id}`);
      });
    } else {
      console.log(`  ✅ 没有孤立订单`);
    }
    
    // 5. 检查前端可能使用的用户ID
    console.log(`\n5️⃣ 检查常用测试用户的订单:`);
    const testUserIds = [1, 2, 3, 4, 5];
    
    for (const userId of testUserIds) {
      const [orders] = await conn.query(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
        [userId]
      );
      const [userInfo] = await conn.query(
        'SELECT username, role FROM users WHERE id = ?',
        [userId]
      );
      
      if (userInfo.length > 0) {
        console.log(`  用户ID ${userId} (${userInfo[0].username}, ${userInfo[0].role}): ${orders[0].count} 条订单`);
      }
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

debugOrderIssue();
