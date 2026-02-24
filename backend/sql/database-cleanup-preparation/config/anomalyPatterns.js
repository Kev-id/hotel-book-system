// 异常模式定义
module.exports = {
  // 故事线1: 倒闭边缘的酒店
  FAILING_HOTEL: {
    hotelId: 1,
    name: '倒闭边缘的酒店',
    patterns: ['ORDER_DROP', 'RATING_DROP'],
    description: '订单暴跌 + 评分跳水，模拟经营不善的酒店'
  },
  
  // 故事线2: 虚假繁荣的酒店
  FAKE_PROSPERITY: {
    hotelId: 2,
    name: '虚假繁荣的酒店',
    patterns: ['SUSPICIOUS_REVIEWS'],
    description: '大量可疑好评，模拟刷单行为'
  },
  
  // 故事线3: 商务热门酒店
  BUSINESS_HOTSPOT: {
    hotelId: 3,
    name: '商务热门酒店',
    patterns: ['BUSINESS_PATTERN'],
    description: '商务用户收藏 + 工作日订单密集'
  }
};
