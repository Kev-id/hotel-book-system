/**
 * Task13: AI推荐服务
 * 提供智能推荐、对比分析、自动分类功能
 */

const axios = require('axios');
const db = require('../../config/database');

class RecommendationService {
  constructor() {
    this.apiKey = process.env.QWEN_API_KEY;
    this.baseUrl = process.env.QWEN_BASE_URL;
    this.model = process.env.QWEN_MODEL || 'qwen-turbo-latest';
    this.maxModel = process.env.QWEN_MAX_MODEL || 'qwen-max-latest';
    this.timeout = 30000;  // 增加到30秒
    
    // 启动时验证配置
    if (!this.apiKey) {
      throw new Error('缺少必要配置：QWEN_API_KEY，请在.env文件中配置');
    }
  }

  /**
   * Prompt安全处理
   */
  sanitize(str) {
    if (!str) return '';
    return String(str).replace(/[<>"']/g, '');
  }

  /**
   * AI智能推荐收藏
   * @param {Object} userProfile - 用户画像
   * @param {Array} candidateHotels - 候选酒店列表
   * @returns {Promise<Array>} 推荐结果
   */
  async getPersonalizedRecommendations(userProfile, candidateHotels) {
    // 安全处理用户数据
    const sanitizedProfile = {
      browsedHotels: userProfile.browsedHotels.map(h => ({
        name: this.sanitize(h.name),
        price: h.price,
        rating: h.rating
      })),
      favoritedHotels: userProfile.favoritedHotels.map(h => ({
        name: this.sanitize(h.name),
        price: h.price,
        rating: h.rating
      })),
      bookedHotels: userProfile.bookedHotels.map(h => ({
        name: this.sanitize(h.name),
        price: h.price,
        rating: h.rating
      }))
    };

    const prompt = `你是一个酒店推荐专家。根据用户的浏览和收藏历史，推荐最适合的酒店。

用户画像：
- 浏览过的酒店：${JSON.stringify(sanitizedProfile.browsedHotels)}
- 收藏的酒店：${JSON.stringify(sanitizedProfile.favoritedHotels)}
- 预订过的酒店：${JSON.stringify(sanitizedProfile.bookedHotels)}

候选酒店列表：
${JSON.stringify(candidateHotels)}

请从候选酒店中选择最适合该用户的4个酒店，并为每个酒店生成推荐理由（20字以内）。

返回JSON格式：
[
  {
    "hotelId": 1,
    "reason": "与您收藏的商务酒店风格相似"
  }
]`;

    try {
      const response = await this.callAI(prompt, this.model);
      const recommendations = JSON.parse(response);
      
      // 类型校验：确保返回数组
      if (!Array.isArray(recommendations)) {
        console.warn('AI推荐返回非数组:', recommendations);
        return [];
      }
      
      return recommendations;
    } catch (error) {
      console.error('AI推荐失败:', error);
      return [];
    }
  }

  /**
   * AI智能对比分析
   * @param {Array} hotels - 待对比的酒店列表
   * @returns {Promise<Object>} 对比分析结果
   */
  async compareHotels(hotels) {
    const prompt = `你是一个酒店对比分析专家。用户正在对比以下酒店，请帮助用户做出决策。

对比酒店信息：
${JSON.stringify(hotels)}

请分析：
1. 核心差异点（价格、位置、设施、评分）
2. 各酒店的优势和劣势
3. 推荐最适合的酒店（考虑性价比、位置便利性、用户评价）

返回JSON格式：
{
  "summary": "简短总结（50字以内）",
  "keyDifferences": ["差异点1", "差异点2"],
  "recommendations": [
    {
      "hotelId": 1,
      "label": "最推荐",
      "reason": "理由"
    }
  ]
}`;

    try {
      const response = await this.callAI(prompt, this.maxModel);  // 使用max模型
      return JSON.parse(response);
    } catch (error) {
      console.error('AI对比分析失败:', error);
      return null;
    }
  }

  /**
   * AI自动分类收藏
   * @param {Object} hotel - 酒店信息
   * @returns {Promise<Object>} 分类结果
   */
  async categorizeHotel(hotel) {
    const prompt = `你是一个酒店分类专家。请根据酒店特征，将其分类到最合适的类别。

酒店信息：
${JSON.stringify(hotel)}

可选类别：
1. 商务出行 - 市中心、会议设施、交通便利
2. 度假休闲 - 景区、度假村、休闲设施
3. 性价比之选 - 价格实惠、评分不错
4. 亲子家庭 - 家庭房、儿童设施、安全性高

返回JSON格式：
{
  "category": "商务出行",
  "confidence": 0.85,
  "reason": "位于市中心，靠近地铁站"
}`;

    try {
      const response = await this.callAI(prompt, this.model);
      return JSON.parse(response);
    } catch (error) {
      console.error('AI分类失败:', error);
      return { category: '未分类', confidence: 0, reason: '' };
    }
  }

  /**
   * 调用通义千问API（带超时和重试机制）
   * @param {String} prompt - 提示词
   * @param {String} model - 模型名称
   * @param {Number} retryCount - 重试次数
   * @returns {Promise<String>} AI响应内容
   */
  async callAI(prompt, model = this.model, retryCount = 3) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          timeout: this.timeout,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 处理响应格式（支持多种返回格式）
      const content = response.data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI返回内容为空');
      }

      // 处理markdown代码块
      const jsonStr = content.replace(/```json\s*|\s*```/g, '').trim();
      
      // 记录成功日志
      const duration = Date.now() - startTime;
      await this.logAICall('recommendation', prompt.length, duration, 'success');
      
      return jsonStr;
    } catch (error) {
      // 记录失败日志
      const duration = Date.now() - startTime;
      await this.logAICall('recommendation', prompt.length, duration, 'error', error.message);
      
      // 智能重试机制（区分错误类型）
      if (retryCount > 0) {
        const isRetryable = !error.response ||  // 网络错误可重试
                           (error.response.status >= 500);  // 服务端错误可重试
        const isClientError = error.response?.status === 400;  // 客户端错误不重试
        
        if (isRetryable && !isClientError) {
          console.log(`AI调用失败，${retryCount}次重试机会，1秒后重试...`);
          await new Promise(r => setTimeout(r, 1000));
          return this.callAI(prompt, model, retryCount - 1);
        }
      }
      throw error;
    }
  }

  /**
   * 记录AI调用日志
   * @param {String} serviceType - 服务类型
   * @param {Number} promptLength - Prompt长度
   * @param {Number} durationMs - 耗时（毫秒）
   * @param {String} status - 状态
   * @param {String} errorMessage - 错误信息
   */
  async logAICall(serviceType, promptLength, durationMs, status, errorMessage = null) {
    try {
      await db.query(`
        INSERT INTO ai_call_logs (
          service_type, prompt_length, duration_ms, status, error_message, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [serviceType, promptLength, durationMs, status, errorMessage]);
    } catch (error) {
      // 日志记录失败不影响主流程
      console.error('记录AI调用日志失败:', error);
    }
  }
}

module.exports = new RecommendationService();
