const aiService = require('./aiService');
const pool = require('../../config/database');

class QualityCheckService {
  async checkQuality(review) {
    const flags = [];
    
    // 规则检测
    flags.push(...await this.ruleBasedCheck(review));
    
    // AI检测
    const aiResult = await this.aiBasedCheck(review);
    flags.push(...aiResult.flags);
    
    // ✅ P0-3修复：使用权重机制计算综合质量
    const qualityScore = this.calculateQualityScore(flags, aiResult);
    
    return {
      quality: qualityScore.level,
      confidence: qualityScore.confidence,
      flags,
      recommendation: qualityScore.recommendation,
      reasons: aiResult.reasons
    };
  }
  
  async ruleBasedCheck(review) {
    const flags = [];
    
    // 规则1：全5分
    if (this.isAllPerfectScores(review.dimensions)) {
      flags.push({
        type: 'all_perfect_scores',
        severity: 'warning',
        message: '所有维度都是满分，可能存在刷单'
      });
    }
    
    // 规则2：内容过短
    if (review.content.length < 20) {
      flags.push({
        type: 'short_content',
        severity: 'info',
        message: '评价内容过短（少于20字）'
      });
    }
    
    // 规则3：检查用户历史
    const userHistory = await this.getUserHistory(review.userId);
    if (userHistory.allFiveStars) {
      flags.push({
        type: 'suspicious_user',
        severity: 'warning',
        message: '用户历史评价全是5星'
      });
    }
    
    return flags;
  }
  
  async aiBasedCheck(review) {
    const prompt = `
请分析这条酒店评价的质量：

评价内容：${review.content}
评分：${review.overallRating}分
维度评分：${JSON.stringify(review.dimensions)}

请判断：
1. 评价是否真实可信
2. 评分与内容是否匹配
3. 是否存在刷单嫌疑

以JSON格式返回：
{
  "isGenuine": true,
  "ratingContentMatch": true,
  "reasons": ["理由1", "理由2"],
  "flags": [
    {
      "type": "rating_content_mismatch",
      "severity": "high",
      "message": "评价内容与评分不匹配"
    }
  ]
}
`;
    
    try {
      return await aiService.callJSON(prompt, {
        systemPrompt: '你是一个专业的评价质量检测专家。',
        maxTokens: 500
      });
    } catch (error) {
      console.error('AI质量检测失败:', error);
      return { flags: [], reasons: [], isGenuine: true, ratingContentMatch: true };
    }
  }
  
  /**
   * ✅ P0-3新增：基于权重的质量评分机制
   * 使用100分制，根据不同严重程度扣分
   */
  calculateQualityScore(flags, aiResult) {
    let score = 100;
    
    // 1. 规则检测扣分
    flags.forEach(flag => {
      if (flag.severity === 'high') {
        score -= 30;  // 高严重度扣30分
      } else if (flag.severity === 'warning') {
        score -= 15;  // 警告扣15分
      } else if (flag.severity === 'info') {
        score -= 5;   // 信息扣5分
      }
    });
    
    // 2. AI判断额外加权
    if (!aiResult.isGenuine) {
      score -= 40;  // AI判断不真实，扣40分
    }
    
    if (!aiResult.ratingContentMatch) {
      score -= 30;  // 评分与内容不匹配，扣30分
    }
    
    // 3. 确保分数在0-100范围内
    score = Math.max(0, Math.min(100, score));
    
    // 4. 根据分数确定质量等级
    let level, recommendation;
    if (score < 40) {
      level = 'fake';
      recommendation = '建议拒绝或删除';
    } else if (score < 70) {
      level = 'suspicious';
      recommendation = '建议人工审核';
    } else {
      level = 'good';
      recommendation = '可以正常发布';
    }
    
    // 5. 计算置信度（分数越低，置信度越高）
    const confidence = Math.min(0.95, (100 - score) / 100);
    
    return {
      level,
      confidence: parseFloat(confidence.toFixed(2)),
      recommendation,
      score  // 返回分数供调试使用
    };
  }
  
  isAllPerfectScores(dimensions) {
    return Object.values(dimensions).every(score => score === 5.0);
  }
  
  async getUserHistory(userId) {
    const [reviews] = await pool.query(
      'SELECT overall_rating FROM reviews WHERE user_id = ?',
      [userId]
    );
    
    const allFiveStars = reviews.length > 0 && 
                        reviews.every(r => r.overall_rating === 5.0);
    
    return { allFiveStars, totalReviews: reviews.length };
  }
}

module.exports = new QualityCheckService();
