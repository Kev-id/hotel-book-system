const axios = require('axios');

async function testFavoriteFilter() {
  try {
    // 假设用户ID为5的用户已登录
    const userInfo = { id: 5, username: 'user1', role: 'user' };
    const token = Buffer.from(JSON.stringify(userInfo)).toString('base64');
    
    console.log('🔍 测试收藏筛选功能...\n');
    
    // 1. 获取全部收藏
    console.log('1️⃣ 获取全部收藏:');
    const allResponse = await axios.get('http://localhost:5000/api/favorites/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   返回 ${allResponse.data.length} 条数据`);
    if (allResponse.data.length > 0) {
      console.log('   示例数据:', {
        id: allResponse.data[0].id,
        name: allResponse.data[0].name,
        category: allResponse.data[0].category
      });
    }
    
    // 2. 按分类筛选
    const categories = ['🏢 商务出行', '🏖️ 度假休闲', '💰 性价比之选', '👨‍👩‍👧 亲子家庭'];
    
    for (const category of categories) {
      console.log(`\n2️⃣ 筛选分类: "${category}"`);
      const response = await axios.get('http://localhost:5000/api/favorites/list', {
        params: { category },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   返回 ${response.data.length} 条数据`);
      if (response.data.length > 0) {
        console.log('   示例:', response.data[0].name);
      }
    }
    
    // 3. 检查数据库中的实际分类
    console.log('\n3️⃣ 检查数据库中的分类分布:');
    const mysql = require('mysql2/promise');
    require('dotenv').config();
    
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Wang2006',
      database: process.env.DB_NAME || 'hotel_booking'
    });
    
    const conn = await pool.getConnection();
    const [categories_db] = await conn.query(`
      SELECT category, COUNT(*) as count
      FROM favorites
      WHERE user_id = 5
      GROUP BY category
    `);
    
    console.log('   数据库中的分类:');
    categories_db.forEach(cat => {
      console.log(`   - "${cat.category}": ${cat.count} 条`);
    });
    
    conn.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }
}

testFavoriteFilter();
