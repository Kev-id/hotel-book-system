/**
 * 诊断收藏功能问题
 */

require('dotenv').config();
const db = require('../config/database');

async function diagnose() {
  console.log('🔍 开始诊断收藏功能...\n');

  try {
    // 1. 检查数据库连接
    console.log('1️⃣ 检查数据库连接...');
    await db.query('SELECT 1');
    console.log('✅ 数据库连接正常\n');

    // 2. 检查favorites表结构
    console.log('2️⃣ 检查favorites表结构...');
    const [columns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'favorites'
      ORDER BY ORDINAL_POSITION
    `);
    
    if (columns.length === 0) {
      console.log('❌ favorites表不存在！');
      console.log('请运行: node sql/migrate-favorite-compare.js\n');
      process.exit(1);
    }
    
    console.log('✅ favorites表结构:');
    columns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.COLUMN_KEY} ${col.EXTRA}`);
    });
    console.log('');

    // 3. 检查是否有id字段的AUTO_INCREMENT
    const idColumn = columns.find(c => c.COLUMN_NAME === 'id');
    if (!idColumn) {
      console.log('❌ 缺少id字段！\n');
      process.exit(1);
    }
    
    if (!idColumn.EXTRA.includes('auto_increment')) {
      console.log('⚠️  id字段缺少AUTO_INCREMENT！');
      console.log('请运行: node fix-favorites-table.js\n');
    } else {
      console.log('✅ id字段有AUTO_INCREMENT\n');
    }

    // 4. 检查是否有note字段
    const noteColumn = columns.find(c => c.COLUMN_NAME === 'note');
    if (!noteColumn) {
      console.log('❌ 缺少note字段！');
      console.log('表结构与代码不匹配\n');
      process.exit(1);
    }
    console.log('✅ note字段存在\n');

    // 5. 检查测试用户
    console.log('3️⃣ 检查测试用户...');
    const [users] = await db.query('SELECT id, username, role FROM users LIMIT 5');
    console.log(`✅ 找到 ${users.length} 个用户:`);
    users.forEach(u => {
      console.log(`   - ${u.username} (ID: ${u.id}, 角色: ${u.role})`);
    });
    console.log('');

    // 6. 检查测试酒店
    console.log('4️⃣ 检查测试酒店...');
    const [hotels] = await db.query('SELECT id, name, price FROM hotels WHERE status = "published" LIMIT 5');
    console.log(`✅ 找到 ${hotels.length} 个已发布酒店:`);
    hotels.forEach(h => {
      console.log(`   - ${h.name} (ID: ${h.id}, 价格: ¥${h.price})`);
    });
    console.log('');

    // 7. 检查现有收藏
    console.log('5️⃣ 检查现有收藏...');
    const [favorites] = await db.query(`
      SELECT f.*, u.username, h.name as hotel_name
      FROM favorites f
      JOIN users u ON f.user_id = u.id
      JOIN hotels h ON f.hotel_id = h.id
      LIMIT 10
    `);
    console.log(`✅ 找到 ${favorites.length} 个收藏记录:`);
    favorites.forEach(f => {
      console.log(`   - ${f.username} 收藏了 ${f.hotel_name} (分类: ${f.category})`);
    });
    console.log('');

    // 8. 测试插入收藏（模拟API调用）
    console.log('6️⃣ 测试插入收藏...');
    const testUserId = users[0].id;
    const testHotelId = hotels[0].id;
    
    // 先删除可能存在的测试数据
    await db.query('DELETE FROM favorites WHERE user_id = ? AND hotel_id = ?', [testUserId, testHotelId]);
    
    // 尝试插入
    try {
      const [result] = await db.query(
        'INSERT INTO favorites (user_id, hotel_id, category, note) VALUES (?, ?, ?, ?)',
        [testUserId, testHotelId, '测试分类', '测试备注']
      );
      console.log('✅ 插入成功！insertId:', result.insertId);
      
      // 清理测试数据
      await db.query('DELETE FROM favorites WHERE id = ?', [result.insertId]);
      console.log('✅ 测试数据已清理\n');
    } catch (error) {
      console.log('❌ 插入失败:', error.message);
      console.log('错误代码:', error.code);
      console.log('');
    }

    // 9. 检查API配置
    console.log('7️⃣ 检查API配置...');
    console.log('环境变量:');
    console.log(`   - PORT: ${process.env.PORT || 5000}`);
    console.log(`   - DB_HOST: ${process.env.DB_HOST}`);
    console.log(`   - DB_USER: ${process.env.DB_USER}`);
    console.log(`   - DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   - QWEN_API_KEY: ${process.env.QWEN_API_KEY ? '已配置' : '未配置'}`);
    console.log('');

    console.log('🎉 诊断完成！\n');
    console.log('📋 总结:');
    console.log('   - 数据库连接: ✅');
    console.log('   - favorites表: ✅');
    console.log('   - 测试用户: ✅');
    console.log('   - 测试酒店: ✅');
    console.log('   - 插入功能: 请查看上面的测试结果');
    console.log('');
    console.log('💡 如果收藏仍然失败，请检查:');
    console.log('   1. 后端是否正在运行 (npm start)');
    console.log('   2. 前端API地址是否正确 (http://localhost:5000/api)');
    console.log('   3. 用户是否已登录 (检查localStorage中的token)');
    console.log('   4. 浏览器控制台是否有错误信息');
    console.log('');

  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    process.exit(0);
  }
}

diagnose();
