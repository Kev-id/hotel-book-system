const pool = require('../config/database');

// 获取价格趋势
exports.getPriceTrends = async (req, res) => {
  try {
    const { hotelId, days = 30 } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({ error: '缺少hotelId参数' });
    }
    
    const [priceHistory] = await pool.query(
      `SELECT date, price, occupancy_rate, is_weekend, is_holiday
       FROM price_history
       WHERE hotel_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY date ASC`,
      [hotelId, parseInt(days)]
    );
    
    res.json(priceHistory);
  } catch (error) {
    console.error('获取价格趋势失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取酒店数据看板
exports.getHotelDashboard = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    // 订单统计
    const [orderStats] = await pool.query(
      `SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedOrders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as totalRevenue
       FROM orders WHERE hotel_id = ?`,
      [hotelId]
    );
    
    // 评价统计
    const [reviewStats] = await pool.query(
      `SELECT 
        COUNT(*) as totalReviews,
        AVG(overall_rating) as avgRating,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positiveReviews,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negativeReviews
       FROM reviews WHERE hotel_id = ?`,
      [hotelId]
    );
    
    // 最近30天价格统计
    const [priceStats] = await pool.query(
      `SELECT 
        AVG(price) as avgPrice,
        MIN(price) as minPrice,
        MAX(price) as maxPrice,
        AVG(occupancy_rate) as avgOccupancy
       FROM price_history
       WHERE hotel_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [hotelId]
    );
    
    // 计算健康分
    const cancelRate = orderStats[0].totalOrders > 0 
      ? (orderStats[0].cancelledOrders / orderStats[0].totalOrders * 100).toFixed(2)
      : 0;
    
    const avgRating = reviewStats[0].avgRating 
      ? parseFloat(reviewStats[0].avgRating).toFixed(2)
      : 0;
    
    const negativeRate = reviewStats[0].totalReviews > 0
      ? (reviewStats[0].negativeReviews / reviewStats[0].totalReviews * 100).toFixed(2)
      : 0;
    
    // 健康分计算：评分权重40%，取消率权重30%，差评率权重30%
    const healthScore = (
      (avgRating / 5 * 40) +
      ((100 - parseFloat(cancelRate)) / 100 * 30) +
      ((100 - parseFloat(negativeRate)) / 100 * 30)
    ).toFixed(2);
    
    res.json({
      orders: {
        total: orderStats[0].totalOrders,
        completed: orderStats[0].completedOrders,
        cancelled: orderStats[0].cancelledOrders,
        cancelRate: parseFloat(cancelRate),
        revenue: orderStats[0].totalRevenue || 0
      },
      reviews: {
        total: reviewStats[0].totalReviews,
        avgRating: parseFloat(avgRating),
        positive: reviewStats[0].positiveReviews,
        negative: reviewStats[0].negativeReviews,
        negativeRate: parseFloat(negativeRate)
      },
      pricing: {
        avg: priceStats[0].avgPrice ? parseFloat(priceStats[0].avgPrice).toFixed(2) : 0,
        min: priceStats[0].minPrice || 0,
        max: priceStats[0].maxPrice || 0,
        avgOccupancy: priceStats[0].avgOccupancy ? parseFloat(priceStats[0].avgOccupancy).toFixed(2) : 0
      },
      healthScore: parseFloat(healthScore)
    });
  } catch (error) {
    console.error('获取酒店看板失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取评价趋势
exports.getReviewTrends = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { days = 30 } = req.query;
    
    const [trends] = await pool.query(
      `SELECT 
        DATE(create_time) as date,
        COUNT(*) as count,
        AVG(overall_rating) as avgRating,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative
       FROM reviews
       WHERE hotel_id = ? AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(create_time)
       ORDER BY date ASC`,
      [hotelId, parseInt(days)]
    );
    
    const formattedTrends = trends.map(t => ({
      date: t.date,
      count: t.count,
      avgRating: t.avgRating ? parseFloat(t.avgRating).toFixed(2) : 0,
      positive: t.positive,
      negative: t.negative
    }));
    
    res.json(formattedTrends);
  } catch (error) {
    console.error('获取评价趋势失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取定价建议
exports.getPricingSuggestions = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    // 获取最近30天的价格和入住率数据
    const [priceData] = await pool.query(
      `SELECT date, price, occupancy_rate, is_weekend, is_holiday
       FROM price_history
       WHERE hotel_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       ORDER BY date DESC`,
      [hotelId]
    );
    
    if (priceData.length === 0) {
      return res.json({
        suggestions: [],
        message: '暂无足够数据生成建议'
      });
    }
    
    // 计算平均价格和入住率
    const avgPrice = priceData.reduce((sum, d) => sum + parseFloat(d.price), 0) / priceData.length;
    const avgOccupancy = priceData.reduce((sum, d) => sum + parseFloat(d.occupancy_rate || 0), 0) / priceData.length;
    
    // 周末和工作日价格对比
    const weekendData = priceData.filter(d => d.is_weekend);
    const weekdayData = priceData.filter(d => !d.is_weekend);
    
    const avgWeekendPrice = weekendData.length > 0
      ? weekendData.reduce((sum, d) => sum + parseFloat(d.price), 0) / weekendData.length
      : avgPrice;
    
    const avgWeekdayPrice = weekdayData.length > 0
      ? weekdayData.reduce((sum, d) => sum + parseFloat(d.price), 0) / weekdayData.length
      : avgPrice;
    
    const suggestions = [];
    
    // 建议1: 入住率分析
    if (avgOccupancy < 0.6) {
      suggestions.push({
        type: 'price_decrease',
        priority: 'high',
        title: '入住率偏低，建议降价促销',
        description: `当前平均入住率${(avgOccupancy * 100).toFixed(1)}%，建议降价5-10%以提高入住率`,
        suggestedPrice: (avgPrice * 0.9).toFixed(0),
        reason: '低入住率'
      });
    } else if (avgOccupancy > 0.85) {
      suggestions.push({
        type: 'price_increase',
        priority: 'medium',
        title: '入住率较高，可适当提价',
        description: `当前平均入住率${(avgOccupancy * 100).toFixed(1)}%，建议提价5-10%以增加收益`,
        suggestedPrice: (avgPrice * 1.1).toFixed(0),
        reason: '高入住率'
      });
    }
    
    // 建议2: 周末定价
    if (avgWeekendPrice < avgWeekdayPrice * 1.1) {
      suggestions.push({
        type: 'weekend_pricing',
        priority: 'medium',
        title: '周末价格偏低',
        description: '周末需求通常更高，建议周末价格比工作日高10-20%',
        suggestedPrice: (avgWeekdayPrice * 1.15).toFixed(0),
        reason: '周末溢价不足'
      });
    }
    
    // 建议3: 价格趋势
    const recentPrices = priceData.slice(0, 7).map(d => parseFloat(d.price));
    const olderPrices = priceData.slice(7, 14).map(d => parseFloat(d.price));
    
    if (recentPrices.length > 0 && olderPrices.length > 0) {
      const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
      
      if (recentAvg < olderAvg * 0.95) {
        suggestions.push({
          type: 'price_trend',
          priority: 'low',
          title: '价格持续下降',
          description: '最近一周价格较前一周下降超过5%，注意市场竞争',
          suggestedPrice: olderAvg.toFixed(0),
          reason: '价格下降趋势'
        });
      }
    }
    
    // 获取评价数据用于建议
    const [reviewStats] = await pool.query(
      `SELECT AVG(overall_rating) as avgRating
       FROM reviews WHERE hotel_id = ?`,
      [hotelId]
    );
    
    if (reviewStats[0].avgRating && reviewStats[0].avgRating >= 4.5) {
      suggestions.push({
        type: 'quality_premium',
        priority: 'low',
        title: '高评分支持溢价',
        description: `当前评分${parseFloat(reviewStats[0].avgRating).toFixed(2)}，可适当提高价格`,
        suggestedPrice: (avgPrice * 1.05).toFixed(0),
        reason: '高评分'
      });
    }
    
    res.json({
      currentAvgPrice: avgPrice.toFixed(0),
      avgOccupancy: (avgOccupancy * 100).toFixed(1),
      suggestions: suggestions.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
    });
  } catch (error) {
    console.error('获取定价建议失败:', error);
    res.status(500).json({ error: error.message });
  }
};
