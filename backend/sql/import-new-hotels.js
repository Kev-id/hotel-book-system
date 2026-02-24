const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

// 生成默认图片数组
function generateDefaultImages(hotelName, stars) {
  const imageCount = stars === 5 ? 8 : stars === 4 ? 6 : 4;
  return Array.from({ length: imageCount }, (_, i) => 
    `https://picsum.photos/800/600?random=${Date.now()}-${i}`
  );
}

async function importHotelsAndReviews() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🚀 开始导入新的酒店和评论数据\n');

    let totalHotels = 0;
    let totalReviews = 0;
    let hotelIdMapping = {}; // 用于映射原始ID到数据库ID

    // 获取当前最大的酒店ID
    const [maxIdResult] = await conn.query('SELECT MAX(id) as maxId FROM hotels');
    let currentMaxId = maxIdResult[0].maxId || 0;

    // 导入6组数据
    for (let i = 1; i <= 6; i++) {
      console.log(`\n📦 处理第 ${i} 组数据...`);
      
      // 读取酒店数据
      const hotelFilePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/hotel-json-${i}`);
      const reviewFilePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${i}`);
      
      let hotelsData, reviewsData;
      
      try {
        const hotelContent = await fs.readFile(hotelFilePath, 'utf-8');
        hotelsData = JSON.parse(hotelContent);
        console.log(`  ✓ 读取到 ${hotelsData.length} 条酒店数据`);
      } catch (err) {
        console.error(`  ❌ 读取酒店文件失败:`, err.message);
        continue;
      }

      try {
        const reviewContent = await fs.readFile(reviewFilePath, 'utf-8');
        const reviewJson = JSON.parse(reviewContent);
        reviewsData = reviewJson.reviews || reviewJson;
        console.log(`  ✓ 读取到 ${reviewsData.length} 条评论数据`);
      } catch (err) {
        console.error(`  ❌ 读取评论文件失败:`, err.message);
        reviewsData = [];
      }

      // 导入酒店
      console.log(`  🏨 导入酒店...`);
      let hotelCount = 0;
      
      for (const hotel of hotelsData) {
        try {
          const newId = ++currentMaxId;
          const oldId = hotel.id;
          
          // 生成图片数组
          const images = hotel.images || generateDefaultImages(hotel.name, hotel.stars);
          
          await conn.execute(
            `INSERT INTO hotels (
              id, name, city, address, stars, price, rating, review_count,
              tags, facilities, images, check_in_time, check_out_time,
              cancel_policy, description, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              newId,
              hotel.name,
              hotel.city || hotel.cityCn,
              hotel.address,
              hotel.stars,
              hotel.basePrice,
              0, // 初始评分为0,后续会根据评论更新
              0, // 初始评论数为0
              JSON.stringify(hotel.tags || []),
              JSON.stringify(hotel.facilities || []),
              JSON.stringify(images),
              '14:00',
              '12:00',
              JSON.stringify({ type: 'flexible', deadline: '18:00' }),
              hotel.description,
              'published'
            ]
          );
          
          hotelIdMapping[oldId] = newId;
          hotelCount++;
          totalHotels++;
        } catch (err) {
          console.error(`    ⚠️  导入酒店 ${hotel.name} 失败:`, err.message);
        }
      }
      console.log(`  ✓ 成功导入 ${hotelCount}/${hotelsData.length} 条酒店数据`);

      // 导入评论
      if (reviewsData.length > 0) {
        console.log(`  💬 导入评论...`);
        let reviewCount = 0;
        
        for (const review of reviewsData) {
          try {
            const newHotelId = hotelIdMapping[review.hotelId];
            if (!newHotelId) {
              console.error(`    ⚠️  找不到酒店ID映射: ${review.hotelId}`);
              continue;
            }

            // 检查用户是否存在，不存在则使用默认用户ID 1
            const userId = review.userId || 1;
            
            await conn.execute(
              `INSERT INTO reviews (
                user_id, hotel_id, order_id, overall_rating, dimensions,
                content, images, tags, sentiment, helpful, reported,
                merchant_reply, create_time
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                userId,
                newHotelId,
                review.orderId || null,
                review.overallRating,
                JSON.stringify(review.dimensions || {}),
                review.content,
                JSON.stringify(review.images || []),
                JSON.stringify(review.tags || []),
                review.sentiment || 'neutral',
                review.helpful || 0,
                review.reported || 0,
                JSON.stringify(review.merchantReply || null),
                review.reviewDate || review.create_time || new Date().toISOString().split('T')[0]
              ]
            );
            
            reviewCount++;
            totalReviews++;
          } catch (err) {
            console.error(`    ⚠️  导入评论失败:`, err.message);
          }
        }
        console.log(`  ✓ 成功导入 ${reviewCount}/${reviewsData.length} 条评论数据`);

        // 更新酒店的评分和评论数
        console.log(`  📊 更新酒店统计信息...`);
        for (const [oldId, newId] of Object.entries(hotelIdMapping)) {
          try {
            const [stats] = await conn.query(
              `SELECT 
                COUNT(*) as review_count,
                AVG(overall_rating) as avg_rating
              FROM reviews 
              WHERE hotel_id = ?`,
              [newId]
            );
            
            if (stats[0].review_count > 0) {
              await conn.execute(
                `UPDATE hotels 
                SET rating = ?, review_count = ?
                WHERE id = ?`,
                [
                  parseFloat(stats[0].avg_rating).toFixed(1),
                  stats[0].review_count,
                  newId
                ]
              );
            }
          } catch (err) {
            console.error(`    ⚠️  更新酒店 ${newId} 统计失败:`, err.message);
          }
        }
        console.log(`  ✓ 统计信息更新完成`);
      }
    }

    // 最终统计
    console.log('\n\n📊 导入完成统计:');
    console.log(`  ✓ 成功导入 ${totalHotels} 条酒店数据`);
    console.log(`  ✓ 成功导入 ${totalReviews} 条评论数据`);
    
    const [hotelStats] = await conn.query('SELECT COUNT(*) as count FROM hotels');
    console.log(`  📍 数据库中酒店总数: ${hotelStats[0].count}`);
    
    const [reviewStats] = await conn.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`  💬 数据库中评论总数: ${reviewStats[0].count}`);
    
    const [cityStats] = await conn.query(
      'SELECT city, COUNT(*) as count FROM hotels GROUP BY city ORDER BY count DESC LIMIT 10'
    );
    console.log('\n  🌆 各城市酒店分布:');
    cityStats.forEach(stat => {
      console.log(`    ${stat.city}: ${stat.count} 家`);
    });

    console.log('\n✅ 数据导入完成！');

  } catch (error) {
    console.error('\n❌ 导入失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

importHotelsAndReviews();
