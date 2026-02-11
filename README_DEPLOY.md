# 🚀 快速部署指南

## 最简单的部署方式（5分钟搞定）

### 步骤 1：准备 GitHub 仓库

```bash
# 如果还没有推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/hotel-book-system.git
git push -u origin main
```

### 步骤 2：部署后端到 Railway（免费）

1. 访问 https://railway.app/
2. 点击 "Login" → 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的 `hotel-book-system` 仓库
5. Railway 会自动检测到项目，点击 "Add variables"
6. 添加 MySQL 数据库：
   - 点击右上角 "New" → "Database" → "Add MySQL"
7. 回到你的后端服务，点击 "Variables" 添加：
   ```
   DB_HOST=${{MySQL.MYSQL_HOST}}
   DB_USER=${{MySQL.MYSQL_USER}}
   DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
   DB_NAME=hotel_booking
   PORT=5000
   NODE_ENV=production
   ```
8. 点击 "Settings" → "Root Directory" 设置为 `backend`
9. 点击 "Deploy"
10. 部署成功后，点击 "Settings" → "Generate Domain" 获取后端 URL
11. 在 Railway 控制台运行初始化数据库：
    - 点击服务 → "Deployments" → 最新部署 → "View Logs"
    - 或者通过 Railway CLI 运行：`npm run init-db`

### 步骤 3：部署前端到 Vercel（免费）

1. 访问 https://vercel.com/
2. 点击 "Sign Up" → 使用 GitHub 登录
3. 点击 "Add New..." → "Project"
4. 选择你的 `hotel-book-system` 仓库
5. 配置项目：
   - Framework Preset: **Vite**
   - Root Directory: `./`（保持默认）
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 点击 "Environment Variables" 添加：
   ```
   VITE_API_URL=https://你的railway后端地址.railway.app
   ```
7. 点击 "Deploy"
8. 等待部署完成（约1-2分钟）
9. 访问 Vercel 提供的 URL，你的网站就上线了！

### 步骤 4：更新后端 CORS 配置

编辑 `backend/server.js`，允许你的 Vercel 域名：

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://你的vercel域名.vercel.app'
  ]
}));
```

提交并推送更改，Railway 会自动重新部署。

## 🎉 完成！

你的网站现在可以通过以下地址访问：
- 前端：`https://你的项目名.vercel.app`
- 后端：`https://你的项目名.railway.app`

## 📝 后续更新

每次修改代码后：

```bash
git add .
git commit -m "更新说明"
git push
```

Vercel 和 Railway 会自动检测并重新部署！

## 💡 提示

- Railway 免费套餐：500 小时/月（约20天）
- Vercel 免费套餐：无限流量
- 如果 Railway 用完免费额度，可以换 Render.com

## 🆘 遇到问题？

查看详细部署文档：[DEPLOYMENT.md](./DEPLOYMENT.md)
