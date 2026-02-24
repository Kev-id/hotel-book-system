const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

async function keepOnlyOriginalHotels() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🧹 开始清理数据,只保留精细处理的原始酒店...\n');

    // 1. 查看要保留的酒店
    const [keepHotels] = await conn.query('SELECT id, name FROM hotels WHERE id <= 4 ORDER BY id');
    console.log('📌 将保留以下酒店:');
    keepHotels.forEach(h => {
      console.log(`   ${h.id}. ${h.name}`);
    });

    // 2. 查看要删除的酒店数量
    const [deleteHotels] = await conn.query('SELECT COUNT(*) as count FROM hotels WHERE id > 4');
    console.log(`\n🗑️  将删除 ${deleteHotels[0].count} 家酒店`);

    // 3. 删除相关的评论
    const [deleteReviews] = await conn.query('SELECT COUNT(*) as count FROM reviews WHERE hotel_id > 4');
    console.log(`🗑️  将删除 ${deleteReviews[0].count} 条评论`);
    await conn.query('DELETE FROM reviews WHERE hotel_id > 4');

    // 4. 删除相关的订单
    const [deleteOrders] = await conn.query('SELECT COUNT(*) as count FROM orders WHERE hotel_id > 4');
    console.log(`🗑️  将删除 ${deleteOrders[0].count} 条订单`);
    await conn.query('DELETE FROM orders WHERE hotel_id > 4');

    // 5. 删除相关的收藏
    const [deleteFavorites] = await conn.query('SELECT COUNT(*) as count FROM favorites WHERE hotel_id > 4');
    console.log(`🗑️  将删除 ${deleteFavorites[0].count} 条收藏记录`);
    await conn.query('DELETE FROM favorites WHERE hotel_id > 4');

    // 6. 删除相关的价格日历(如果表存在)
    try {
      const [deletePrices] = await conn.query('SELECT COUNT(*) as count FROM price_calendar WHERE hotel_id > 4');
      console.log(`🗑️  将删除 ${deletePrices[0].count} 条价格记录`);
      await conn.query('DELETE FROM price_calendar WHERE hotel_id > 4');
    } catch (err) {
      console.log(`⚠️  跳过价格日历清理: ${err.message}`);
    }

    // 7. 删除酒店
    await conn.query('DELETE FROM hotels WHERE id > 4');

    // 8. 最终统计
    console.log('\n✅ 清理完成！\n');
    console.log('📊 当前数据库状态:');
    
    const [hotelCount] = await conn.query('SELECT COUNT(*) as count FROM hotels');
    console.log(`   - 酒店总数: ${hotelCount[0].count}`);
    
    const [reviewCount] = await conn.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`   - 评论总数: ${reviewCount[0].count}`);
    
    const [orderCount] = await conn.query('SELECT COUNT(*) as count FROM orders');
    console.log(`   - 订单总数: ${orderCount[0].count}`);
    
    const [favoriteCount] = await conn.query('SELECT COUNT(*) as count FROM favorites');
    console.log(`   - 收藏总数: ${favoriteCount[0].count}`);

    console.log('\n✅ 数据库已准备好导入新数据！');

  } catch (error) {
    console.error('\n❌ 清理失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

keepOnlyOriginalHotels();
