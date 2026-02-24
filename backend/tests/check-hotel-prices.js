/**
 * 检查酒店价格数据
 */

const pool = require('../config/database');

async function checkHotelPrices() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('========================================');
    console.log('🔍 检查酒店价格数据');
    console.log('========================================\n');
    
    // 1. 检查酒店总数
    const [hotelCount] = await conn.query('SELECT COUNT(*) as total FROM hotels WHERE deleted_at IS NULL');
    console.log(`📊 酒店总数: ${hotelCount[0].total}\n`);
    
    // 2. 检查有价格的酒店数量
    const [hotelsWithPrice] = await conn.query(`
      SELECT COUNT(DISTINCT h.id) as count
      FROM hotels h
      INNER JOIN room_types rt ON h.id = rt.hotelId
      WHERE h.deleted_at IS NULL
    `);
    console.log(`✓ 有价格的酒店: ${hotelsWithPrice[0].count}`);
    
    // 3. 检查没有价格的酒店数量
    const [hotelsWithoutPrice] = await conn.query(`
      SELECT COUNT(*) as count
      FROM hotels h
      LEFT JOIN room_types rt ON h.id = rt.hotelId
      WHERE h.deleted_at IS NULL AND rt.id IS NULL
    `);
    console.log(`✗ 没有价格的酒店: ${hotelsWithoutPrice[0].count}\n`);
    
    // 4. 显示前10个没有价格的酒店
    if (hotelsWithoutPrice[0].count > 0) {
      console.log('📋 没有价格的酒店列表（前10个）:');
      console.log('----------------------------------------');
      
      const [noPrice] = await conn.query(`
        SELECT h.id, h.name, h.city, h.stars
        FROM hotels h
        LEFT JOIN room_types rt ON h.id = rt.hotelId
        WHERE h.deleted_at IS NULL AND rt.id IS NULL
        LIMIT 10
      `);
      
      noPrice.forEach((hotel, index) => {
        console.log(`${index + 1}. [ID:${hotel.id}] ${hotel.name} - ${hotel.city} (${hotel.stars}星)`);
      });
      console.log('');
    }
    
    // 5. 显示前10个有价格的酒店
    console.log('📋 有价格的酒店列表（前10个）:');
    console.log('----------------------------------------');
    
    const [withPrice] = await conn.query(`
      SELECT h.id, h.name, h.city, h.stars, 
             COUNT(rt.id) as room_type_count,
             MIN(rt.price) as min_price,
             MAX(rt.price) as max_price
      FROM hotels h
      INNER JOIN room_types rt ON h.id = rt.hotelId
      WHERE h.deleted_at IS NULL
      GROUP BY h.id
      LIMIT 10
    `);
    
    withPrice.forEach((hotel, index) => {
      console.log(`${index + 1}. [ID:${hotel.id}] ${hotel.name} - ${hotel.city} (${hotel.stars}星)`);
      console.log(`   房型数: ${hotel.room_type_count}, 价格范围: ¥${hotel.min_price} - ¥${hotel.max_price}`);
    });
    console.log('');
    
    // 6. 检查room_types表总数
    const [roomTypeCount] = await conn.query('SELECT COUNT(*) as total FROM room_types');
    console.log(`📊 房型总数: ${roomTypeCount[0].total}\n`);
    
    // 7. 统计每个城市的价格情况
    console.log('📊 各城市价格数据统计:');
    console.log('----------------------------------------');
    
    const [cityStats] = await conn.query(`
      SELECT 
        h.city,
        COUNT(DISTINCT h.id) as total_hotels,
        COUNT(DISTINCT CASE WHEN rt.id IS NOT NULL THEN h.id END) as hotels_with_price,
        COUNT(DISTINCT CASE WHEN rt.id IS NULL THEN h.id END) as hotels_without_price
      FROM hotels h
      LEFT JOIN room_types rt ON h.id = rt.hotelId
      WHERE h.deleted_at IS NULL
      GROUP BY h.city
      ORDER BY total_hotels DESC
      LIMIT 10
    `);
    
    cityStats.forEach(city => {
      const coverage = ((city.hotels_with_price / city.total_hotels) * 100).toFixed(1);
      console.log(`${city.city}: ${city.total_hotels}个酒店, ${city.hotels_with_price}个有价格 (${coverage}%), ${city.hotels_without_price}个无价格`);
    });
    
    console.log('\n========================================');
    console.log('✅ 检查完成');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

checkHotelPrices();
