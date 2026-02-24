/**
 * 方案3: AI智能价格生成
 * 使用通义千问AI为每个酒店生成真实感强的价格数据
 */

const pool = require('../config/database');
const axios = require('axios');
require('dotenv').config();

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL;
const QWEN_MODEL = 'qwen-max-latest'; // 使用max模型获得更好的价格分析

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// AI调用函数
async function callAI(prompt) {
  try {
    const response = await axios.post(
      `${QWEN_BASE_URL}/chat/completions`,
      {
        model: QWEN_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的酒店定价专家，精通中国各城市的酒店市场价格。请根据酒店信息生成合理的房型和价格数据。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content;
    
    // 尝试提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // 如果没有找到JSON，尝试提取```json```块
    const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]);
    }
    
    throw new Error('无法从AI响应中提取JSON');
  } catch (error) {
    console.error('AI调用失败:', error.message);
    throw error;
  }
}

// 生成价格的Prompt
function generatePricePrompt(hotel) {
  const facilitiesText = hotel.tags ? JSON.parse(hotel.tags).join('、') : '基础设施';
  
  return `请为以下酒店生成合理的房型和价格数据：

酒店信息：
- 名称：${hotel.name}
- 城市：${hotel.city}
- 星级：${hotel.stars}星
- 地址：${hotel.address}
- 设施：${facilitiesText}
- 描述：${hotel.description || '暂无描述'}

要求：
1. 生成3-5个房型（例如：标准大床房、标准双床房、豪华房、行政套房、总统套房等）
2. 价格必须符合该城市${hotel.stars}星级酒店的真实市场水平
3. 考虑酒店位置、设施、品牌的溢价因素
4. 房型之间价格要有合理的梯度
5. 必须返回严格的JSON格式，不要有任何额外文字

返回格式（必须严格遵守）：
{
  "roomTypes": [
    {
      "name": "标准大床房",
      "price": 888,
      "reason": "基础房型，适合商务出行"
    },
    {
      "name": "豪华房",
      "price": 1288,
      "reason": "更大空间，高级装修"
    }
  ],
  "priceAnalysis": "简要说明定价依据（50字以内）"
}

注意：
- 价格必须是整数
- 价格范围：3星(200-800)、4星(400-1500)、5星(800-5000)
- 北京/上海的5星酒店通常在1000-3000元
- 深圳/广州的5星酒店通常在800-2500元
- 其他城市根据实际情况调整`;
}

// 验证价格合理性
function validatePrices(hotel, roomTypes) {
  const errors = [];
  
  // 价格范围检查
  const priceRanges = {
    3: { min: 200, max: 800 },
    4: { min: 400, max: 1500 },
    5: { min: 800, max: 5000 }
  };
  
  const range = priceRanges[hotel.stars] || { min: 200, max: 2000 };
  
  for (const room of roomTypes) {
    if (room.price < range.min || room.price > range.max) {
      errors.push(`${room.name}价格${room.price}元超出${hotel.stars}星酒店合理范围(${range.min}-${range.max}元)`);
    }
  }
  
  // 价格梯度检查
  const prices = roomTypes.map(r => r.price).sort((a, b) => a - b);
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] === prices[i-1]) {
      errors.push('存在相同价格的房型');
      break;
    }
  }
  
  return errors;
}

