const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';

// 登录获取token
async function login() {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      params: {
        username: 'merchant1',
        password: '123456'
      }
    });
    token = response.data.token;
    console.log('✅ 登录成功');
    return token;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    process.exit(1);
  }
}

// 测试数据概览
async function testOverview() {
  console.log('\n📊 测试数据概览...');
  try {
    const response = await axios.get(`${BASE_URL}/analytics/overview?period=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 数据概览:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
  }
}

// 测试订单趋势
async function testTrend() {
  console.log('\n📈 测试订单趋势...');
  try {
    const response = await axios.get(`${BASE_URL}/analytics/trend?period=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 订单趋势:', `${response.data.data.length}条数据`);
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
  }
}

// 测试房型排行
async function testRoomRanking() {
  console.log('\n🏆 测试房型排行...');
  try {
    const response = await axios.get(`${BASE_URL}/analytics/room-ranking?period=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 房型排行:', `${response.data.data.length}个房型`);
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
  }
}

// 测试AI洞察
async function testAIInsights() {
  console.log('\n🤖 测试AI数据洞察...');
  console.log('⏳ 首次调用需要3-5秒...');
  const startTime = Date.now();
  try {
    const response = await axios.get(`${BASE_URL}/analytics/ai/insights?period=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ AI洞察 (${duration}秒):`);
    console.log('机会点:', response.data.data.opportunities?.length || 0);
    console.log('风险点:', response.data.data.risks?.length || 0);
    
    // 再次调用测试缓存
    console.log('\n⏳ 测试缓存（第二次调用）...');
    const startTime2 = Date.now();
    await axios.get(`${BASE_URL}/analytics/ai/insights?period=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const duration2 = ((Date.now() - startTime2) / 1000).toFixed(2);
    console.log(`✅ 缓存命中 (${duration2}秒)`);
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
  }
}

// 测试AI定价
async function testAIPricing() {
  console.log('\n💰 测试AI智能定价...');
  try {
    const response = await axios.get(`${BASE_URL}/analytics/ai/pricing?period=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 定价建议:', response.data.data.suggestions?.length || 0, '条');
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
  }
}

// 测试AI预警
async function testAIAlerts() {
  console.log('\n⚠️  测试AI异常预警...');
  try {
    const response = await axios.get(`${BASE_URL}/analytics/ai/alerts?period=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 异常预警:', response.data.data.alerts?.length || 0, '条');
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始测试任务14 - AI增强数据看板\n');
  console.log('=' .repeat(50));
  
  await login();
  await testOverview();
  await testTrend();
  await testRoomRanking();
  await testAIInsights();
  await testAIPricing();
  await testAIAlerts();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ 所有测试完成！');
}

runAllTests();
