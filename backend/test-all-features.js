/**
 * 全功能检查脚本
 * 测试所有后端API接口和功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// 测试用户凭证
const testUsers = {
  admin: { username: 'admin1', password: '123456' },
  merchant: { username: 'merchant1', password: '123456' },
  user: { username: 'user1', password: '123456' }
};

let tokens = {};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 登录获取token
async function login(role) {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      params: testUsers[role]
    });
    tokens[role] = response.data.token;
    log(`✓ ${role} 登录成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${role} 登录失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试健康检查
async function testHealth() {
  try {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/api/health`);
    log(`✓ 健康检查: ${response.data.message}`, 'green');
    return true;
  } catch (error) {
    log(`✗ 健康检查失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试酒店列表
async function testHotels() {
  try {
    const response = await axios.get(`${BASE_URL}/hotels`);
    log(`✓ 酒店列表: 获取到 ${response.data.length} 个酒店`, 'green');
    return true;
  } catch (error) {
    log(`✗ 酒店列表失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试评论功能
async function testReviews() {
  try {
    const response = await axios.get(`${BASE_URL}/reviews/stats/hotel/1`);
    log(`✓ 评论统计: 获取成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ 评论统计失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试收藏功能
async function testFavorites() {
  try {
    const response = await axios.get(`${BASE_URL}/favorites/list`, {
      headers: { Authorization: `Bearer ${tokens.user}` }
    });
    log(`✓ 收藏列表: 获取到 ${response.data.length} 个收藏`, 'green');
    return true;
  } catch (error) {
    log(`✗ 收藏列表失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试收藏推荐
async function testFavoriteRecommendations() {
  try {
    const response = await axios.get(`${BASE_URL}/favorites/recommendations`, {
      headers: { Authorization: `Bearer ${tokens.user}` }
    });
    log(`✓ 收藏推荐: 获取到 ${response.data.length} 个推荐`, 'green');
    return true;
  } catch (error) {
    log(`✗ 收藏推荐失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试收藏对比
async function testFavoriteCompare() {
  try {
    const response = await axios.post(
      `${BASE_URL}/favorites/compare`,
      { hotelIds: [1, 2] },
      { headers: { Authorization: `Bearer ${tokens.user}` } }
    );
    log(`✓ 收藏对比: 对比成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ 收藏对比失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试AI评论摘要
async function testAIReviewSummary() {
  try {
    const response = await axios.get(`${BASE_URL}/ai/review-summary/1`, {
      headers: { Authorization: `Bearer ${tokens.user}` }
    });
    log(`✓ AI评论摘要: 生成成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ AI评论摘要失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试AI智能回复
async function testAIReply() {
  try {
    const response = await axios.post(
      `${BASE_URL}/ai/reply-suggestions`,
      {
        reviewId: 1,
        reviewContent: '酒店很不错，服务很好',
        overallRating: 5,
        hotelName: '北京国际大饭店'
      },
      { headers: { Authorization: `Bearer ${tokens.merchant}` } }
    );
    log(`✓ AI智能回复: 生成成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ AI智能回复失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试数据看板
async function testAnalytics() {
  try {
    const response = await axios.get(`${BASE_URL}/analytics/overview?days=30`, {
      headers: { Authorization: `Bearer ${tokens.merchant}` }
    });
    log(`✓ 数据看板: 获取成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ 数据看板失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试AI数据洞察
async function testAIInsights() {
  try {
    const response = await axios.get(`${BASE_URL}/analytics/ai/insights?days=30`, {
      headers: { Authorization: `Bearer ${tokens.merchant}` }
    });
    log(`✓ AI数据洞察: 生成成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ AI数据洞察失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试AI智能定价
async function testAIPricing() {
  try {
    const response = await axios.get(`${BASE_URL}/analytics/ai/pricing?days=30`, {
      headers: { Authorization: `Bearer ${tokens.merchant}` }
    });
    log(`✓ AI智能定价: 生成成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ AI智能定价失败: ${error.message}`, 'red');
    return false;
  }
}

// 测试AI异常预警
async function testAIAlerts() {
  try {
    const response = await axios.get(`${BASE_URL}/analytics/ai/alerts?days=30`, {
      headers: { Authorization: `Bearer ${tokens.merchant}` }
    });
    log(`✓ AI异常预警: 检测成功`, 'green');
    return true;
  } catch (error) {
    log(`✗ AI异常预警失败: ${error.message}`, 'red');
    return false;
  }
}

// 主测试函数
async function runAllTests() {
  log('\n========================================', 'blue');
  log('🚀 开始全功能检查', 'blue');
  log('========================================\n', 'blue');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // 1. 健康检查
  log('\n【1. 系统健康检查】', 'yellow');
  results.total++;
  if (await testHealth()) results.passed++;
  else results.failed++;

  // 2. 用户登录
  log('\n【2. 用户认证】', 'yellow');
  for (const role of ['admin', 'merchant', 'user']) {
    results.total++;
    if (await login(role)) results.passed++;
    else results.failed++;
  }

  // 3. 基础功能
  log('\n【3. 基础功能】', 'yellow');
  const basicTests = [
    { name: '酒店列表', fn: testHotels },
    { name: '评论列表', fn: testReviews }
  ];

  for (const test of basicTests) {
    results.total++;
    if (await test.fn()) results.passed++;
    else results.failed++;
  }

  // 4. 收藏功能（任务13）
  log('\n【4. 收藏功能 - 任务13】', 'yellow');
  const favoriteTests = [
    { name: '收藏列表', fn: testFavorites },
    { name: '收藏推荐', fn: testFavoriteRecommendations },
    { name: '收藏对比', fn: testFavoriteCompare }
  ];

  for (const test of favoriteTests) {
    results.total++;
    if (await test.fn()) results.passed++;
    else results.failed++;
  }

  // 5. AI评论功能（任务12）
  log('\n【5. AI评论功能 - 任务12】', 'yellow');
  const aiReviewTests = [
    { name: 'AI评论摘要', fn: testAIReviewSummary },
    { name: 'AI智能回复', fn: testAIReply }
  ];

  for (const test of aiReviewTests) {
    results.total++;
    if (await test.fn()) results.passed++;
    else results.failed++;
  }

  // 6. 数据看板功能（任务14）
  log('\n【6. 数据看板功能 - 任务14】', 'yellow');
  const analyticsTests = [
    { name: '数据看板', fn: testAnalytics },
    { name: 'AI数据洞察', fn: testAIInsights },
    { name: 'AI智能定价', fn: testAIPricing },
    { name: 'AI异常预警', fn: testAIAlerts }
  ];

  for (const test of analyticsTests) {
    results.total++;
    if (await test.fn()) results.passed++;
    else results.failed++;
  }

  // 输出总结
  log('\n========================================', 'blue');
  log('📊 测试结果总结', 'blue');
  log('========================================', 'blue');
  log(`总测试数: ${results.total}`, 'blue');
  log(`通过: ${results.passed}`, 'green');
  log(`失败: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`成功率: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
    results.failed === 0 ? 'green' : 'yellow');
  log('========================================\n', 'blue');

  if (results.failed === 0) {
    log('🎉 所有功能测试通过！', 'green');
  } else {
    log('⚠️  部分功能测试失败，请检查日志', 'yellow');
  }
}

// 运行测试
runAllTests().catch(error => {
  log(`\n❌ 测试执行出错: ${error.message}`, 'red');
  process.exit(1);
});
