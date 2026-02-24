# 🔑 AI API 快速参考手册

> 给3个Agent开发任务12/13/14时的快速参考

**最后更新**: 2026-02-21

---

## ✅ API配置状态

### 已完成配置 ✅

**配置文件**: `backend/.env`

```env
# 通义千问 AI API 配置
QWEN_API_KEY=sk-56137e94aa6743c893cc967e8e0e6ec3
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-turbo-latest
QWEN_MAX_MODEL=qwen-max-latest
```

**状态**: ✅ 已配置完成，可直接使用

---

## 📋 可用模型列表

| 模型名称 | 特点 | 适用场景 | 成本 |
|---------|------|---------|------|
| qwen-turbo | 快速响应 | 实时场景 | 0.008元/1K tokens |
| qwen-turbo-latest | 最新快速版 | 推荐使用 | 0.008元/1K tokens |
| qwen-turbo-2025-07-15 | 稳定版本 | 生产环境 | 0.008元/1K tokens |
| qwen-max | 能力最强 | 复杂分析 | 0.02元/1K tokens |
| qwen-max-latest | 最新强力版 | 推荐使用 | 0.02元/1K tokens |

---

## 🎯 任务模型选择建议

### 任务12 - AI评价系统

| 功能 | 推荐模型 | 原因 | tokens/次 |
|------|---------|------|-----------|
| 评价摘要 | qwen-turbo-latest | 速度快，够用 | 500 |
| 质量检测 | qwen-turbo-latest | 规则判断为主 | 300 |
| 智能回复 | qwen-max-latest | 需要高质量文案 | 400 |
| 趋势分析 | qwen-max-latest | 需要深度分析 | 700 |

**预估成本**: 50-80元/月

### 任务13 - AI收藏对比

| 功能 | 推荐模型 | 原因 | tokens/次 |
|------|---------|------|-----------|
| 智能推荐 | qwen-turbo-latest | 速度优先 | 300 |
| 对比分析 | qwen-max-latest | 需要深度对比 | 500 |
| 自动分类 | qwen-turbo-latest | 简单分类 | 200 |

**预估成本**: 30-50元/月

### 任务14 - AI数据看板

| 功能 | 推荐模型 | 原因 | tokens/次 |
|------|---------|------|-----------|
| 数据洞察 | qwen-max-latest | 需要深度分析 ⭐ | 700 |
| 智能定价 | qwen-max-latest | 涉及收益计算 ⭐ | 600 |
| 异常检测 | qwen-turbo-latest | 实时性要求高 | 400 |

**预估成本**: 80-120元/月

**注意**: 任务14建议优先使用qwen-max，质量更重要

---

## 💰 成本控制

### 免费额度
- 100万tokens/月
- 足够开发测试使用

### 总成本预估
```
任务12: 50-80元/月
任务13: 30-50元/月
任务14: 80-120元/月
总计: 160-250元/月（超出免费额度后）
```

### 节省成本的方法
1. **实现缓存**: 相同请求返回缓存结果
2. **限流**: 防止恶意调用
3. **降级**: AI服务不可用时返回简单统计
4. **按需使用**: 开发时用turbo，生产用max

---

## 🔧 API调用示例

### 基础调用（已封装）

```javascript
// backend/services/ai/aiService.js 已创建
const aiService = require('./services/ai/aiService');

// 简单调用
const result = await aiService.call('你的prompt');

// JSON格式调用
const jsonResult = await aiService.callJSON('你的prompt');

// 指定模型
const result = await aiService.call('prompt', {
  model: 'qwen-max-latest',
  temperature: 0.7,
  maxTokens: 1500
});
```

### 任务12示例

```javascript
// 评价摘要
const summary = await aiService.callJSON(`
分析以下评价并生成摘要：
${reviewTexts}

返回JSON格式：
{
  "summary": "整体评价",
  "pros": ["优点1", "优点2"],
  "cons": ["缺点1", "缺点2"]
}
`, {
  model: 'qwen-turbo-latest'
});
```

### 任务13示例

```javascript
// 智能推荐
const recommendations = await aiService.callJSON(`
根据用户偏好推荐酒店：
用户历史: ${userHistory}
当前搜索: ${searchContext}

返回JSON格式：
{
  "recommendations": [
    {"hotelId": 5, "score": 0.95, "reason": "推荐理由"}
  ]
}
`, {
  model: 'qwen-turbo-latest'
});
```

### 任务14示例

```javascript
// 数据洞察
const insights = await aiService.callJSON(`
分析以下数据并给出建议：
订单数据: ${orderData}
营收数据: ${revenueData}

返回JSON格式：
{
  "insights": [
    {"type": "opportunity", "title": "标题", "description": "描述"}
  ],
  "recommendations": ["建议1", "建议2"]
}
`, {
  model: 'qwen-max-latest'  // 使用max模型
});
```

---

## ⚠️ 常见问题

### Q1: API Key找不到？
**A**: 已配置在 `backend/.env`，确保文件存在且内容正确

### Q2: 调用失败401错误？
**A**: 检查API Key是否正确，是否有多余空格

### Q3: 超时错误？
**A**: 
1. 检查网络连接
2. 增加超时时间（默认10秒）
3. 减少prompt长度

### Q4: 返回结果不是JSON？
**A**: 
1. 在prompt中明确要求JSON格式
2. 使用 `aiService.callJSON()` 方法
3. 添加示例JSON格式

### Q5: 成本太高？
**A**:
1. 实现缓存机制
2. 使用turbo代替max（适当场景）
3. 减少不必要的调用
4. 实现限流

### Q6: 如何切换模型？
**A**: 
```javascript
// 方法1: 修改.env文件
QWEN_MODEL=qwen-max-latest

// 方法2: 代码中指定
await aiService.call(prompt, { model: 'qwen-max-latest' });
```

---

## 📚 相关文档

- [任务12详细文档](./Task12-AI-Review-System-Detail.md)
- [任务13详细文档](./Task13-AI-Favorite-Compare-Detail.md)
- [任务14详细文档](./Task14-AI-Data-Dashboard-Detail.md)
- [AI API选型指南](./AI-API-Selection-Guide.md)
- [项目状态总览](../PROJECT-STATUS.md)

---

## ✅ 开发前检查清单

开始开发前，确认：
- [ ] 已阅读本文档
- [ ] 确认API Key已配置（backend/.env）
- [ ] 了解任务应该用哪个模型
- [ ] 知道如何调用aiService
- [ ] 了解成本控制方法
- [ ] 准备好实现缓存和限流

---

**准备好了？开始开发吧！** 🚀

**提示**: 把这个文档链接发给3个Agent，让他们先读这个！
