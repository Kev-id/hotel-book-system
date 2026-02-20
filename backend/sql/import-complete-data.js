const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

async function importCompleteData() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🚀 开始导入完整业务数据\n');

    // 1. 导入订单数据
    console.log('📋 导入订单数据...');
    const ordersData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/orders_complete.json'), 'utf-8')
    );
    
    // 清空现有订单数据
    await conn.query('TRUNCATE TABLE orders');
    
    let orderCount = 0;
    for (const order of ordersData) {
      try {
        await conn.execute(
          `INSERT INTO orders (
            id, user_id, hotel_id, room_type, status,
            check_in_date, check_out_date, nights, adults, children,
            total_price, create_time, update_time, cancel_deadline,
            cancel_policy, logs, risk_flags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order.id,
            order.userId,
            order.hotelId,
            order.roomType,
            order.status,
            order.checkInDate,
            order.checkOutDate,
            order.nights,
            order.adults,
            order.children,
            order.totalPrice,
            order.createTime,
            order.updateTime,
            order.cancelDeadline,
            JSON.stringify(order.cancelPolicy),
            JSON.stringify(order.logs),
            JSON.stringify(order.riskFlags)
          ]
        );
        orderCount++;
      } catch (err) {
        console.error(`  ⚠️  导入订单 ${order.id} 失败:`, err.message);
      }
    }
    console.log(`  ✓ 成功导入 ${orderCount}/${ordersData.length} 条订单数据\n`);

    // 2. 导入评价数据
    console.log('💬 导入评价数据...');
    const reviewsData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/reviews_complete.json'), 'utf-8')
    );
    
    // 清空现有评价数据
    await conn.query('TRUNCATE TABLE reviews');
    
    let reviewCount = 0;
    for (const review of reviewsData) {
      try {
        await conn.execute(
          `INSERT INTO reviews (
            user_id, hotel_id, order_id, overall_rating, dimensions,
            content, images, tags, sentiment, helpful, reported,
            merchant_reply, create_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            review.userId,
            review.hotelId,
            review.orderId,
            review.overallRating,
            JSON.stringify(review.dimensions),
            review.content,
            JSON.stringify(review.images),
            JSON.stringify(review.tags),
            review.sentiment,
            review.helpful,
            review.reported,
            JSON.stringify(review.merchantReply),
            review.createTime
          ]
        );
        reviewCount++;
      } catch (err) {
        console.error(`  ⚠️  导入评价失败:`, err.message);
      }
    }
    console.log(`  ✓ 成功导入 ${reviewCount}/${reviewsData.length} 条评价数据\n`);

    // 3. 创建并导入收藏表
    console.log('⭐ 创建收藏表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        category VARCHAR(50),
        note TEXT,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_hotel_id (hotel_id),
        UNIQUE KEY unique_user_hotel (user_id, hotel_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✓ 收藏表创建成功');

    console.log('⭐ 导入收藏数据...');
    const favoritesData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/favorites.json'), 'utf-8')
    );
    
    let favoriteCount = 0;
    for (const favorite of favoritesData) {
      try {
        await conn.execute(
          `INSERT IGNORE INTO favorites (id, user_id, hotel_id, category, note, create_time)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            favorite.id,
            favorite.userId,
            favorite.hotelId,
            favorite.category,
            favorite.note,
            favorite.createTime
          ]
        );
        favoriteCount++;
      } catch (err) {
        console.error(`  ⚠️  导入收藏失败:`, err.message);
      }
    }
    console.log(`  ✓ 成功导入 ${favoriteCount}/${favoritesData.length} 条收藏数据\n`);

    // 4. 创建并导入价格历史表
    console.log('💰 创建价格历史表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT NOT NULL,
        date DATE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        occupancy_rate DECIMAL(3,2),
        is_weekend BOOLEAN DEFAULT FALSE,
        is_holiday BOOLEAN DEFAULT FALSE,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_hotel_date (hotel_id, date),
        UNIQUE KEY unique_hotel_date (hotel_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✓ 价格历史表创建成功');

    console.log('💰 导入价格历史数据...');
    const priceHistoryData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/price_history.json'), 'utf-8')
    );
    
    let priceCount = 0;
    // 批量插入以提高性能
    const batchSize = 1000;
    for (let i = 0; i < priceHistoryData.length; i += batchSize) {
      const batch = priceHistoryData.slice(i, i + batchSize);
      const values = batch.map(p => [
        p.hotelId,
        p.date,
        p.price,
        p.occupancyRate,
        p.isWeekend,
        p.isHoliday
      ]);
      
      try {
        await conn.query(
          `INSERT IGNORE INTO price_history (hotel_id, date, price, occupancy_rate, is_weekend, is_holiday)
           VALUES ?`,
          [values]
        );
        priceCount += batch.length;
      } catch (err) {
        console.error(`  ⚠️  批量导入价格历史失败:`, err.message);
      }
    }
    console.log(`  ✓ 成功导入 ${priceCount}/${priceHistoryData.length} 条价格历史数据\n`);

    // 5. 更新用户偏好数据
    console.log('👤 更新用户偏好数据...');
    const usersData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/users_complete.json'), 'utf-8')
    );
    
    let userCount = 0;
    for (const user of usersData) {
      try {
        await conn.execute(
          `UPDATE users SET preferences = ?, favorites = ? WHERE id = ?`,
          [
            JSON.stringify(user.preferences),
            JSON.stringify(user.favorites),
            user.id
          ]
        );
        userCount++;
      } catch (err) {
        // 忽略不存在的用户
      }
    }
    console.log(`  ✓ 成功更新 ${userCount} 个用户的偏好数据\n`);

    // 6. 统计信息
    console.log('📊 数据统计:');
    
    const [orderStats] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM orders
    `);
    console.log(`  - 订单总数: ${orderStats[0].total}`);
    console.log(`    待确认: ${orderStats[0].pending}`);
    console.log(`    已确认: ${orderStats[0].confirmed}`);
    console.log(`    已完成: ${orderStats[0].completed}`);
    console.log(`    已取消: ${orderStats[0].cancelled}`);
    
    const [reviewStats] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        AVG(overall_rating) as avg_rating,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative
      FROM reviews
    `);
    console.log(`  - 评价总数: ${reviewStats[0].total}`);
    console.log(`    平均评分: ${reviewStats[0].avg_rating ? Number(reviewStats[0].avg_rating).toFixed(2) : 'N/A'}`);
    console.log(`    正面: ${reviewStats[0].positive}, 中性: ${reviewStats[0].neutral}, 负面: ${reviewStats[0].negative}`);
    
    const [favoriteStats] = await conn.query('SELECT COUNT(*) as total FROM favorites');
    console.log(`  - 收藏总数: ${favoriteStats[0].total}`);
    
    const [priceStats] = await conn.query('SELECT COUNT(*) as total FROM price_history');
    console.log(`  - 价格历史: ${priceStats[0].total} 条记录`);

    console.log('\n✅ 完整业务数据导入完成！');
    console.log('\n🎯 支持的功能:');
    console.log('  ✅ 任务11: 订单管理系统');
    console.log('  ✅ 任务12: 用户评价系统');
    console.log('  ✅ 任务13: 收藏与智能对比');
    console.log('  ✅ 任务14: 数据分析看板');
    console.log('  ✅ 任务15: 评价智能分析');
    console.log('  ✅ 任务16: 智能定价建议');

  } catch (error) {
    console.error('\n❌ 导入失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

importCompleteData();
