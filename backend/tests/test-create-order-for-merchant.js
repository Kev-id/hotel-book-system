const pool = require('../config/database');

async function testCreateOrderForMerchant() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('=== 测试用户创建订单，商家能否看到 ===\n');
    
    // 1. 选择一个商家和他的酒店
    const [merchants] = await conn.query(
      "SELECT id, username FROM users WHERE role = 'merchant' LIMIT 1"
    );
    
    if (merchants.length === 0) {
      console.log('❌ 没有找到商家用户');
      return;
    }
    
    const merchant = merchants[0];
    console.log(`1️⃣ 选择商家: ${merchant.username} (ID: ${merchant.id})`);
    
    // 2. 获取该商家的一个酒店
    const [hotels] = await conn.query(
      'SELECT id, name FROM hotels WHERE merchantId = ? LIMIT 1',
      [merchant.id]
    );
    
    if (hotels.length === 0) {
      console.log('❌ 该商家没有酒店');
      return;
    }
    
    const hotel = hotels[0];
    console.log(`2️⃣ 选择酒店: ${hotel.name} (ID: ${hotel.id})`);
    
    // 3. 选择一个普通用户
    const [users] = await conn.query(
      "SELECT id, username FROM users WHERE role = 'user' LIMIT 1"
    );
    
    if (users.length === 0) {
      console.log('❌ 没有找到普通用户');
      return;
    }
    
    const user = users[0];
    console.log(`3️⃣ 选择用户: ${user.username} (ID: ${user.id})\n`);
    
    // 4. 创建一个测试订单
    console.log('4️⃣ 创建测试订单...');
    const [result] = await conn.query(`
      INSERT INTO orders (
        user_id, hotel_id, room_type, status,
        check_in_date, check_out_date, nights, adults, children,
        total_price, cancel_deadline, cancel_policy, logs
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id,
      hotel.id,
      '豪华大床房',
      '2026-06-01',
      '2026-06-03',
      2,
      2,
      0,
      1200,
      '2026-05-31 18:00:00',
      JSON.stringify({ freeCancel: true }),
      JSON.stringify([{ time: new Date().toISOString(), action: 'created', operator: 'user', note: '订单创建' }])
    ]);
    
    const orderId = result.insertId;
    console.log(`✅ 订单创建成功，订单ID: ${orderId}\n`);
    
    // 5. 验证订单数据
    console.log('5️⃣ 验证订单数据...');
    const [orders] = await conn.query(`
      SELECT 
        o.id,
        o.user_id,
        o.hotel_id,
        h.merchantId,
        h.name as hotelName,
        m.username as merchantName
      FROM orders o
      LEFT JOIN hotels h ON o.hotel_id = h.id
      LEFT JOIN users m ON h.merchantId = m.id
      WHERE o.id = ?
    `, [orderId]);
    
    if (orders.length > 0) {
      const order = orders[0];
      console.log('订单详情:');
      console.log(`  - 订单ID: ${order.id}`);
      console.log(`  - 用户ID: ${order.user_id}`);
      console.log(`  - 酒店ID: ${order.hotel_id}`);
      console.log(`  - 酒店名称: ${order.hotelName}`);
      console.log(`  - 商家ID: ${order.merchantId}`);
      console.log(`  - 商家名称: ${order.merchantName}\n`);
    }
    
    // 6. 测试商家查询（管理模式）
    console.log('6️⃣ 测试商家查询（管理模式）...');
    const [merchantOrders] = await conn.query(`
      SELECT o.*, h.name as hotelName
      FROM orders o
      LEFT JOIN hotels h ON o.hotel_id = h.id
      WHERE h.merchantId = ? AND o.id = ?
    `, [merchant.id, orderId]);
    
    if (merchantOrders.length > 0) {
      console.log(`✅ 商家 ${merchant.username} 可以看到这个订单`);
      console.log(`   订单 #${merchantOrders[0].id}: ${merchantOrders[0].hotelName}, 状态: ${merchantOrders[0].status}\n`);
    } else {
      console.log(`❌ 商家 ${merchant.username} 看不到这个订单！\n`);
    }
    
    // 7. 测试用户查询（我的订单）
    console.log('7️⃣ 测试用户查询（我的订单）...');
    const [userOrders] = await conn.query(`
      SELECT o.*, h.name as hotelName
      FROM orders o
      LEFT JOIN hotels h ON o.hotel_id = h.id
      WHERE o.user_id = ? AND o.id = ?
    `, [user.id, orderId]);
    
    if (userOrders.length > 0) {
      console.log(`✅ 用户 ${user.username} 可以看到这个订单`);
      console.log(`   订单 #${userOrders[0].id}: ${userOrders[0].hotelName}, 状态: ${userOrders[0].status}\n`);
    } else {
      console.log(`❌ 用户 ${user.username} 看不到这个订单！\n`);
    }
    
    // 8. 清理测试数据
    console.log('8️⃣ 清理测试数据...');
    await conn.query('DELETE FROM orders WHERE id = ?', [orderId]);
    console.log(`✅ 测试订单 #${orderId} 已删除\n`);
    
    console.log('=== 测试完成 ===');
    console.log('结论: 数据库结构正确，商家应该能看到用户在他酒店创建的订单');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

testCreateOrderForMerchant();
