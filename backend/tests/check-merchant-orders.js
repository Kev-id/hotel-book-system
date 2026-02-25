const pool = require('../config/database');

async function checkMerchantOrders() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('=== 检查商家订单关系 ===\n');
    
    // 1. 查看所有商家
    console.log('1️⃣ 商家列表：');
    const [merchants] = await conn.query(
      "SELECT id, username, role FROM users WHERE role = 'merchant'"
    );
    console.log(merchants);
    console.log('');
    
    // 2. 查看每个商家拥有的酒店
    console.log('2️⃣ 商家的酒店：');
    for (const merchant of merchants) {
      const [hotels] = await conn.query(
        'SELECT id, name, merchantId FROM hotels WHERE merchantId = ?',
        [merchant.id]
      );
      console.log(`商家 ${merchant.username} (ID: ${merchant.id}) 拥有 ${hotels.length} 家酒店：`);
      hotels.forEach(h => console.log(`  - 酒店ID: ${h.id}, 名称: ${h.name}`));
      console.log('');
    }
    
    // 3. 查看所有订单及其关联的酒店和商家
    console.log('3️⃣ 订单-酒店-商家关系：');
    const [orders] = await conn.query(`
      SELECT 
        o.id as orderId,
        o.user_id as customerId,
        u.username as customerName,
        o.hotel_id as hotelId,
        h.name as hotelName,
        h.merchantId,
        m.username as merchantName,
        o.status,
        o.create_time
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN hotels h ON o.hotel_id = h.id
      LEFT JOIN users m ON h.merchantId = m.id
      ORDER BY o.create_time DESC
      LIMIT 20
    `);
    
    console.log(`找到 ${orders.length} 条订单：`);
    orders.forEach(order => {
      console.log(`订单 #${order.orderId}:`);
      console.log(`  - 顾客: ${order.customerName} (ID: ${order.customerId})`);
      console.log(`  - 酒店: ${order.hotelName} (ID: ${order.hotelId})`);
      console.log(`  - 商家: ${order.merchantName} (ID: ${order.merchantId})`);
      console.log(`  - 状态: ${order.status}`);
      console.log(`  - 创建时间: ${order.create_time}`);
      console.log('');
    });
    
    // 4. 测试商家查询逻辑
    console.log('4️⃣ 测试商家查询逻辑：');
    for (const merchant of merchants) {
      const [merchantOrders] = await conn.query(`
        SELECT o.*, h.name as hotelName
        FROM orders o
        LEFT JOIN hotels h ON o.hotel_id = h.id
        WHERE h.merchantId = ?
      `, [merchant.id]);
      
      console.log(`商家 ${merchant.username} (ID: ${merchant.id}) 应该看到 ${merchantOrders.length} 条订单`);
      if (merchantOrders.length > 0) {
        merchantOrders.forEach(order => {
          console.log(`  - 订单 #${order.id}: ${order.hotelName}, 状态: ${order.status}`);
        });
      } else {
        console.log('  ⚠️  该商家没有订单！');
      }
      console.log('');
    }
    
    // 5. 检查是否有订单的酒店没有商家
    console.log('5️⃣ 检查数据完整性：');
    const [orphanOrders] = await conn.query(`
      SELECT o.id, o.hotel_id, h.name, h.merchantId
      FROM orders o
      LEFT JOIN hotels h ON o.hotel_id = h.id
      WHERE h.merchantId IS NULL
    `);
    
    if (orphanOrders.length > 0) {
      console.log(`⚠️  发现 ${orphanOrders.length} 条订单的酒店没有分配商家：`);
      orphanOrders.forEach(order => {
        console.log(`  - 订单 #${order.id}, 酒店: ${order.name} (ID: ${order.hotel_id})`);
      });
    } else {
      console.log('✅ 所有订单的酒店都已分配商家');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

checkMerchantOrders();