// 主函数
async function generateAIPrices() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    log('\n========================================', 'blue');
    log('🤖 AI智能价格生成 - 方案3', 'blue');
    log('========================================\n', 'blue');
    
    // 检查API配置
    if (!QWEN_API_KEY) {
      log('❌ 错误: 未配置QWEN_API_KEY', 'red');
      log('请在backend/.env文件中配置API密钥', 'yellow');
      return;
    }
    
    log(`✓ API配置正常`, 'green');
    log(`✓ 使用模型: ${QWEN_MODEL}\n`, 'green');
    
    // 获取所有没有价格的酒店
    const [hotels] = await conn.query(`
      SELECT h.id, h.name, h.city, h.stars, h.address, h.tags, h.description
      FROM hotels h
      LEFT JOIN room_types rt ON h.id = rt.hotelId
      WHERE h.deleted_at IS NULL AND rt.id IS NULL
      GROUP BY h.id
      ORDER BY h.stars DESC, h.id ASC
    `);
    
    log(`📊 找到 ${hotels.length} 个需要生成价格的酒店\n`, 'cyan');
    
    if (hotels.length === 0) {
      log('✅ 所有酒店都已有价格数据', 'green');
      return;
    }
    
    // 统计信息
    const stats = {
      total: hotels.length,
      success: 0,
      failed: 0,
      totalRooms: 0,
      totalTokens: 0,
      startTime: Date.now()
    };
    
    // 批量处理（每次5个酒店，避免过快调用）
    const batchSize = 5;
    for (let i = 0; i < hotels.length; i += batchSize) {
      const batch = hotels.slice(i, i + batchSize);
      
      log(`\n📦 处理批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(hotels.length/batchSize)} (${batch.length}个酒店)`, 'cyan');
      log('----------------------------------------', 'cyan');
      
      for (const hotel of batch) {
        try {
          log(`\n🏨 [${hotel.id}] ${hotel.name} (${hotel.city}, ${hotel.stars}星)`, 'yellow');
          
          // 生成Prompt
          const prompt = generatePricePrompt(hotel);
          
          // 调用AI
          log('   ⏳ 调用AI生成价格...', 'cyan');
          const result = await callAI(prompt);
          
          if (!result.roomTypes || result.roomTypes.length === 0) {
            throw new Error('AI返回的房型数据为空');
          }
          
          // 验证价格
          const errors = validatePrices(hotel, result.roomTypes);
          if (errors.length > 0) {
            log(`   ⚠️  价格验证警告:`, 'yellow');
            errors.forEach(err => log(`      - ${err}`, 'yellow'));
          }
          
          // 插入数据库
          for (const room of result.roomTypes) {
            await conn.query(
              `INSERT INTO room_types (hotelId, roomType, price) VALUES (?, ?, ?)`,
              [hotel.id, room.name, room.price]
            );
          }
          
          stats.success++;
          stats.totalRooms += result.roomTypes.length;
          
          log(`   ✓ 成功生成 ${result.roomTypes.length} 个房型`, 'green');
          result.roomTypes.forEach(room => {
            log(`      - ${room.name}: ¥${room.price} (${room.reason})`, 'green');
          });
          
          if (result.priceAnalysis) {
            log(`   💡 ${result.priceAnalysis}`, 'cyan');
          }
          
          // 等待1秒，避免API限流
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          stats.failed++;
          log(`   ✗ 失败: ${error.message}`, 'red');
          
          // 如果AI失败，使用降级方案
          log(`   🔄 使用降级方案生成价格...`, 'yellow');
          try {
            const fallbackRooms = generateFallbackPrices(hotel);
            for (const room of fallbackRooms) {
              await conn.query(
                `INSERT INTO room_types (hotelId, roomType, price) VALUES (?, ?, ?)`,
                [hotel.id, room.name, room.price]
              );
            }
            stats.success++;
            stats.totalRooms += fallbackRooms.length;
            log(`   ✓ 降级方案成功生成 ${fallbackRooms.length} 个房型`, 'green');
          } catch (fallbackError) {
            log(`   ✗ 降级方案也失败: ${fallbackError.message}`, 'red');
          }
        }
      }
      
      // 批次间等待2秒
      if (i + batchSize < hotels.length) {
        log('\n⏸️  等待2秒后继续...', 'cyan');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 输出统计
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    
    log('\n========================================', 'blue');
    log('📊 生成完成统计', 'blue');
    log('========================================', 'blue');
    log(`总酒店数: ${stats.total}`, 'cyan');
    log(`成功: ${stats.success}`, 'green');
    log(`失败: ${stats.failed}`, stats.failed > 0 ? 'red' : 'green');
    log(`生成房型数: ${stats.totalRooms}`, 'cyan');
    log(`耗时: ${duration}秒`, 'cyan');
    log(`平均: ${(duration / stats.total).toFixed(1)}秒/酒店`, 'cyan');
    
    if (stats.success === stats.total) {
      log('\n🎉 所有酒店价格生成成功！', 'green');
    } else {
      log(`\n⚠️  ${stats.failed}个酒店生成失败，请检查日志`, 'yellow');
    }
    
    log('\n========================================\n', 'blue');
    
  } catch (error) {
    log(`\n❌ 生成失败: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

// 降级方案：基于规则的价格生成
function generateFallbackPrices(hotel) {
  const cityPremium = {
    'beijing': 200,
    'shanghai': 200,
    'shenzhen': 100,
    'guangzhou': 100,
    'hangzhou': 50,
    'chengdu': 0,
    'sanya': 100
  };
  
  const premium = cityPremium[hotel.city] || 0;
  const basePrice = hotel.stars * 200 + premium;
  
  const rooms = [
    { name: '标准大床房', price: Math.round(basePrice * 0.8), reason: '基础房型' },
    { name: '标准双床房', price: Math.round(basePrice * 0.85), reason: '双床配置' },
    { name: '豪华房', price: Math.round(basePrice * 1.0), reason: '高级装修' }
  ];
  
  if (hotel.stars >= 4) {
    rooms.push({ name: '行政套房', price: Math.round(basePrice * 1.3), reason: '套房配置' });
  }
  
  if (hotel.stars === 5) {
    rooms.push({ name: '总统套房', price: Math.round(basePrice * 2.0), reason: '顶级套房' });
  }
  
  return rooms;
}

// 运行
generateAIPrices();
