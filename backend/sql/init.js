const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
});

const initDB = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const dbName = process.env.DB_NAME || 'hotel_booking';

    // 创建数据库
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ 数据库 ${dbName} 创建成功`);

    // 选择数据库
    await conn.query(`USE ${dbName}`);

    // 创建用户表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        role ENUM('admin', 'merchant', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ users 表创建成功');

    // 创建酒店表（移除 price 和 roomType 字段）
    await conn.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(200) NOT NULL,
        city VARCHAR(50),
        status ENUM('pending', 'published', 'rejected') DEFAULT 'pending',
        rejectReason VARCHAR(500),
        merchantId INT,
        openingDate DATE,
        stars INT,
        tags JSON,
        description TEXT,
        images JSON,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchantId) REFERENCES users(id)
      )
    `);
    console.log('✓ hotels 表创建成功');

    // 创建房型表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS room_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotelId INT NOT NULL,
        roomType VARCHAR(50) NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotelId) REFERENCES hotels(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ room_types 表创建成功');

    // 创建价格日历表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS price_calendar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotelId INT NOT NULL,
        roomTypeId INT NOT NULL,
        date DATE NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_room_date (hotelId, roomTypeId, date),
        FOREIGN KEY (hotelId) REFERENCES hotels(id) ON DELETE CASCADE,
        FOREIGN KEY (roomTypeId) REFERENCES room_types(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ price_calendar 表创建成功');

    // 插入用户数据
    await conn.query(`
      INSERT IGNORE INTO users (id, username, password, email, phone, role) VALUES
      (1, 'admin1', '123456', NULL, NULL, 'admin'),
      (2, 'merchant1', '123456', NULL, NULL, 'merchant'),
      (3, '陈凯文', 'Kv20060426', '123@qq.com', '18017402610', 'merchant'),
      (4, 'icc', 'Wang2006', NULL, NULL, 'admin'),
      (5, 'user1', '123456', NULL, NULL, 'user')
    `);
    console.log('✓ 用户数据插入成功');

    // 插入酒店数据（4个酒店，使用在线图片）
    await conn.query(`
      INSERT IGNORE INTO hotels (id, name, address, city, status, merchantId, openingDate, stars, tags, description, images) VALUES
      (1, '北京国际大饭店', '北京市朝阳区建国门外大街1号', 'beijing', 'published', 2, '2015-03-15', 5, 
       '["WiFi", "停车场", "健身房", "游泳池", "SPA"]', 
       '五星级豪华酒店，拥有完善的娱乐和休闲设施，提供顶级的住宿体验。',
       '["/uploads/hotels/0.png", "/uploads/hotels/1.png"]'),
      
      (2, '上海外滩华尔道夫酒店', '上海市黄浦区中山东一路2号', 'shanghai', 'published', 2, '2011-05-20', 5,
       '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]',
       '坐落于外滩核心位置，尽享黄浦江美景，奢华与历史完美融合。',
       '["/uploads/hotels/2.png", "/uploads/hotels/3.png"]'),
      
      (3, '广州白天鹅宾馆', '广州市越秀区沙面南街1号', 'guangzhou', 'published', 3, '2008-10-15', 5,
       '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅"]',
       '广州老牌五星级酒店，坐落于珠江边，享有绝佳江景。',
       '["/uploads/hotels/4.png"]'),
      
      (4, '深圳瑞吉酒店', '深圳市福田区深南大道5016号', 'shenzhen', 'published', 3, '2012-08-15', 5,
       '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]',
       '深圳顶级奢华酒店，位于CBD核心，服务一流。',
       '["/uploads/hotels/5.png"]')
    `);
    console.log('✓ 酒店数据插入成功（4家）');

    // 插入房型数据（每个酒店2种房型）
    await conn.query(`
      INSERT IGNORE INTO room_types (id, hotelId, roomType, price) VALUES
      -- 北京国际大饭店的房型
      (1, 1, '豪华大床房', 888),
      (2, 1, '行政套房', 1288),
      
      -- 上海外滩华尔道夫酒店的房型
      (3, 2, '豪华江景房', 1280),
      (4, 2, '总统套房', 2888),
      
      -- 广州白天鹅宾馆的房型
      (5, 3, '豪华江景房', 780),
      (6, 3, '行政套房', 1180),
      
      -- 深圳瑞吉酒店的房型
      (7, 4, '豪华房', 1180),
      (8, 4, '总统套房', 2688)
    `);
    console.log('✓ 房型数据插入成功（每个酒店2种房型）');

    // 创建 orders 表
    console.log('\n📋 创建 orders 表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        room_type VARCHAR(50),
        status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled') DEFAULT 'pending',
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        nights INT NOT NULL,
        adults INT DEFAULT 1,
        children INT DEFAULT 0,
        total_price DECIMAL(10,2) NOT NULL,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        cancel_deadline DATETIME,
        cancel_policy JSON,
        logs JSON,
        risk_flags JSON,
        INDEX idx_user_id (user_id),
        INDEX idx_hotel_id (hotel_id),
        INDEX idx_status (status),
        INDEX idx_check_in (check_in_date),
        INDEX idx_create_time (create_time),
        INDEX idx_orders_merchant_time (hotel_id, create_time, status),
        INDEX idx_orders_analytics (hotel_id, status, create_time, total_price)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ orders 表创建成功');

    // 创建 reviews 表
    console.log('\n💬 创建 reviews 表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        order_id INT,
        overall_rating DECIMAL(2,1) NOT NULL,
        dimensions JSON NOT NULL COMMENT '5维度评分',
        content TEXT,
        images JSON,
        tags JSON,
        sentiment ENUM('positive', 'neutral', 'negative'),
        helpful INT DEFAULT 0,
        reported BOOLEAN DEFAULT FALSE,
        merchant_reply JSON,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_hotel_id (hotel_id),
        INDEX idx_user_id (user_id),
        INDEX idx_rating (overall_rating),
        INDEX idx_create_time (create_time),
        INDEX idx_sentiment (sentiment),
        INDEX idx_reviews_hotel_time (hotel_id, create_time, overall_rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ reviews 表创建成功');

    // 扩展 hotels 表
    console.log('\n🏨 扩展 hotels 表字段...');
    const hotelExtensions = [
      'rating DECIMAL(2,1) DEFAULT 0',
      'review_count INT DEFAULT 0',
      'facilities JSON',
      'coordinates JSON',
      'check_in_time VARCHAR(10) DEFAULT "14:00"',
      'check_out_time VARCHAR(10) DEFAULT "12:00"',
      'cancel_policy JSON'
    ];

    for (const ext of hotelExtensions) {
      const colName = ext.split(' ')[0];
      try {
        await conn.query(`ALTER TABLE hotels ADD COLUMN ${ext}`);
        console.log(`  ✓ 添加 ${colName} 列`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ✓ ${colName} 列已存在`);
        } else {
          throw err;
        }
      }
    }

    // 扩展 users 表
    console.log('\n👥 扩展 users 表字段...');
    const userExtensions = [
      'preferences JSON',
      'favorites JSON'
    ];

    for (const ext of userExtensions) {
      const colName = ext.split(' ')[0];
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN ${ext}`);
        console.log(`  ✓ 添加 ${colName} 列`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ✓ ${colName} 列已存在`);
        } else {
          throw err;
        }
      }
    }

    // 创建收藏表
    console.log('\n⭐ 创建 favorites 表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        category VARCHAR(50),
        ai_reason TEXT,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorite (user_id, hotel_id),
        INDEX idx_user_category (user_id, category),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表'
    `);
    console.log('✓ favorites 表创建成功');

    // 创建浏览历史表
    console.log('\n📖 创建 browse_history 表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS browse_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        browse_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration INT DEFAULT 0,
        INDEX idx_user_browse_time (user_id, browse_time),
        INDEX idx_user_hotel_time (user_id, hotel_id, browse_time),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户浏览历史表'
    `);
    console.log('✓ browse_history 表创建成功');

    // 创建AI缓存表
    console.log('\n🤖 创建 review_ai_cache 表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS review_ai_cache (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotel_id INT NOT NULL,
        cache_type VARCHAR(50) NOT NULL,
        cache_key VARCHAR(100) NOT NULL,
        cache_data JSON NOT NULL,
        reviews_count INT NOT NULL,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expire_time TIMESTAMP NOT NULL,
        INDEX idx_hotel_type_key (hotel_id, cache_type, cache_key),
        INDEX idx_expire (expire_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI分析缓存表'
    `);
    console.log('✓ review_ai_cache 表创建成功');

    // 创建质量标记表
    console.log('\n🔍 创建 review_quality_flags 表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS review_quality_flags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        review_id INT NOT NULL,
        flag_type VARCHAR(50) NOT NULL,
        confidence DECIMAL(3,2) NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_review (review_id),
        INDEX idx_status (status),
        INDEX idx_status_created (status, create_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价质量标记表'
    `);
    console.log('✓ review_quality_flags 表创建成功');

    // 创建AI调用日志表
    console.log('\n📊 创建 ai_call_logs 表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_call_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        service_type VARCHAR(50) NOT NULL,
        prompt_length INT NOT NULL,
        duration_ms INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_service_status (service_type, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI调用日志表'
    `);
    console.log('✓ ai_call_logs 表创建成功');

    // ==================== 数据导入 ====================
    console.log('\n📦 开始导入数据...');

    // 1. 导入用户数据
    console.log('\n👤 导入用户数据...');
    try {
      const usersData = JSON.parse(
        await fs.readFile(path.join(__dirname, '../../data/processed/users_complete.json'), 'utf-8')
      );
      
      let userCount = 0;
      for (const user of usersData) {
        try {
          await conn.execute(
            `INSERT IGNORE INTO users (id, username, password, email, phone, role, preferences, favorites, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              user.id,
              user.username,
              user.password,
              user.email || null,
              user.phone || null,
              user.role || 'user',
              JSON.stringify(user.preferences || {}),
              JSON.stringify(user.favorites || []),
              user.createdAt || new Date()
            ]
          );
          userCount++;
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') {
            console.error(`  ⚠️  导入用户 ${user.username} 失败:`, err.message);
          }
        }
      }
      console.log(`  ✓ 成功导入 ${userCount}/${usersData.length} 个用户`);
    } catch (err) {
      console.error('  ⚠️  读取用户数据文件失败，使用默认测试用户');
      // 插入默认测试用户
      await conn.query(`
        INSERT IGNORE INTO users (id, username, password, email, phone, role) VALUES
        (1, 'admin1', '123456', NULL, NULL, 'admin'),
        (2, 'merchant1', '123456', NULL, NULL, 'merchant'),
        (3, '陈凯文', 'Kv20060426', '123@qq.com', '18017402610', 'merchant'),
        (4, 'icc', 'Wang2006', NULL, NULL, 'admin'),
        (5, 'user1', '123456', NULL, NULL, 'user')
      `);
      console.log('  ✓ 使用默认测试用户（5个）');
    }

    // 2. 导入酒店数据
    console.log('\n🏨 导入酒店数据...');
    try {
      const hotelsData = JSON.parse(
        await fs.readFile(path.join(__dirname, '../../data/processed/hotels.json'), 'utf-8')
      );
      
      let hotelCount = 0;
      for (const hotel of hotelsData) {
        try {
          await conn.execute(
            `INSERT IGNORE INTO hotels (
              id, name, address, city, status, merchantId, stars,
              tags, description, images, rating, review_count, facilities,
              coordinates, check_in_time, check_out_time, cancel_policy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              hotel.id,
              hotel.name,
              hotel.address,
              hotel.city,
              hotel.status || 'published',
              2,  // 默认商户ID
              hotel.stars || 5,
              JSON.stringify(hotel.tags || []),
              hotel.description || `${hotel.name}位于${hotel.city}市中心，交通便利，设施完善。`,
              JSON.stringify(hotel.images || []),
              hotel.rating || 0,
              hotel.reviewCount || 0,
              JSON.stringify(hotel.facilities || []),
              JSON.stringify(hotel.coordinates || {}),
              hotel.checkInTime || '14:00',
              hotel.checkOutTime || '12:00',
              JSON.stringify(hotel.cancelPolicy || {})
            ]
          );
          hotelCount++;
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') {
            console.error(`  ⚠️  导入酒店 ${hotel.name} 失败:`, err.message);
          }
        }
      }
      console.log(`  ✓ 成功导入 ${hotelCount}/${hotelsData.length} 家酒店`);
    } catch (err) {
      console.error('  ⚠️  读取酒店数据文件失败，使用默认测试酒店:', err.message);
      // 插入默认测试酒店
      await conn.query(`
        INSERT IGNORE INTO hotels (id, name, address, city, status, merchantId, openingDate, stars, tags, description, images) VALUES
        (1, '北京国际大饭店', '北京市朝阳区建国门外大街1号', 'beijing', 'published', 2, '2015-03-15', 5, 
         '["WiFi", "停车场", "健身房", "游泳池", "SPA"]', 
         '五星级豪华酒店，拥有完善的娱乐和休闲设施，提供顶级的住宿体验。',
         '["/uploads/hotels/0.png", "/uploads/hotels/1.png"]'),
        
        (2, '上海外滩华尔道夫酒店', '上海市黄浦区中山东一路2号', 'shanghai', 'published', 2, '2011-05-20', 5,
         '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]',
         '坐落于外滩核心位置，尽享黄浦江美景，奢华与历史完美融合。',
         '["/uploads/hotels/2.png", "/uploads/hotels/3.png"]'),
        
        (3, '广州白天鹅宾馆', '广州市越秀区沙面南街1号', 'guangzhou', 'published', 3, '2008-10-15', 5,
         '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅"]',
         '广州老牌五星级酒店，坐落于珠江边，享有绝佳江景。',
         '["/uploads/hotels/4.png"]'),
        
        (4, '深圳瑞吉酒店', '深圳市福田区深南大道5016号', 'shenzhen', 'published', 3, '2012-08-15', 5,
         '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]',
         '深圳顶级奢华酒店，位于CBD核心，服务一流。',
         '["/uploads/hotels/5.png"]')
      `);
      console.log('  ✓ 使用默认测试酒店（4家）');
    }

    // 3. 导入房型数据
    console.log('\n🛏️  导入房型数据...');
    try {
      const hotelsData = JSON.parse(
        await fs.readFile(path.join(__dirname, '../../data/processed/hotels.json'), 'utf-8')
      );
      
      let roomTypeCount = 0;
      for (const hotel of hotelsData) {
        if (hotel.rooms && Array.isArray(hotel.rooms)) {
          for (const room of hotel.rooms) {
            try {
              await conn.execute(
                `INSERT IGNORE INTO room_types (hotelId, roomType, price) VALUES (?, ?, ?)`,
                [hotel.id, room.type, room.price]
              );
              roomTypeCount++;
            } catch (err) {
              if (err.code !== 'ER_DUP_ENTRY') {
                console.error(`  ⚠️  导入房型失败:`, err.message);
              }
            }
          }
        }
      }
      console.log(`  ✓ 成功导入 ${roomTypeCount} 种房型`);
    } catch (err) {
      console.log('  ⚠️  从酒店数据生成房型失败，使用默认方式');
      // 为每个酒店创建2种房型
      const [hotels] = await conn.query('SELECT id FROM hotels');
      let roomTypeCount = 0;
      for (const hotel of hotels) {
        try {
          await conn.execute(
            `INSERT IGNORE INTO room_types (hotelId, roomType, price) VALUES
             (?, '豪华大床房', ?),
             (?, '行政套房', ?)`,
            [hotel.id, 800 + Math.floor(Math.random() * 500), hotel.id, 1200 + Math.floor(Math.random() * 1000)]
          );
          roomTypeCount += 2;
        } catch (err) {
          console.error(`  ⚠️  生成房型失败:`, err.message);
        }
      }
      console.log(`  ✓ 成功生成 ${roomTypeCount} 种房型`);
    }

    // 4. 导入订单数据
    console.log('\n📋 导入订单数据...');
    try {
      const ordersData = JSON.parse(
        await fs.readFile(path.join(__dirname, '../../data/processed/orders_complete.json'), 'utf-8')
      );
      
      let orderCount = 0;
      for (const order of ordersData) {
        try {
          await conn.execute(
            `INSERT IGNORE INTO orders (
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
              JSON.stringify(order.cancelPolicy || {}),
              JSON.stringify(order.logs || []),
              JSON.stringify(order.riskFlags || [])
            ]
          );
          orderCount++;
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') {
            console.error(`  ⚠️  导入订单失败:`, err.message);
          }
        }
      }
      console.log(`  ✓ 成功导入 ${orderCount}/${ordersData.length} 条订单`);
    } catch (err) {
      console.log('  ⚠️  订单数据文件不存在，跳过');
    }

    // 5. 导入评价数据
    console.log('\n💬 导入评价数据...');
    try {
      const reviewsData = JSON.parse(
        await fs.readFile(path.join(__dirname, '../../data/processed/reviews_complete.json'), 'utf-8')
      );
      
      let reviewCount = 0;
      for (const review of reviewsData) {
        try {
          await conn.execute(
            `INSERT IGNORE INTO reviews (
              user_id, hotel_id, order_id, overall_rating, dimensions,
              content, images, tags, sentiment, helpful, reported,
              merchant_reply, create_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              review.userId,
              review.hotelId,
              review.orderId || null,
              review.overallRating,
              JSON.stringify(review.dimensions || {}),
              review.content,
              JSON.stringify(review.images || []),
              JSON.stringify(review.tags || []),
              review.sentiment || 'neutral',
              review.helpful || 0,
              review.reported || false,
              JSON.stringify(review.merchantReply || null),
              review.createTime
            ]
          );
          reviewCount++;
        } catch (err) {
          console.error(`  ⚠️  导入评价失败:`, err.message);
        }
      }
      console.log(`  ✓ 成功导入 ${reviewCount}/${reviewsData.length} 条评价`);
    } catch (err) {
      console.log('  ⚠️  评价数据文件不存在，跳过');
    }

    // 6. 导入收藏数据
    console.log('\n⭐ 导入收藏数据...');
    try {
      const favoritesData = JSON.parse(
        await fs.readFile(path.join(__dirname, '../../data/processed/favorites.json'), 'utf-8')
      );
      
      let favoriteCount = 0;
      for (const favorite of favoritesData) {
        try {
          await conn.execute(
            `INSERT IGNORE INTO favorites (user_id, hotel_id, category, ai_reason, create_time)
             VALUES (?, ?, ?, ?, ?)`,
            [
              favorite.userId,
              favorite.hotelId,
              favorite.category || '未分类',
              favorite.note || favorite.aiReason || '',
              favorite.createTime || new Date()
            ]
          );
          favoriteCount++;
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') {
            console.error(`  ⚠️  导入收藏失败:`, err.message);
          }
        }
      }
      console.log(`  ✓ 成功导入 ${favoriteCount}/${favoritesData.length} 条收藏`);
    } catch (err) {
      console.log('  ⚠️  收藏数据文件不存在，跳过');
    }

    // 插入测试价格数据
    console.log('\n📅 生成价格日历测试数据...');
    
    // 获取今天的日期
    const today = new Date();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const priceData = [];
    
    // 酒店1，房型1：未来7-10天涨价（周末）
    for (let i = 7; i <= 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      priceData.push({
        hotelId: 1,
        roomTypeId: 1,
        date: formatDate(date),
        price: 1288  // 周末涨价
      });
    }

    // 酒店1，房型2：未来15-20天促销
    for (let i = 15; i <= 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      priceData.push({
        hotelId: 1,
        roomTypeId: 2,
        date: formatDate(date),
        price: 999  // 促销价
      });
    }

    // 酒店2，房型3：未来5-8天涨价
    for (let i = 5; i <= 8; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      priceData.push({
        hotelId: 2,
        roomTypeId: 3,
        date: formatDate(date),
        price: 1688  // 特殊活动价
      });
    }

    // 插入价格数据
    for (const data of priceData) {
      await conn.query(
        `INSERT IGNORE INTO price_calendar (hotelId, roomTypeId, date, price) 
         VALUES (?, ?, ?, ?)`,
        [data.hotelId, data.roomTypeId, data.date, data.price]
      );
    }

    console.log(`✓ 价格日历数据插入成功（${priceData.length} 条记录）`);
    console.log('   - 酒店1房型1：未来7-10天周末价 ¥1288');
    console.log('   - 酒店1房型2：未来15-20天促销价 ¥999');
    console.log('   - 酒店2房型3：未来5-8天活动价 ¥1688');

    console.log('\n✅ 数据库初始化完成！');
    console.log('\n📊 数据统计：');
    
    const [userStats] = await conn.query('SELECT COUNT(*) as total FROM users');
    const [hotelStats] = await conn.query('SELECT COUNT(*) as total FROM hotels');
    const [roomStats] = await conn.query('SELECT COUNT(*) as total FROM room_types');
    const [orderStats] = await conn.query('SELECT COUNT(*) as total FROM orders');
    const [reviewStats] = await conn.query('SELECT COUNT(*) as total FROM reviews');
    const [favoriteStats] = await conn.query('SELECT COUNT(*) as total FROM favorites');
    const [priceStats] = await conn.query('SELECT COUNT(*) as total FROM price_calendar');
    
    console.log(`   - 用户：${userStats[0].total} 个`);
    console.log(`   - 酒店：${hotelStats[0].total} 家`);
    console.log(`   - 房型：${roomStats[0].total} 种`);
    console.log(`   - 订单：${orderStats[0].total} 条`);
    console.log(`   - 评价：${reviewStats[0].total} 条`);
    console.log(`   - 收藏：${favoriteStats[0].total} 条`);
    console.log(`   - 价格日历：${priceStats[0].total} 条`);
    
    console.log('\n📋 创建的表：');
    console.log('   - users (用户表)');
    console.log('   - hotels (酒店表)');
    console.log('   - room_types (房型表)');
    console.log('   - price_calendar (价格日历表)');
    console.log('   - orders (订单表)');
    console.log('   - reviews (评价表)');
    console.log('   - favorites (收藏表)');
    console.log('   - browse_history (浏览历史表)');
    console.log('   - review_ai_cache (AI缓存表)');
    console.log('   - review_quality_flags (质量标记表)');
    console.log('   - ai_call_logs (AI调用日志表)');
    
    console.log('\n🎯 下一步：');
    console.log('   1. 启动后端服务：npm run dev');
    console.log('   2. 启动前端服务：npm run dev（在项目根目录）');
    console.log('   3. 访问系统：http://localhost:5173');
    console.log('   4. 测试账号：admin1/123456, merchant1/123456, user1/123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
};

initDB();
