// 默认配置
module.exports = {
  // 评价生成配置
  reviewsPerHotel: {
    min: 15,
    max: 25
  },
  reviewToOrderRatio: 0.6,
  suspiciousReviewRate: {
    min: 0.05,
    max: 0.10
  },
  
  // 订单生成配置
  totalOrders: {
    min: 50,
    max: 100
  },
  orderStatusDistribution: {
    completed: 0.70,
    confirmed: 0.15,
    cancelled: 0.10,
    pending: 0.05
  },
  
  // 收藏生成配置
  favoritesPerUser: {
    min: 2,
    max: 4
  },
  
  // 价格历史配置
  priceHistoryDays: 90,
  weekendPremium: 0.3,
  holidayPremium: 0.5,
  priceFluctuation: 0.2,
  
  // 异常模式配置
  anomalyHotelCount: 3,
  anomalyPatterns: {
    orderDrop: {
      enabled: true,
      dropRate: 0.9,
      comparisonDays: 7
    },
    highCancellation: {
      enabled: true,
      cancellationRate: 0.6,
      windowDays: 15
    },
    ratingDrop: {
      enabled: true,
      lowRatingCount: 8,
      recentReviewCount: 10
    }
  },
  
  // 随机种子（用于可重现的数据生成）
  seed: null
};
