/**
 * 检查favorites表结构
 */

require('dotenv').config();
const db = require('./config/database');

async function checkTable() {
  try {
    console.log('检查favorites表结构...\n');
    
    const [columns] = await db.query(`
      SHOW COLUMNS FROM favorites
    `);
    
    console.log('当前表结构:');
    console.table(columns);
    
    console.log('\n需要的字段:');
    console.log('- id');
    console.log('- user_id');
    console.log('- hotel_id');
    console.log('- category');
    console.log('- ai_reason (缺失!)');
    console.log('- create_time');
    
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTable();
