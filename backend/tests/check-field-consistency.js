/**
 * 字段一致性检查脚本
 * 检查代码中使用的字段是否与数据库表结构一致
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

async function checkFieldConsistency() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🔍 开始检查字段一致性...\n');

    // 获取所有表的字段
    const tables = ['users', 'hotels', 'room_types', 'price_calendar', 'orders', 'reviews', 'favorites', 'browse_history'];
    const tableFields = {};

    for (const table of tables) {
      const [fields] = await conn.query(`DESCRIBE ${table}`);
      tableFields[table] = fields.map(f => f.Field);
      console.log(`📋 ${table} 表字段:`, tableFields[table].join(', '));
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // 检查常见的字段问题
    const issues = [];

    // 1. 检查 hotels 表是否有 price 字段
    if (!tableFields.hotels.includes('price')) {
      issues.push({
        severity: 'ERROR',
        table: 'hotels',
        field: 'price',
        message: 'hotels 表没有 price 字段，价格存储在 room_types 表中',
        solution: '使用子查询: (SELECT MIN(price) FROM room_types WHERE hotelId = h.id) as price'
      });
    }

    // 2. 检查 favorites 表的字段
    if (tableFields.favorites.includes('note') && tableFields.favorites.includes('ai_reason')) {
      issues.push({
        severity: 'WARNING',
        table: 'favorites',
        field: 'note/ai_reason',
        message: 'favorites 表同时存在 note 和 ai_reason 字段',
        solution: '统一使用一个字段，删除另一个'
      });
    } else if (tableFields.favorites.includes('ai_reason') && !tableFields.favorites.includes('note')) {
      issues.push({
        severity: 'INFO',
        table: 'favorites',
        field: 'ai_reason',
        message: 'favorites 表使用 ai_reason 字段（正确）',
        solution: '代码中使用 ai_reason，或在查询时使用别名: ai_reason as note'
      });
    } else if (tableFields.favorites.includes('note') && !tableFields.favorites.includes('ai_reason')) {
      issues.push({
        severity: 'INFO',
        table: 'favorites',
        field: 'note',
        message: 'favorites 表使用 note 字段',
        solution: '确保代码中使用 note 字段'
      });
    }

    // 3. 检查 orders 表的字段命名
    const orderFields = tableFields.orders;
    const snakeCaseFields = orderFields.filter(f => f.includes('_'));
    const camelCaseFields = orderFields.filter(f => /[A-Z]/.test(f));
    
    if (camelCaseFields.length > 0) {
      issues.push({
        severity: 'WARNING',
        table: 'orders',
        field: camelCaseFields.join(', '),
        message: '存在驼峰命名的字段',
        solution: '建议统一使用下划线命名（snake_case）'
      });
    }

    // 4. 检查 reviews 表的字段
    if (!tableFields.reviews.includes('overall_rating')) {
      issues.push({
        severity: 'ERROR',
        table: 'reviews',
        field: 'overall_rating',
        message: 'reviews 表缺少 overall_rating 字段',
        solution: '添加字段或检查字段名是否正确'
      });
    }

    // 5. 检查外键字段命名一致性
    const foreignKeyIssues = [];
    
    // orders.hotel_id vs hotels.id
    if (tableFields.orders.includes('hotel_id') && !tableFields.hotels.includes('hotel_id')) {
      // 这是正常的，hotel_id 引用 hotels.id
    }
    
    // room_types.hotelId vs hotels.id
    if (tableFields.room_types.includes('hotelId')) {
      foreignKeyIssues.push({
        table: 'room_types',
        field: 'hotelId',
        message: '使用驼峰命名，建议改为 hotel_id'
      });
    }

    if (foreignKeyIssues.length > 0) {
      issues.push({
        severity: 'WARNING',
        table: '多个表',
        field: '外键字段',
        message: '外键字段命名不一致',
        solution: '统一使用 snake_case 命名: hotel_id, user_id 等',
        details: foreignKeyIssues
      });
    }

    // 输出检查结果
    console.log('🔍 检查结果:\n');
    
    if (issues.length === 0) {
      console.log('✅ 未发现字段一致性问题！');
    } else {
      const errors = issues.filter(i => i.severity === 'ERROR');
      const warnings = issues.filter(i => i.severity === 'WARNING');
      const infos = issues.filter(i => i.severity === 'INFO');

      if (errors.length > 0) {
        console.log('❌ 错误 (' + errors.length + '):\n');
        errors.forEach((issue, index) => {
          console.log(`${index + 1}. [${issue.table}] ${issue.field}`);
          console.log(`   问题: ${issue.message}`);
          console.log(`   解决: ${issue.solution}`);
          if (issue.details) {
            console.log(`   详情:`, issue.details);
          }
          console.log('');
        });
      }

      if (warnings.length > 0) {
        console.log('⚠️  警告 (' + warnings.length + '):\n');
        warnings.forEach((issue, index) => {
          console.log(`${index + 1}. [${issue.table}] ${issue.field}`);
          console.log(`   问题: ${issue.message}`);
          console.log(`   建议: ${issue.solution}`);
          if (issue.details) {
            console.log(`   详情:`, issue.details);
          }
          console.log('');
        });
      }

      if (infos.length > 0) {
        console.log('ℹ️  信息 (' + infos.length + '):\n');
        infos.forEach((issue, index) => {
          console.log(`${index + 1}. [${issue.table}] ${issue.field}`);
          console.log(`   说明: ${issue.message}`);
          console.log(`   建议: ${issue.solution}`);
          console.log('');
        });
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
    console.log('💡 建议:\n');
    console.log('1. 统一使用 snake_case 命名数据库字段');
    console.log('2. 在代码中使用 SQL 别名进行字段映射');
    console.log('3. 价格字段从 room_types 表查询');
    console.log('4. 定期运行此脚本检查一致性');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

checkFieldConsistency();
