# 酒店预订系统

一个功能完整的酒店预订管理系统，支持客户预订、商户管理和管理员审核。

## 功能特性

### 客户端功能
- 酒店浏览与搜索
- 酒店详情查看
- 在线预订
- 订单管理
- 收藏功能
- 评价系统

### 商户端功能
- 酒店信息管理
- 房型管理
- 订单管理（查看、确认、取消）
- 数据统计

### 管理员功能
- 商户审核
- 系统管理
- 数据监控

## 技术栈

### 前端
- React 18
- React Router
- Axios
- Vite

### 后端
- Node.js
- Express
- MySQL
- JWT认证

## 快速开始

### 环境要求
- Node.js >= 16
- MySQL >= 8.0

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd hotel-book-system-master
```

2. 安装依赖
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
```

3. 配置数据库
```bash
# 复制环境变量文件
cp backend/.env.example backend/.env

# 编辑 backend/.env 配置数据库连接信息
```

4. 初始化数据库
```bash
cd backend
node sql/init.js
node sql/migrate.js
node sql/import-data.js
```

5. 启动服务

```bash
# 启动后端服务（在backend目录）
npm start

# 启动前端服务（在项目根目录）
npm run dev
```

6. 访问系统
- 前端地址: http://localhost:5173
- 后端API: http://localhost:3000

## 项目结构

```
hotel-book-system-master/
├── src/                    # 前端源码
│   ├── api/               # API接口
│   ├── components/        # 公共组件
│   ├── context/           # React Context
│   ├── pages/             # 页面组件
│   │   ├── client/       # 客户端页面
│   │   └── admin/        # 管理端页面
│   └── styles/            # 样式文件
├── backend/               # 后端源码
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── routes/           # 路由
│   ├── sql/              # 数据库脚本
│   └── utils/            # 工具函数
├── documents/            # 项目文档
├── scripts/              # 数据处理脚本
└── data/                 # 数据文件
```

## 开发文档

详细的开发文档请查看 `documents/` 目录：
- 实战练习项目任务
- 开发者技能指南
- API参考文档

## 更新日志

### v2.2 - 订单系统完善
- 完善订单管理功能
- 优化商户订单界面
- 增强权限控制
- 修复已知问题

## 许可证

MIT License
