# 🚀 Agent 快速启动提示句（简化版）

> 复制下面的提示句，发给开发任务12/13/14的Agent

---

## 📋 任务12启动提示句

```
开始开发任务12 - AI增强评价系统。

【必读】
1. documents/AI-API-Quick-Reference.md - API配置（必读）⭐
2. documents/Task12-AI-Review-System-Detail.md - 详细文档

【API配置】
✅ 已完成配置，位置：backend/.env
✅ API Key: sk-56137e94aa6743c893cc967e8e0e6ec3
✅ 推荐模型：qwen-turbo-latest（摘要、质量检测）
✅ 推荐模型：qwen-max-latest（智能回复、趋势分析）

【当前步骤】
按照Task12文档中的实现步骤开始开发。

【开始】
请确认你已读取API配置信息，然后开始开发。
```

---

## 📋 任务13启动提示句

```
开始开发任务13 - AI增强收藏对比。

【必读】
1. documents/AI-API-Quick-Reference.md - API配置（必读）⭐
2. documents/Task13-AI-Favorite-Compare-Detail.md - 详细文档

【API配置】
✅ 已完成配置，位置：backend/.env
✅ API Key: sk-56137e94aa6743c893cc967e8e0e6ec3
✅ 推荐模型：qwen-turbo-latest（智能推荐、自动分类）
✅ 推荐模型：qwen-max-latest（对比分析）

【当前步骤】
按照Task13文档中的实现步骤开始开发。

【开始】
请确认你已读取API配置信息，然后开始开发。
```

---

## 📋 任务14启动提示句

```
开始开发任务14 - AI增强数据看板。

【必读】
1. documents/AI-API-Quick-Reference.md - API配置（必读）⭐
2. documents/Task14-AI-Data-Dashboard-Detail.md - 详细文档

【API配置】
✅ 已完成配置，位置：backend/.env
✅ API Key: sk-56137e94aa6743c893cc967e8e0e6ec3
✅ 推荐模型：qwen-max-latest（数据洞察、智能定价）⭐ 优先
✅ 推荐模型：qwen-turbo-latest（异常检测）

【重要提示】
任务14建议优先使用qwen-max-latest，因为需要深度数据分析。

【当前步骤】
按照Task14文档中的实现步骤开始开发。

【开始】
请确认你已读取API配置信息，然后开始开发。
```

---

## ✅ 使用说明

### 1. 复制对应的提示句
根据要开发的任务（12/13/14），复制对应的提示句

### 2. 发送给Agent
在Kiro Chat中粘贴并发送

### 3. 确认Agent理解
Agent会确认已读取API配置，然后开始开发

### 4. 如果Agent还是找不到API Key
告诉Agent：
```
API配置在 backend/.env 文件中，内容如下：

QWEN_API_KEY=sk-56137e94aa6743c893cc967e8e0e6ec3
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-turbo-latest
QWEN_MAX_MODEL=qwen-max-latest

请直接使用这些配置。
```

---

## 🎯 关键信息速查

### API Key（所有任务通用）
```
sk-56137e94aa6743c893cc967e8e0e6ec3
```

### Base URL
```
https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 模型选择
- **快速场景**: qwen-turbo-latest
- **复杂分析**: qwen-max-latest
- **任务14优先**: qwen-max-latest

### 调用示例
```javascript
const aiService = require('./services/ai/aiService');

// 使用turbo
const result = await aiService.call(prompt, {
  model: 'qwen-turbo-latest'
});

// 使用max
const result = await aiService.call(prompt, {
  model: 'qwen-max-latest'
});
```

---

**准备好了？复制提示句，开始开发！** 🚀
