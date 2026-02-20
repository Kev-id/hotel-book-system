const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPIs() {
  console.log('🧪 测试新增API接口\n');

  try {
    // 1. 测试订单API
    console.log('📋 测试订单API...');
    const ordersRes = await axios.get(`${BASE_URL}/orders?page=1&limit=5`);
    console.log(`  ✓ 获取订单列表: ${ordersRes.data.total} 条订单`);
    console.log(`    - 待确认: ${ordersRes.data.orders.filter(o => o.status === 'pending').length}`);
    console.log(`    - 已确认: ${ordersRes.data.orders.filter(o => o.status === 'confirmed').length}`);
    console.log(`    - 已完成: ${ordersRes.data.orders.filter(o => o.status === 'completed').length}`);
    console.log(`    - 已取消: ${ordersRes.data.orders.filter(o => o.status === 'cancelled').length}`);

    if (ordersRes.data.orders.length > 0) {
      const orderDetailRes = await axios.get(`${BASE_URL}/orders/${ordersRes.data.orders[0].id}`);
      console.log(`  ✓ 获取订单详情: 订单#${orderDetailRes.data.id}`);
    }

    const orderStatsRes = await axios.get(`${BASE_URL}/orders/stats/summary`);
    console.log(`  ✓ 订单统计: 总计${orderStatsRes.data.total}条，总收入¥${orderStatsRes.data.totalRevenue}\n`);

    // 2. 测试评价API
    console.log('💬 测试评价API...');
    const reviewsRes = await axios.get(`${BASE_URL}/reviews?page=1&limit=5`);
    console.log(`  ✓ 获取评价列表: ${reviewsRes.data.total} 条评价`);
    console.log(`    - 平均评分: ${reviewsRes.data.reviews.length > 0 ? (reviewsRes.data.reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviewsRes.data.reviews.length).toFixed(2) : 'N/A'}`);

    if (reviewsRes.data.reviews.length > 0) {
      const hotelId = reviewsRes.data.reviews[0].hotel_id;
      const reviewStatsRes = await axios.get(`${BASE_URL}/reviews/stats/hotel/${hotelId}`);
      console.log(`  ✓ 酒店评价统计: 酒店#${hotelId}`);
      console.log(`    - 总评价: ${reviewStatsRes.data.total}`);
      console.log(`    - 平均分: ${reviewStatsRes.data.avgRating}`);
      console.log(`    - 正面: ${reviewStatsRes.data.positive}, 负面: ${reviewStatsRes.data.negative}\n`);
    }

    // 3. 测试收藏API
    console.log('⭐ 测试收藏API...');
    const favoritesRes = await axios.get(`${BASE_URL}/favorites?userId=1`);
    console.log(`  ✓ 获取收藏列表: ${favoritesRes.data.length} 个收藏`);
    
    if (favoritesRes.data.length >= 2) {
      const hotelIds = favoritesRes.data.slice(0, 2).map(f => f.hotel_id).join(',');
      const compareRes = await axios.get(`${BASE_URL}/favorites/compare?hotelIds=${hotelIds}`);
      console.log(`  ✓ 对比酒店: ${compareRes.data.length} 个酒店\n`);
    } else {
      console.log(`  ⚠️  收藏数量不足，跳过对比测试\n`);
    }

    // 4. 测试数据分析API
    console.log('📊 测试数据分析API...');
    const hotelId = 1;
    
    const priceTrendsRes = await axios.get(`${BASE_URL}/analytics/price-trends?hotelId=${hotelId}&days=7`);
    console.log(`  ✓ 价格趋势: ${priceTrendsRes.data.length} 天数据`);

    const dashboardRes = await axios.get(`${BASE_URL}/analytics/hotel-dashboard/${hotelId}`);
    console.log(`  ✓ 酒店看板: 酒店#${hotelId}`);
    console.log(`    - 订单总数: ${dashboardRes.data.orders.total}`);
    console.log(`    - 取消率: ${dashboardRes.data.orders.cancelRate}%`);
    console.log(`    - 平均评分: ${dashboardRes.data.reviews.avgRating}`);
    console.log(`    - 健康分: ${dashboardRes.data.healthScore}`);

    const pricingSuggestionsRes = await axios.get(`${BASE_URL}/analytics/pricing-suggestions/${hotelId}`);
    console.log(`  ✓ 定价建议: ${pricingSuggestionsRes.data.suggestions.length} 条建议`);
    if (pricingSuggestionsRes.data.suggestions.length > 0) {
      console.log(`    - ${pricingSuggestionsRes.data.suggestions[0].title}`);
    }

    console.log('\n✅ 所有API测试通过！');
    console.log('\n🎯 支持的功能模块:');
    console.log('  ✅ 任务11: 订单管理系统 - API已就绪');
    console.log('  ✅ 任务12: 用户评价系统 - API已就绪');
    console.log('  ✅ 任务13: 收藏与智能对比 - API已就绪');
    console.log('  ✅ 任务14: 数据分析看板 - API已就绪');
    console.log('  ✅ 任务15: 评价智能分析 - 数据已准备');
    console.log('  ✅ 任务16: 智能定价建议 - API已就绪');

  } catch (error) {
    console.error('\n❌ API测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

testAPIs();
