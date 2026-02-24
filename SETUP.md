# 项目初始化完整指南

本指南将带你从零开始搭建整个酒店预订系统。

## 前置准备

### 1. 安装必需软件

#### Node.js
- 版本要求：>= 16.0.0
- 下载地址：https://nodejs.org/
- 验证安装：
  ```bash
  node --version
  npm --version
  ```

#### MySQL
- 版本要求：>= 5.7
- 下载地址：https://dev.mysql.com/downloads/mysql/
- 验证安装：
  ```bash
  mysql --version
  ```

#### Git（可选）
- 用于版本控制
- 下载地址：https://git-scm.com/

### 2. 获取项目代码

```bash
# 如果使用 Git
git clone <repository-url>
cd hotel-book-system

# 或者直接解压项目压缩包
```

## 详细安装步骤

### 步骤 1：安装项目依赖

#### 1.1 安装前端依赖

```bash
# 在项目根目录执行
npm install
```

这会安装：
- Vue 3
- Element Plus
- Vue Router
- Axios
- 其他前端依赖

#### 1.2 安装后端依赖

```bash
# 进入后端目录
cd backend
npm install
cd ..
```

这会安装：
- Express
- MySQL2
- JWT
- Multer
- 其他后端依赖

### 步骤 2：配置数据库

#### 2.1 启动 MySQL 服务

**Windows:**
```bash
# 通过服务管理器启动 MySQL 服务
# 或使用命令行
net start MySQL80
```

**macOS/Linux:**
```bash
sudo systemctl start mysql
# 或
sudo service mysql start
```

#### 2.2 创建数据库用户（可选）

如果你想使用专门的数据库用户而不是 root：

```bash
# 登录 MySQL
mysql -u root -p

# 创建用户
CREATE USER 'hotel_admin'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON hotel_booking.* TO 'hotel_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 步骤 3：配置环境变量

#### 3.1 复制环境变量模板

```bash
# 复制后端环境变量文件
cp backend/.env.example backend/.env
```

#### 3.2 编辑配置文件

打开 `backend/.env` 文件，修改以下配置：

```env
# 服务器端口（默认 5000）
PORT=5000

# 数据库配置
DB_HOST=localhost
DB_USER=root                    # 修改为你的 MySQL 用户名
DB_PASSWORD=your_password       # 修改为你的 MySQL 密码
DB_NAME=hotel_booking

# AI API 配置（可选）
# 如果需要使用 AI 功能，请配置通义千问 API Key
# 获取地址：https://dashscope.aliyun.com/
DASHSCOPE_API_KEY=your_api_key_here
```

**重要提示：**
- `DB_PASSWORD` 必须设置为你的 MySQL 密码
- `DASHSCOPE_API_KEY` 是可选的，不配置也能运行（会使用模拟数据）

### 步骤 4：初始化数据库

```bash
cd backend
node sql/init.js
```

**这个脚本会自动完成：**

✅ 创建数据库 `hotel_booking`
✅ 创建 11 个数据表：
  - users（用户表）
  - hotels（酒店表）
  - room_types（房型表）
  - price_calendar（价格日历表）
  - orders（订单表）
  - reviews（评价表）
  - favorites（收藏表）
  - browse_history（浏览历史表）
  - review_ai_cache（AI 缓存表）
  - review_quality_flags（质量标记表）
  - ai_call_logs（AI 调用日志表）

✅ 插入测试数据：
  - 5 个测试用户（admin, merchant, user）
  - 4 家示例酒店
  - 8 种房型（每家酒店 2 种）
  - 价格日历数据

**预期输出：**
```
✓ 数据库 hotel_booking 创建成功
✓ users 表创建成功
✓ hotels 表创建成功
...
✅ 数据库初始化完成！
```

**如果遇到错误：**
- 检查 MySQL 服务是否启动
- 检查 `.env` 文件中的数据库配置
- 确认 MySQL 用户有创建数据库的权限

### 步骤 5：启动项目

#### 5.1 开发模式（推荐用于开发）

**打开两个终端窗口：**

**终端 1 - 启动后端：**
```bash
cd backend
npm run dev
```

看到以下输出表示成功：
```
✅ 数据库连接成功
🚀 服务器运行在 http://localhost:5000
```

**终端 2 - 启动前端：**
```bash
# 在项目根目录
npm run dev
```

看到以下输出表示成功：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 5.2 生产模式

```bash
# 1. 构建前端
npm run build

# 2. 启动后端（会自动服务前端静态文件）
cd backend
npm start
```

访问：http://localhost:5000

### 步骤 6：验证安装

#### 6.1 访问系统

打开浏览器访问：
- 开发模式：http://localhost:5173
- 生产模式：http://localhost:5000

#### 6.2 测试登录

使用测试账号登录：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin1 | 123456 | 管理员 |
| merchant1 | 123456 | 商户 |
| user1 | 123456 | 用户 |

#### 6.3 运行测试脚本（可选）

```bash
cd backend

# 测试所有功能
node tests/test-all-features.js

# 测试 AI 功能
node tests/test-ai-api.js
```

## 可选配置

### 导入完整测试数据

如果需要更多测试数据：

```bash
cd backend
node sql/import-complete-data.js
```

这会导入：
- 更多用户数据
- 更多酒店数据
- 订单数据
- 评价数据

### 配置 AI 功能

#### 1. 获取通义千问 API Key

1. 访问：https://dashscope.aliyun.com/
2. 注册/登录阿里云账号
3. 开通 DashScope 服务
4. 创建 API Key

#### 2. 配置 API Key

编辑 `backend/.env`：
```env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
```

#### 3. 测试 AI 功能

```bash
cd backend
node tests/test-ai-api.js
```

## 故障排除

### 问题 1：数据库连接失败

**错误信息：**
```
❌ 初始化失败: Access denied for user 'root'@'localhost'
```

**解决方案：**
1. 检查 `backend/.env` 中的 `DB_PASSWORD` 是否正确
2. 确认 MySQL 服务已启动
3. 尝试用命令行登录测试：`mysql -u root -p`

### 问题 2：端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**解决方案：**
1. 修改 `backend/.env` 中的 `PORT` 为其他端口（如 5001）
2. 或关闭占用端口的程序

### 问题 3：npm install 失败

**解决方案：**
1. 清除 npm 缓存：`npm cache clean --force`
2. 删除 `node_modules` 和 `package-lock.json`
3. 重新运行：`npm install`
4. 或使用国内镜像：`npm install --registry=https://registry.npmmirror.com`

### 问题 4：前端无法访问后端 API

**解决方案：**
1. 确认后端服务已启动
2. 检查 `vite.config.js` 中的代理配置
3. 查看浏览器控制台的网络请求

### 问题 5：AI 功能不工作

**解决方案：**
1. 检查 `DASHSCOPE_API_KEY` 是否配置
2. 如果没有 API Key，系统会使用模拟数据（不影响其他功能）
3. 查看后端控制台的错误信息

## 下一步

安装完成后，你可以：

1. 📖 阅读 [README.md](README.md) 了解项目功能
2. 🔧 查看 [backend/README.md](backend/README.md) 了解 API 文档
3. 🤖 阅读 [documents/AI-FEATURES-README.md](documents/AI-FEATURES-README.md) 了解 AI 功能
4. 🧪 运行测试脚本验证功能
5. 💻 开始开发你的功能

## 获取帮助

- 查看 [documents](documents/) 目录下的详细文档
- 运行测试脚本诊断问题
- 检查后端控制台的错误日志

祝你使用愉快！🎉
