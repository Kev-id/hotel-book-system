const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

async function analyzeData() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('📊 数据分析报告\n');

    // 1. 城市分布
    console.log('🏙️  城市分布:');
    const [cities] = await conn.query(`
      SELECT city, COUNT(*) as count 
      FROM hotels 
      GROUP BY city 
      ORDER BY count DESC
    `);
    cities.forEach(c => {
      console.log(`   ${c.city || '未知'}: ${c.count} 家`);
    });

    // 2. 星级分布
    console.log('\n⭐ 星级分布:');
    const [stars] = await conn.query(`
      SELECT stars, COUNT(*) as count 
      FROM hotels 
      GROUP BY stars 
      ORDER BY stars DESC
    `);
    stars.forEach(s => {
      console.log(`   ${s.stars || '未评级'}星: ${s.count} 家`);
    });

    // 3. 价格分布
    console.log('\n💰 价格分布:');
    const [prices] = await conn.query(`
      SELECT 
        MIN(price) as min, 
        MAX(price) as max, 
        AVG(price) as avg,
        COUNT(*) as total
      FROM hotels
    `);
    console.log(`   最低: ¥${prices[0].min}`);
    console.log(`   最高: ¥${prices[0].max}`);
    console.log(`   平均: ¥${Math.round(prices[0].avg)}`);
    console.log(`   总数: ${prices[0].total} 家`);

    // 4. 价格区间分布
    console.log('\n💵 价格区间分布:');
    const [priceRanges] = await conn.query(`
      SELECT 
        CASE 
          WHEN price < 200 THEN '0-200'
          WHEN price < 500 THEN '200-500'
          WHEN price < 1000 THEN '500-1000'
          WHEN price < 2000 THEN '1000-2000'
          ELSE '2000+'
        END as range,
        COUNT(*) as count
      FROM hotels
      GROUP BY range
      ORDER BY MIN(price)
    `);
    priceRanges.forEach(r => {
      console.log(`   ¥${r.range}: ${r.count} 家`);
    });

    // 5. 数据完整性
    console.log('\n📋 数据完整性:');
    const [completeness] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN images IS NOT NULL AND JSON_LENGTH(images) > 0 THEN 1 ELSE 0 END) as with_images,
        SUM(CASE WHEN tags IS NOT NULL AND JSON_LENGTH(tags) > 0 THEN 1 ELSE 0 END) as with_tags,
        SUM(CASE WHEN description IS NOT NULL AND description != '' THEN 1 ELSE 0 END) as with_desc,
        SUM(CASE WHEN rating > 0 THEN 1 ELSE 0 END) as with_rating
      FROM hotels
    `);
    const total = completeness[0].total;
    console.log(`   有图片: ${completeness[0].with_images}/${total} (${Math.round(completeness[0].with_images/total*100)}%)`);
    console.log(`   有标签: ${completeness[0].with_tags}/${total} (${Math.round(completeness[0].with_tags/total*100)}%)`);
    console.log(`   有描述: ${completeness[0].with_desc}/${total} (${Math.round(completeness[0].with_desc/total*100)}%)`);
    console.log(`   有评分: ${completeness[0].with_rating}/${total} (${Math.round(completeness[0].with_rating/total*100)}%)`);

    // 6. 房型统计
    console.log('\n🏠 房型统计:');
    const [roomStats] = await conn.query(`
      SELECT 
        COUNT(DISTINCT hotelId) as hotels_with_rooms,
        COUNT(*) as total_rooms,
        AVG(price) as avg_room_price
      FROM room_types
    `);
    console.log(`   有房型的酒店: ${roomStats[0].hotels_with_rooms} 家`);
    console.log(`   总房型数: ${roomStats[0].total_rooms} 种`);
    console.log(`   平均房价: ¥${Math.round(roomStats[0].avg_room_price)}`);

    // 7. 订单和评价统计
    console.log('\n📦 订单统计:');
    const [orderStats] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM orders
    `);
    console.log(`   总订单: ${orderStats[0].total}`);
    console.log(`   已完成: ${orderStats[0].completed}`);
    console.log(`   已取消: ${orderStats[0].cancelled}`);

    console.log('\n💬 评价统计:');
    const [reviewStats] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        AVG(overall_rating) as avg_rating
      FROM reviews
    `);
    console.log(`   总评价: ${reviewStats[0].total}`);
    console.log(`   平均评分: ${reviewStats[0].avg_rating?.toFixed(1) || 'N/A'}`);

    // 8. 问题诊断
    console.log('\n⚠️  潜在问题:');
    const issues = [];
    
    if (cities.length < 5) {
      issues.push(`城市覆盖不足（仅 ${cities.length} 个城市）`);
    }
    
    const lowPriceCount = priceRanges.find(r => r.range === '0-200')?.count || 0;
    if (lowPriceCount > total * 0.5) {
      issues.push(`低价酒店过多（${lowPriceCount}/${total}，占 ${Math.round(lowPriceCount/total*100)}%）`);
    }

    const fiveStarCount = stars.find(s => s.stars === 5)?.count || 0;
    if (fiveStarCount > total * 0.7) {
      issues.push(`五星酒店比例过高（${fiveStarCount}/${total}，占 ${Math.round(fiveStarCount/total*100)}%）`);
    }

    if (completeness[0].with_images < total * 0.5) {
      issues.push(`图片覆盖率低（仅 ${Math.round(completeness[0].with_images/total*100)}%）`);
    }

    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    } else {
      console.log('   ✅ 数据分布合理');
    }

    console.log('\n💡 建议:');
    if (cities.length < 10) {
      console.log('   - 增加更多城市的酒店数据');
    }
    if (lowPriceCount > total * 0.3) {
      console.log('   - 增加中高端酒店数据（500-2000元）');
    }
    if (completeness[0].with_images < total * 0.8) {
      console.log('   - 为更多酒店添加图片');
    }
    console.log('   - 考虑从 Kaggle 导入更多真实数据');

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

analyzeData();
