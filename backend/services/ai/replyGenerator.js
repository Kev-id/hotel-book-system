const aiService = require('./aiService');

class ReplyGeneratorService {
  async generateReplies(review, hotelName) {
    const prompt = `
你是${hotelName}的客服经理。请为以下评价生成3种不同风格的回复。

评价内容：${review.content}
评分：${review.overall_rating}分

请生成：
1. professional风格：专业正式，适合高端酒店
2. friendly风格：友好亲切，拉近距离
3. compensatory风格：补偿型，提供解决方案

以JSON格式返回：
{
  "suggestions": [
    {
      "style": "professional",
      "content": "回复内容（80-120字）",
      "tone": "formal"
    },
    {
      "style": "friendly",
      "content": "回复内容（80-120字）",
      "tone": "casual"
    },
    {
      "style": "compensatory",
      "content": "回复内容（80-120字）",
      "tone": "apologetic"
    }
  ],
  "tips": ["建议1", "建议2", "建议3"]
}

要求：
1. 回复要真诚，不要套话
2. 针对评价中的具体问题给出回应
3. 差评（<3分）要道歉并提供解决方案
4. 好评（>=4分）要感谢并邀请再次光临
5. tips要给出实用的回复建议
`;
    
    try {
      const result = await aiService.callJSON(prompt, {
        systemPrompt: '你是一个专业的酒店客服培训师，擅长撰写得体的客户回复。',
        maxTokens: 800
      });
      
      return result;
    } catch (error) {
      console.error('生成回复建议失败:', error);
      return this.getDefaultReplies(review.overall_rating);
    }
  }
  
  getDefaultReplies(rating) {
    if (rating >= 4) {
      return {
        suggestions: [
          {
            style: 'professional',
            content: '感谢您的好评！我们会继续保持高标准的服务，期待再次为您服务。',
            tone: 'formal'
          }
        ],
        tips: ['建议在24小时内回复']
      };
    } else {
      return {
        suggestions: [
          {
            style: 'professional',
            content: '非常抱歉给您带来不好的体验，我们会认真改进。期待下次能为您提供更好的服务。',
            tone: 'formal'
          }
        ],
        tips: ['建议尽快回复并提供补偿方案']
      };
    }
  }
}

module.exports = new ReplyGeneratorService();
