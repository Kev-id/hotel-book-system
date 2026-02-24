# 酒店预订系统

一个功能完整的酒店预订平台，包含用户端、商户端和管理员端，集成 AI 智能推荐和数据分析功能。

## 技术栈

### 前端
- Vue 3 + Vite
- Element Plus UI 组件库
- Vue Router 路由管理
- Axios HTTP 客户端

### 后端
- Node.js + Express
- MySQL 数据库
- JWT 身份认证
- 通义千问 AI API

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd hotel-book-system
```

### 2. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

### 3. 配置环境变量

复制环境变量模板并配置：

```bash
# 复制后端环境变量
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 文件：

```env
# 服务器配置
PORT=5000

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_booking

# AI API 配置（可选，用于 AI 功能）
DASHSCOPE_API_KEY=your_api_key
```

### 4. 初始化数据库

```bash
cd backend
node sql/init.js
```

这会自动创建：
- 数据库和所有表结构
- 测试用户账号
- 4 家示例酒店
- 价格和房型数据

### 5. 启动项目

**开发模式：**

```bash
# 终端 1 - 启动后端服务
cd backend
npm run dev

# 终端 2 - 启动前端服务
npm run dev
```

**生产模式：**

```bash
# 构建前端
npm run build

# 启动后端（会自动服务前端静态文件）
cd backend
npm start
```

### 6. 访问系统

- 前端开发服务器：http://localhost:5173
- 后端 API 服务器：http://localhost:5000

## 测试账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin1 | 123456 | 管理员 | 审核酒店、管理用户 |
| merchant1 | 123456 | 商户 | 发布和管理酒店 |
| 陈凯文 | Kv20060426 | 商户 | 发布和管理酒店 |
| user1 | 123456 | 用户 | 浏览和预订酒店 |

## 主要功能

### 用户端
- 🔍 酒店搜索和筛选（城市、价格、评分）
- 📅 房型选择和价格日历
- ⭐ 收藏酒店（AI 智能推荐理由）
- 📝 预订下单和订单管理
- 💬 评价系统（5 维度评分）
- 🤖 AI 智能回复评价

### 商户端
- 🏨 发布和管理酒店信息
- 💰 房型和价格管理
- 📊 数据分析看板
- 📈 订单和收入统计
- 💬 回复用户评价

### 管理员端
- ✅ 审核酒店发布
- 👥 用户管理
- 🔍 评价质量监控
- 📊 平台数据统计

## 项目结构

```
hotel-book-system/
├── src/                    # 前端源码
│   ├── components/         # Vue 组件
│   ├── views/             # 页面视图
│   ├── router/            # 路由配置
│   └── utils/             # 工具函数
├── backend/               # 后端源码
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── routes/           # 路由
│   ├── services/         # 业务逻辑
│   ├── sql/              # 数据库脚本
│   └── tests/            # 测试脚本
├── documents/            # 项目文档
├── data/                 # 数据文件
└── public/               # 静态资源
```

## 开发指南

### 运行测试

```bash
cd backend

# 测试所有功能
node tests/test-all-features.js

# 测试 AI 功能
node tests/test-ai-api.js

# 测试数据分析
node tests/test-analytics-api.js
```

### 数据管理

```bash
cd backend

# 导入完整测试数据
node sql/import-complete-data.js

# 生成价格数据
node sql/generate-all-hotel-prices.js

# 生成评价数据
node sql/generate-missing-reviews.js
```

### API 文档

详见 [backend/README.md](backend/README.md)

## 文档

- [项目交接指南](documents/HANDOVER-GUIDE.md)
- [AI 功能说明](documents/AI-FEATURES-README.md)
- [后端 API 文档](backend/README.md)
- [测试脚本说明](backend/tests/README.md)

## 常见问题

### 数据库连接失败

检查 `backend/.env` 中的数据库配置是否正确，确保 MySQL 服务已启动。

### AI 功能不可用

AI 功能需要配置通义千问 API Key。如果没有配置，系统会使用模拟数据，不影响其他功能使用。

### 端口被占用

修改 `backend/.env` 中的 `PORT` 配置，或修改 `vite.config.js` 中的前端端口。

## 许可证

MIT License

## 联系方式

如有问题，请查看 [documents](documents/) 目录下的详细文档。
