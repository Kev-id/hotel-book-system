const fs = require('fs');
const path = require('path');

console.log('🔧 深度修复 review-json-4 和 review-json-5...\n');

function deepFixReviewFile(fileNum) {
  const filePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${fileNum}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 步骤1: 清理所有乱码和控制字符
    content = content.replace(/�/g, '');
    content = content.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    content = content.replace(/\r\n/g, '\n');
    content = content.replace(/\r/g, '\n');
    
    // 步骤2: 修复常见的JSON格式问题
    // 修复 } { 之间缺少逗号
    content = content.replace(/}\s*\n\s*{/g, '},\n    {');
    
    // 修复 ] { 之间缺少逗号
    content = content.replace(/]\s*\n\s*{/g, '],\n    {');
    
    // 修复多余的空对象 } { {
    content = content.replace(/}\s*{\s*\n\s*{/g, '},\n    {');
    
    // 步骤3: 尝试解析
    try {
      const parsed = JSON.parse(content);
      const reviews = parsed.reviews || parsed;
      console.log(`✓ review-json-${fileNum}: 成功修复，${reviews.length} 条评论`);
      
      // 重新格式化并保存
      const formatted = JSON.stringify({ reviews }, null, 2);
      fs.writeFileSync(filePath, formatted, 'utf-8');
      return true;
      
    } catch (parseError) {
      console.log(`⚠️  review-json-${fileNum}: 第一次解析失败 - ${parseError.message}`);
      
      // 步骤4: 更激进的修复 - 逐行处理
      const lines = content.split('\n');
      const fixedLines = [];
      let inString = false;
      let braceDepth = 0;
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 跟踪字符串状态
        for (let j = 0; j < line.length; j++) {
          if (line[j] === '"' && (j === 0 || line[j-1] !== '\\')) {
            inString = !inString;
          }
          if (!inString) {
            if (line[j] === '{') braceDepth++;
            if (line[j] === '}') braceDepth--;
          }
        }
        
        // 检查是否需要在行尾添加逗号
        const trimmed = line.trim();
        if (trimmed.endsWith('}') && !trimmed.endsWith('},') && i < lines.length - 1) {
          const nextTrimmed = lines[i + 1].trim();
          if (nextTrimmed.startsWith('{') && braceDepth === 1) {
            line = line.replace(/}(\s*)$/, '},$1');
          }
        }
        
        fixedLines.push(line);
      }
      
      content = fixedLines.join('\n');
      
      // 再次尝试解析
      try {
        const parsed = JSON.parse(content);
        const reviews = parsed.reviews || parsed;
        console.log(`✓ review-json-${fileNum}: 二次修复成功，${reviews.length} 条评论`);
        
        const formatted = JSON.stringify({ reviews }, null, 2);
        fs.writeFileSync(filePath, formatted, 'utf-8');
        return true;
        
      } catch (e2) {
        console.log(`❌ review-json-${fileNum}: 二次解析仍失败`);
        console.log(`   错误位置: ${e2.message}`);
        
        // 步骤5: 最后的尝试 - 提取所有完整的评论对象
        const reviewObjects = [];
        let currentObj = '';
        let objDepth = 0;
        let inObj = false;
        
        for (let i = 0; i < content.length; i++) {
          const char = content[i];
          
          if (char === '{') {
            if (objDepth === 0) {
              inObj = true;
              currentObj = '{';
            } else {
              currentObj += char;
            }
            objDepth++;
          } else if (char === '}') {
            objDepth--;
            currentObj += char;
            
            if (objDepth === 0 && inObj) {
              // 尝试解析这个对象
              try {
                const obj = JSON.parse(currentObj);
                if (obj.hotelId && obj.userId && obj.overallRating) {
                  reviewObjects.push(obj);
                }
              } catch (e) {
                // 跳过无效对象
              }
              currentObj = '';
              inObj = false;
            }
          } else if (inObj) {
            currentObj += char;
          }
        }
        
        if (reviewObjects.length > 0) {
          console.log(`✓ review-json-${fileNum}: 提取修复成功，${reviewObjects.length} 条评论`);
          const formatted = JSON.stringify({ reviews: reviewObjects }, null, 2);
          fs.writeFileSync(filePath, formatted, 'utf-8');
          return true;
        } else {
          console.log(`❌ review-json-${fileNum}: 无法提取有效数据`);
          return false;
        }
      }
    }
    
  } catch (e) {
    console.log(`❌ review-json-${fileNum}: 读取失败 - ${e.message}`);
    return false;
  }
}

// 修复两个文件
const success4 = deepFixReviewFile(4);
const success5 = deepFixReviewFile(5);

if (success4 && success5) {
  console.log('\n✅ 所有文件修复成功！可以运行导入脚本了');
} else {
  console.log('\n⚠️  部分文件修复失败，请检查错误信息');
}
