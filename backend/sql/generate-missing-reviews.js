const fs = require('fs');
const path = require('path');

console.log('🎯 为酒店 31-40 和 41-50 生成评论数据...\n');

// 读取酒店数据
const hotels4 = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../.kiro/hotel-json&review-json/hotel-json-4'), 'utf-8'));
const hotels5 = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../.kiro/hotel-json&review-json/hotel-json-5'), 'utf-8'));

const allHotels = [...hotels4, ...hotels5];

// 生成评论的辅助函数
function generateReviews(hotelId, hotelName, count = 25) {
  const reviews = [];
  const ratings = [5.0, 4.8, 4.5, 4.2, 4.0, 3.5, 3.0, 2.5, 2.0];
  const userTypes = ['couple', 'family', 'business', 'solo'];
  const sentiments = ['positive', 'positive', 'positive', 'neutral', 'negative'];
  
  for (let i = 0; i < count; i++) {
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    const sentiment = rating >= 4.0 ? 'positive' : rating >= 3.0 ? 'neutral' : 'negative';
    
    reviews.push({
      hotelId,
      userId: Math.floor(Math.random() * 100) + 1,
      orderId: `ORD${hotelId}${String(i + 1).padStart(3, '0')}`,
      overallRating: rating,
      dimensions: {
        cleanliness: Math.min(5, Math.floor(rating) + (Math.random() > 0.5 ? 1 : 0)),
        service: Math.min(5, Math.floor(rating) + (Math.random() > 0.5 ? 1 : 0)),
        location: Math.min(5, Math.floor(rating) + (Math.random() > 0.5 ? 1 : 0)),
        facilities: Math.min(5, Math.floor(rating)),
        value: Math.max(1, Math.floor(rating) - (Math.random() > 0.7 ? 1 : 0))
      },
      content: generateContent(hotelName, rating),
      sentiment,
      tags: generateTags(rating),
      userName: `用户${i + 1}`,
      userType: userTypes[Math.floor(Math.random() * userTypes.length)],
      checkInDate: generateDate(-180, -7),
      reviewDate: generateDate(-180, 0),
      roomType: ['豪华大床房', '行政套房', '标准双床房', '湖景房'][Math.floor(Math.random() * 4)],
      stayNights: Math.floor(Math.random() * 3) + 1,
      isSuspicious: Math.random() < 0.05
    });
  }
  
  return reviews;
}

function generateContent(hotelName, rating) {
  if (rating >= 4.5) {
    return `入住${hotelName}体验非常好！酒店设施完善，服务周到，房间干净整洁。地理位置优越，交通便利。早餐丰富美味，工作人员态度友好。强烈推荐！`;
  } else if (rating >= 4.0) {
    return `${hotelName}整体不错。房间宽敞舒适，设施齐全。服务人员热情专业。位置方便，周边配套完善。性价比较高，值得推荐。`;
  } else if (rating >= 3.0) {
    return `${hotelName}中规中矩。房间设施一般，服务还可以。位置还行，价格适中。有一些小问题但总体能接受。`;
  } else {
    return `对${hotelName}比较失望。房间设施陈旧，服务态度一般。性价比不高，不太推荐。希望酒店能改进。`;
  }
}

function generateTags(rating) {
  if (rating >= 4.5) {
    return ['#服务周到', '#干净卫生', '#位置优越', '#强烈推荐'];
  } else if (rating >= 4.0) {
    return ['#整体不错', '#性价比高', '#值得推荐'];
  } else if (rating >= 3.0) {
    return ['#中规中矩', '#还可以'];
  } else {
    return ['#有待改进', '#不推荐'];
  }
}

function generateDate(minDaysAgo, maxDaysAgo) {
  const daysAgo = Math.floor(Math.random() * (minDaysAgo - maxDaysAgo + 1)) + maxDaysAgo;
  const date = new Date();
  date.setDate(date.getDate() + daysAgo);
  return date.toISOString().split('T')[0];
}

// 生成所有评论
const allReviews = [];
allHotels.forEach(hotel => {
  console.log(`  生成 ${hotel.name} 的评论...`);
  const reviews = generateReviews(hotel.id, hotel.name, 25);
  allReviews.push(...reviews);
});

// 保存文件
const output4 = { reviews: allReviews.filter(r => r.hotelId >= 31 && r.hotelId <= 40) };
const output5 = { reviews: allReviews.filter(r => r.hotelId >= 41 && r.hotelId <= 50) };

fs.writeFileSync(
  path.join(__dirname, '../../../.kiro/hotel-json&review-json/review-json-4'),
  JSON.stringify(output4, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(__dirname, '../../../.kiro/hotel-json&review-json/review-json-5'),
  JSON.stringify(output5, null, 2),
  'utf-8'
);

console.log(`\n✅ 生成完成！`);
console.log(`  - review-json-4: ${output4.reviews.length} 条评论`);
console.log(`  - review-json-5: ${output5.reviews.length} 条评论`);
