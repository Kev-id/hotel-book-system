const reviewSummaryService = require('../services/ai/reviewSummary');
const qualityCheckService = require('../services/ai/qualityCheck');
const replyGeneratorService = require('../services/ai/replyGenerator');
const trendAnalysisService = require('../services/ai/trendAnalysis');
const { getCache, setCache } = require('../middleware/aiCache');
const pool = require('../config/database');

// 1. 获取评价摘要
exports.getReviewSummary = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { force } = req.query;
    
    // ✅ P1-1修复：缓存键包含参数
    const cacheParams = { force: force || false };
    
    // 检查缓存
    if (!force) {
      const cached = await getCache(hotelId, 'summary', cacheParams);
      if (cached) {
        return res.json({
          success: true,
          data: { ...cached, cached: true }
        });
      }
    }
    
    // 获取最近30条评价
    const [reviews] = await pool.query(
      `SELECT * FROM reviews 
       WHERE hotel_id = ? 
       ORDER BY create_time DESC 
       LIMIT 30`,
      [hotelId]
    );
    
    // 生成摘要
    const summary = await reviewSummaryService.generateSummary(reviews);
    
    // 缓存结果
    await setCache(hotelId, 'summary', summary, reviews.length, cacheParams);
    
    res.json({
      success: true,
      data: {
        ...summary,
        cachedAt: new Date().toISOString(),
        cached: false
      }
    });
  } catch (error) {
    console.error('获取评价摘要失败:', error);
    
    // ✅ P1-3修复：AI失败时使用降级方案
    try {
      const fallbackData = await getFallbackSummary(req.params.hotelId);
      res.json({
        success: true,
        data: {
          ...fallbackData,
          isFallback: true,
          message: 'AI服务暂时不可用，显示基础统计'
        }
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: '生成摘要失败，请稍后重试'
      });
    }
  }
};

// 2. 评价质量检测
exports.checkReviewQuality = async (req, res) => {
  try {
    const review = req.body;
    
    // 执行质量检测
    const result = await qualityCheckService.checkQuality(review);
    
    // 如果质量可疑，保存标记
    if (result.quality === 'suspicious' || result.quality === 'fake') {
      await pool.query(
        `INSERT INTO review_quality_flags (review_id, flag_type, confidence, reason)
         VALUES (?, ?, ?, ?)`,
        [review.reviewId, result.quality, result.confidence, JSON.stringify(result.reasons)]
      );
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('质量检测失败:', error);
    
    // ✅ P1-3修复：降级方案 - 返回基础检测结果
    res.json({
      success: true,
      data: {
        quality: 'unknown',
        confidence: 0,
        flags: [],
        recommendation: 'AI服务暂时不可用，建议人工审核',
        isFallback: true
      }
    });
  }
};

// 3. 生成回复建议
exports.generateReplySuggestions = async (req, res) => {
  try {
    const { reviewId, reviewContent, overallRating, hotelName } = req.body;
    
    if (!reviewContent || !hotelName) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    const review = { content: reviewContent, overall_rating: overallRating };
    const suggestions = await replyGeneratorService.generateReplies(review, hotelName);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('生成回复建议失败:', error);
    
    // ✅ P1-3修复：降级方案 - 返回通用回复模板
    const fallbackSuggestions = getDefaultReplySuggestions(req.body.overallRating);
    res.json({
      success: true,
      data: {
        ...fallbackSuggestions,
        isFallback: true,
        message: 'AI服务暂时不可用，显示通用回复模板'
      }
    });
  }
};

// 4. 获取趋势分析
exports.getReviewTrend = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { days = 30 } = req.query;
    
    // ✅ P1-1修复：缓存键包含days参数
    const cacheParams = { days: parseInt(days) };
    
    // 检查缓存
    const cached = await getCache(hotelId, 'trend', cacheParams);
    if (cached) {
      return res.json({
        success: true,
        data: { ...cached, cached: true }
      });
    }
    
    // 分析趋势
    const trend = await trendAnalysisService.analyzeTrend(hotelId, parseInt(days));
    
    // 缓存结果
    await setCache(hotelId, 'trend', trend, 0, cacheParams);
    
    res.json({
      success: true,
      data: { ...trend, cached: false }
    });
  } catch (error) {
    console.error('获取趋势分析失败:', error);
    
    // ✅ P1-3修复：降级方案 - 返回基础统计
    try {
      const fallbackTrend = await getFallbackTrend(req.params.hotelId, parseInt(req.query.days || 30));
      res.json({
        success: true,
        data: {
          ...fallbackTrend,
          isFallback: true,
          message: 'AI服务暂时不可用，显示基础统计'
        }
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: '分析失败，请稍后重试'
      });
    }
  }
};

