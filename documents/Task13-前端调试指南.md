# Task13: 前端调试指南 - 收藏功能

## ✅ 后端状态确认

根据诊断脚本，后端一切正常:
- ✅ 数据库连接正常
- ✅ favorites表结构正确
- ✅ 插入功能正常
- ✅ API配置正确

**问题出在前端！**

---

## 🔍 前端调试步骤

### 步骤1: 检查后端是否运行

打开新的命令行窗口:

```bash
cd hotel-book-system-master/backend
npm start
```

**预期输出:**
```
Server is running on port 5000
✅ 数据库已存在，跳过初始化
```

**如果看到这个输出，说明后端正在运行。保持这个窗口打开！**

---

### 步骤2: 检查前端是否运行

打开另一个新的命令行窗口:

```bash
cd hotel-book-system-master
npm run dev
```

**预期输出:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**如果看到这个输出，说明前端正在运行。保持这个窗口打开！**

---

### 步骤3: 打开浏览器开发者工具

1. 打开浏览器访问: http://localhost:5173
2. 按 F12 打开开发者工具
3. 切换到 Console 标签

---

### 步骤4: 检查登录状态

在 Console 中输入:

```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
```

**情况A: 如果token为null**
```
Token: null
User: {}
```

**解决方案: 需要登录**
1. 访问: http://localhost:5173/admin/login
2. 输入账号: user1
3. 输入密码: 123456
4. 点击登录

**情况B: 如果token存在**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User: { id: 5, username: 'user1', role: 'user' }
```

**说明: 已登录，继续下一步**

---

### 步骤5: 测试收藏功能

#### 5.1 访问酒店列表页

访问: http://localhost:5173/list

#### 5.2 打开Network标签

1. 在开发者工具中切换到 Network 标签
2. 确保 Preserve log 已勾选
3. 清空现有记录（点击禁止图标）

#### 5.3 点击收藏按钮

找到任意酒店卡片，点击"收藏"按钮

#### 5.4 查看Network请求

在 Network 标签中找到 `add` 请求，点击查看详情

**检查Request:**

```
Request URL: http://localhost:5000/api/favorites/add
Request Method: POST
Status Code: 应该是 200 或 400

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Payload:
  { "hotelId": 1 }
```

**检查Response:**

成功时:
```json
{
  "success": true,
  "message": "收藏成功",
  "category": "💰 性价比之选",
  "reason": "价格实惠"
}
```

失败时:
```json
{
  "error": "错误信息"
}
```

---

### 步骤6: 查看Console错误

切换回 Console 标签，查看是否有红色错误信息。

**常见错误及解决方案:**

#### 错误1: Failed to fetch
```
原因: 后端未运行
解决: 启动后端 (npm start)
```

#### 错误2: 401 Unauthorized
```
原因: 未登录或token过期
解决: 重新登录
```

#### 错误3: 404 Not Found
```
原因: API路由错误
解决: 检查 src/api/favoriteApi.js 中的API地址
```

#### 错误4: CORS error
```
原因: 跨域问题
解决: 检查后端 server.js 中的CORS配置
```

---

## 🛠️ 快速修复方案

### 方案1: 完全重启

```bash
# 1. 停止所有进程
# 在后端窗口按 Ctrl+C
# 在前端窗口按 Ctrl+C

# 2. 重新启动后端
cd hotel-book-system-master/backend
npm start

# 3. 重新启动前端（新窗口）
cd hotel-book-system-master
npm run dev

# 4. 清除浏览器缓存
# F12 -> Application -> Local Storage -> Clear
# 刷新页面

# 5. 重新登录
# 访问 http://localhost:5173/admin/login
# 账号: user1, 密码: 123456
```

### 方案2: 检查API地址

检查 `src/api/favoriteApi.js` 文件:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

**应该是: http://localhost:5000/api**

如果不是，创建 `.env` 文件:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 方案3: 手动测试API

在 Console 中直接调用API:

```javascript
// 1. 获取token
const token = localStorage.getItem('token');

