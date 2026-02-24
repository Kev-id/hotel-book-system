# 任务12 - AI增强评价系统 快速启动指南

## 🚀 快速开始

### 前置条件
- ✅ Node.js 已安装
- ✅ MySQL 数据库已配置
- ✅ 通义千问 API Key 已配置

### 1. 安装依赖

```bash
cd hotel-book-system-master/backend
npm install
```

### 2. 配置环境变量

确认 `backend/.env` 文件包含以下配置：

```env
# 通义千问 AI API 配置
QWEN_API_KEY=sk-56137e94aa6743c893cc967e8e0e6ec3
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-turbo-latest
QWEN_MAX_MODEL=qwen-max-latest
```

### 3. 执行数据库迁移

```bash
node backend/sql/migrate-ai-review.js
```

**预期输出**:
```
开始AI评价系统数据库迁移...
创建 review_ai_cache 表...
创建 review_quality_flags 表...
✅ AI评价系统数据库迁移完成
🎉 迁移成功完成！
```

### 4. 启动服务器

```bash
npm start
```

**预期输出**:
```
Server is running on port 5000
✅ 数据库已存在，跳过初始化
```

### 5. 测试API接口

```bash
node backend/test-ai-api.js
```

**预期输出**:
```
🧪 开始测试AI API接口...
✅ 评价摘要接口响应: {...}
✅ 质量检测接口响应: {...}
✅ 回复建议接口响应: {...}
✅ 趋势分析接口响应: {...}
🎉 测试完成！
```

---

## 📡 API接口使用

### 1. 获取评价摘要

**请求**:
```bash
GET http://localhost:5000/api/ai/review-summary/:hotelId
```

**参数**:
- `hotelId`: 酒店ID
- `force`: 是否强制刷新缓存（可选）

**示例**:
```bash
curl http://localhost:5000/api/ai/review-summary/1
```

**响应**:
```json
{
  "success": true,
  "data": {
    "summary": "整体评价良好...",
    "pros": ["位置好", "干净"],
    "cons": ["隔音差"],
    "sentiment": {
      "positive": 65,
      "neutral": 25,
      "negative": 10
    },
    "tags": [
      {"name": "位置好", "count": 18}
    ],
    "reviewsAnalyzed": 30,
    "cachedAt": "2026-02-23T10:30:00Z",
    "cached": false
  }
}
```

### 2. 评价质量检测

**请求**:
```bash
POST http://localhost:5000/api/ai/review-quality-check
```

**请求体**:
```json
{
  "reviewId": 123,
  "content": "评价内容",
  "overallRating": 5.0,
  "dimensions": {
    "cleanliness": 5.0,
    "service": 5.0,
    "facilities": 5.0,
    "location": 5.0,
    "valueForMoney": 5.0
  },
  "userId": 456
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "quality": "suspicious",
    "confidence": 0.85,
    "flags": [
      {
        "type": "all_perfect_scores",
        "severity": "warning",
        "message": "所有维度都是满分，可能存在刷单"
      }
    ],
    "recommendation": "建议人工审核",
    "reasons": ["理由1", "理由2"]
  }
}
```

### 3. 生成回复建议

**请求**:
```bash
POST http://localhost:5000/api/ai/reply-suggestions
```

**请求体**:
```json
{
  "reviewId": 123,
  "reviewContent": "房间隔音太差",
  "overallRating": 2.0,
  "hotelName": "XX酒店"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "style": "professional",
        "content": "尊敬的客人，非常抱歉...",
        "tone": "formal"
      },
      {
        "style": "friendly",
        "content": "非常抱歉影响了您的休息...",
        "tone": "casual"
      },
      {
        "style": "compensatory",
        "content": "非常抱歉给您带来困扰...",
        "tone": "apologetic"
      }
    ],
    "tips": ["建议在24小时内回复", "可以主动提供补偿方案"]
  }
}
```

### 4. 获取趋势分析

**请求**:
```bash
GET http://localhost:5000/api/ai/review-trend/:hotelId?days=30
```

**参数**:
- `hotelId`: 酒店ID
- `days`: 分析天数（默认30）

**示例**:
```bash
curl http://localhost:5000/api/ai/review-trend/1?days=30
```

**响应**:
```json
{
  "success": true,
  "data": {
    "trend": {
      "direction": "declining",
      "change": -0.3,
      "description": "近30天评分呈下降趋势"
    },
    "dimensionTrends": {
      "cleanliness": {"trend": "stable", "avgScore": 4.5}
    },
    "hotIssues": [
      {
        "issue": "隔音问题",
        "mentions": 12,
        "trend": "increasing",
        "severity": "high"
      }
    ],
    "insights": [
      {
        "type": "warning",
        "title": "隔音问题投诉增加",
        "description": "近两周有12位客人提到隔音问题",
        "recommendation": "建议检查房间隔音设施"
      }
    ],
    "chartData": {
      "ratingTrend": [...],
      "sentimentDistribution": [...]
    }
  }
}
```

---

## 🔧 常见问题

### Q1: API调用失败，返回401错误？
**A**: 检查 `.env` 文件中的 `QWEN_API_KEY` 是否正确配置。

### Q2: 数据库迁移失败？
**A**: 
1. 检查数据库连接配置
2. 确保MySQL服务正在运行
3. 检查数据库用户权限

### Q3: AI接口响应很慢？
**A**: 
1. 首次调用会比较慢（无缓存）
2. 后续调用会使用缓存，速度会快很多
3. 可以使用 `force=true` 参数强制刷新缓存

### Q4: 限流错误（429）？
**A**: 
- 游客：5次/分钟
- 普通用户：20次/分钟
- 商户：50次/分钟
- 等待1分钟后重试

### Q5: AI返回降级数据（isFallback: true）？
**A**: 
1. AI服务暂时不可用
2. 返回的是基础统计数据
3. 稍后刷新可获取完整AI分析

---

## 📊 监控指标

### 关键指标
- AI调用成功率：>95%
- 平均响应时间：<3秒
- 缓存命中率：>80%
- 降级触发次数：<5%

### 查看缓存统计
```sql
SELECT 
  cache_type,
  COUNT(*) as total,
  SUM(CASE WHEN expire_time > NOW() THEN 1 ELSE 0 END) as valid
FROM review_ai_cache
GROUP BY cache_type;
```

### 查看质量标记统计
```sql
SELECT 
  flag_type,
  status,
  COUNT(*) as count
FROM review_quality_flags
GROUP BY flag_type, status;
```

---

## 🎯 下一步

1. **前端集成**
   - 在酒店详情页添加AI摘要卡片
   - 在商户端添加回复建议功能
   - 在数据看板添加趋势分析

2. **测试**
   - 添加更多评价数据
   - 测试不同场景
   - 性能压测

3. **优化**
   - 调整Prompt提示词
   - 优化缓存策略
   - 监控成本

---

## 📚 相关文档

- [Task12详细文档](./Task12-AI-Review-System-Detail.md)
- [实施总结](./Task12-Implementation-Summary.md)
- [AI API快速参考](./AI-API-Quick-Reference.md)

---

**准备好了？开始使用AI增强评价系统吧！** 🚀
