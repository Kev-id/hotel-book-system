# 酒店预订系统 - Node.js 后端

## 快速开始

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 配置数据库
编辑 `.env` 文件（已为你创建）：
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=hotel_booking
```

### 3. 初始化数据库
```bash
npm run init-db
# 或者
node sql/init.js
```

此命令会：
- 创建 `hotel_booking` 数据库
- 创建所有必需的表：
  - 核心表：users, hotels, room_types, price_calendar
  - 业务表：orders, reviews, favorites, browse_history
  - AI功能表：review_ai_cache, review_quality_flags, ai_call_logs
- 插入初始测试数据
- 设置所有索引和外键

**注意：** 所有迁移逻辑已整合到 `init.js`，无需单独运行迁移脚本。

### 4. 启动开发服务器
```bash
npm run dev
```

服务器将运行在 `http://localhost:5000`

## API 端点

### 用户相关
- **GET** `/api/users?username=xxx&password=xxx&role=admin` - 登录
- **POST** `/api/users` - 注册（body: username, password, confirmPwd, role）

### 酒店相关
- **GET** `/api/hotels` - 获取酒店列表（支持筛选：city, price_gte, price_lte, status）
- **GET** `/api/hotels/:id` - 获取酒店详情
- **POST** `/api/hotels` - 新增酒店
- **PATCH** `/api/hotels/:id` - 更新酒店（审核）
- **DELETE** `/api/hotels/:id` - 删除酒店

## 测试账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin1 | 123456 | 管理员 |
| merchant1 | 123456 | 商户 |
| 陈凯文 | Kv20060426 | 商户 |

## 前端配置

已自动配置 Vite 代理，所有 `/api` 请求都会转发到 `http://localhost:5000`

## 测试脚本

所有测试脚本已移至 `tests/` 目录，详见 [tests/README.md](tests/README.md)

常用测试命令：
```bash
node tests/test-all-features.js    # 测试所有功能
node tests/test-ai-api.js          # 测试 AI 功能
node tests/test-analytics-api.js   # 测试数据分析
node tests/test-favorite-api.js    # 测试收藏功能
```

## 数据管理

### 导入完整数据
```bash
node sql/import-complete-data.js
```

### 数据生成工具
```bash
node sql/generate-all-hotel-prices.js  # 生成所有酒店价格
node sql/generate-missing-reviews.js   # 生成缺失的评价
```

### 数据清理工具
详见 `sql/database-cleanup-preparation/` 目录

