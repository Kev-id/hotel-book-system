# 快速启动指南 ⚡

5 分钟快速启动酒店预订系统！

## 前提条件

✅ Node.js >= 16.0.0  
✅ MySQL >= 5.7  
✅ 已安装 npm

## 快速启动（3 步）

### 1️⃣ 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend && npm install && cd ..
```

### 2️⃣ 配置数据库

```bash
# 复制环境变量
cp backend/.env.example backend/.env

# 编辑 backend/.env，修改数据库密码
# DB_PASSWORD=your_mysql_password
```

### 3️⃣ 初始化并启动

```bash
# 初始化数据库
cd backend && node sql/init.js

# 启动后端（终端1）
npm run dev

# 启动前端（终端2，新开一个终端）
cd .. && npm run dev
```

## 访问系统

🌐 前端：http://localhost:5173  
🔌 后端：http://localhost:5000

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin1 | 123456 | 管理员 |
| merchant1 | 123456 | 商户 |
| user1 | 123456 | 用户 |

## 常用命令

```bash
# 运行测试
cd backend && node tests/test-all-features.js

# 导入更多数据
cd backend && node sql/import-complete-data.js

# 生成价格数据
cd backend && node sql/generate-all-hotel-prices.js
```

## 遇到问题？

- 📖 详细安装指南：[SETUP.md](SETUP.md)
- 📚 完整文档：[documents/](documents/)
- 🔧 后端 API：[backend/README.md](backend/README.md)

## 项目结构

```
hotel-book-system/
├── src/              # 前端代码
├── backend/          # 后端代码
│   ├── sql/         # 数据库脚本
│   └── tests/       # 测试脚本
├── documents/        # 项目文档
└── data/            # 数据文件
```

## 下一步

✨ 浏览系统功能  
📖 阅读 [README.md](README.md) 了解详细功能  
🤖 配置 AI 功能（可选）：[SETUP.md](SETUP.md)  
💻 开始开发你的功能

---

**提示：** 如果是第一次使用，建议阅读完整的 [SETUP.md](SETUP.md) 文档。
