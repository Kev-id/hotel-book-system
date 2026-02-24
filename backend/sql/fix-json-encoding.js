const fs = require('fs');
const path = require('path');

console.log('🔧 修复JSON编码和格式问题...\n');

for (let i = 4; i <= 5; i++) {  // 只修复有问题的文件
  const filePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${i}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. 移除乱码字符
    content = content.replace(/�/g, '');
    content = content.replace(/\?/g, '');  // 移除可能的问号乱码
    
    // 2. 修复 } { 之间缺少逗号
    content = content.replace(/}\s*\n\s*{/g, '},\n    {');
    
    // 3. 修复控制字符
    content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // 4. 确保正确的换行
    content = content.replace(/\r\n/g, '\n');
    
    // 写回文件
    fs.writeFileSync(filePath, content, 'utf-8');
    
    // 验证
    try {
      const parsed = JSON.parse(content);
      const reviews = parsed.reviews || parsed;
      console.log(`  ✓ review-json-${i}: 修复成功，${reviews.length} 条评论`);
    } catch (e) {
      console.log(`  ⚠️  review-json-${i}: ${e.message}`);
    }
    
  } catch (e) {
    console.log(`  ❌ review-json-${i}: ${e.message}`);
  }
}

console.log('\n✅ 修复完成！');
