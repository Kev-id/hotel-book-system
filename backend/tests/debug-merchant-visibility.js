const pool = require('../config/database');

async function debugMerchantVisibility() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('=== 商家订单可见性调试工具 ===\n');
    console.log('这个工具帮助你诊断为什么商家看不到用户创建的订单\n');
    
    // 1. 列出所有商家
    console.log('📋 第1步: 列出所有商家账号');
    console.log('─'.repeat(60));
    const [merchants] = await conn.query(
      "SELECT id, username, role FROM users WHERE role = 'merchant' ORDER BY id"
    );
    
    merchants.forEach((m, index) => {
      console.log(`${index + 1}. 商家ID: ${m.id}, 用户名: ${m.username}`);
    });
    console.log('');
    
    // 2. 对每个商家，显示他们的酒店和最近的订单
    for (const merchant of merchants) {
      console.log(`\n🏨 商家: ${merchant.username} (ID: ${merchant.id})`);
      console.log('─'.repeat(60));
      
      // 获取商家的酒店
      const [hotels] = await conn.query(
        'SELECT id, name FROM hotels WHERE merchantId = ? ORDER BY id',
        [merchant.id]
      );
      
      console.log(`拥有 ${hotels.length} 家酒店:`);
      if (hotels.length > 0) {
        hotels.slice(0, 5).forEach(h => {
          console.log(`  - 酒店ID: ${h.id}, 名称: ${h.name}`);
        });
        if (hotels.length > 5) {
          console.log(`  ... 还有 ${hotels.length - 5} 家酒店`);
        }
      }
      
      // 获取最近的订单
      const [recentOrders] = await conn.query(`
        SELECT 
          o.id,
          o.user_id,
          u.username as customerName,
          o.hotel_id,
          h.name as hotelName,
          o.status,
          o.create_time
        FROM orders o
        LEFT JOIN hotels h ON o.hotel_id = h.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE h.merchantId = ?
        ORDER BY o.create_time DESC
        LIMIT 5
      `, [merchant.id]);
      
      console.log(`\n最近的 ${recentOrders.length} 条订单:`);
      if (recentOrders.length > 0) {
        recentOrders.forEach(order => {
          console.log(`  - 订单#${order.id}: ${order.customerName} 在 ${order.hotelName}, 状态: ${order.status}`);
          console.log(`    创建时间: ${order.create_time}`);
        });
      } else {
        console.log('  ⚠️  该商家目前没有任何订单');
      }
    }
    
    // 3. 检查最近创建的订单
    console.log('\n\n📅 第2步: 检查最近创建的订单');
    console.log('─'.repeat(60));
    const [latestOrders] = await conn.query(`
      SELECT 
        o.id,
        o.user_id,
        u.username as customerName,
        u.role as customerRole,
        o.hotel_id,
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
      LIMIT 10
    `);
    
    console.log('最近10条订单:');
    latestOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. 订单 #${order.id}`);
      console.log(`   顾客: ${order.customerName} (ID: ${order.user_id}, 角色: ${order.customerRole})`);
      console.log(`   酒店: ${order.hotelName} (ID: ${order.hotel_id})`);
      console.log(`   商家: ${order.merchantName} (ID: ${order.merchantId})`);
      console.log(`   状态: ${order.status}`);
      console.log(`   创建时间: ${order.create_time}`);
    });
    
    // 4. 提供诊断建议
    console.log('\n\n💡 诊断建议');
    console.log('─'.repeat(60));
    console.log('如果商家看不到用户创建的订单，请检查:');
    console.log('');
    console.log('1. 商家登录的账号ID是否正确');
    console.log('   - 在浏览器控制台运行: localStorage.getItem("hotelUser")');
    console.log('   - 检查返回的 JSON 中的 id 和 role 字段');
    console.log('');
    console.log('2. 用户创建订单时选择的酒店是否属于该商家');
    console.log('   - 查看上面的"最近创建的订单"列表');
    console.log('   - 确认订单的商家ID与登录商家的ID一致');
    console.log('');
    console.log('3. 前端是否正确传递 viewMode=management 参数');
    console.log('   - 打开浏览器开发者工具的 Network 标签');
    console.log('   - 查看订单列表请求的 URL 参数');
    console.log('   - 应该包含: ?viewMode=management');
    console.log('');
    console.log('4. 后端是否收到正确的用户信息');
    console.log('   - 查看后端控制台日志');
    console.log('   - 应该显示: "当前用户ID: X, 当前用户角色: merchant"');
    console.log('');
    
    // 5. 提供测试命令
    console.log('\n📝 测试步骤');
    console.log('─'.repeat(60));
    console.log('1. 使用商家账号登录 (例如: merchant1 / 123456)');
    console.log('2. 记下商家的用户ID');
    console.log('3. 使用普通用户账号登录 (例如: user1 / 123456)');
    console.log('4. 创建一个订单，选择属于该商家的酒店');
    console.log('5. 切换回商家账号');
    console.log('6. 进入"订单管理"页面');
    console.log('7. 检查是否能看到刚才创建的订单');
    console.log('');
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

debugMerchantVisibility();
