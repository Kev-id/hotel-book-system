# 🤖 如何使用Agent辅助开发

## 📋 当前进度

✅ **已完成：**
- 数据处理（Kaggle真实数据）
- 数据库迁移（orders、reviews表）
- 数据导入（80酒店、400订单、300评价）
- 任务卡片文档（任务0-19）

🎯 **待开发：**
- 任务11: 订单管理系统
- 任务12: 用户评价系统
- 任务13: 收藏对比功能
- 任务14: 数据分析看板

---

## 🚀 使用Agent辅助开发的方法

### 方法1: 在新窗口中逐任务开发（推荐）

**步骤：**

1. **打开新的Kiro Chat窗口**

2. **告诉Agent你要做什么任务**
   ```
   我要开发任务11：订单管理系统
   
   请帮我：
   1. 查看任务卡片：documents/实战练习项目/任务11-订单管理.md
   2. 查看真实数据结构：data/processed/orders.json
   3. 指导我一步步实现
   ```

3. **Agent会帮你：**
   - 读取任务卡片了解需求
   - 查看真实数据结构
   - 分步骤指导实现
   - 解答遇到的问题
   - 检查代码质量

4. **开发流程示例：**
   ```
   你: 开始任务11的后端API开发
   
   Agent: 
   - 读取任务卡片
   - 创建 backend/controllers/orderController.js
   - 实现 createOrder、getOrders等方法
   - 添加路由配置
   
   你: 遇到问题：订单状态机怎么实现？
   
   Agent:
   - 解释状态机概念
   - 提供代码示例
   - 帮助调试
   ```

---

### 方法2: 使用任务卡片作为参考

**每个任务卡片包含：**

📝 **任务目标** - 明确要实现什么
🎓 **需要的知识点** - 技术要求
💡 **实现步骤** - 详细步骤
✅ **验收标准** - 如何检查完成度
🎨 **UI设计建议** - 界面设计
🐛 **常见问题** - 问题解决方案

**使用方式：**

1. 打开任务卡片文档
2. 按照步骤自己实现
3. 遇到问题时询问Agent
4. 完成后对照验收标准检查

---

### 方法3: 让Agent全程辅助

**适合场景：** 对某个技术不熟悉，需要详细指导

**示例对话：**

```
你: 我要实现任务11的订单异常预警功能，但不知道怎么开始

Agent会：
1. 解释业务逻辑（检测酒店差评率）
2. 提供数据库查询代码
3. 展示如何在API中集成
4. 帮助测试功能
```

---

## 📚 任务卡片位置

所有任务卡片在：`documents/实战练习项目/`

```
任务0-数据处理.md          ✅ 已完成
任务索引-v3.0.md           📋 任务总览
任务卡片概览-v3.0.md       📊 进度追踪

待开发任务：
任务11-订单管理.md         🎯 高优先级
任务12-评价系统.md         🎯 高优先级  
任务13-收藏对比.md         ⭐ 中优先级
任务14-数据看板.md         ⭐ 中优先级
```

---

## 💡 开发建议

### 推荐开发顺序

1. **任务11: 订单管理系统**（3天）
   - 最核心的业务功能
   - 包含3个差异化亮点
   - 先做后端API，再做前端页面

2. **任务12: 用户评价系统**（3天）
   - 第二核心功能
   - 5维度评分展示
   - 评价趋势分析

3. **任务13: 收藏对比功能**（2天）
   - 增值功能
   - 智能对比算法

4. **任务14: 数据分析看板**（3天）
   - 数据可视化
   - 智能建议引擎

### 每个任务的开发流程

```
1. 阅读任务卡片（10分钟）
   ↓
2. 查看真实数据结构（5分钟）
   ↓
3. 后端API开发（1-2小时）
   - 创建controller
   - 添加路由
   - 测试API
   ↓
4. 前端页面开发（2-3小时）
   - 创建组件
   - 调用API
   - 样式优化
   ↓
5. 差异化亮点实现（1-2小时）
   - 订单预警
   - 智能提醒
   - 数据分析
   ↓
6. 测试和优化（30分钟）
   - 功能测试
   - 代码优化
   - 文档更新
```

