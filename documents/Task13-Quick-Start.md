# Task13: AI增强收藏对比系统 - 快速启动指南

## 📋 功能概述

Task13实现了智能化的酒店收藏和对比系统，包含三大AI亮点功能：

1. **AI智能推荐收藏** - 基于用户画像的个性化推荐
2. **AI智能对比分析** - 多酒店横向对比与决策建议
3. **AI自动分类收藏** - 智能分类管理收藏夹

---

## 🚀 快速启动

### 1. 数据库迁移

```bash
cd hotel-book-system-master/backend
node sql/migrate-favorite-compare.js
```

**创建的表：**
- `favorites` - 收藏表
- `browse_history` - 浏览历史表
- `ai_call_logs` - AI调用日志表

### 2. 启动后端

```bash
cd hotel-book-system-master/backend
npm start
```

### 3. 启动前端

```bash
cd hotel-book-system-master
npm run dev
```

### 4. 测试AI功能

```bash
cd hotel-book-system-master/backend
node test-favorite-api.js
```

---

## 🧪 功能测试

### 测试账号

| 用户名 | 密码 | 角色 | 用途 |
|--------|------|------|------|
| user1 | 123456 | 普通用户 | 测试收藏功能 |
| 陈凯文 | Kv20060426 | 商家 | 测试商家视角 |

### 测试流程

#### 1. 测试收藏功能

1. 登录用户账号
2. 浏览酒店列表
3. 点击"收藏"按钮
4. 查看AI自动分类结果
5. 进入"我的收藏"页面

**预期结果：**
- 收藏成功
- AI自动分类（商务出行/度假休闲/性价比之选/亲子家庭）
- 显示AI分类理由

#### 2. 测试AI推荐

1. 在收藏页面查看"AI为您推荐"模块
2. 查看推荐理由

**预期结果：**
- 显示3个推荐酒店
- 每个酒店有AI推荐理由
- 推荐基于用户浏览和收藏历史

#### 3. 测试智能对比

1. 在收藏页面选择2-3个酒店
2. 点击"对比选中的酒店"
3. 查看AI对比分析

**预期结果：**
- 显示AI分析卡片（总结、差异点、推荐）
- 对比表格自动高亮最优/最差项
- 价格最低标绿，最高标红
- 评分最高标绿，最低标红

#### 4. 测试分类筛选

1. 点击不同分类标签
2. 查看筛选结果

**预期结果：**
- 只显示对应分类的收藏
- 切换分类时清空选中状态

---

## 🔑 API接口

### 收藏管理

```javascript
// 添加收藏
POST /api/favorites/add
Body: { hotelId: 1 }

// 取消收藏
DELETE /api/favorites/:hotelId

// 获取收藏列表
GET /api/favorites/list?category=商务出行

// 检查是否已收藏
GET /api/favorites/check/:hotelId
```

### AI功能

```javascript
// AI智能推荐
GET /api/favorites/recommendations

// AI智能对比
POST /api/favorites/compare
Body: { hotelIds: [1, 2, 3] }
```

### 浏览历史

```javascript
// 记录浏览历史
POST /api/favorites/browse
Body: { hotelId: 1, duration: 30 }
```

---

## 🎨 前端页面

### 收藏列表页面

**路径**: `/favorites`

**功能：**
- 分类标签筛选
- 多选对比
- AI推荐模块
- 取消收藏

### 对比页面

**路径**: `/compare?hotels=1,2,3`

**功能：**
- AI分析卡片
- 对比表格
- 差异高亮
- 推荐标签

---

## 🤖 AI功能说明

### 1. AI智能推荐

**输入：**
- 用户浏览历史（最近10条）
- 用户收藏历史（全部）
- 用户订单历史（全部）
- 候选酒店列表（20个）

**输出：**
- 4个推荐酒店
- 每个酒店的推荐理由（20字以内）

**缓存策略：**
- 缓存时间：30分钟
- 缓存键：`recommend:{userId}`
- 清除时机：收藏变更时

### 2. AI智能对比

