const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Wang2006',
  database: 'hotel_booking'
});

async function checkDataDistribution() {
  try {
    console.log('📊 检查数据分布情况\n');
    
    // 1. 酒店总数
    const [hotelCount] = await pool.query('SELECT COUNT(*) as total FROM hotels WHERE deleted_at IS NULL');
    console.log(`🏨 酒店总数: ${hotelCount[0].total}\n`);
    
    // 2. 有订单的酒店
    const [hotelsWithOrders] = await pool.query(`
      SELECT COUNT(DISTINCT hotel_id) as count 
      FROM orders
    `);
    console.log(`📋 订单数据分布:`);
    console.log(`  - 有订单的酒店: ${hotelsWithOrders[0].count}/${hotelCount[0].total}`);
    
    const [ordersByHotel] = await pool.query(`
      SELECT hotel_id, COUNT(*) as order_count
      FROM orders
      GROUP BY hotel_id
      ORDER BY order_count DESC
      LIMIT 5
    `);
    console.log(`  - 订单最多的5个酒店:`);
    ordersByHotel.forEach(h => console.log(`    酒店#${h.hotel_id}: ${h.order_count}条订单`));
    
    // 3. 有评价的酒店
    const [hotelsWithReviews] = await pool.query(`
      SELECT COUNT(DISTINCT hotel_id) as count 
      FROM reviews
    `);
    console.log(`\n💬 评价数据分布:`);
    console.log(`  - 有评价的酒店: ${hotelsWithReviews[0].count}/${hotelCount[0].total}`);
    
    const [reviewsByHotel] = await pool.query(`
      SELECT hotel_id, COUNT(*) as review_count, AVG(overall_rating) as avg_rating
      FROM reviews
      GROUP BY hotel_id
      ORDER BY review_count DESC
      LIMIT 5
    `);
    console.log(`  - 评价最多的5个酒店:`);
    reviewsByHotel.forEach(h => console.log(`    酒店#${h.hotel_id}: ${h.review_count}条评价, 平均${parseFloat(h.avg_rating).toFixed(2)}分`));
    
    // 4. 被收藏的酒店
    const [hotelsWithFavorites] = await pool.query(`
      SELECT COUNT(DISTINCT hotel_id) as count 
      FROM favorites
    `);
    console.log(`\n⭐ 收藏数据分布:`);
    console.log(`  - 被收藏的酒店: ${hotelsWithFavorites[0].count}/${hotelCount[0].total}`);
    
    const [favoritesByHotel] = await pool.query(`
      SELECT hotel_id, COUNT(*) as favorite_count
      FROM favorites
      GROUP BY hotel_id
      ORDER BY favorite_count DESC
      LIMIT 5
    `);
    console.log(`  - 收藏最多的5个酒店:`);
    favoritesByHotel.forEach(h => console.log(`    酒店#${h.hotel_id}: ${h.favorite_count}次收藏`));
    
    // 5. 有价格历史的酒店
    const [hotelsWithPriceHistory] = await pool.query(`
      SELECT COUNT(DISTINCT hotel_id) as count 
      FROM price_history
    `);
    console.log(`\n💰 价格历史数据分布:`);
    console.log(`  - 有价格历史的酒店: ${hotelsWithPriceHistory[0].count}/${hotelCount[0].total}`);
    
    const [priceHistoryByHotel] = await pool.query(`
      SELECT hotel_id, COUNT(*) as record_count, 
             MIN(price) as min_price, MAX(price) as max_price, AVG(price) as avg_price
      FROM price_history
      GROUP BY hotel_id
      ORDER BY record_count DESC
      LIMIT 5
    `);
    console.log(`  - 价格记录最多的5个酒店:`);
    priceHistoryByHotel.forEach(h => console.log(`    酒店#${h.hotel_id}: ${h.record_count}条记录, 价格¥${parseFloat(h.min_price).toFixed(0)}-¥${parseFloat(h.max_price).toFixed(0)}`));
    
    // 6. 综合统计：有完整数据的酒店
    const [completeDataHotels] = await pool.query(`
      SELECT h.id, h.name,
        (SELECT COUNT(*) FROM orders WHERE hotel_id = h.id) as order_count,
        (SELECT COUNT(*) FROM reviews WHERE hotel_id = h.id) as review_count,
        (SELECT COUNT(*) FROM favorites WHERE hotel_id = h.id) as favorite_count,
        (SELECT COUNT(*) FROM price_history WHERE hotel_id = h.id) as price_count
      FROM hotels h
      WHERE h.deleted_at IS NULL
      HAVING order_count > 0 OR review_count > 0 OR favorite_count > 0 OR price_count > 0
      ORDER BY (order_count + review_count + favorite_count) DESC
      LIMIT 10
    `);
    
    console.log(`\n🎯 数据最完整的10个酒店:`);
    completeDataHotels.forEach(h => {
      console.log(`  酒店#${h.id} ${h.name}:`);
      console.log(`    订单:${h.order_count} | 评价:${h.review_count} | 收藏:${h.favorite_count} | 价格历史:${h.price_count}`);
    });
    
    // 7. 没有任何业务数据的酒店
    const [emptyDataHotels] = await pool.query(`
      SELECT COUNT(*) as count
      FROM hotels h
      WHERE h.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM orders WHERE hotel_id = h.id)
        AND NOT EXISTS (SELECT 1 FROM reviews WHERE hotel_id = h.id)
        AND NOT EXISTS (SELECT 1 FROM favorites WHERE hotel_id = h.id)
        AND NOT EXISTS (SELECT 1 FROM price_history WHERE hotel_id = h.id)
    `);
    
    console.log(`\n⚠️  没有任何业务数据的酒店: ${emptyDataHotels[0].count}/${hotelCount[0].total}`);
    
    if (emptyDataHotels[0].count > 0) {
      const [emptyHotels] = await pool.query(`
        SELECT h.id, h.name, h.city
        FROM hotels h
        WHERE h.deleted_at IS NULL
          AND NOT EXISTS (SELECT 1 FROM orders WHERE hotel_id = h.id)
          AND NOT EXISTS (SELECT 1 FROM reviews WHERE hotel_id = h.id)
          AND NOT EXISTS (SELECT 1 FROM favorites WHERE hotel_id = h.id)
          AND NOT EXISTS (SELECT 1 FROM price_history WHERE hotel_id = h.id)
        LIMIT 10
      `);
      console.log(`  示例（前10个）:`);
      emptyHotels.forEach(h => console.log(`    酒店#${h.id}: ${h.name} (${h.city})`));
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkDataDistribution();