---

## 🎯 与Agent对话的技巧

### ✅ 好的提问方式

```
❌ 不好: "帮我写订单管理"
✅ 好的: "我要实现任务11的createOrder API，请帮我：
         1. 查看orders表结构
         2. 实现订单创建逻辑
         3. 添加订单异常预警功能"

❌ 不好: "这个报错了"
✅ 好的: "运行createOrder API时报错：
         Error: Unknown column 'risk_flags'
         我的代码在 backend/controllers/orderController.js 第45行
         请帮我排查"

❌ 不好: "前端怎么做"
✅ 好的: "我要创建订单列表页面，需要：
         1. 显示用户的所有订单
         2. 按状态筛选
         3. 显示取消倒计时
         请指导我实现"
```

### 📝 开发过程中的常见问题

**问题1: 不知道从哪开始**
```
告诉Agent: "我要开始任务11，请帮我制定开发计划"
```

**问题2: 代码报错**
```
告诉Agent: "我的代码报错了：[错误信息]
           文件：[文件路径]
           代码：[相关代码]
           请帮我排查"
```

**问题3: 不理解业务逻辑**
```
告诉Agent: "任务11中的'订单异常预警'是什么意思？
           应该如何实现？"
```

**问题4: 需要代码示例**
```
告诉Agent: "请给我一个订单状态机的实现示例"
```

---

## 🔧 开发环境准备

### 启动项目

**后端：**
```bash
cd hotel-book-system-master/backend
npm start
# 运行在 http://localhost:3000
```

**前端：**
```bash
cd hotel-book-system-master
npm run dev
# 运行在 http://localhost:5173
```

### 数据库连接

配置文件：`backend/.env`
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Wang2006
DB_NAME=hotel_booking
```

### 查看数据

```bash
# 查看酒店数据
node -e "const db=require('./backend/config/database'); db.query('SELECT * FROM hotels LIMIT 5').then(([rows])=>{console.log(rows); process.exit();})"

# 查看订单数据
node -e "const db=require('./backend/config/database'); db.query('SELECT * FROM orders LIMIT 5').then(([rows])=>{console.log(rows); process.exit();})"

# 查看评价数据
node -e "const db=require('./backend/config/database'); db.query('SELECT * FROM reviews LIMIT 5').then(([rows])=>{console.log(rows); process.exit();})"
```

---

## 📊 数据结构参考

### orders表（订单）
```javascript
{
  id: 'ORD202601123456',
  userId: 10,
  hotelId: 5,
  roomType: '豪华间',
  status: 'confirmed',  // pending, confirmed, checked_in, checked_out, completed, cancelled
  checkInDate: '2026-03-15',
  checkOutDate: '2026-03-17',
  nights: 2,
  adults: 2,
  children: 0,
  totalPrice: 1600,
  cancelDeadline: '2026-03-13T14:00:00',
  cancelPolicy: { free_before_hours: 48, penalty_rate: 0 },
  logs: [{ time, action, operator }],
  riskFlags: ['high_complaint_hotel']
}
```

### reviews表（评价）
```javascript
{
  id: 1,
  userId: 15,
  hotelId: 3,
  orderId: 'ORD202601123456',
  overallRating: 4.5,
  dimensions: {
    cleanliness: 4.8,
    service: 4.5,
    soundproof: 3.8,
    location: 4.7,
    facilities: 4.3
  },
  content: '酒店位置很好...',
  tags: ['干净', '位置方便', '服务好'],
  sentiment: 'positive',
  helpful: 12,
  merchantReply: { content, time }
}
```

---

## 🎉 开始开发

**准备好了吗？**

1. 打开新的Kiro Chat窗口
2. 说："我要开始开发任务11：订单管理系统"
3. Agent会指导你完成整个开发过程

**祝你开发顺利！** 🚀

---

**提示：** 
- 遇到任何问题都可以问Agent
- 不要害怕犯错，Agent会帮你纠正
- 每完成一个功能就测试一下
- 保持代码整洁和注释完整
