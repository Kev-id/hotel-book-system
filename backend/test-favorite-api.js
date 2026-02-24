/**
 * Task13: 收藏对比功能测试脚本
 * 测试AI推荐、对比分析、自动分类功能
 */

// 加载环境变量
require('dotenv').config();

const recommendationService = require('./services/ai/recommendation');

async function testRecommendation() {
  console.log('\n========== 测试1: AI智能推荐 ==========\n');
  
  const userProfile = {
    browsedHotels: [
      { name: '北京国际大饭店', price: 888, rating: 4.8 },
      { name: '上海外滩华尔道夫酒店', price: 1280, rating: 4.9 }
    ],
    favoritedHotels: [
      { name: '广州白天鹅宾馆', price: 780, rating: 4.7 }
    ],
    bookedHotels: [
      { name: '深圳瑞吉酒店', price: 1180, rating: 4.8 }
    ]
  };

  const candidateHotels = [
    { id: 1, name: '杭州西湖国宾馆', price: 980, rating: 4.8, address: '杭州市西湖区' },
    { id: 2, name: '成都香格里拉大酒店', price: 850, rating: 4.7, address: '成都市锦江区' },
    { id: 3, name: '南京金陵饭店', price: 680, rating: 4.6, address: '南京市玄武区' },
    { id: 4, name: '青岛海景花园大酒店', price: 580, rating: 4.5, address: '青岛市市南区' }
  ];

  try {
    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userProfile,
      candidateHotels
    );
    
    console.log('✅ AI推荐结果:');
    console.log(JSON.stringify(recommendations, null, 2));
  } catch (error) {
    console.error('❌ AI推荐失败:', error.message);
  }
}

async function testComparison() {
  console.log('\n========== 测试2: AI智能对比 ==========\n');
  
  const hotels = [
    {
      id: 1,
      name: '北京国际大饭店',
      price: 888,
      rating: 4.8,
      address: '北京市朝阳区建国门外大街1号',
      facilities: ['WiFi', '停车场', '健身房', '游泳池', 'SPA']
    },
    {
      id: 2,
      name: '上海外滩华尔道夫酒店',
      price: 1280,
      rating: 4.9,
      address: '上海市黄浦区中山东一路2号',
      facilities: ['WiFi', '停车场', '健身房', '游泳池', 'SPA', '餐厅', '会议室']
    },
    {
      id: 3,
      name: '广州白天鹅宾馆',
      price: 780,
      rating: 4.7,
      address: '广州市越秀区沙面南街1号',
      facilities: ['WiFi', '停车场', '健身房', '游泳池', 'SPA', '餐厅']
    }
  ];

  try {
    const analysis = await recommendationService.compareHotels(hotels);
    
    console.log('✅ AI对比分析结果:');
    console.log(JSON.stringify(analysis, null, 2));
  } catch (error) {
    console.error('❌ AI对比分析失败:', error.message);
  }
}

async function testCategorization() {
  console.log('\n========== 测试3: AI自动分类 ==========\n');
  
  const hotels = [
    {
      id: 1,
      name: '北京国际大饭店',
      price: 888,
      rating: 4.8,
      address: '北京市朝阳区建国门外大街1号',
      facilities: ['WiFi', '停车场', '健身房', '会议室']
    },
    {
      id: 2,
      name: '三亚亚龙湾度假酒店',
      price: 1200,
      rating: 4.9,
      address: '三亚市亚龙湾国家旅游度假区',
      facilities: ['WiFi', '停车场', '游泳池', 'SPA', '海滩']
    },
    {
      id: 3,
      name: '如家快捷酒店',
      price: 180,
      rating: 4.2,
      address: '北京市海淀区中关村大街',
      facilities: ['WiFi', '停车场']
    },
    {
      id: 4,
      name: '亲子主题酒店',
      price: 580,
      rating: 4.6,
      address: '上海市浦东新区迪士尼度假区',
      facilities: ['WiFi', '停车场', '儿童乐园', '家庭房', '儿童餐厅']
    }
  ];

  for (const hotel of hotels) {
    try {
      const category = await recommendationService.categorizeHotel(hotel);
      
      console.log(`\n酒店: ${hotel.name}`);
      console.log(`分类: ${category.category}`);
      console.log(`置信度: ${category.confidence}`);
      console.log(`理由: ${category.reason}`);
    } catch (error) {
      console.error(`❌ 分类失败 (${hotel.name}):`, error.message);
    }
  }
}

async function runAllTests() {
  console.log('🚀 开始测试 Task13 AI功能...\n');
  
  try {
    await testRecommendation();
    await new Promise(r => setTimeout(r, 2000));  // 等待2秒避免频繁调用
    
    await testComparison();
    await new Promise(r => setTimeout(r, 2000));
    
    await testCategorization();
    
    console.log('\n✅ 所有测试完成！');
  } catch (error) {
    console.error('\n❌ 测试过程出错:', error);
  } finally {
    process.exit(0);
  }
}

// 运行测试
runAllTests();
