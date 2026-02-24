const aiService = require('./aiService');
const pool = require('../../config/database');

class TrendAnalysisService {
  async analyzeTrend(hotelId, days = 30) {
    // 获取指定天数内的评价
    const [reviews] = await pool.query(
      `SELECT * FROM reviews 
       WHERE hotel_id = ? AND create_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY create_time ASC`,
      [hotelId, days]
    );
    
    if (reviews.length < 5) {
      return this.getEmptyTrend();
    }
    
    // 计算基础趋势
    const trend = this.calculateBasicTrend(reviews);
    
    // AI分析热点问题和洞察
    const aiInsights = await this.getAIInsights(reviews);
    
    return {
      trend: trend.overall,
      dimensionTrends: trend.dimensions,
      hotIssues: aiInsights.hotIssues,
      insights: aiInsights.insights,
      chartData: this.prepareChartData(reviews)
    };
  }
  
  calculateBasicTrend(reviews) {
    // 分成前后两半计算趋势
    const mid = Math.floor(reviews.length / 2);
    const firstHalf = reviews.slice(0, mid);
    const secondHalf = reviews.slice(mid);
    
    const avgFirst = this.calculateAvgRating(firstHalf);
    const avgSecond = this.calculateAvgRating(secondHalf);
    const change = avgSecond - avgFirst;
    
    return {
      overall: {
        direction: change > 0.2 ? 'improving' : change < -0.2 ? 'declining' : 'stable',
        change: parseFloat(change.toFixed(2)),
        description: `近${reviews.length}条评价，评分从${avgFirst.toFixed(1)}变化到${avgSecond.toFixed(1)}`
      },
      dimensions: this.calculateDimensionTrends(reviews)
    };
  }
  
  calculateDimensionTrends(reviews) {
    const dimensions = ['cleanliness', 'service', 'facilities', 'location', 'valueForMoney'];
    const result = {};
    
    dimensions.forEach(dim => {
      const scores = reviews
        .map(r => r.dimensions?.[dim])
        .filter(s => s !== undefined);
      
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        result[dim] = {
          trend: 'stable',
          avgScore: parseFloat(avg.toFixed(2))
        };
      }
    });
    
    return result;
  }
  
  async getAIInsights(reviews) {
    // ✅ P0-2修复：限制评价数量和长度，防止Token超限
    const maxReviews = 50;  // 最多分析50条
    const maxContentLength = 150;  // 每条最多150字
    
    const reviewTexts = reviews
      .slice(0, maxReviews)
      .map(r => ({
        rating: r.overall_rating,
        content: r.content.substring(0, maxContentLength)
      }))
      .map(r => `[${r.rating}分] ${r.content}`)
      .join('\n');
    
    const prompt = `
请分析这些酒店评价，识别热点问题和改进机会：

评价内容：
${reviewTexts}

请以JSON格式返回：
{
  "hotIssues": [
    {
      "issue": "隔音问题",
      "mentions": 12,
      "trend": "increasing",
      "severity": "high"
    }
  ],
  "insights": [
    {
      "type": "warning",
      "title": "标题",
      "description": "描述",
      "recommendation": "建议"
    }
  ]
}

要求：
1. hotIssues要列出被多次提及的问题（至少3次）
2. insights要给出可操作的建议
3. type可以是warning（问题）或opportunity（机会）
`;
    
    try {
      return await aiService.callJSON(prompt, {
        systemPrompt: '你是一个专业的酒店运营分析师。',
        maxTokens: 1000
      });
    } catch (error) {
      console.error('AI趋势分析失败:', error);
      return { hotIssues: [], insights: [] };
    }
  }
  
  calculateAvgRating(reviews) {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.overall_rating, 0);
    return sum / reviews.length;
  }
  
  prepareChartData(reviews) {
    // 按周分组
    const weeklyData = {};
    reviews.forEach(r => {
      const week = this.getWeekKey(new Date(r.create_time));
      if (!weeklyData[week]) {
        weeklyData[week] = { ratings: [], positive: 0, neutral: 0, negative: 0 };
      }
      weeklyData[week].ratings.push(r.overall_rating);
      
      if (r.overall_rating >= 4) weeklyData[week].positive++;
      else if (r.overall_rating >= 3) weeklyData[week].neutral++;
      else weeklyData[week].negative++;
    });
    
    // 转换为图表数据
    const ratingTrend = Object.keys(weeklyData).map(week => ({
      date: week,
      avgRating: parseFloat(
        (weeklyData[week].ratings.reduce((a, b) => a + b, 0) / weeklyData[week].ratings.length).toFixed(2)
      )
    }));
    
    const sentimentDistribution = Object.keys(weeklyData).map(week => {
      const total = weeklyData[week].positive + weeklyData[week].neutral + weeklyData[week].negative;
      return {
        date: week,
        positive: Math.round((weeklyData[week].positive / total) * 100),
        neutral: Math.round((weeklyData[week].neutral / total) * 100),
        negative: Math.round((weeklyData[week].negative / total) * 100)
      };
    });
    
    return { ratingTrend, sentimentDistribution };
  }
  
  getWeekKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  getEmptyTrend() {
    return {
      trend: { direction: 'stable', change: 0, description: '评价数量不足' },
      dimensionTrends: {},
      hotIssues: [],
      insights: [],
      chartData: { ratingTrend: [], sentimentDistribution: [] }
    };
  }
}

module.exports = new TrendAnalysisService();
