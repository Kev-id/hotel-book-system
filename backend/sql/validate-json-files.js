const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证JSON数据文件...\n');

let totalHotels = 0;
let totalReviews = 0;
let hasErrors = false;

// 验证酒店文件
console.log('📋 验证酒店数据文件:');
for (let i = 1; i <= 6; i++) {
  const filePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/hotel-json-${i}`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      console.log(`  ❌ hotel-json-${i}: 不是数组格式`);
      hasErrors = true;
      continue;
    }
    
    const ids = data.map(h => h.id);
    const missingFields = [];
    
    data.forEach((hotel, idx) => {
      const required = ['id', 'name', 'city', 'address', 'stars', 'basePrice'];
      required.forEach(field => {
        if (!hotel[field]) {
          missingFields.push(`酒店${idx + 1}缺少${field}`);
        }
      });
    });
    
    console.log(`  ✓ hotel-json-${i}: ${data.length} 家酒店, IDs: ${ids.join(', ')}`);
    if (missingFields.length > 0) {
      console.log(`    ⚠️  ${missingFields.slice(0, 3).join('; ')}${missingFields.length > 3 ? '...' : ''}`);
    }
    totalHotels += data.length;
    
  } catch (e) {
    console.log(`  ❌ hotel-json-${i}: ${e.message}`);
    hasErrors = true;
  }
}

// 验证评论文件
console.log('\n💬 验证评论数据文件:');
for (let i = 1; i <= 6; i++) {
  const filePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${i}`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    const data = json.reviews || json;
    
    if (!Array.isArray(data)) {
      console.log(`  ❌ review-json-${i}: 不是数组格式`);
      hasErrors = true;
      continue;
    }
    
    const hotelIds = [...new Set(data.map(r => r.hotelId))].sort((a, b) => a - b);
    const missingFields = [];
    
    data.forEach((review, idx) => {
      const required = ['hotelId', 'userId', 'overallRating', 'content'];
      required.forEach(field => {
        if (!review[field] && field !== 'content') {
          missingFields.push(`评论${idx + 1}缺少${field}`);
        }
      });
    });
    
    console.log(`  ✓ review-json-${i}: ${data.length} 条评论, 酒店IDs: ${hotelIds.join(', ')}`);
    if (missingFields.length > 0) {
      console.log(`    ⚠️  ${missingFields.slice(0, 3).join('; ')}${missingFields.length > 3 ? '...' : ''}`);
    }
    totalReviews += data.length;
    
  } catch (e) {
    console.log(`  ❌ review-json-${i}: ${e.message}`);
    hasErrors = true;
  }
}

console.log('\n📊 统计信息:');
console.log(`  - 总酒店数: ${totalHotels}`);
console.log(`  - 总评论数: ${totalReviews}`);

if (hasErrors) {
  console.log('\n⚠️  发现错误，请修复后再导入');
  process.exit(1);
} else {
  console.log('\n✅ 所有文件验证通过，可以开始导入！');
}
