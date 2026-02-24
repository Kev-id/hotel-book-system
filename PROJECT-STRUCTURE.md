# 项目结构说明

本文档详细说明酒店预订系统的目录结构和文件组织。

## 📁 根目录结构

```
hotel-book-system/
├── src/                    # 前端源码
├── backend/                # 后端源码
├── documents/              # 项目文档
├── data/                   # 数据文件
├── public/                 # 静态资源
├── scripts/                # 脚本工具
├── .vscode/                # VS Code 配置
├── node_modules/           # 前端依赖（自动生成）
├── dist/                   # 前端构建产物（自动生成）
├── .env.example            # 环境变量模板
├── .gitignore              # Git 忽略配置
├── package.json            # 前端依赖配置
├── vite.config.js          # Vite 配置
├── eslint.config.js        # ESLint 配置
├── index.html              # 前端入口 HTML
├── README.md               # 项目说明
├── QUICK-START.md          # 快速启动指南
├── SETUP.md                # 详细安装指南
└── PROJECT-STRUCTURE.md    # 本文档
```

## 🎨 前端结构 (src/)

```
src/
├── components/             # Vue 组件
│   ├── AdminPanel.vue     # 管理员面板
│   ├── HotelCard.vue      # 酒店卡片
│   ├── HotelDetail.vue    # 酒店详情
│   ├── HotelList.vue      # 酒店列表
│   ├── LoginForm.vue      # 登录表单
│   ├── MerchantPanel.vue  # 商户面板
│   ├── OrderList.vue      # 订单列表
│   ├── ReviewList.vue     # 评价列表
│   └── ...                # 其他组件
├── views/                 # 页面视图
│   ├── Home.vue          # 首页
│   ├── Login.vue         # 登录页
│   ├── Admin.vue         # 管理员页
│   ├── Merchant.vue      # 商户页
│   └── ...               # 其他页面
├── router/               # 路由配置
│   └── index.js         # 路由定义
├── utils/               # 工具函数
│   ├── request.js      # HTTP 请求封装
│   └── ...             # 其他工具
├── assets/             # 静态资源
│   ├── images/        # 图片
│   └── styles/        # 样式
├── App.vue            # 根组件
└── main.js            # 入口文件
```

## 🔧 后端结构 (backend/)

```
backend/
├── config/                 # 配置文件
│   ├── ai.js              # AI 配置
│   ├── config.js          # 通用配置
│   └── database.js        # 数据库配置
├── controllers/           # 控制器（业务逻辑）
│   ├── aiReviewController.js      # AI 评价控制器
│   ├── analyticsController.js     # 数据分析控制器
│   ├── favoriteController.js      # 收藏控制器
│   ├── hotelController.js         # 酒店控制器
│   ├── orderController.js         # 订单控制器
│   ├── reviewController.js        # 评价控制器
│   └── userController.js          # 用户控制器
├── middleware/            # 中间件
│   ├── aiCache.js        # AI 缓存中间件
│   ├── aiRateLimit.js    # AI 限流中间件
│   ├── auth.js           # 认证中间件
│   ├── favoriteCache.js  # 收藏缓存中间件
│   └── upload.js         # 文件上传中间件
├── routes/               # 路由定义
│   ├── aiReview.js      # AI 评价路由
│   ├── analytics.js     # 数据分析路由
│   ├── favorite.js      # 收藏路由
│   ├── hotel.js         # 酒店路由
│   ├── order.js         # 订单路由
│   ├── review.js        # 评价路由
│   └── user.js          # 用户路由
├── services/             # 业务服务
│   └── ai/              # AI 服务
│       ├── aiService.js         # AI 服务基础
│       ├── dataInsights.js      # 数据洞察
│       ├── pricingInsights.js   # 价格洞察
│       ├── qualityCheck.js      # 质量检测
│       ├── recommendation.js    # 推荐服务
│       ├── replyGenerator.js    # 回复生成
│       ├── reviewSummary.js     # 评价摘要
│       └── trendAnalysis.js     # 趋势分析
├── sql/                  # 数据库脚本
│   ├── init.js          # 初始化脚本（包含所有迁移）
│   ├── import-complete-data.js  # 导入完整数据
│   ├── import-data.js           # 导入基础数据
│   ├── generate-all-hotel-prices.js  # 生成价格
│   ├── generate-missing-reviews.js   # 生成评价
│   └── database-cleanup-preparation/ # 数据清理工具
├── tests/                # 测试脚本
│   ├── test-all-features.js     # 综合测试
│   ├── test-ai-api.js           # AI 功能测试
│   ├── test-analytics-api.js    # 数据分析测试
│   ├── test-favorite-api.js     # 收藏功能测试
│   ├── diagnose-favorite.js     # 收藏诊断
│   ├── check-hotel-prices.js    # 价格检查
│   └── README.md                # 测试说明
├── uploads/              # 上传文件
│   └── hotels/          # 酒店图片
├── utils/               # 工具函数
│   └── dateUtils.js    # 日期工具
├── .env                 # 环境变量（不提交到 Git）
├── .env.example         # 环境变量模板
├── package.json         # 后端依赖配置
├── server.js            # 服务器入口
└── README.md            # 后端说明
```

