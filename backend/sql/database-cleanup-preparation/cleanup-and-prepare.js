#!/usr/bin/env node

// 数据库清理和数据准备主脚本
const Database = require('./utils/database');
const Reporter = require('./utils/reporter');
const SchemaValidator = require('./modules/validator');
const DataCleaner = require('./modules/cleaner');
const OrderGenerator = require('./modules/generators/orderGenerator');
const ReviewGenerator = require('./modules/generators/reviewGenerator');
const FavoriteGenerator = require('./modules/generators/favoriteGenerator');
const PriceHistoryGenerator = require('./modules/generators/priceGenerator');
const defaultConfig = require('./config/default');

async function main() {
  const db = new Database();
  const reporter = new Reporter();
  
  try {
    reporter.start();
    
    // 连接数据库
    await db.connect();
    reporter.success('数据库连接成功');
    
    // 步骤1: 验证架构
    reporter.phase('验证数据库架构');
    const validator = new SchemaValidator(db);
    const validationResult = await validator.validate();
    
    if (!validationResult.valid) {
      validationResult.errors.forEach(error => {
        reporter.error(error.message);
      });
      throw new Error('架构验证失败，请先修复上述问题');
    }
    
    if (validationResult.warnings.length > 0) {
      validationResult.warnings.forEach(warning => {
        reporter.warning(warning.message);
      });
    }
    
    reporter.success('架构验证通过');
    
    // 步骤2: 清理数据
    reporter.phase('清理现有数据');
    const cleaner = new DataCleaner(db);
    await cleaner.clean();
    reporter.success('数据清理完成');
    
    // 步骤3: 加载基础数据
    reporter.phase('加载基础数据');
    const [users] = await db.query('SELECT * FROM users');
    const [hotels] = await db.query('SELECT * FROM hotels WHERE deleted_at IS NULL');
    const [roomTypes] = await db.query('SELECT * FROM room_types');
    
    reporter.info(`加载了 ${users.length} 个用户`);
    reporter.info(`加载了 ${hotels.length} 个酒店`);
    reporter.info(`加载了 ${roomTypes.length} 个房型`);
    
    // 步骤4: 生成订单数据
    reporter.phase('生成订单数据');
    const orderGenerator = new OrderGenerator(db, defaultConfig);
    const orders = await orderGenerator.generate(users, hotels, roomTypes);
    reporter.info(`生成了 ${orders.length} 个订单`);
    
    // 插入订单数据
    for (const order of orders) {
      await db.execute(
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
          order.cancelPolicy,
          order.logs,
          order.riskFlags
        ]
      );
    }
    reporter.success(`订单数据插入完成`);
    reporter.updateStats('orders', orders.length);
    
    // 步骤5: 生成评价数据
    reporter.phase('生成评价数据');
    const reviewGenerator = new ReviewGenerator(db, defaultConfig);
    const reviews = await reviewGenerator.generate(orders, hotels);
    reporter.info(`生成了 ${reviews.length} 条评价`);
    
    // 插入评价数据
    for (const review of reviews) {
      await db.execute(
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
          review.dimensions,
          review.content,
          review.images,
          review.tags,
          review.sentiment,
          review.helpful,
          review.reported,
          review.merchantReply,
          review.createTime
        ]
      );
    }
    reporter.success(`评价数据插入完成`);
    reporter.updateStats('reviews', reviews.length);
    
    // 步骤6: 生成收藏数据
    reporter.phase('生成收藏数据');
    const favoriteGenerator = new FavoriteGenerator(db, defaultConfig);
    const favorites = await favoriteGenerator.generate(users, hotels);
    reporter.info(`生成了 ${favorites.length} 条收藏`);
    
    // 插入收藏数据
    for (const favorite of favorites) {
      await db.execute(
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
    }
    reporter.success(`收藏数据插入完成`);
    reporter.updateStats('favorites', favorites.length);
    
    // 步骤7: 生成价格历史数据
    reporter.phase('生成价格历史数据');
    const priceGenerator = new PriceHistoryGenerator(db, defaultConfig);
    const priceHistory = await priceGenerator.generate(hotels, roomTypes);
    reporter.info(`生成了 ${priceHistory.length} 条价格历史记录`);
    
    // 批量插入价格历史数据
    const batchSize = 1000;
    for (let i = 0; i < priceHistory.length; i += batchSize) {
      const batch = priceHistory.slice(i, i + batchSize);
      const values = batch.map(p => [
        p.hotelId,
        p.date,
        p.price,
        p.occupancyRate,
        p.isWeekend,
        p.isHoliday
      ]);
      
      await db.query(
        `INSERT IGNORE INTO price_history (hotel_id, date, price, occupancy_rate, is_weekend, is_holiday)
         VALUES ?`,
        [values]
      );
    }
    reporter.success(`价格历史数据插入完成`);
    reporter.updateStats('priceHistory', priceHistory.length);
    
    // 完成
    reporter.finish();
    
  } catch (error) {
    reporter.error('执行失败', error);
    console.error('\n详细错误信息:');
    console.error(error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// 运行主函数
main();
