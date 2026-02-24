const axios = require('axios');
const aiConfig = require('../../config/ai');

class AIService {
  constructor() {
    this.apiKey = aiConfig.apiKey;
    this.baseURL = aiConfig.baseURL;
    this.model = aiConfig.model;
    this.maxModel = aiConfig.maxModel;
  }

  /**
   * 基础AI调用
   */
  async call(prompt, options = {}) {
    const {
      systemPrompt = '',
      maxTokens = aiConfig.maxTokens,
      temperature = aiConfig.temperature,
      timeout = aiConfig.timeout,
      model = this.model
    } = options;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: temperature
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: timeout
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI调用失败:', error.message);
      throw new Error('AI服务暂时不可用');
    }
  }

  /**
   * ✅ P0-1修复：增强JSON解析容错
   * 处理通义千问返回的markdown包裹的JSON
   */
  parseJSON(content) {
    // 1. 移除markdown代码块标记
    let jsonStr = content.trim()
      .replace(/^```json\s*/i, '')  // 移除开头的 ```json
      .replace(/^```\s*/i, '')      // 移除开头的 ```
      .replace(/\s*```$/, '');      // 移除结尾的 ```

    // 2. 尝试直接解析
    try {
      return JSON.parse(jsonStr);
    } catch (firstError) {
      console.warn('首次JSON解析失败，尝试提取JSON片段');
      
      // 3. 尝试提取JSON对象（使用正则匹配 {...}）
      try {
        const match = jsonStr.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch (secondError) {
        console.error('JSON提取也失败');
      }
      
      // 4. 所有尝试都失败
      console.error('原始内容:', content);
      throw new Error('AI返回格式错误，无法解析JSON');
    }
  }

  /**
   * JSON格式调用（✅ 已修复：使用parseJSON方法）
   */
  async callJSON(prompt, options = {}) {
    const content = await this.call(prompt, options);
    return this.parseJSON(content);
  }

  /**
   * 批量调用（并发控制）
   */
  async batchCall(prompts, options = {}) {
    const { concurrency = 3 } = options;
    const results = [];
    
    for (let i = 0; i < prompts.length; i += concurrency) {
      const batch = prompts.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(prompt => this.call(prompt, options))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Token估算
   */
  estimateTokens(text) {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }
}

module.exports = AIService;
