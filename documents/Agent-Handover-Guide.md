# 🤝 Agent 协作指南 - 保证计划连续性

## 📋 问题：如何让新的Agent理解并继续执行计划？

当你开启新的Agent会话时，新Agent不知道之前的讨论和计划。我们需要一套标准化的流程来保证连续性。

---

## ✅ 解决方案：三层文档体系

```
第1层：总体规划文档（已创建）
├─ AI-Innovation-Plan-v4.md        # AI增强总体方案
├─ AI-API-Selection-Guide.md       # API选型指南
└─ Agent-Handover-Guide.md         # 本文档

第2层：任务详细文档（即将创建）
├─ Task12-Review-System-Detail.md  # 任务12详细方案
├─ Task13-Favorite-Compare-Detail.md # 任务13详细方案
└─ Task14-Data-Dashboard-Detail.md  # 任务14详细方案

第3层：开发检查清单（执行时创建）
├─ Task12-Checklist.md             # 任务12检查清单
├─ Task13-Checklist.md             # 任务13检查清单
└─ Task14-Checklist.md             # 任务14检查清单
```

---

## 🎯 标准化的Agent启动流程

### 方法1: 使用启动模板（推荐）⭐⭐⭐

**每次开启新Agent时，复制以下模板发送**：

```
我要继续开发酒店预订系统的AI增强功能。

【项目背景】
- 项目：酒店预订系统（携程训练营大作业）
- 目标：通过AI API提升用户、商户、管理员体验
- 当前阶段：准备开发任务12-14

【请先阅读以下文档】
1. documents/AI-Innovation-Plan-v4.md - AI增强总体方案
2. documents/AI-API-Selection-Guide.md - API选型指南
3. documents/项目完成度总结.md - 项目现状

【当前任务】
我要开发：任务12 - AI增强评价系统

【需要你做的】
1. 阅读上述文档，确认理解项目背景和AI方案
2. 查看 documents/实战练习项目/任务11-订单管理.md 了解文档格式
3. 为任务12创建详细开发文档，包括：
   - 数据库设计
   - API接口设计
   - AI集成方案
   - 前后端实现步骤
   - 测试方案

【确认】
请先告诉我你理解的项目目标和任务12的核心功能。
```

### 方法2: 使用项目README（推荐）⭐⭐

**我现在为你创建一个项目README，包含所有关键信息**

---

## 📝 创建项目协作README

我会创建一个 `PROJECT-STATUS.md` 文件，包含：
1. 项目当前状态
2. 已完成的工作
3. 待开发的任务
4. 关键文档索引
5. 开发规范

这样新Agent只需要读取这一个文件就能了解全局。

---

## 🔄 任务详细文档的标准格式

### 每个任务文档必须包含的章节

```markdown
# 任务X: 标题

## 📋 任务信息
- 优先级：高/中/低
- 预计时间：X天
- 前置任务：任务Y
- 依赖：数据库表、API接口

## 🎯 任务目标
### 基础功能
- [ ] 功能1
- [ ] 功能2

### AI创新功能
- [ ] AI功能1
- [ ] AI功能2

## 📊 数据库设计
### 新建表
```sql
CREATE TABLE ...
```

### 修改表
```sql
ALTER TABLE ...
```

## 🔌 API接口设计
### 接口列表
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/... | ... | ... |

### 接口详细设计
#### GET /api/...
**请求参数**:
```json
{...}
```

**返回数据**:
```json
{...}
```

## 🤖 AI集成方案
### AI功能1
**调用时机**: ...
**Prompt设计**: ...
**返回处理**: ...
**代码示例**: ...

## 💻 实现步骤
### 后端开发（Day 1-2）
#### Step 1: 创建数据库表
```bash
node backend/sql/migrate-task12.js
```

#### Step 2: 创建Controller
文件：`backend/controllers/xxxController.js`
```javascript
// 代码示例
```

#### Step 3: 创建AI Service
文件：`backend/services/ai/xxx.js`
```javascript
// 代码示例
```

### 前端开发（Day 3-4）
#### Step 1: 创建API接口
文件：`src/api/xxxApi.js`
```javascript
// 代码示例
```

#### Step 2: 创建页面组件
文件：`src/pages/.../index.jsx`
```javascript
// 代码示例
```

### AI功能集成（Day 5）
#### Step 1: 集成AI摘要
...

## ✅ 验收标准
### 功能验收
- [ ] 基础功能1可用
- [ ] AI功能1可用

### 性能验收
- [ ] API响应时间 < 2秒
- [ ] AI调用成功率 > 95%

### 代码质量
- [ ] 代码规范
- [ ] 注释完整
- [ ] 无明显bug

## 🐛 常见问题
### 问题1: ...
**解决方案**: ...

## 📸 UI效果图
（可选）

## 🔗 相关文档
- [AI增强总体方案](./AI-Innovation-Plan-v4.md)
- [API选型指南](./AI-API-Selection-Guide.md)
```

