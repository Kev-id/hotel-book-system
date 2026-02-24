const AIService = require('./aiService');

class PricingInsightsService extends AIService {
  // AI智能定价建议
  async generatePricingSuggestions(merchantData) {
    const {
      roomRanking,
      stats,
      competitorPrices = {},
      costPrices = {}
    } = merchantData;

    const context = this.buildPricingContext(roomRanking, stats, competitorPrices, costPrices);
    
    const prompt = `你是一个酒店定价专家。请基于以下数据给出定价建议。

【当前经营数据】
${context.currentData}

【市场数据】
${context.marketData}

【成本数据】
${context.costData}

请为每个房型给出定价建议，要求：
1. 建议价格必须高于成本价
2. 建议价格不能偏离市场均价超过30%
3. 考虑入住率、季节性、竞争态势

返回JSON格式：
[
  {
    "roomType": "标准房",
    "currentPrice": 299,
    "suggestedPrice": 329,
    "change": 10,
    "reason": "入住率85%，需求旺盛，建议涨价",
    "confidence": "high"
  }
]`;

    try {
      const suggestions = await this.call(prompt, {
        model: 'qwen-max-latest',
        temperature: 0.5,
        maxTokens: 1500
      });
      
      return this.validatePricingSuggestions(suggestions, costPrices, competitorPrices);
      
    } catch (error) {
      console.error('AI定价建议失败，使用降级方案:', error);
      return this.fallbackPricingSuggestions(roomRanking, stats, costPrices);
    }
  }

  buildPricingContext(roomRanking, stats, competitorPrices, costPrices) {
    const currentData = roomRanking.map(room => {
      const occupancyRate = (room.orders / stats.totalOrders * 100).toFixed(1);
      return `${room.room_type}: 当前均价¥${Math.round(room.avgPrice)}, 订单${room.orders}单, 入住率${occupancyRate}%`;
    }).join('\n');

    const marketData = Object.keys(competitorPrices).length > 0
      ? Object.entries(competitorPrices).map(([type, price]) => 
          `${type}: 市场均价¥${price}`
        ).join('\n')
      : '暂无竞品数据';

    const costData = Object.keys(costPrices).length > 0
      ? Object.entries(costPrices).map(([type, cost]) => 
          `${type}: 成本价¥${cost}`
        ).join('\n')
      : '暂无成本数据';

    return { currentData, marketData, costData };
  }

  validatePricingSuggestions(suggestions, costPrices, competitorPrices) {
    return suggestions.map(item => {
      const costPrice = costPrices[item.roomType] || 0;
      const marketPrice = competitorPrices[item.roomType] || item.currentPrice;
      
      // 不能低于成本价
      if (item.suggestedPrice < costPrice) {
        item.suggestedPrice = Math.ceil(costPrice * 1.1);
        item.reason += '（已调整至成本价以上）';
        item.confidence = 'low';
      }
      
      // 不能偏离市场价超过30%
      const deviation = Math.abs(item.suggestedPrice - marketPrice) / marketPrice;
      if (deviation > 0.3) {
        const maxPrice = Math.ceil(marketPrice * 1.2);
        const minPrice = Math.floor(marketPrice * 0.8);
        item.suggestedPrice = Math.max(minPrice, Math.min(maxPrice, item.suggestedPrice));
        item.reason += '（已调整至合理范围）';
        item.confidence = 'medium';
      }
      
      item.change = Math.round(((item.suggestedPrice - item.currentPrice) / item.currentPrice) * 100);
      return item;
    });
  }

  fallbackPricingSuggestions(roomRanking, stats, costPrices) {
    return roomRanking.map(room => {
      const occupancyRate = (room.orders / stats.totalOrders) * 100;
      const currentPrice = Math.round(room.avgPrice);
      const costPrice = costPrices[room.room_type] || currentPrice * 0.7;
      
      let suggestedPrice = currentPrice;
      let reason = '';
      
      if (occupancyRate > 80) {
        suggestedPrice = Math.ceil(currentPrice * 1.1);
        reason = `入住率${occupancyRate.toFixed(0)}%，需求旺盛，建议涨价`;
      } else if (occupancyRate < 40) {
        suggestedPrice = Math.floor(currentPrice * 0.9);
        reason = `入住率${occupancyRate.toFixed(0)}%，需求不足，建议降价促销`;
      } else {
        reason = `入住率${occupancyRate.toFixed(0)}%，建议保持当前价格`;
      }
      
      if (suggestedPrice < costPrice) {
        suggestedPrice = Math.ceil(costPrice * 1.1);
        reason += '（已调整至成本价以上）';
      }
      
      return {
        roomType: room.room_type,
        currentPrice,
        suggestedPrice,
        change: Math.round(((suggestedPrice - currentPrice) / currentPrice) * 100),
        reason,
        confidence: 'medium',
        isFallback: true
      };
    });
  }
}

module.exports = PricingInsightsService;
