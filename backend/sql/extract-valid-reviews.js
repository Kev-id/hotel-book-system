const fs = require('fs');
const path = require('path');

console.log('🔍 尝试从损坏的文件中提取有效评论...\n');

for (const fileNum of [4, 5]) {
  const filePath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${fileNum}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 清理常见问题
    content = content.replace(/�/g, '');
    content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    content = content.replace(/\r\n/g, '\n');
    
    // 尝试提取所有看起来像评论对象的内容
    const reviewPattern = /{[\s\S]*?"hotelId":\s*\d+[\s\S]*?"userId":\s*\d+[\s\S]*?"overallRating"[\s\S]*?}/g;
    const matches = content.match(reviewPattern);
    
    if (matches) {
      const validReviews = [];
      
      for (const match of matches) {
        try {
          // 尝试修复这个对象
          let reviewStr = match;
          
          // 确保字符串正确闭合
          if (!reviewStr.endsWith('}')) {
            reviewStr += '}';
          }
          
          const review = JSON.parse(reviewStr);
          validReviews.push(review);
        } catch (e) {
          // 跳过无效的对象
        }
      }
      
      console.log(`review-json-${fileNum}: 提取到 ${validReviews.length} 条有效评论`);
      
      if (validReviews.length > 0) {
        // 保存到新文件
        const outputPath = path.join(__dirname, `../../../.kiro/hotel-json&review-json/review-json-${fileNum}-fixed`);
        fs.writeFileSync(outputPath, JSON.stringify({ reviews: validReviews }, null, 2), 'utf-8');
        console.log(`  ✓ 已保存到 review-json-${fileNum}-fixed`);
      }
    } else {
      console.log(`review-json-${fileNum}: 未找到有效的评论对象`);
    }
    
  } catch (e) {
    console.log(`review-json-${fileNum}: ${e.message}`);
  }
}

console.log('\n提示: 请检查生成的 *-fixed 文件,如果数据正确,可以替换原文件');