---

## 📋 开发检查清单格式

```markdown
# 任务12开发检查清单

## 进度追踪
- 开始时间：2026-02-21
- 预计完成：2026-02-24
- 当前状态：进行中

## Day 1: 数据库和后端API
- [ ] 创建数据库迁移脚本
- [ ] 运行迁移，验证表结构
- [ ] 创建 reviewController.js
- [ ] 实现基础CRUD接口
- [ ] 测试API接口

## Day 2: AI服务集成
- [ ] 创建 reviewAnalysis.js
- [ ] 实现AI评价摘要
- [ ] 实现AI质量检测
- [ ] 实现AI回复建议
- [ ] 测试AI功能

## Day 3-4: 前端开发
- [ ] 创建评价列表页
- [ ] 创建评价详情页
- [ ] 集成AI摘要显示
- [ ] 集成AI回复建议
- [ ] 样式优化

## Day 5: 测试和优化
- [ ] 功能测试
- [ ] 性能优化
- [ ] 代码review
- [ ] 文档更新

## 遇到的问题
### 问题1: AI API调用超时
- 时间：2026-02-21 14:30
- 解决方案：增加超时时间到10秒
- 状态：已解决

## 完成情况
- 完成度：60%
- 剩余工作：前端页面开发
```

---

## 🎯 实际使用流程

### 场景1: 开始新任务

**你的操作**：
1. 打开新的Kiro Chat窗口
2. 发送启动模板（见上面"方法1"）
3. Agent会读取文档并确认理解

**Agent的响应**：
```
我已阅读相关文档，理解如下：

【项目目标】
通过AI API增强酒店预订系统，提升三方体验，在大作业"项目创新性"维度拿满分。

【任务12核心功能】
1. 基础：5维度评分、评价管理
2. AI增强：
   - AI评价智能摘要（从100条评价提取关键信息）
   - AI评价质量检测（识别刷单）
   - AI智能回复建议（帮商户回复）
   - AI评价趋势分析

【技术方案】
- 使用通义千问 qwen-turbo
- 后端：Node.js + Express
- 前端：React

我现在开始创建任务12的详细开发文档...
```

### 场景2: 继续未完成的任务

**你的操作**：
```
我要继续开发任务12，目前进度：

【已完成】
- 数据库表已创建
- 基础CRUD API已完成

【当前问题】
AI评价摘要功能调用失败，报错：401 Unauthorized

【需要帮助】
1. 检查AI API配置是否正确
2. 帮我调试这个问题

【相关文件】
- backend/services/ai/reviewAnalysis.js
- backend/controllers/aiController.js
```

**Agent的响应**：
```
我来帮你排查问题。

【问题分析】
401错误通常是API Key配置问题。

【检查步骤】
1. 先查看 backend/.env 文件
2. 检查 DASHSCOPE_API_KEY 是否正确配置
3. 验证API Key是否有效

让我先读取相关文件...
```

---

## 📚 关键文档索引

### 必读文档（新Agent必须先读）
1. `documents/AI-Innovation-Plan-v4.md` - AI增强总体方案
2. `documents/AI-API-Selection-Guide.md` - API选型指南
3. `documents/项目完成度总结.md` - 项目现状
4. `.kiro/111.md` - 大作业要求

### 参考文档（需要时查阅）
1. `documents/实战练习项目/任务11-订单管理.md` - 文档格式参考
2. `documents/如何使用Agent辅助开发.md` - 开发指导
3. `README.md` - 项目说明

### 技术文档（开发时参考）
1. `backend/README.md` - 后端说明
2. `backend/sql/migrate.js` - 数据库迁移
3. 现有Controller文件 - 代码风格参考

---

## ✅ 检查清单：确保Agent理解正确

**在Agent开始工作前，让它回答这些问题**：

1. 项目的核心目标是什么？
2. 为什么要做AI增强？
3. 任务12的核心功能有哪些？
4. 使用什么AI API？为什么？
5. 开发的优先级是什么？

**如果Agent回答正确，说明理解到位，可以开始工作。**

---

## 🚀 下一步

我现在为你创建：
1. `PROJECT-STATUS.md` - 项目状态总览
2. `Task12-Review-System-Detail.md` - 任务12详细方案

这样你就有了完整的文档体系，任何新Agent都能快速上手。

---

**更新时间**: 2026-02-21
