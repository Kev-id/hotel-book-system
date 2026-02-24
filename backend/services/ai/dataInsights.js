const AIService = require('./aiService');

class DataInsightsService extends AIService {
  // AI数据洞察引擎
  async generateDataInsights(stats, trendData, roomRanking) {
    // Token限制
    const estimatedTokens = this.estimateTokens(JSON.stringify({ stats, trendData, roomRanking }));
    if (estimatedTokens > 3000) {
      trendData = trendData.slice(-7);
      roomRanking = roomRanking.slice(0, 5);
    }

    const prompt = `你是一个酒店经营数据分析专家。请分析以下数据并给出具体的优化建议。

【数据概览】
- 总订单量：${stats.totalOrders}（环比${stats.orderGrowth > 0 ? '+' : ''}${stats.orderGrowth}%）
- 总营收：¥${stats.totalRevenue}（环比${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%）
- 平均入住率：${stats.avgOccupancy}%
- 平均评分：${stats.avgRating}
- 取消率：${stats.cancelRate}%

【房型数据】
${roomRanking.slice(0, 5).map((r, i) => `${i + 1}. ${r.room_type}：${r.orders}单，营收¥${r.revenue}`).join('\n')}

【趋势数据】
最近7天订单量：${trendData.slice(-7).map(d => d.orders).join(', ')}

请按以下JSON格式输出（不要添加任何额外文字）：

{
  "opportunities": [
    {
      "finding": "具体发现（20字以内）",
      "suggestion": "具体建议（30字以内）"
    }
  ],
  "risks": [
    {
      "finding": "具体发现（20字以内）",
      "suggestion": "具体建议（30字以内）"
    }
  ]
}

要求：机会点和风险点各2-3条，建议必须具体可执行`;

    try {
      const insights = await this.call(prompt, {
        model: 'qwen-max-latest',
        temperature: 0.7,
        maxTokens: 800
      });
      
      insights.isAI = true;
      insights.isFallback = false;
      return insights;
      
    } catch (error) {
      console.error('AI洞察生成失败，使用实时降级方案:', error);
      return this.fallbackInsights(stats, trendData, roomRanking);
    }
  }

  // 实时降级方案（基于规则引擎）
  fallbackInsights(stats, trendData, roomRanking) {
    console.log('使用实时规则引擎生成洞察');
    
    const insights = {
      opportunities: [],
      risks: [],
      isAI: false,
      isFallback: true
    };
    
    // 机会点分析
    if (stats.avgOccupancy > 75) {
      insights.opportunities.push({
        finding: `入住率达${stats.avgOccupancy}%，需求旺盛`,
        suggestion: '建议适当提高房价10-15%，提升收益'
      });
    }
    
    if (stats.orderGrowth > 15) {
      insights.opportunities.push({
        finding: `订单量增长${stats.orderGrowth}%，趋势良好`,
        suggestion: '建议增加营销投入，扩大市场份额'
      });
    }
    
    if (stats.avgRating >= 4.5) {
      insights.opportunities.push({
        finding: `平均评分${stats.avgRating}，口碑优秀`,
        suggestion: '建议在宣传中突出高评分，吸引更多客户'
      });
    }
    
    // 风险点分析
    if (stats.cancelRate > 20) {
      insights.risks.push({
        finding: `取消率${stats.cancelRate}%，高于行业平均`,
        suggestion: '建议优化取消政策，联系客户了解原因'
      });
    }
    
    if (stats.avgRating < 4.0) {
      insights.risks.push({
        finding: `平均评分${stats.avgRating}，低于优秀水平`,
        suggestion: '建议查看差评内容，针对性改进服务'
      });
    }
    
    if (stats.orderGrowth < -15) {
      insights.risks.push({
        finding: `订单量下降${Math.abs(stats.orderGrowth)}%`,
        suggestion: '建议检查价格竞争力，增加促销活动'
      });
    }
    
    // 确保至少有一些洞察
    if (insights.opportunities.length === 0) {
      insights.opportunities.push({
        finding: '当前经营状况稳定',
        suggestion: '建议持续关注市场变化，保持竞争力'
      });
    }
    
    if (insights.risks.length === 0) {
      insights.risks.push({
        finding: '暂未发现明显风险',
        suggestion: '建议定期检查数据，预防潜在问题'
      });
    }
    
    return insights;
  }

  // AI异常检测预警
  async detectAnomalies(stats, trendData) {
    const alerts = [];
    
    // 1. 订单量异常
    if (stats.orderGrowth < -30) {
      const severity = stats.orderGrowth < -50 ? 'error' : 'warning';
      alerts.push({
        type: 'order_drop',
        severity,
        title: '订单量大幅下降',
        message: `订单量环比下降${Math.abs(stats.orderGrowth)}%`,
        suggestion: '建议检查价格竞争力，增加营销投入'
      });
    }
    
    // 2. 取消率异常
    if (stats.cancelRate > 25) {
      alerts.push({
        type: 'high_cancel_rate',
        severity: 'warning',
        title: '取消率异常偏高',
        message: `近期取消率${stats.cancelRate}%，远高于正常水平`,
        suggestion: '建议联系客户了解取消原因，优化服务'
      });
    }
    
    // 3. 评分异常
    if (stats.avgRating < 3.8) {
      alerts.push({
        type: 'low_rating',
        severity: 'error',
        title: '评分严重下降',
        message: `平均评分${stats.avgRating}，低于及格线`,
        suggestion: '紧急查看差评内容，立即改进服务质量'
      });
    }
    
    // 4. 营收异常
    if (stats.revenueGrowth < -25) {
      alerts.push({
        type: 'revenue_drop',
        severity: 'error',
        title: '营收大幅下降',
        message: `营收环比下降${Math.abs(stats.revenueGrowth)}%`,
        suggestion: '建议优化定价策略，提升客单价'
      });
    }
    
    // 5. 趋势异常
    if (trendData.length >= 3) {
      const recent3Days = trendData.slice(-3);
      const isDecreasing = recent3Days.every((day, i) => 
        i === 0 || day.orders < recent3Days[i - 1].orders
      );
      
      if (isDecreasing) {
        alerts.push({
          type: 'trend_decline',
          severity: 'warning',
          title: '订单量持续下降',
          message: '最近3天订单量持续下降',
          suggestion: '建议分析原因，及时调整策略'
        });
      }
    }
    
    // 新店保护
    if (stats.totalOrders < 20) {
      return alerts.filter(a => a.severity === 'error');
    }
    
    return alerts;
  }
}

module.exports = DataInsightsService;
