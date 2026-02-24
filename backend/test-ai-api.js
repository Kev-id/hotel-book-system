const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAIAPIs() {
  console.log('🧪 开始测试AI API接口...\n');
  
  try {
    // 测试1: 获取评价摘要
    console.log('1️⃣ 测试评价摘要接口...');
    try {
      const summaryResponse = await axios.get(`${API_BASE}/ai/review-summary/1`);
      console.log('✅ 评价摘要接口响应:', JSON.stringify(summaryResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ 评价摘要接口错误:', error.response?.data || error.message);
    }
    
    console.log('\n---\n');
    
    // 测试2: 质量检测
    console.log('2️⃣ 测试质量检测接口...');
    try {
      const qualityResponse = await axios.post(`${API_BASE}/ai/review-quality-check`, {
        reviewId: 1,
        content: '非常好，很满意！',
        overallRating: 5.0,
        dimensions: {
          cleanliness: 5.0,
          service: 5.0,
          facilities: 5.0,
          location: 5.0,
          valueForMoney: 5.0
        },
        userId: 1
      });
      console.log('✅ 质量检测接口响应:', JSON.stringify(qualityResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ 质量检测接口错误:', error.response?.data || error.message);
    }
    
    console.log('\n---\n');
    
    // 测试3: 回复建议
    console.log('3️⃣ 测试回复建议接口...');
    try {
      const replyResponse = await axios.post(`${API_BASE}/ai/reply-suggestions`, {
        reviewId: 1,
        reviewContent: '房间很干净，服务态度好，但是隔音效果一般',
        overallRating: 4.0,
        hotelName: '北京国际大饭店'
      });
      console.log('✅ 回复建议接口响应:', JSON.stringify(replyResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ 回复建议接口错误:', error.response?.data || error.message);
    }
    
    console.log('\n---\n');
    
    // 测试4: 趋势分析
    console.log('4️⃣ 测试趋势分析接口...');
    try {
      const trendResponse = await axios.get(`${API_BASE}/ai/review-trend/1?days=30`);
      console.log('✅ 趋势分析接口响应:', JSON.stringify(trendResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️ 趋势分析接口错误:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAIAPIs();
