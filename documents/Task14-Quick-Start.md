# 任务14: AI增强数据看板 - 快速启动指南

## 🚀 5分钟快速启动

### 第1步：确认环境配置

```bash
# 检查API配置
cat backend/.env | grep QWEN

# 应该看到：
# QWEN_API_KEY=sk-56137e94aa6743c893cc967e8e0e6ec3
# QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# QWEN_MODEL=qwen-turbo-latest
# QWEN_MAX_MODEL=qwen-max-latest
```

### 第2步：安装依赖

```bash
# 后端依赖
cd backend
npm install node-cache

# 前端依赖
cd ..
npm install chart.js react-chartjs-2
```

### 第3步：创建数据库索引

```bash
cd backend
node sql/migrate-analytics-indexes.js

# 应该看到：
# ✅ 创建索引: idx_orders_merchant_time
# ✅ 创建索引: idx_orders_analytics
# ✅ 创建索引: idx_reviews_hotel_time
# ✅ Analytics索引创建完成
```

### 第4步：启动服务

```bash
# 启动后端（终端1）
cd backend
npm start

# 启动前端（终端2）
cd ..
npm run dev
```

### 第5步：访问数据看板

1. 打开浏览器访问：`http://localhost:5173`
2. 使用商户账号登录：
   - 用户名：`merchant1`
   - 密码：`123456`
3. 点击导航栏的"数据看板"菜单
4. 查看数据概览和图表
5. 点击"🤖 AI 智能分析"按钮
6. 等待3-5秒，查看AI分析结果

---

## 📊 功能演示

### 数据概览
- 总订单量：显示订单总数和环比增长
- 总营收：显示营收总额和环比增长
- 平均入住率：显示入住率百分比
- 平均评分：显示评分和评价等级

### 图表展示
- 订单趋势：折线图显示订单量变化
- 营收趋势：柱状图显示营收变化
- 热门房型：排行榜显示各房型订单量

### AI智能分析
- AI数据洞察：机会点和风险点分析
- AI定价建议：分房型定价建议
- AI异常预警：异常数据预警

---

## 🧪 测试API

### 使用curl测试

```bash
# 1. 登录获取token
TOKEN=$(curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"merchant1","password":"123456"}' \
  | jq -r '.token')

# 2. 获取数据概览
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/analytics/overview?period=30" | jq

# 3. 获取订单趋势
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/analytics/trend?period=30" | jq

# 4. 获取房型排行
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/analytics/room-ranking?period=30" | jq

# 5. 获取AI洞察
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/analytics/ai/insights?period=30" | jq

# 6. 获取AI定价
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/analytics/ai/pricing?period=30" | jq

# 7. 获取AI预警
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/analytics/ai/alerts?period=30" | jq
```

### 使用Postman测试

1. 创建新的Collection：`Analytics API`
2. 添加环境变量：
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: `<登录后获取的token>`
3. 创建请求：
   - GET `{{baseUrl}}/analytics/overview?period=30`
   - GET `{{baseUrl}}/analytics/trend?period=30`
   - GET `{{baseUrl}}/analytics/room-ranking?period=30`
   - GET `{{baseUrl}}/analytics/ai/insights?period=30`
   - GET `{{baseUrl}}/analytics/ai/pricing?period=30`
   - GET `{{baseUrl}}/analytics/ai/alerts?period=30`
4. 在Headers中添加：`Authorization: Bearer {{token}}`

---

## 🔍 验证功能

### 1. 验证数据概览
- [ ] 总订单量显示正确
- [ ] 总营收显示正确
- [ ] 平均入住率显示正确
- [ ] 平均评分显示正确
- [ ] 环比增长显示正确

### 2. 验证图表
- [ ] 订单趋势图正确渲染
- [ ] 营收趋势图正确渲染
- [ ] 热门房型排行正确显示

### 3. 验证AI功能
- [ ] AI洞察正确显示机会点
- [ ] AI洞察正确显示风险点
- [ ] AI定价建议合理
- [ ] AI异常预警准确

### 4. 验证时间段切换
- [ ] 切换到"近7天"数据更新
- [ ] 切换到"近30天"数据更新
- [ ] 切换到"近90天"数据更新

### 5. 验证缓存
- [ ] 第一次请求较慢（3-5秒）
- [ ] 第二次请求很快（<1秒）
- [ ] 缓存命中率>60%

---

## ⚠️ 常见问题

### Q1: AI分析按钮点击后没反应？
**A**: 检查以下几点：
1. 确认API Key配置正确
2. 检查网络连接
3. 查看浏览器控制台错误
4. 查看后端日志

### Q2: 显示"暂无数据"？
**A**: 确认以下几点：
1. 商户账号下有酒店
2. 酒店有订单数据
3. 订单在选定时间范围内

### Q3: AI分析很慢？
**A**: 正常情况：
1. 首次请求需要3-5秒（调用AI API）
2. 后续请求<1秒（使用缓存）
3. 如果持续慢，检查网络和API配额

### Q4: 图表不显示？
**A**: 检查以下几点：
1. Chart.js是否正确安装
2. 浏览器控制台是否有错误
3. 数据是否正确返回

### Q5: 索引创建失败？
**A**: 可能原因：
1. 数据库连接失败
2. 权限不足
3. 索引已存在（可忽略）

---

## 📈 性能监控

### 查看缓存命中率

```javascript
// 在backend/middleware/aiCache.js中添加
console.log('缓存统计:', {
  hits: cacheHits,
  misses: cacheMisses,
  hitRate: (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(2) + '%'
});
```

### 查看SQL执行计划

```sql
-- 验证索引使用
EXPLAIN SELECT * FROM orders 
WHERE hotel_id IN (1,2,3) 
AND create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 应该看到 key: idx_orders_merchant_time
```

### 查看API响应时间

```bash
# 使用curl测量
time curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/analytics/ai/insights?period=30"

# 首次：3-5秒
# 缓存后：<1秒
```

---

## 🎯 下一步

### 功能扩展
1. 添加数据导出功能
2. 添加自定义时间范围
3. 添加更多图表类型
4. 添加数据对比功能

### 性能优化
1. 实现Redis缓存
2. 添加CDN加速
3. 优化SQL查询
4. 添加数据预加载

### 用户体验
1. 添加数据刷新按钮
2. 添加加载进度条
3. 添加错误重试机制
4. 添加数据筛选功能

---

## 📚 相关文档

- [Task14详细文档](./Task14-AI-Data-Dashboard-Detail.md)
- [Task14实现总结](./Task14-Implementation-Summary.md)
- [AI API快速参考](./AI-API-Quick-Reference.md)

---

**准备好了？开始使用AI增强数据看板吧！** 🚀

**提示**: 如果遇到问题，请查看详细文档或联系开发团队。
