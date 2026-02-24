const aiService = require('./aiService');

class ReviewSummaryService {
  async generateSummary(reviews) {
    if (reviews.length === 0) {
      return this.getEmptySummary();
    }
    
    // ✅ P0-2修复：限制评价数量，防止Token超限
    const maxReviews = 30;  // 最多分析30条评价
    const limitedReviews = reviews.slice(0, maxReviews);
    
    // 准备评价文本（✅ P0-2修复：限制单条长度）
    const reviewTexts = limitedReviews.map((r, i) => 
      `评价${i + 1}（${r.overall_rating}分）: ${r.content.substring(0, 200)}`  // 每条最多200字
    ).join('\n\n');
    
    const prompt = `
你是一个专业的酒店评价分析师。请分析以下${limitedReviews.length}条评价并生成摘要。

评价数据：
${reviewTexts}

请以JSON格式返回：
{
  "summary": "整体评价摘要（100-150字，客观中立）",
  "pros": ["优点1", "优点2", "优点3", "优点4"],
  "cons": ["缺点1", "缺点2"],
  "sentiment": {
    "positive": 65,
    "neutral": 25,
    "negative": 10
  },
  "tags": [
    {"name": "位置好", "count": 18},
    {"name": "干净", "count": 15},
    {"name": "隔音差", "count": 8}
  ]
}

要求：
1. summary要客观中立，突出重点，不要主观评价
2. pros和cons要具体，不要泛泛而谈（如"服务好"改为"前台服务热情周到"）
3. sentiment百分比总和必须为100
4. tags要提取高频关键词，按出现次数排序，至少5个
5. 如果评价中提到具体问题（如隔音、WiFi），必须在cons中体现
`;
    
    try {
      const result = await aiService.callJSON(prompt, {
        systemPrompt: '你是一个专业的酒店评价分析师，擅长从大量评价中提取关键信息。',
        maxTokens: 1000
      });
      
      // ✅ P1-2修复：校验并修正情感百分比
      const normalizedSentiment = this.normalizeSentiment(result.sentiment);
      
      return {
        ...result,
        sentiment: normalizedSentiment,
        reviewsAnalyzed: limitedReviews.length
      };
    } catch (error) {
      console.error('生成评价摘要失败:', error);
      return this.getEmptySummary();
    }
  }
  
  /**
   * ✅ P1-2新增：情感百分比校验和修正
   * 确保positive + neutral + negative = 100
   */
  normalizeSentiment(sentiment) {
    const total = sentiment.positive + sentiment.neutral + sentiment.negative;
    
    // 如果总和为0，返回默认值
    if (total === 0) {
      return { positive: 0, neutral: 0, negative: 0 };
    }
    
    // 如果总和已经是100，直接返回
    if (total === 100) {
      return sentiment;
    }
    
    // 按比例调整，确保总和为100
    const normalized = {
      positive: Math.round((sentiment.positive / total) * 100),
      neutral: Math.round((sentiment.neutral / total) * 100),
      negative: Math.round((sentiment.negative / total) * 100)
    };
    
    // 处理四舍五入导致的误差（确保总和正好是100）
    const normalizedTotal = normalized.positive + normalized.neutral + normalized.negative;
    if (normalizedTotal !== 100) {
      // 将差值加到最大的那一项上
      const maxKey = Object.keys(normalized).reduce((a, b) => 
        normalized[a] > normalized[b] ? a : b
      );
      normalized[maxKey] += (100 - normalizedTotal);
    }
    
    return normalized;
  }
  
  getEmptySummary() {
    return {
      summary: '暂无足够评价生成摘要',
      pros: [],
      cons: [],
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      tags: [],
      reviewsAnalyzed: 0
    };
  }
}

module.exports = new ReviewSummaryService();
