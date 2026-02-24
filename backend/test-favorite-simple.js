/**
 * 简单测试收藏功能（不依赖AI）
 */

require('dotenv').config();
const db = require('./config/database');

async function testFavorite() {
  console.log('🧪 测试收藏功能...\n');

  try {
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    const [result] = await db.query('SELECT 1 as test');
    console.log('✅ 数据库连接成功\n');

    // 2. 检查表是否存在
    console.log('2. 检查favorites表...');
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'favorites'
    `);
    
    if (tables.length === 0) {
      console.log('❌ favorites表不存在！');
      console.log('请运行: node sql/migrate-favorite-compare.js\n');
      process.exit(1);
    }
    console.log('✅ favorites表存在\n');

    // 3. 检查用户是否存在
    console.log('3. 检查测试用户...');
    const [users] = await db.query('SELECT id, username FROM users WHERE username = ?', ['user1']);
    
    if (users.length === 0) {
      console.log('❌ 测试用户user1不存在！\n');
      process.exit(1);
    }
    
    const userId = users[0].id;
    console.log(`✅ 找到用户: ${users[0].username} (ID: ${userId})\n`);

    // 4. 检查酒店是否存在
    console.log('4. 检查测试酒店...');
    const [hotels] = await db.query('SELECT id, name, price FROM hotels LIMIT 1');
    
    if (hotels.length === 0) {
      console.log('❌ 没有可用的酒店！\n');
      process.exit(1);
    }
    
    const hotel = hotels[0];
    console.log(`✅ 找到酒店: ${hotel.name} (ID: ${hotel.id}, 价格: ¥${hotel.price})\n`);

    // 5. 测试添加收藏（不使用AI）
    console.log('5. 测试添加收藏...');
    
    // 先删除可能存在的收藏
    await db.query('DELETE FROM favorites WHERE user_id = ? AND hotel_id = ?', [userId, hotel.id]);
    
    // 添加收藏
    const category = hotel.price < 300 ? '💰 性价比之选' : '🏢 商务出行';
    const reason = hotel.price < 300 ? '价格实惠' : '高端酒店';
    
    await db.query(
      'INSERT INTO favorites (user_id, hotel_id, category, note) VALUES (?, ?, ?, ?)',
      [userId, hotel.id, category, reason]
    );
    
    console.log('✅ 收藏添加成功');
    console.log(`   分类: ${category}`);
    console.log(`   理由: ${reason}\n`);

    // 6. 查询收藏
    console.log('6. 查询收藏列表...');
    const [favorites] = await db.query(`
      SELECT f.*, h.name, h.price 
      FROM favorites f
      JOIN hotels h ON f.hotel_id = h.id
      WHERE f.user_id = ?
    `, [userId]);
    
    console.log(`✅ 找到 ${favorites.length} 个收藏:`);
    favorites.forEach(fav => {
      console.log(`   - ${fav.name} (${fav.category})`);
    });
    console.log('');

    // 7. 清理测试数据
    console.log('7. 清理测试数据...');
    await db.query('DELETE FROM favorites WHERE user_id = ? AND hotel_id = ?', [userId, hotel.id]);
    console.log('✅ 测试数据已清理\n');

    console.log('🎉 所有测试通过！收藏功能正常！\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    process.exit(0);
  }
}

testFavorite();