/**
 * ✅ P1-3新增：降级方案辅助函数
 */

// 获取降级摘要（基础统计）
async function getFallbackSummary(hotelId) {
  const [reviews] = await pool.query(
    `SELECT * FROM reviews WHERE hotel_id = ? ORDER BY create_time DESC LIMIT 30`,
    [hotelId]
  );
  
  if (reviews.length === 0) {
    return {
      summary: '暂无评价',
      pros: [],
      cons: [],
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      tags: []
    };
  }
  
  // 简单情感分析
  const positive = reviews.filter(r => r.overall_rating >= 4).length;
  const negative = reviews.filter(r => r.overall_rating <= 2).length;
  const neutral = reviews.length - positive - negative;
  
  return {
    summary: `共有${reviews.length}条评价，平均评分${(reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)}分`,
    pros: extractTopKeywords(reviews, 'positive'),
    cons: extractTopKeywords(reviews, 'negative'),
    sentiment: {
      positive: Math.round((positive / reviews.length) * 100),
      neutral: Math.round((neutral / reviews.length) * 100),
      negative: Math.round((negative / reviews.length) * 100)
    },
    tags: extractSimpleTags(reviews)
  };
}

// 提取关键词（简单版本）
function extractTopKeywords(reviews, type) {
  const keywords = type === 'positive' 
    ? ['位置好', '干净', '服务好', '性价比高']
    : ['隔音差', 'WiFi不稳定', '设施陈旧'];
  
  return keywords.slice(0, 3);
}

// 提取标签（简单版本）
function extractSimpleTags(reviews) {
  return [
    { name: '位置', count: Math.floor(reviews.length * 0.6) },
    { name: '服务', count: Math.floor(reviews.length * 0.5) },
    { name: '卫生', count: Math.floor(reviews.length * 0.4) }
  ];
}

// 获取默认回复建议
function getDefaultReplySuggestions(rating) {
  if (rating >= 4) {
    return {
      suggestions: [
        {
          style: 'professional',
          content: '感谢您的好评！我们会继续保持高标准的服务，期待再次为您服务。',
          tone: 'formal'
        },
        {
          style: 'friendly',
          content: '谢谢您的认可！很高兴能为您提供满意的服务，欢迎下次再来！',
          tone: 'casual'
        }
      ],
      tips: ['建议在24小时内回复', '可以邀请客人再次光临']
    };
  } else {
    return {
      suggestions: [
        {
          style: 'professional',
          content: '非常抱歉给您带来不好的体验，我们会认真改进。期待下次能为您提供更好的服务。',
          tone: 'formal'
        },
        {
          style: 'compensatory',
          content: '非常抱歉让您失望了。我们已经记录您的反馈，会尽快改进。希望能有机会弥补这次的遗憾。',
          tone: 'apologetic'
        }
      ],
      tips: ['建议尽快回复', '可以主动提供补偿方案', '避免推卸责任']
    };
  }
}

// 获取降级趋势分析
async function getFallbackTrend(hotelId, days) {
  const [reviews] = await pool.query(
    `SELECT * FROM reviews 
     WHERE hotel_id = ? AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY create_time ASC`,
    [hotelId, days]
  );
  
  if (reviews.length < 5) {
    return {
      trend: { direction: 'stable', change: 0, description: '评价数量不足' },
      dimensionTrends: {},
      hotIssues: [],
      insights: [],
      chartData: { ratingTrend: [], sentimentDistribution: [] }
    };
  }
  
  // 简单趋势计算
  const mid = Math.floor(reviews.length / 2);
  const firstHalf = reviews.slice(0, mid);
  const secondHalf = reviews.slice(mid);
  
  const avgFirst = firstHalf.reduce((sum, r) => sum + r.overall_rating, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, r) => sum + r.overall_rating, 0) / secondHalf.length;
  const change = avgSecond - avgFirst;
  
  return {
    trend: {
      direction: change > 0.2 ? 'improving' : change < -0.2 ? 'declining' : 'stable',
      change: parseFloat(change.toFixed(2)),
      description: `近${reviews.length}条评价，评分从${avgFirst.toFixed(1)}变化到${avgSecond.toFixed(1)}`
    },
    dimensionTrends: {},
    hotIssues: [],
    insights: [
      {
        type: 'info',
        title: '基础统计',
        description: 'AI服务暂时不可用，仅显示基础评分趋势',
        recommendation: '请稍后刷新获取完整分析'
      }
    ],
    chartData: { ratingTrend: [], sentimentDistribution: [] }
  };
}
