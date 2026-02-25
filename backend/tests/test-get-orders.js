const axios = require('axios');

async function testGetOrders() {
  try {
    console.log('🔍 测试获取订单功能...\n');
    
    // 测试不同的用户
    const testUsers = [
      { id: 2, username: 'merchant1', role: 'merchant' },
      { id: 5, username: 'user1', role: 'user' },
      { id: 67, username: 'ping70', role: 'user' }  // 从数据库中看到有订单的用户
    ];
    
    for (const user of testUsers) {
      console.log(`\n📋 测试用户: ${user.username} (ID: ${user.id}, 角色: ${user.role})`);
      
      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      
      try {
        const response = await axios.get('http://localhost:5000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`  ✅ 返回 ${response.data.orders?.length || 0} 条订单`);
        console.log(`  总数: ${response.data.total}`);
        
        if (response.data.orders && response.data.orders.length > 0) {
          const firstOrder = response.data.orders[0];
          console.log(`  示例订单: ID=${firstOrder.id}, 酒店=${firstOrder.hotelName}, 状态=${firstOrder.status}`);
        }
      } catch (error) {
        console.log(`  ❌ 请求失败:`, error.response?.data || error.message);
      }
    }
    
    // 测试创建订单
    console.log('\n\n🆕 测试创建订单...');
    const testUser = { id: 5, username: 'user1', role: 'user' };
    const token = Buffer.from(JSON.stringify(testUser)).toString('base64');
    
    const orderData = {
      hotelId: 1,
      roomType: '豪华大床房',
      checkInDate: '2026-03-01',
      checkOutDate: '2026-03-03',
      nights: 2,
      adults: 2,
      children: 0,
      totalPrice: 1776,
      cancelPolicy: { type: 'free', deadline: 24 }
    };
    
    try {
      const response = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('  ✅ 订单创建成功:', response.data);
      
      // 立即查询订单
      console.log('\n  验证订单是否可查询...');
      const getResponse = await axios.get('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`  查询到 ${getResponse.data.orders?.length || 0} 条订单`);
      
      // 查找刚创建的订单
      const newOrder = getResponse.data.orders?.find(o => o.id === response.data.orderId);
      if (newOrder) {
        console.log('  ✅ 找到新创建的订单:', newOrder.id);
      } else {
        console.log('  ❌ 未找到新创建的订单');
      }
      
    } catch (error) {
      console.log('  ❌ 创建订单失败:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testGetOrders();
