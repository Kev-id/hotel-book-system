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
```

此命令会：
- 创建 `hotel_booking` 数据库
- 创建 `users` 和 `hotels` 表
- 插入初始测试数据

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
