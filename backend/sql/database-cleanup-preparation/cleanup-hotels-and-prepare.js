#!/usr/bin/env node

// 完整的数据库清理和准备脚本（包括清理酒店）
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
    
    // 步骤2: 清理所有业务数据（包括酒店）
    reporter.phase('清理现有数据（包括酒店）');
    
    // 清理订单、评价、收藏、价格历史
    const cleaner = new DataCleaner(db);
    await cleaner.clean();
    
    // 清理酒店和房型数据
    await db.query('DELETE FROM room_types');
    await db.query('DELETE FROM hotels');
    
    reporter.success('所有业务数据清理完成');
    
    // 步骤3: 创建精选酒店数据
    reporter.phase('创建精选酒店数据');
    
    const hotels = [
      {
        id: 1,
        name: '北京国际大饭店',
        address: '北京市朝阳区建国门外大街1号',
        city: 'beijing',
        status: 'published',
        merchantId: 2,
        openingDate: '2015-03-15',
        stars: 5,
        tags: JSON.stringify(['WiFi', '停车场', '健身房', '游泳池', 'SPA']),
        description: '五星级豪华酒店，拥有完善的娱乐和休闲设施，提供顶级的住宿体验。',
        images: JSON.stringify(['/uploads/hotels/0.png', '/uploads/hotels/1.png'])
      },
      {
        id: 2,
        name: '上海外滩华尔道夫酒店',
        address: '上海市黄浦区中山东一路2号',
        city: 'shanghai',
        status: 'published',
        merchantId: 2,
        openingDate: '2011-05-20',
        stars: 5,
        tags: JSON.stringify(['WiFi', '停车场', '健身房', '游泳池', 'SPA', '餐厅', '会议室']),
        description: '坐落于外滩核心位置，尽享黄浦江美景，奢华与历史完美融合。',
        images: JSON.stringify(['/uploads/hotels/2.png', '/uploads/hotels/3.png'])
      },
      {
        id: 3,
        name: '广州白天鹅宾馆',
        address: '广州市越秀区沙面南街1号',
        city: 'guangzhou',
        status: 'published',
        merchantId: 3,
        openingDate: '2008-10-15',
        stars: 5,
        tags: JSON.stringify(['WiFi', '停车场', '健身房', '游泳池', 'SPA', '餐厅']),
        description: '广州老牌五星级酒店，坐落于珠江边，享有绝佳江景。',
        images: JSON.stringify(['/uploads/hotels/4.png'])
      },
      {
        id: 4,
        name: '深圳瑞吉酒店',
        address: '深圳市福田区深南大道5016号',
        city: 'shenzhen',
        status: 'published',
        merchantId: 3,
        openingDate: '2012-08-15',
        stars: 5,
        tags: JSON.stringify(['WiFi', '停车场', '健身房', '游泳池', 'SPA', '餐厅', '会议室']),
        description: '深圳顶级奢华酒店，位于CBD核心，服务一流。',
        images: JSON.stringify(['/uploads/hotels/5.png'])
      }
    ];
    
    // 插入酒店数据
    for (const hotel of hotels) {
      await db.execute(
        `INSERT INTO hotels (id, name, address, city, status, merchantId, openingDate, stars, tags, description, images)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hotel.id,
          hotel.name,
          hotel.address,
          hotel.city,
          hotel.status,
          hotel.merchantId,
          hotel.openingDate,
          hotel.stars,
          hotel.tags,
          hotel.description,
          hotel.images
        ]
      );
    }
    
    reporter.success(`创建了 ${hotels.length} 个精选酒店`);
    
    // 步骤4: 创建房型数据
    reporter.phase('创建房型数据');
    
    const roomTypes = [
      // 北京国际大饭店的房型
      { id: 1, hotelId: 1, roomType: '豪华大床房', price: 888 },
      { id: 2, hotelId: 1, roomType: '行政套房', price: 1288 },
      
      // 上海外滩华尔道夫酒店的房型
      { id: 3, hotelId: 2, roomType: '豪华江景房', price: 1280 },
      { id: 4, hotelId: 2, roomType: '总统套房', price: 2888 },
      
      // 广州白天鹅宾馆的房型
      { id: 5, hotelId: 3, roomType: '豪华江景房', price: 780 },
      { id: 6, hotelId: 3, roomType: '行政套房', price: 1180 },
      
      // 深圳瑞吉酒店的房型
      { id: 7, hotelId: 4, roomType: '豪华房', price: 1180 },
      { id: 8, hotelId: 4, roomType: '总统套房', price: 2688 }
    ];
    
    for (const roomType of roomTypes) {
      await db.execute(
        `INSERT INTO room_types (id, hotelId, roomType, price)
         VALUES (?, ?, ?, ?)`,
        [roomType.id, roomType.hotelId, roomType.roomType, roomType.price]
      );
    }
    
    reporter.success(`创建了 ${roomTypes.length} 个房型`);
    
    // 步骤5: 加载用户数据
    reporter.phase('加载用户数据');
    const [users] = await db.query('SELECT * FROM users');
    reporter.info(`加载了 ${users.length} 个用户`);
    
    // 步骤6: 生成订单数据
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
    
    // 步骤7: 生成评价数据
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
    
    // 步骤8: 生成收藏数据
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
    
    // 步骤9: 生成价格历史数据
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
    
    console.log('\n🎉 数据库已完全重置并准备好用于演示！');
    console.log('\n📝 数据摘要:');
    console.log(`  - 酒店: ${hotels.length} 个精选酒店`);
    console.log(`  - 房型: ${roomTypes.length} 种`);
    console.log(`  - 用户: ${users.length} 个`);
    console.log(`  - 订单: ${orders.length} 个`);
    console.log(`  - 评价: ${reviews.length} 条`);
    console.log(`  - 收藏: ${favorites.length} 条`);
    console.log(`  - 价格历史: ${priceHistory.length} 条记录`);
    
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
