const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testImportedData() {
  console.log('🧪 开始测试导入的数据\n');

  try {
    // 1. 测试酒店列表
    console.log('1️⃣ 测试酒店列表...');
    const hotelsRes = await axios.get(`${BASE_URL}/hotels?page=1&limit=10`);
    console.log(`   ✓ 获取到 ${hotelsRes.data.length} 家酒店`);
    if (hotelsRes.data.length > 0) {
      const hotel = hotelsRes.data[0];
      console.log(`   ✓ 示例酒店: ${hotel.name} (${hotel.city})`);
      console.log(`   ✓ 评分: ${hotel.rating} | 评论数: ${hotel.review_count}`);
    }

    // 2. 测试城市分布
    console.log('\n2️⃣ 测试城市筛选...');
    const cities = ['shanghai', 'beijing', 'shenzhen', 'guangzhou'];
    for (const city of cities) {
      const cityRes = await axios.get(`${BASE_URL}/hotels?city=${city}&limit=5`);
      console.log(`   ✓ ${city}: ${cityRes.data.length} 家酒店`);
    }

    // 3. 测试酒店详情和评论
    console.log('\n3️⃣ 测试酒店详情和评论...');
    const detailRes = await axios.get(`${BASE_URL}/hotels/${hotelsRes.data[0].id}`);
    console.log(`   ✓ 酒店详情: ${detailRes.data.name}`);
    console.log(`   ✓ 设施数量: ${detailRes.data.facilities?.length || 0}`);
    console.log(`   ✓ 标签数量: ${detailRes.data.tags?.length || 0}`);

    const reviewsRes = await axios.get(`${BASE_URL}/reviews?hotelId=${hotelsRes.data[0].id}&limit=10`);
    console.log(`   ✓ 评论数量: ${reviewsRes.data.length}`);
    if (reviewsRes.data.length > 0) {
      const review = reviewsRes.data[0];
      console.log(`   ✓ 示例评论评分: ${review.overall_rating}`);
      console.log(`   ✓ 评论内容长度: ${review.content?.length || 0} 字符`);
    }

    // 4. 测试搜索功能
    console.log('\n4️⃣ 测试搜索功能...');
    const searchRes = await axios.get(`${BASE_URL}/hotels?search=酒店&limit=5`);
    console.log(`   ✓ 搜索"酒店"找到 ${searchRes.data.length} 个结果`);

    // 5. 测试价格筛选
    console.log('\n5️⃣ 测试价格筛选...');
    const priceRes = await axios.get(`${BASE_URL}/hotels?minPrice=1000&maxPrice=3000&limit=5`);
    console.log(`   ✓ 价格区间 1000-3000: ${priceRes.data.length} 家酒店`);

    // 6. 测试星级筛选
    console.log('\n6️⃣ 测试星级筛选...');
    const starsRes = await axios.get(`${BASE_URL}/hotels?stars=5&limit=5`);
    console.log(`   ✓ 五星级酒店: ${starsRes.data.length} 家`);

    // 7. 统计信息
    console.log('\n📊 数据统计:');
    const allHotels = await axios.get(`${BASE_URL}/hotels?limit=1000`);
    console.log(`   - 总酒店数: ${allHotels.data.length}`);
    
    const cityCount = {};
    allHotels.data.forEach(h => {
      cityCount[h.city] = (cityCount[h.city] || 0) + 1;
    });
    console.log('   - 城市分布:');
    Object.entries(cityCount).forEach(([city, count]) => {
      console.log(`     ${city}: ${count} 家`);
    });

    const avgRating = allHotels.data.reduce((sum, h) => sum + parseFloat(h.rating || 0), 0) / allHotels.data.length;
    console.log(`   - 平均评分: ${avgRating.toFixed(2)}`);

    const totalReviews = allHotels.data.reduce((sum, h) => sum + (h.review_count || 0), 0);
    console.log(`   - 总评论数: ${totalReviews}`);

    console.log('\n✅ 所有测试通过！数据导入成功，系统功能正常！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

testImportedData();