## 📚 文档结构 (documents/)

```
documents/
├── AI数据生成模板/          # 数据生成模板
│   ├── 01-酒店列表生成提示词.md
│   ├── 02-评价数据生成提示词.md
│   ├── 03-数据格式说明.md
│   ├── README.md
│   └── 示例输出/
├── archive/                # 归档文档
│   ├── Task12-*.md        # Task12 相关
│   ├── Task13-*.md        # Task13 相关
│   ├── Task14-*.md        # Task14 相关
│   └── ...                # 其他历史文档
├── AI-FEATURES-README.md   # AI 功能说明
├── AI智能回复功能-最终版.md
├── HANDOVER-GUIDE.md       # 交接指南
├── DEPLOYMENT.md           # 部署指南
├── CHANGELOG.md            # 更新日志
└── README.md               # 文档索引
```

## 📊 数据结构 (data/)

```
data/
└── processed/              # 处理后的数据
    ├── hotels.json        # 酒店数据
    ├── users.json         # 用户数据
    ├── orders.json        # 订单数据
    ├── reviews.json       # 评价数据
    ├── favorites.json     # 收藏数据
    └── price_history.json # 价格历史
```

## 🗄️ 数据库结构

### 核心表
- `users` - 用户表
- `hotels` - 酒店表
- `room_types` - 房型表
- `price_calendar` - 价格日历表

### 业务表
- `orders` - 订单表
- `reviews` - 评价表
- `favorites` - 收藏表
- `browse_history` - 浏览历史表

### AI 功能表
- `review_ai_cache` - AI 缓存表
- `review_quality_flags` - 质量标记表
- `ai_call_logs` - AI 调用日志表

详细的数据库设计请参考 `backend/sql/init.js`

## 🔑 关键文件说明

### 配置文件
- `.env` - 环境变量（数据库、API Key 等）
- `vite.config.js` - 前端构建配置（包含代理设置）
- `backend/config/database.js` - 数据库连接配置
- `backend/config/ai.js` - AI API 配置

### 入口文件
- `index.html` - 前端 HTML 入口
- `src/main.js` - 前端 JS 入口
- `backend/server.js` - 后端服务器入口

### 路由文件
- `src/router/index.js` - 前端路由
- `backend/routes/*.js` - 后端 API 路由

## 📦 依赖管理

### 前端依赖 (package.json)
- Vue 3 - 前端框架
- Element Plus - UI 组件库
- Vue Router - 路由管理
- Axios - HTTP 客户端
- Vite - 构建工具

### 后端依赖 (backend/package.json)
- Express - Web 框架
- MySQL2 - 数据库驱动
- JWT - 身份认证
- Multer - 文件上传
- Axios - HTTP 客户端（调用 AI API）

## 🚀 构建产物

### 开发模式
- 前端：Vite 开发服务器（http://localhost:5173）
- 后端：Nodemon 热重载（http://localhost:5000）

### 生产模式
- `dist/` - 前端构建产物
- 后端直接运行 `server.js`

## 📝 命名规范

### 文件命名
- 组件：PascalCase（如 `HotelCard.vue`）
- 工具：camelCase（如 `dateUtils.js`）
- 配置：kebab-case（如 `vite.config.js`）
- 文档：UPPER-CASE 或 kebab-case

### 代码命名
- 变量/函数：camelCase
- 类/组件：PascalCase
- 常量：UPPER_SNAKE_CASE
- 数据库表：snake_case

## 🔍 查找文件技巧

### 按功能查找
- 用户相关：`*user*` 或 `*User*`
- 酒店相关：`*hotel*` 或 `*Hotel*`
- AI 相关：`*ai*` 或 `*AI*`
- 评价相关：`*review*` 或 `*Review*`

### 按类型查找
- 组件：`src/components/*.vue`
- 控制器：`backend/controllers/*Controller.js`
- 路由：`backend/routes/*.js`
- 测试：`backend/tests/test-*.js`

## 💡 最佳实践

### 添加新功能
1. 后端：创建 controller → 创建 route → 测试
2. 前端：创建 component → 添加到 view → 配置 router
3. 文档：更新对应的 README

### 修改现有功能
1. 找到对应的 controller/component
2. 修改代码
3. 运行测试验证
4. 更新文档

### 调试问题
1. 检查浏览器控制台（前端）
2. 检查后端终端日志（后端）
3. 运行测试脚本诊断
4. 查看 documents/archive/ 中的历史问题

## 🔗 相关文档

- [README.md](README.md) - 项目说明
- [QUICK-START.md](QUICK-START.md) - 快速启动
- [SETUP.md](SETUP.md) - 详细安装
- [documents/README.md](documents/README.md) - 文档索引
- [backend/README.md](backend/README.md) - 后端 API

---

**提示：** 使用 VS Code 的文件搜索功能（Ctrl+P）可以快速定位文件。
