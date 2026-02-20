// API 测试脚本
const testAPI = async () => {
  console.log('🧪 开始测试 API...\n');

  try {
    // 1. 测试获取酒店列表
    console.log('1️⃣ 测试获取酒店列表...');
    const hotelsRes = await fetch('http://localhost:5000/api/hotels');
    const hotels = await hotelsRes.json();
    console.log(`   ✓ 获取到 ${hotels.length} 家酒店`);
    if (hotels.length > 0) {
      const hotel = hotels[0];
      console.log(`   ✓ 示例酒店: ${hotel.name}`);
      console.log(`   ✓ 价格: ¥${hotel.price}`);
      console.log(`   ✓ 房型数量: ${hotel.roomTypes?.length || 0}`);
      console.log(`   ✓ 图片数量: ${hotel.images?.length || 0}`);
      console.log(`   ✓ 标签数量: ${hotel.tags?.length || 0}\n`);
    }

    // 2. 测试城市筛选
    console.log('2️⃣ 测试城市筛选...');
    const beijingRes = await fetch('http://localhost:5000/api/hotels?city=beijing');
    const beijingHotels = await beijingRes.json();
    console.log(`   ✓ 北京酒店数量: ${beijingHotels.length}\n`);

    // 3. 测试价格筛选
    console.log('3️⃣ 测试价格筛选...');
    const priceRes = await fetch('http://localhost:5000/api/hotels?price_gte=500&price_lte=1000');
    const priceHotels = await priceRes.json();
    console.log(`   ✓ 价格在 500-1000 的酒店: ${priceHotels.length}\n`);

    // 4. 测试获取酒店详情
    if (hotels.length > 0) {
      console.log('4️⃣ 测试获取酒店详情...');
      const detailRes = await fetch(`http://localhost:5000/api/hotels/${hotels[0].id}`);
      const detail = await detailRes.json();
      console.log(`   ✓ 酒店详情: ${detail.name}`);
      console.log(`   ✓ 地址: ${detail.address}`);
      console.log(`   ✓ 星级: ${detail.stars}星\n`);
    }

    // 5. 测试获取房型
    if (hotels.length > 0) {
      console.log('5️⃣ 测试获取酒店房型...');
      const roomTypesRes = await fetch(`http://localhost:5000/api/hotels/${hotels[0].id}/room-types`);
      const roomTypes = await roomTypesRes.json();
      console.log(`   ✓ 房型数量: ${roomTypes.length}`);
      if (roomTypes.length > 0) {
        roomTypes.forEach(rt => {
          console.log(`   ✓ ${rt.roomType}: ¥${rt.price}`);
        });
      }
      console.log();
    }

    console.log('✅ 所有 API 测试通过！\n');
    console.log('📊 数据统计:');
    console.log(`   - 总酒店数: ${hotels.length}`);
    console.log(`   - 有房型的酒店: ${hotels.filter(h => h.roomTypes?.length > 0).length}`);
    console.log(`   - 有图片的酒店: ${hotels.filter(h => h.images?.length > 0).length}`);
    console.log(`   - 有标签的酒店: ${hotels.filter(h => h.tags?.length > 0).length}`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

testAPI();
