const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Wang2006',
  database: 'hotel_booking'
});

async function checkHotels() {
  try {
    // 统计信息
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        MIN(id) as minId,
        MAX(id) as maxId
      FROM hotels 
      WHERE deleted_at IS NULL
    `);
    console.log('📊 酒店统计:', stats[0]);
    
    // 按来源统计
    const [bySource] = await pool.query(`
      SELECT 
        CASE 
          WHEN id <= 20 THEN '原始测试数据'
          ELSE 'Kaggle数据'
        END as source,
        COUNT(*) as count
      FROM hotels 
      WHERE deleted_at IS NULL
      GROUP BY source
    `);
    console.log('\n📋 按来源统计:');
    bySource.forEach(s => console.log(`  ${s.source}: ${s.count}个`));
    
    // 前10个酒店
    const [first10] = await pool.query(`
      SELECT id, name, city 
      FROM hotels 
      WHERE deleted_at IS NULL 
      ORDER BY id 
      LIMIT 10
    `);
    console.log('\n🏨 前10个酒店:');
    first10.forEach(h => console.log(`  ID: ${h.id}, 名称: ${h.name}, 城市: ${h.city}`));
    
    // 最后10个酒店
    const [last10] = await pool.query(`
      SELECT id, name, city 
      FROM hotels 
      WHERE deleted_at IS NULL 
      ORDER BY id DESC 
      LIMIT 10
    `);
    console.log('\n🏨 最后10个酒店:');
    last10.forEach(h => console.log(`  ID: ${h.id}, 名称: ${h.name}, 城市: ${h.city}`));
    
    // 按城市统计
    const [byCity] = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM hotels 
      WHERE deleted_at IS NULL
      GROUP BY city
      ORDER BY count DESC
    `);
    console.log('\n🌆 按城市统计:');
    byCity.forEach(c => console.log(`  ${c.city}: ${c.count}个`));
    
    await pool.end();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkHotels();
