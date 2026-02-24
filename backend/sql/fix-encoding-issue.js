const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

console.log('🔧 修复编码问题...\n');

for (const fileNum of [4, 5]) {
  const filePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${fileNum}`);
  
  try {
    // 尝试不同的编码读取
    const encodings = ['utf8', 'gbk', 'gb2312', 'big5', 'utf16le'];
    let content = null;
    let usedEncoding = null;
    
    for (const encoding of encodings) {
      try {
        if (encoding === 'utf8') {
          content = fs.readFileSync(filePath, 'utf8');
        } else {
          const buffer = fs.readFileSync(filePath);
          content = iconv.decode(buffer, encoding);
        }
        
        // 检查是否包含中文字符
        if (/[\u4e00-\u9fa5]/.test(content)) {
          usedEncoding = encoding;
          console.log(`  ✓ review-json-${fileNum}: 使用 ${encoding} 编码读取成功`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!content || !usedEncoding) {
      console.log(`  ❌ review-json-${fileNum}: 无法识别编码`);
      continue;
    }
    
    // 修复JSON格式
    content = content.replace(/}\s*\n\s*{/g, '},\n    {');
    content = content.replace(/}\s*{\s*\n\s*{/g, '},\n    {');
    
    // 保存为UTF-8
    fs.writeFileSync(filePath, content, 'utf8');
    
    // 验证
    try {
      const parsed = JSON.parse(content);
      const reviews = parsed.reviews || parsed;
      console.log(`  ✓ review-json-${fileNum}: 修复成功，${reviews.length} 条评论`);
    } catch (e) {
      console.log(`  ⚠️  review-json-${fileNum}: JSON仍有问题 - ${e.message}`);
    }
    
  } catch (e) {
    console.log(`  ❌ review-json-${fileNum}: ${e.message}`);
  }
}

console.log('\n完成！');
