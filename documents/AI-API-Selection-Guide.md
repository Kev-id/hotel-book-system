# 🤖 AI API 选型指南

## 📋 大模型类型要求

### 我们需要的能力

| 能力 | 用途 | 重要性 |
|------|------|--------|
| 文本理解 | 理解用户查询、评价内容 | ⭐⭐⭐ 必须 |
| 文本生成 | 生成摘要、建议、文案 | ⭐⭐⭐ 必须 |
| 情感分析 | 分析评价情感倾向 | ⭐⭐ 重要 |
| 结构化输出 | 返回JSON格式数据 | ⭐⭐⭐ 必须 |
| 中文能力 | 处理中文酒店评价 | ⭐⭐⭐ 必须 |

### 推荐的大模型类型

**通用对话模型**（推荐）
- 通义千问 qwen-turbo / qwen-plus
- 文心一言 ERNIE-Bot-turbo
- 智谱 GLM-4

**不需要**：
- ❌ 图像生成模型（DALL-E, Stable Diffusion）
- ❌ 语音模型（Whisper）
- ❌ 代码专用模型（CodeLlama）

---

## 🎯 推荐方案对比

### 方案1: 通义千问（阿里云）⭐⭐⭐ 强烈推荐

**模型选择**:
- `qwen-turbo`: 快速响应，适合实时场景
- `qwen-plus`: 能力更强，适合复杂分析

**优点**:
- ✅ 免费额度：100万tokens/月（够用）
- ✅ 中文能力强
- ✅ 响应速度快（1-2秒）
- ✅ 支持结构化输出
- ✅ 文档完善，易于集成
- ✅ 国内访问稳定

**成本**:
```
免费额度：100万tokens/月
超出后：
- qwen-turbo: 0.008元/1000tokens
- qwen-plus: 0.02元/1000tokens

预估月成本：
- 开发测试期：0元（免费额度内）
- 正式运营：50-100元/月
```

**注册地址**: https://dashscope.aliyun.com/

**需要准备**:
1. 阿里云账号
2. 实名认证
3. 开通DashScope服务
4. 获取API Key

---

### 方案2: 文心一言（百度）⭐⭐

**模型选择**:
- `ERNIE-Bot-turbo`: 快速版本
- `ERNIE-Bot`: 标准版本

**优点**:
- ✅ 免费额度：50万tokens/月
- ✅ 中文能力强
- ✅ 百度生态集成好

**缺点**:
- ⚠️ 免费额度较少
- ⚠️ 响应速度略慢

**成本**:
```
免费额度：50万tokens/月
超出后：0.012元/1000tokens
```

---

### 方案3: 智谱AI（清华）⭐⭐

**模型选择**:
- `glm-4-flash`: 快速版本
- `glm-4`: 标准版本

**优点**:
- ✅ 技术能力强
- ✅ 支持长文本

**缺点**:
- ⚠️ 免费额度较少
- ⚠️ 文档相对简单

---

### 方案4: OpenAI（不推荐）❌

**为什么不推荐**:
- ❌ 需要科学上网
- ❌ 需要国外信用卡
- ❌ 成本较高
- ❌ 访问不稳定

---

## 🔧 通义千问集成示例

### 1. 注册和获取API Key

**步骤**:
1. 访问 https://dashscope.aliyun.com/
2. 使用阿里云账号登录（没有就注册）
3. 完成实名认证
4. 进入控制台 → API-KEY管理
5. 创建新的API Key
6. 复制保存（只显示一次）

### 2. 配置环境变量

```bash
# backend/.env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 安装依赖

```bash
npm install axios
```

### 4. 创建AI服务基础类

```javascript
// backend/services/ai/aiService.js
const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY;
    this.baseURL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    this.model = 'qwen-turbo'; // 或 qwen-plus
  }

  /**
   * 调用通义千问API
   * @param {string} prompt - 提示词
   * @param {object} options - 可选参数
   * @returns {Promise<string>} AI生成的文本
   */
  async call(prompt, options = {}) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: options.model || this.model,
          input: {
            messages: [
              {
                role: 'system',
                content: options.systemPrompt || '你是一个专业的酒店行业AI助手'
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            result_format: 'message',
            max_tokens: options.maxTokens || 1500,
            temperature: options.temperature || 0.7
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.output.choices[0].message.content;
    } catch (error) {
      console.error('AI API调用失败:', error.response?.data || error.message);
      throw new Error('AI服务暂时不可用');
    }
  }

  /**
   * 调用AI并返回JSON格式
   * @param {string} prompt - 提示词
   * @param {object} options - 可选参数
   * @returns {Promise<object>} 解析后的JSON对象
   */
  async callJSON(prompt, options = {}) {
    const systemPrompt = (options.systemPrompt || '') + 
      '\n\n请以JSON格式返回结果，不要包含任何其他文字。';
    
    const result = await this.call(prompt, { ...options, systemPrompt });
    
    // 提取JSON（处理可能的markdown代码块）
    const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                     result.match(/```\n([\s\S]*?)\n```/) ||
                     [null, result];
    
    return JSON.parse(jsonMatch[1].trim());
  }
}