// 2. 测试添加收藏
fetch('http://localhost:5000/api/favorites/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ hotelId: 1 })
})
.then(res => res.json())
.then(data => console.log('成功:', data))
.catch(err => console.error('失败:', err));
```

**预期输出:**
```javascript
成功: {
  success: true,
  message: "收藏成功",
  category: "💰 性价比之选",
  reason: "价格实惠"
}
```

---

## 📸 截图示例

### 正常的Network请求

```
Name: add
Status: 200
Type: xhr
Size: 123 B
Time: 234 ms
```

点击查看详情:

**Headers:**
```
Request URL: http://localhost:5000/api/favorites/add
Request Method: POST
Status Code: 200 OK
```

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Payload:**
```json
{
  "hotelId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "收藏成功",
  "category": "💰 性价比之选",
  "reason": "价格实惠"
}
```

---

## 🎯 完整测试流程

### 1. 确保两个服务都在运行

**窗口1 - 后端:**
```bash
cd hotel-book-system-master/backend
npm start
# 看到 "Server is running on port 5000"
```

**窗口2 - 前端:**
```bash
cd hotel-book-system-master
npm run dev
# 看到 "Local: http://localhost:5173/"
```

### 2. 登录

1. 访问: http://localhost:5173/admin/login
2. 账号: user1
3. 密码: 123456
4. 点击登录

### 3. 测试收藏

1. 访问: http://localhost:5173/list
2. 找到任意酒店
3. 点击"收藏"按钮
4. 查看提示消息

**成功提示:**
```
✅ 收藏成功！
🤖 AI分类：💰 性价比之选
💡 价格实惠
```

### 4. 查看我的收藏

1. 点击导航栏"我的收藏"
2. 应该能看到刚才收藏的酒店

---

## 💡 调试技巧

### 技巧1: 使用Console.log

在 `src/components/FavoriteButton/index.jsx` 中添加日志:

```javascript
const handleFavorite = async (e) => {
  console.log('🔍 开始收藏操作');
  console.log('用户:', user);
  console.log('酒店ID:', hotelId);
  
  e.stopPropagation();

  if (!user) {
    console.log('❌ 用户未登录');
    message.warning('请先登录');
    navigate('/admin/login');
    return;
  }

  setLoading(true);
  try {
    console.log('📡 调用API...');
    const result = await favoriteApi.addFavorite(hotelId);
    console.log('✅ API返回:', result);
    // ...
  } catch (error) {
    console.error('❌ 收藏失败:', error);
    // ...
  }
};
```

### 技巧2: 检查组件渲染

在 Console 中检查组件是否正确渲染:

```javascript
// 检查收藏按钮是否存在
document.querySelectorAll('.favorite-button').length
// 应该返回一个数字，表示页面上有多少个收藏按钮
```

### 技巧3: 监听所有API请求

在 Console 中运行:

```javascript
// 监听所有fetch请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('📡 Fetch:', args[0]);
  return originalFetch.apply(this, args)
    .then(res => {
      console.log('✅ Response:', res.status);
      return res;
    })
    .catch(err => {
      console.error('❌ Error:', err);
      throw err;
    });
};
```

---

## 📞 常见问题

### Q: 点击收藏按钮没有任何反应？

A: 检查:
1. 浏览器Console是否有JavaScript错误
2. 按钮是否有 `onClick` 事件
3. 用户是否已登录

### Q: 提示"请先登录"但我已经登录了？

A: 
1. 检查 localStorage 中的 token
2. 可能是 AuthContext 没有正确初始化
3. 尝试重新登录

### Q: Network标签中看不到请求？

A: 
1. 确保 Preserve log 已勾选
2. 确保 Filter 没有过滤掉 XHR 请求
3. 可能是请求根本没有发出（检查Console错误）

### Q: 请求返回401？

A: 
1. Token过期或无效
2. 重新登录获取新token

### Q: 请求返回500？

A: 
1. 后端代码错误
2. 查看后端控制台的错误信息
3. 可能是数据库问题

---

## 🎬 视频演示

如果你想看完整的操作流程，可以按照以下步骤录制:

1. 启动后端和前端
2. 打开浏览器开发者工具
3. 登录账号
4. 访问酒店列表
5. 点击收藏按钮
6. 查看Network和Console
7. 访问我的收藏页面

---

**最后更新**: 2026-02-24  
**适用版本**: Task13 最新版本
