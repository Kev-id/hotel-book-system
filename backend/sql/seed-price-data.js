// ⚠️ 注意：此文件已整合到 init.js 中
// 
// 这个文件保留作为参考，展示如何独立生成价格日历测试数据。
// 
// 正常情况下，运行 `node sql/init.js` 就会自动生成测试数据，
// 不需要单独运行此脚本。
// 
// 如果需要添加更多测试数据或自定义价格数据，可以：
// 1. 修改此文件
// 2. 运行 `node sql/seed-price-data.js`
// 
// 用途：
// - 学习价格数据生成逻辑
// - 添加额外的测试数据
// - 自定义价格数据
// 
// 相关文件：
// - sql/init.js - 主初始化脚本（已包含价格数据生成）
// - 数据库初始化整合说明.md - 整合说明文档
// ============================================================

// 为测试添加一些价格日历数据
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking'
});

async function seedPriceData() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('开始添加测试价格数据...\n');

    // 获取今天的日期
    const today = new Date();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 为未来30天设置一些特殊价格
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

    // 插入数据
    for (const data of priceData) {
      await conn.query(
        `INSERT INTO price_calendar (hotelId, roomTypeId, date, price) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE price = ?`,
        [data.hotelId, data.roomTypeId, data.date, data.price, data.price]
      );
    }

    console.log(`✅ 成功添加 ${priceData.length} 条价格数据`);
    console.log('\n价格数据示例：');
    console.log('- 酒店1房型1：未来7-10天周末价 ¥1288');
    console.log('- 酒店1房型2：未来15-20天促销价 ¥999');
    console.log('- 酒店2房型3：未来5-8天活动价 ¥1688');
    
    // 查询验证
    const [rows] = await conn.query(
      'SELECT COUNT(*) as count FROM price_calendar'
    );
    console.log(`\n数据库中共有 ${rows[0].count} 条价格记录`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 添加数据失败:', error.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

seedPriceData();