**输入：**
- 2-3个酒店的完整信息

**输出：**
- 简短总结（50字以内）
- 核心差异点列表
- 推荐建议（最推荐、性价比之选等）

**缓存策略：**
- 缓存时间：1小时
- 缓存键：`compare:{hotelIds}`（排序后）
- 不主动清除

### 3. AI自动分类

**输入：**
- 酒店完整信息

**输出：**
- 分类名称（商务出行/度假休闲/性价比之选/亲子家庭）
- 置信度（0-1）
- 分类理由

**调用时机：**
- 添加收藏时自动调用
- 不缓存（每次收藏都重新分类）

---

## 📊 监控与日志

### AI调用日志

查询AI调用统计：

```sql
-- 查看今日AI调用次数
SELECT service_type, COUNT(*) as count, 
       AVG(duration_ms) as avg_duration,
       SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as success_count
FROM ai_call_logs
WHERE DATE(created_at) = CURDATE()
GROUP BY service_type;

-- 查看失败的调用
SELECT * FROM ai_call_logs
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 10;
```

### 缓存统计

```javascript
// 在代码中获取缓存统计
const { getCacheStats } = require('./middleware/favoriteCache');
console.log(getCacheStats());
```

---

## 🐛 常见问题

### Q1: AI推荐返回空数组？

**原因：**
- 用户没有浏览/收藏/订单历史
- 候选酒店列表为空
- AI API调用失败

**解决：**
1. 先浏览几个酒店
2. 收藏1-2个酒店
3. 检查AI API配置

### Q2: 对比页面显示错误？

**原因：**
- URL参数格式错误
- 酒店ID不存在
- 少于2个酒店

**解决：**
1. 检查URL格式：`/compare?hotels=1,2,3`
2. 确保酒店ID有效
3. 至少选择2个酒店

### Q3: AI分类不准确？

**原因：**
- 酒店信息不完整
- AI模型理解偏差

**解决：**
1. 完善酒店信息（设施、描述）
2. 可以手动调整分类（未来功能）

### Q4: 缓存不生效？

**原因：**
- node-cache未安装
- 缓存被清除

**解决：**
```bash
npm install node-cache
```

---

## 💰 成本估算

### AI API调用量（每月）

| 功能 | 单次tokens | 预估调用 | 总tokens |
|------|-----------|---------|----------|
| 智能推荐 | 2000 | 500次 | 100万 |
| 对比分析 | 1500 | 200次 | 30万 |
| 自动分类 | 500 | 1000次 | 50万 |
| **总计** | - | - | **180万** |

### 成本计算

- 免费额度：100万 tokens/月
- 超出部分：80万 tokens
- 预估成本：**30-50元/月**

### 优化建议

1. **启用缓存** - 减少50%调用
2. **限制推荐频率** - 30分钟刷新一次
3. **对比结果缓存** - 1小时有效期

---

## 🔧 配置说明

### 环境变量

```env
# AI API配置（已配置）
QWEN_API_KEY=sk-56137e94aa6743c893cc967e8e0e6ec3
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-turbo-latest
QWEN_MAX_MODEL=qwen-max-latest
```

### 缓存配置

```javascript
// backend/middleware/favoriteCache.js
const favoriteCache = new NodeCache({ 
  stdTTL: 3600,        // 默认1小时
  checkperiod: 600     // 每10分钟检查过期
});
```

---

## 📚 相关文档

- [Task13详细文档](./Task13-AI-Favorite-Compare-Detail.md)
- [AI API快速参考](./AI-API-Quick-Reference.md)
- [项目状态总览](../PROJECT-STATUS.md)

---

## ✅ 验收标准

- [ ] 数据库迁移成功
- [ ] 收藏功能正常
- [ ] AI自动分类准确
- [ ] AI推荐显示正常
- [ ] AI对比分析合理
- [ ] 缓存机制生效
- [ ] 错误处理完善
- [ ] 响应式设计良好

---

**开发完成时间**: 2026-02-23  
**版本**: v1.0  
**状态**: ✅ 开发完成，可测试