module.exports = new AIService();
```

### 5. 使用示例：评价摘要

```javascript
// backend/services/ai/reviewAnalysis.js
const aiService = require('./aiService');

class ReviewAnalysisService {
  /**
   * 生成评价智能摘要
   * @param {Array} reviews - 评价列表
   * @returns {Promise<object>} 摘要结果
   */
  async generateSummary(reviews) {
    // 准备评价文本
    const reviewTexts = reviews.map((r, i) => 
      `评价${i + 1}（${r.overallRating}分）: ${r.content}`
    ).join('\n\n');

    const prompt = `
请分析以下酒店评价，生成智能摘要：

${reviewTexts}

请以JSON格式返回：
{
  "summary": "整体评价摘要（100字内）",
  "pros": ["优点1", "优点2", "优点3"],
  "cons": ["缺点1", "缺点2"],
  "sentiment": {
    "positive": 65,
    "neutral": 25,
    "negative": 10
  },
  "tags": ["干净", "位置好", "隔音差"]
}
`;

    return await aiService.callJSON(prompt, {
      systemPrompt: '你是一个专业的酒店评价分析师，擅长从大量评价中提取关键信息。',
      maxTokens: 1000
    });
  }
}

module.exports = new ReviewAnalysisService();
```

### 6. API接口

```javascript
// backend/controllers/aiController.js
const reviewAnalysisService = require('../services/ai/reviewAnalysis');
const db = require('../config/database');

exports.getReviewSummary = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // 获取最近30条评价
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE hotelId = ? ORDER BY createdAt DESC LIMIT 30',
      [hotelId]
    );

    if (reviews.length === 0) {
      return res.json({
        summary: '暂无评价',
        pros: [],
        cons: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        tags: []
      });
    }

    // 调用AI生成摘要
    const summary = await reviewAnalysisService.generateSummary(reviews);

    res.json(summary);
  } catch (error) {
    console.error('生成评价摘要失败:', error);
    res.status(500).json({ error: '生成摘要失败' });
  }
};
```

### 7. 前端调用

```javascript
// src/api/aiApi.js
import axios from 'axios';

export const aiApi = {
  // 获取评价摘要
  getReviewSummary: (hotelId) => 
    axios.get(`/api/ai/review-summary/${hotelId}`),
};

// 使用
const summary = await aiApi.getReviewSummary(hotelId);
console.log(summary.data);
```

---

## 💰 成本控制建议

### 1. 缓存策略
```javascript
// 缓存AI结果，避免重复调用
const cache = new Map();

async function getCachedSummary(hotelId) {
  const cacheKey = `summary_${hotelId}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    // 缓存1小时
    if (Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }
  }
  
  const summary = await generateSummary(hotelId);
  cache.set(cacheKey, { data: summary, timestamp: Date.now() });
  return summary;
}
```

### 2. 限流策略
```javascript
// 限制每个用户的调用频率
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 最多10次
  message: 'AI服务调用过于频繁，请稍后再试'
});

app.use('/api/ai', aiLimiter);
```

### 3. 降级策略
```javascript
// AI服务不可用时的降级方案
async function getReviewSummaryWithFallback(hotelId) {
  try {
    return await aiService.generateSummary(reviews);
  } catch (error) {
    // 降级：返回简单统计
    return {
      summary: '暂时无法生成AI摘要',
      pros: ['查看详细评价了解更多'],
      cons: [],
      sentiment: calculateSimpleSentiment(reviews)
    };
  }
}
```

---

## 📊 Token 使用估算

### 单次调用消耗

| 功能 | 输入tokens | 输出tokens | 总计 |
|------|-----------|-----------|------|
| 评价摘要 | 300 | 200 | 500 |
| 智能推荐 | 200 | 100 | 300 |
| 数据洞察 | 400 | 300 | 700 |
| 智能回复 | 150 | 150 | 300 |

### 月度使用预估

```
假设日活100人：
- 评价摘要：100次/天 × 500tokens = 50,000tokens/天
- 智能推荐：200次/天 × 300tokens = 60,000tokens/天
- 其他功能：40,000tokens/天

总计：150,000tokens/天 × 30天 = 4,500,000tokens/月

成本：
- 前100万免费
- 超出350万 × 0.008元/1000 = 28元/月
```

---

## ✅ 最终推荐

**使用通义千问 qwen-turbo**

理由：
1. 免费额度充足（100万tokens/月）
2. 中文能力强，适合酒店评价场景
3. 响应速度快，用户体验好
4. 文档完善，易于集成
5. 国内访问稳定，无需科学上网

**下一步**：
1. 注册阿里云账号
2. 开通DashScope服务
3. 获取API Key
4. 按照上面的代码示例集成

---

**更新时间**: 2026-02-21
