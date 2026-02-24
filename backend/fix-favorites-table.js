/**
 * 修复favorites表结构
 */

require('dotenv').config();
const db = require('./config/database');

async function fixTable() {
  try {
    console.log('修复favorites表结构...\n');
    
    // 1. 修改id字段为AUTO_INCREMENT
    console.log('1. 设置id字段为AUTO_INCREMENT...');
    await db.query(`
      ALTER TABLE favorites 
      MODIFY COLUMN id INT AUTO_INCREMENT
    `);
    console.log('✅ id字段已设置为AUTO_INCREMENT\n');
    
    // 2. 检查修复结果
    console.log('2. 检查表结构...');
    const [columns] = await db.query('SHOW COLUMNS FROM favorites');
    console.table(columns);
    
    console.log('\n✅ 表结构修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    process.exit(0);
  }
}

fixTable();
