/**
 * 修复favorites表：将ai_reason字段改为note
 */

require('dotenv').config();
const db = require('../config/database');

async function fixTable() {
  console.log('🔧 开始修复favorites表...\n');

  try {
    // 1. 检查表是否存在
    console.log('1️⃣ 检查favorites表...');
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'favorites'
    `);
    
    if (tables.length === 0) {
      console.log('❌ favorites表不存在！');
      console.log('请先运行: node sql/migrate-favorite-compare.js\n');
      process.exit(1);
    }
    console.log('✅ favorites表存在\n');

    // 2. 检查当前字段
    console.log('2️⃣ 检查当前字段...');
    const [columns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'favorites'
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    console.log('当前字段:', columnNames.join(', '));
    console.log('');

    // 3. 检查是否有ai_reason字段
    const hasAiReason = columnNames.includes('ai_reason');
    const hasNote = columnNames.includes('note');

    if (hasAiReason && !hasNote) {
      console.log('3️⃣ 发现ai_reason字段，需要重命名为note...');
      await db.query('ALTER TABLE favorites CHANGE COLUMN ai_reason note TEXT');
      console.log('✅ 已将ai_reason重命名为note\n');
    } else if (hasAiReason && hasNote) {
      console.log('3️⃣ 同时存在ai_reason和note字段，删除ai_reason...');
      // 先将ai_reason的数据复制到note（如果note为空）
      await db.query('UPDATE favorites SET note = ai_reason WHERE note IS NULL OR note = ""');
      // 删除ai_reason字段
      await db.query('ALTER TABLE favorites DROP COLUMN ai_reason');
      console.log('✅ 已删除ai_reason字段\n');
    } else if (!hasAiReason && hasNote) {
      console.log('3️⃣ 已经是正确的结构（使用note字段）\n');
    } else {
      console.log('3️⃣ 两个字段都不存在，添加note字段...');
      await db.query('ALTER TABLE favorites ADD COLUMN note TEXT AFTER category');
      console.log('✅ 已添加note字段\n');
    }

    // 4. 确保id字段有AUTO_INCREMENT
    console.log('4️⃣ 检查id字段...');
    const [idColumn] = await db.query(`
      SELECT EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'favorites'
      AND COLUMN_NAME = 'id'
    `);
    
    if (idColumn.length > 0 && !idColumn[0].EXTRA.includes('auto_increment')) {
      console.log('⚠️  id字段缺少AUTO_INCREMENT，正在修复...');
      await db.query('ALTER TABLE favorites MODIFY COLUMN id INT AUTO_INCREMENT');
      console.log('✅ 已添加AUTO_INCREMENT\n');
    } else {
      console.log('✅ id字段正常\n');
    }

    // 5. 显示最终结构
    console.log('5️⃣ 最终表结构:');
    const [finalColumns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'favorites'
      ORDER BY ORDINAL_POSITION
    `);
    
    finalColumns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.COLUMN_KEY} ${col.EXTRA}`);
    });
    console.log('');

    console.log('🎉 修复完成！\n');
    console.log('现在可以重启后端测试收藏功能了：');
    console.log('   cd hotel-book-system-master/backend');
    console.log('   npm start\n');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    process.exit(0);
  }
}

fixTable();
