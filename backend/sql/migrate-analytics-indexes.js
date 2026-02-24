const db = require('../config/database');

async function migrateAnalyticsIndexes() {
  console.log('开始创建Analytics索引...');
  
  try {
    // 检查并创建索引的辅助函数
    async function createIndexIfNotExists(indexName, tableName, columns) {
      try {
        // 检查索引是否存在
        const [indexes] = await db.query(`
          SHOW INDEX FROM ${tableName} WHERE Key_name = ?
        `, [indexName]);
        
        if (indexes.length === 0) {
          await db.query(`
            CREATE INDEX ${indexName} ON ${tableName}(${columns})
          `);
          console.log(`✅ 创建索引: ${indexName}`);
        } else {
          console.log(`⏭️  索引已存在: ${indexName}`);
        }
      } catch (error) {
        console.error(`❌ 创建索引失败 ${indexName}:`, error.message);
      }
    }

    // Analytics查询优化索引
    await createIndexIfNotExists('idx_orders_merchant_time', 'orders', 'hotel_id, create_time, status');
    await createIndexIfNotExists('idx_orders_analytics', 'orders', 'hotel_id, status, create_time, total_price');
    await createIndexIfNotExists('idx_reviews_hotel_time', 'reviews', 'hotel_id, create_time, overall_rating');

    console.log('✅ Analytics索引创建完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 索引创建失败:', error);
    process.exit(1);
  }
}

migrateAnalyticsIndexes();
