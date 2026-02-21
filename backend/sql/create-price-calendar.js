const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

const createPriceCalendar = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🚀 创建 price_calendar 表\n');

    // 创建价格日历表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS price_calendar (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotelId INT NOT NULL,
        roomTypeId INT NOT NULL,
        date DATE NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_price (hotelId, roomTypeId, date),
        INDEX idx_hotel_room (hotelId, roomTypeId),
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='价格日历表'
    `);
    
    console.log('✅ price_calendar 表创建成功！');
    console.log('\n📊 表结构:');
    console.log('  - hotelId: 酒店ID');
    console.log('  - roomTypeId: 房型ID');
    console.log('  - date: 日期');
    console.log('  - price: 特殊价格（覆盖基础价格）');
    console.log('\n💡 说明:');
    console.log('  - 如果某天没有特殊价格，系统会使用 room_types 表中的基础价格');
    console.log('  - 可以通过 API 设置节假日、周末等特殊价格\n');

  } catch (error) {
    console.error('\n❌ 创建失败:', error.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
};

createPriceCalendar();
