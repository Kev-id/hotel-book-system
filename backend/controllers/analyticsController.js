const db = require('../config/database');
const DataInsightsService = require('../services/ai/dataInsights');
const PricingInsightsService = require('../services/ai/pricingInsights');
const { 
  getCachedInsights, 
  getCachedPricing, 
  getCachedAlerts 
} = require('../middleware/aiCache');

// 获取商户数据概览
exports.getMerchantOverview = async (req, res) => {
  const merchantId = req.user.id;
  const { period = '30' } = req.query;
  
  // 限制最大查询天�?
  const safePeriod = Math.min(parseInt(period), 180);
  
  try {
    const [hotels] = await db.query(
      'SELECT id FROM hotels WHERE merchantId = ? LIMIT 100',
      [merchantId]
    );
    
    if (hotels.length === 0) {
      return res.json({
        success: true,
        data: { totalOrders: 0, totalRevenue: 0, avgOccupancy: 0, avgRating: 0, cancelRate: 0, orderGrowth: 0, revenueGrowth: 0 }
      });
    }
    
    const hotelIds = hotels.map(h => h.id);
    
    // 统计订单量和营收
    const [orderStats] = await db.query(
      `SELECT 
        COUNT(*) as totalOrders,
        SUM(total_price) as totalRevenue,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders
       FROM orders
       WHERE hotel_id IN (?) 
       AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [hotelIds, safePeriod]
    );
    
    // 计算入住�?
    const [occupancyStats] = await db.query(
      `SELECT COUNT(*) as completedOrders
       FROM orders
       WHERE hotel_id IN (?)
       AND status IN ('checked_out', 'completed')
       AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [hotelIds, safePeriod]
    );
    
    const avgOccupancy = orderStats[0].totalOrders > 0
      ? (occupancyStats[0].completedOrders / orderStats[0].totalOrders) * 100
      : 0;
    
    // 计算平均评分
    const [ratingStats] = await db.query(
      `SELECT AVG(overall_rating) as avgRating
       FROM reviews
       WHERE hotel_id IN (?)
       AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [hotelIds, safePeriod]
    );
    
    // 计算环比数据
    const prevPeriod = parseInt(safePeriod) * 2;
    const [prevOrderStats] = await db.query(
      `SELECT COUNT(*) as totalOrders, SUM(total_price) as totalRevenue
       FROM orders
       WHERE hotel_id IN (?)
       AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
       AND create_time < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [hotelIds, prevPeriod, safePeriod]
    );
    
    const orderGrowth = prevOrderStats[0].totalOrders > 0
      ? ((orderStats[0].totalOrders - prevOrderStats[0].totalOrders) / prevOrderStats[0].totalOrders) * 100
      : 0;
    
    const revenueGrowth = prevOrderStats[0].totalRevenue > 0
      ? ((orderStats[0].totalRevenue - prevOrderStats[0].totalRevenue) / prevOrderStats[0].totalRevenue) * 100
      : 0;
    
    res.json({
      success: true,
      data: {
        totalOrders: orderStats[0].totalOrders || 0,
        totalRevenue: orderStats[0].totalRevenue || 0,
        avgOccupancy: Math.round(avgOccupancy),
        avgRating: parseFloat((Number(ratingStats[0].avgRating) || 0).toFixed(1)),
        cancelRate: orderStats[0].totalOrders > 0
          ? Math.round((orderStats[0].cancelledOrders / orderStats[0].totalOrders) * 100)
          : 0,
        orderGrowth: Math.round(orderGrowth),
        revenueGrowth: Math.round(revenueGrowth)
      }
    });
  } catch (error) {
    console.error('获取数据概览失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取订单趋势数据
exports.getOrderTrend = async (req, res) => {
  const merchantId = req.user.id;
  const { period = '30' } = req.query;
  const safePeriod = Math.min(parseInt(period), 180);
  
  try {
    const [hotels] = await db.query(
      'SELECT id FROM hotels WHERE merchantId = ? LIMIT 100',
      [merchantId]
    );
    
    if (hotels.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const hotelIds = hotels.map(h => h.id);
    
    const [trendData] = await db.query(
      `SELECT 
        DATE(create_time) as date,
        COUNT(*) as orders,
        SUM(total_price) as revenue
       FROM orders
       WHERE hotel_id IN (?)
       AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(create_time)
       ORDER BY date ASC
       LIMIT 200`,
      [hotelIds, safePeriod]
    );
    
    res.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取房型排行
exports.getRoomTypeRanking = async (req, res) => {
  const merchantId = req.user.id;
  const { period = '30' } = req.query;
  const safePeriod = Math.min(parseInt(period), 180);
  
  try {
    const [hotels] = await db.query(
      'SELECT id FROM hotels WHERE merchantId = ?',
      [merchantId]
    );
    
    if (hotels.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const hotelIds = hotels.map(h => h.id);
    
    const [ranking] = await db.query(
      `SELECT 
        room_type,
        COUNT(*) as orders,
        SUM(total_price) as revenue,
        AVG(total_price / nights) as avgPrice
       FROM orders
       WHERE hotel_id IN (?)
       AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
       AND status != 'cancelled'
       GROUP BY room_type
       ORDER BY orders DESC`,
      [hotelIds, safePeriod]
    );
    
    res.json({
      success: true,
      data: ranking
    });
  } catch (error) {
    console.error('获取房型排行失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 辅助函数：获取商户统计数�?
async function getMerchantStats(merchantId, period) {
  const safePeriod = Math.min(parseInt(period), 180);
  
  const [hotels] = await db.query(
    'SELECT id FROM hotels WHERE merchantId = ? LIMIT 100',
    [merchantId]
  );
  
  if (hotels.length === 0) {
    return { totalOrders: 0, totalRevenue: 0, avgOccupancy: 0, avgRating: 0, cancelRate: 0, orderGrowth: 0, revenueGrowth: 0 };
  }
  
  const hotelIds = hotels.map(h => h.id);
  
  const [orderStats] = await db.query(
    `SELECT 
      COUNT(*) as totalOrders,
      SUM(total_price) as totalRevenue,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders
     FROM orders
     WHERE hotel_id IN (?) 
     AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [hotelIds, safePeriod]
  );
  
  const [occupancyStats] = await db.query(
    `SELECT COUNT(*) as completedOrders
     FROM orders
     WHERE hotel_id IN (?)
     AND status IN ('checked_out', 'completed')
     AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [hotelIds, safePeriod]
  );
  
  const avgOccupancy = orderStats[0].totalOrders > 0
    ? (occupancyStats[0].completedOrders / orderStats[0].totalOrders) * 100
    : 0;
  
  const [ratingStats] = await db.query(
    `SELECT AVG(overall_rating) as avgRating
     FROM reviews
     WHERE hotel_id IN (?)
     AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [hotelIds, safePeriod]
  );
  
  const prevPeriod = parseInt(safePeriod) * 2;
  const [prevOrderStats] = await db.query(
    `SELECT COUNT(*) as totalOrders, SUM(total_price) as totalRevenue
     FROM orders
     WHERE hotel_id IN (?)
     AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
     AND create_time < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [hotelIds, prevPeriod, safePeriod]
  );
  
  const orderGrowth = prevOrderStats[0].totalOrders > 0
    ? ((orderStats[0].totalOrders - prevOrderStats[0].totalOrders) / prevOrderStats[0].totalOrders) * 100
    : 0;
  
  const revenueGrowth = prevOrderStats[0].totalRevenue > 0
    ? ((orderStats[0].totalRevenue - prevOrderStats[0].totalRevenue) / prevOrderStats[0].totalRevenue) * 100
    : 0;
  
  return {
    totalOrders: orderStats[0].totalOrders || 0,
    totalRevenue: orderStats[0].totalRevenue || 0,
    avgOccupancy: Math.round(avgOccupancy),
    avgRating: parseFloat((Number(ratingStats[0].avgRating) || 0).toFixed(1)),
    cancelRate: orderStats[0].totalOrders > 0
      ? Math.round((orderStats[0].cancelledOrders / orderStats[0].totalOrders) * 100)
      : 0,
    orderGrowth: Math.round(orderGrowth),
    revenueGrowth: Math.round(revenueGrowth)
  };
}

// 辅助函数：获取趋势数�?
async function getTrendData(merchantId, period) {
  const safePeriod = Math.min(parseInt(period), 180);
  
  const [hotels] = await db.query(
    'SELECT id FROM hotels WHERE merchantId = ? LIMIT 100',
    [merchantId]
  );
  
  if (hotels.length === 0) {
    return [];
  }
  
  const hotelIds = hotels.map(h => h.id);
  
  const [trendData] = await db.query(
    `SELECT 
      DATE(create_time) as date,
      COUNT(*) as orders,
      SUM(total_price) as revenue
     FROM orders
     WHERE hotel_id IN (?)
     AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(create_time)
     ORDER BY date ASC
     LIMIT 200`,
    [hotelIds, safePeriod]
  );
  
  return trendData;
}

// 辅助函数：获取房型排�?
async function getRoomRanking(merchantId, period) {
  const safePeriod = Math.min(parseInt(period), 180);
  
  const [hotels] = await db.query(
    'SELECT id FROM hotels WHERE merchantId = ?',
    [merchantId]
  );
  
  if (hotels.length === 0) {
    return [];
  }
  
  const hotelIds = hotels.map(h => h.id);
  
  const [ranking] = await db.query(
    `SELECT 
      room_type,
      COUNT(*) as orders,
      SUM(total_price) as revenue,
      AVG(total_price / nights) as avgPrice
     FROM orders
     WHERE hotel_id IN (?)
     AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
     AND status != 'cancelled'
     GROUP BY room_type
     ORDER BY orders DESC`,
    [hotelIds, safePeriod]
  );
  
  return ranking;
}

// 获取AI数据洞察（带缓存�?
exports.getAIInsights = async (req, res) => {
  const merchantId = req.user.id;
  const { period = '30' } = req.query;
  
  try {
    const insights = await getCachedInsights(merchantId, period, async () => {
      const stats = await getMerchantStats(merchantId, period);
      const trendData = await getTrendData(merchantId, period);
      const roomRanking = await getRoomRanking(merchantId, period);
      
      const insightsService = new DataInsightsService();
      return await insightsService.generateDataInsights(stats, trendData, roomRanking);
    });
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('获取AI洞察失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取AI定价建议（带缓存�?
exports.getAIPricing = async (req, res) => {
  const merchantId = req.user.id;
  const { period = '30' } = req.query;
  
  try {
    const suggestions = await getCachedPricing(merchantId, period, async () => {
      const stats = await getMerchantStats(merchantId, period);
      const roomRanking = await getRoomRanking(merchantId, period);
      
      const pricingService = new PricingInsightsService();
      return await pricingService.generatePricingSuggestions({
        roomRanking,
        stats,
        competitorPrices: {},  // 可扩�?
        costPrices: {}         // 可扩�?
      });
    });
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('获取AI定价失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取AI异常预警（带缓存�?
exports.getAIAlerts = async (req, res) => {
  const merchantId = req.user.id;
  const { period = '30' } = req.query;
  
  try {
    const alerts = await getCachedAlerts(merchantId, period, async () => {
      const stats = await getMerchantStats(merchantId, period);
      const trendData = await getTrendData(merchantId, period);
      
      const insightsService = new DataInsightsService();
      return await insightsService.detectAnomalies(stats, trendData);
    });
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('获取AI预警失败:', error);
    res.status(500).json({ error: error.message });
  }
};
