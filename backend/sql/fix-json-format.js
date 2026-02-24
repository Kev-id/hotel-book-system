const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复JSON格式问题...\n');

for (let i = 1; i <= 6; i++) {
  const filePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${i}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 修复常见的JSON格式问题
    // 1. 修复 } { 之间缺少逗号的问题
    content = content.replace(/}\s*\n\s*{/g, '},\n    {');
    
    // 2. 修复 ] { 之间缺少逗号的问题  
    content = content.replace(/]\s*\n\s*{/g, '],\n    {');
    
    // 3. 尝试解析
    try {
      const parsed = JSON.parse(content);
      console.log(`  ✓ review-json-${i}: 修复成功，${(parsed.reviews || parsed).length} 条评论`);
      
      // 写回文件
      fs.writeFileSync(filePath, content, 'utf-8');
      
    } catch (parseError) {
      console.log(`  ⚠️  review-json-${i}: 仍有格式问题 - ${parseError.message}`);
      
      // 尝试更激进的修复
      const lines = content.split('\n');
      for (let j = 0; j < lines.length - 1; j++) {
        const currentLine = lines[j].trim();
        const nextLine = lines[j + 1].trim();
        
        // 如果当前行以 } 结尾，下一行以 { 开头，且当前行不以逗号结尾
        if (currentLine.endsWith('}') && !currentLine.endsWith('},') && nextLine.startsWith('{')) {
          lines[j] = lines[j].replace(/}$/, '},');
        }
      }
      
      content = lines.join('\n');
      
      try {
        const parsed = JSON.parse(content);
        console.log(`  ✓ review-json-${i}: 二次修复成功，${(parsed.reviews || parsed).length} 条评论`);
        fs.writeFileSync(filePath, content, 'utf-8');
      } catch (e2) {
        console.log(`  ❌ review-json-${i}: 无法自动修复 - ${e2.message}`);
      }
    }
    
  } catch (e) {
    console.log(`  ❌ review-json-${i}: 读取失败 - ${e.message}`);
  }
}

console.log('\n✅ 修复完成！请运行 node sql/validate-json-files.js 验证');
