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

async function importData() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🚀 开始导入数据\n');

    // 1. 导入酒店数据
    console.log('🏨 导入酒店数据...');
    const hotelsData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/hotels.json'), 'utf-8')
    );
    
    let hotelCount = 0;
    for (const hotel of hotelsData) {
      try {
        await conn.execute(
          `INSERT INTO hotels (
            id, name, city, address, stars, price, rating, review_count, 
            tags, facilities, images, check_in_time, check_out_time, 
            cancel_policy, description, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
          ON DUPLICATE KEY UPDATE
            rating = VALUES(rating),
            review_count = VALUES(review_count),
            tags = VALUES(tags),
            facilities = VALUES(facilities)`,
          [
            hotel.id,
            hotel.name,
            hotel.city,
            hotel.address,
            hotel.stars,
            hotel.basePrice,
            hotel.rating,
            hotel.reviewCount,
            JSON.stringify(hotel.tags),
            JSON.stringify(hotel.facilities),
            JSON.stringify(hotel.images),
            hotel.checkInTime,
            hotel.checkOutTime,
            JSON.stringify(hotel.cancelPolicy),
            hotel.description
          ]
        );
        hotelCount++;
      } catch (err) {
        console.error(`  ⚠️  导入酒店 ${hotel.id} 失败:`, err.message);
      }
    }
    console.log(`  ✓ 成功导入 ${hotelCount}/${hotelsData.length} 条酒店数据\n`);

    // 2. 导入订单数据
    console.log('📋 导入订单数据...');
    const ordersData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/orders.json'), 'utf-8')
    );
    
    let orderCount = 0;
    for (const order of ordersData) {
      try {
        await conn.execute(
          `INSERT INTO orders (
            id, user_id, hotel_id, room_type, status, 
            check_in_date, check_out_date, nights, adults, children, 
            total_price, create_time, update_time, cancel_deadline, 
            cancel_policy, logs, risk_flags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            update_time = VALUES(update_time)`,
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

    // 3. 导入评价数据
    console.log('💬 导入评价数据...');
    const reviewsData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/reviews.json'), 'utf-8')
    );
    
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

    // 4. 更新用户数据
    console.log('👥 更新用户数据...');
    const usersData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../data/processed/users.json'), 'utf-8')
    );
    
    let userCount = 0;
    for (const user of usersData) {
      try {
        // 检查用户是否存在
        const [existing] = await conn.execute(
          'SELECT id FROM users WHERE id = ?',
          [user.id]
        );

        if (existing.length > 0) {
          // 更新现有用户
          await conn.execute(
            `UPDATE users SET 
              preferences = ?, 
              favorites = ?
            WHERE id = ?`,
            [
              JSON.stringify(user.preferences),
              JSON.stringify(user.favorites),
              user.id
            ]
          );
        } else {
          // 插入新用户
          await conn.execute(
            `INSERT INTO users (
              id, username, email, phone, password, role, 
              preferences, favorites
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              user.id,
              user.username,
              user.email,
              user.phone,
              user.password, // 注意：实际使用时应该加密
              user.role,
              JSON.stringify(user.preferences),
              JSON.stringify(user.favorites)
            ]
          );
        }
        userCount++;
      } catch (err) {
        console.error(`  ⚠️  更新用户 ${user.id} 失败:`, err.message);
      }
    }
    console.log(`  ✓ 成功处理 ${userCount}/${usersData.length} 条用户数据\n`);

    // 5. 统计信息
    console.log('📊 数据统计:');
    
    const [hotelStats] = await conn.query('SELECT COUNT(*) as count FROM hotels');
    console.log(`  - 酒店总数: ${hotelStats[0].count}`);
    
    const [orderStats] = await conn.query('SELECT COUNT(*) as count, status FROM orders GROUP BY status');
    console.log(`  - 订单总数: ${ordersData.length}`);
    orderStats.forEach(stat => {
      console.log(`    ${stat.status}: ${stat.count}`);
    });
    
    const [reviewStats] = await conn.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`  - 评价总数: ${reviewStats[0].count}`);
    
    const [userStats] = await conn.query('SELECT COUNT(*) as count FROM users');
    console.log(`  - 用户总数: ${userStats[0].count}`);

    console.log('\n✅ 数据导入完成！');
    console.log('\n🎯 下一步:');
    console.log('  1. 启动后端服务: cd backend && npm start');
    console.log('  2. 启动前端服务: npm run dev');
    console.log('  3. 开始开发任务11-14\n');

  } catch (error) {
    console.error('\n❌ 导入失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

importData();
