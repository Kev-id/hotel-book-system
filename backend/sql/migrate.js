const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

const migrate = async () => {
  let conn;
  try {
    conn = await pool.getConnection();

    // 添加新列到 hotels 表
    try {
      await conn.query(`ALTER TABLE hotels ADD COLUMN tags JSON`);
      console.log('✓ 添加 tags 列成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ tags 列已存在');
      } else {
        throw err;
      }
    }

    try {
      await conn.query(`ALTER TABLE hotels ADD COLUMN description TEXT`);
      console.log('✓ 添加 description 列成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ description 列已存在');
      } else {
        throw err;
      }
    }

    try {
      await conn.query(`ALTER TABLE hotels ADD COLUMN rejectReason VARCHAR(500) DEFAULT NULL`);
      console.log('✓ 添加 rejectReason 列成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ rejectReason 列已存在');
      } else {
        throw err;
      }
    }

    // 更新现有数据
    await conn.query(`
      UPDATE hotels 
      SET tags = JSON_ARRAY('WiFi', '停车场', '健身房'),
          description = CONCAT(name, '是一家优质酒店，提供舒适的住宿环境和完善的服务设施。')
      WHERE tags IS NULL
    `);
    console.log('✓ 更新现有数据成功');

    console.log('\n✅ 数据库迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
};

migrate();
