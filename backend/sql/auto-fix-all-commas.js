const fs = require('fs');
const path = require('path');

console.log('🔧 自动修复所有缺少逗号的问题...\n');

for (const fileNum of [4, 5]) {
  const filePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${fileNum}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let fixed = false;
    
    // 逐行处理
    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trim();
      
      // 如果当前行是 } 结尾,下一行是 { 开头,且当前行不是 },
      if (i < lines.length - 1) {
        const nextTrimmed = lines[i + 1].trim();
        
        if (trimmed === '}' && nextTrimmed === '{') {
          line = line.replace('}', '},');
          fixed = true;
          console.log(`  修复第 ${i + 1} 行: } -> },`);
        }
      }
      
      fixedLines.push(line);
    }
    
    if (fixed) {
      content = fixedLines.join('\n');
      fs.writeFileSync(filePath, content, 'utf-8');
      
      // 验证
      try {
        const parsed = JSON.parse(content);
        const reviews = parsed.reviews || parsed;
        console.log(`  ✓ review-json-${fileNum}: 修复成功，${reviews.length} 条评论\n`);
      } catch (e) {
        console.log(`  ⚠️  review-json-${fileNum}: 仍有问题 - ${e.message}\n`);
      }
    } else {
      console.log(`  - review-json-${fileNum}: 未发现需要修复的问题\n`);
    }
    
  } catch (e) {
    console.log(`  ❌ review-json-${fileNum}: ${e.message}\n`);
  }
}

console.log('完成！');
