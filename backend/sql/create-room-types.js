const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

async function createRoomTypes() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🚀 开始创建 room_types 表和数据\n');

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

    // 为每个酒店创建房型数据
    console.log('\n📋 为酒店生成房型数据...');
    
    const [hotels] = await conn.query('SELECT id, price FROM hotels');
    
    const roomTypeTemplates = [
      { type: '标准间', priceMultiplier: 0.8 },
      { type: '豪华大床房', priceMultiplier: 1.0 },
      { type: '行政套房', priceMultiplier: 1.5 },
      { type: '总统套房', priceMultiplier: 2.5 }
    ];

    let count = 0;
    for (const hotel of hotels) {
      // 每个酒店随机选择2-3种房型
      const numRoomTypes = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const selectedTypes = roomTypeTemplates
        .sort(() => Math.random() - 0.5)
        .slice(0, numRoomTypes);

      for (const roomTemplate of selectedTypes) {
        const basePrice = hotel.price || 500;
        const roomPrice = Math.round(basePrice * roomTemplate.priceMultiplier);
        
        await conn.execute(
          `INSERT INTO room_types (hotelId, roomType, price) VALUES (?, ?, ?)`,
          [hotel.id, roomTemplate.type, roomPrice]
        );
        count++;
      }
    }

    console.log(`✓ 成功为 ${hotels.length} 家酒店创建 ${count} 种房型\n`);

    // 统计信息
    const [stats] = await conn.query(`
      SELECT h.name, rt.roomType, rt.price 
      FROM room_types rt 
      JOIN hotels h ON rt.hotelId = h.id 
      ORDER BY h.id, rt.price
      LIMIT 10
    `);
    
    console.log('📊 示例房型数据（前10条）:');
    stats.forEach(row => {
      console.log(`  ${row.name} - ${row.roomType}: ¥${row.price}`);
    });

    console.log('\n✅ room_types 表创建完成！');

  } catch (error) {
    console.error('\n❌ 创建失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

createRoomTypes();
