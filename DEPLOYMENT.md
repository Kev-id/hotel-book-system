# 部署指南

本项目包含前端（React + Vite）和后端（Node.js + MySQL），需要分别部署。

## 方案一：Vercel + Railway（推荐，免费）

### 1. 部署后端到 Railway

1. 访问 [Railway.app](https://railway.app/)
2. 使用 GitHub 账号登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的仓库
5. 添加 MySQL 数据库：
   - 点击 "New" → "Database" → "Add MySQL"
6. 配置环境变量（在后端服务中）：
   ```
   DB_HOST=<Railway提供的MySQL主机>
   DB_USER=<Railway提供的用户名>
   DB_PASSWORD=<Railway提供的密码>
   DB_NAME=hotel_booking
   PORT=5000
   ```
7. 设置启动命令：
   - Root Directory: `backend`
   - Start Command: `npm start`
8. 初始化数据库：
   - 在 Railway 控制台运行：`npm run init-db`
9. 复制后端 URL（例如：`https://your-app.railway.app`）

### 2. 部署前端到 Vercel

1. 访问 [Vercel.com](https://vercel.com/)
2. 使用 GitHub 账号登录
3. 点击 "Add New" → "Project"
4. 选择你的仓库
5. 配置构建设置：
   - Framework Preset: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 添加环境变量：
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
7. 点击 "Deploy"
8. 部署完成后，编辑 `vercel.json` 中的后端 URL

### 3. 更新前端 API 配置

修改 `src/api/hotelApi.js` 和 `src/api/userApi.js`：

```javascript
const baseUrl = import.meta.env.VITE_API_URL || '/api';
```

## 方案二：Render（全栈部署，免费）

### 1. 部署数据库

1. 访问 [Render.com](https://render.com/)
2. 创建 PostgreSQL 数据库（免费）或使用外部 MySQL
3. 记录数据库连接信息

### 2. 部署后端

1. 在 Render 创建 "New Web Service"
2. 连接 GitHub 仓库
3. 配置：
   - Name: hotel-booking-backend
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. 添加环境变量（同上）
5. 点击 "Create Web Service"

### 3. 部署前端

1. 在 Render 创建 "New Static Site"
2. 连接 GitHub 仓库
3. 配置：
   - Name: hotel-booking-frontend
   - Root Directory: `./`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. 添加环境变量：
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. 点击 "Create Static Site"

## 方案三：GitHub Pages（仅前端演示）

⚠️ 注意：GitHub Pages 只能托管静态网站，后端功能无法使用。

1. 修改 `vite.config.js`：
```javascript
export default defineConfig({
  base: '/hotel-book-system/', // 你的仓库名
  plugins: [react()],
})
```

2. 部署：
```bash
npm run build
npm run deploy
```

3. 在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

## 推荐配置

### 免费方案组合：
- **前端**: Vercel（无限流量，自动 HTTPS）
- **后端**: Railway（500小时/月免费）
- **数据库**: Railway MySQL（免费）

### 备选方案：
- **前端**: Netlify
- **后端**: Render（免费但会休眠）
- **数据库**: PlanetScale（免费 MySQL）

## 注意事项

1. 确保 `.gitignore` 包含：
   - `node_modules/`
   - `.env`
   - `backend/.env`
   - `dist/`

2. 后端需要配置 CORS 允许前端域名

3. 数据库连接使用环境变量，不要硬编码

4. 图片上传需要使用云存储（如 Cloudinary）

## 环境变量示例

### 后端 (.env)
```
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=hotel_booking
PORT=5000
NODE_ENV=production
```

### 前端 (.env.production)
```
VITE_API_URL=https://your-backend-url.com
```
