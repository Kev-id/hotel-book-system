# 项目结构说明

## 📁 目录结构

```
hotel-book-system-master/
├── backend/                          # 后端服务
│   ├── config/
│   │   ├── config.js                # 配置文件
│   │   └── database.js              # 数据库配置
│   ├── controllers/
│   │   ├── hotelController.js       # 酒店控制器
│   │   └── userController.js        # 用户控制器
│   ├── routes/                      # 路由文件
│   ├── sql/
│   │   └── init.js                  # 数据库初始化
│   ├── .env                         # 环境变量
│   ├── package.json
│   ├── server.js                    # 服务器入口
│   └── README.md
│
├── src/                             # 前端源代码
│   ├── api/
│   │   ├── hotelApi.js             # 酒店 API
│   │   └── userApi.js              # 用户 API
│   ├── components/
│   │   ├── AuthGuard.jsx           # 权限守卫
│   │   ├── Navigation.jsx          # 导航栏
│   │   └── Navigation.css
│   ├── context/
│   │   └── AuthContext.jsx         # 认证上下文
│   ├── pages/
│   │   ├── admin/                  # 管理端页面
│   │   │   ├── Audit/              # 审核页面
│   │   │   ├── HotelForm/          # 酒店表单页
│   │   │   │   ├── index.jsx
│   │   │   │   └── styles.css
│   │   │   ├── Login/              # 登录页
│   │   │   │   ├── index.jsx
│   │   │   │   └── styles.css
│   │   │   └── Register/           # 注册页
│   │   │       ├── index.jsx
│   │   │       └── styles.css
│   │   └── client/                 # 客户端页面
│   │       ├── Detail/             # 详情页
│   │       │   ├── index.jsx
│   │       │   └── styles.css
│   │       ├── Home/               # 首页
│   │       │   ├── index.jsx
│   │       │   └── styles.css
│   │       └── List/               # 列表页
│   │           ├── index.jsx
│   │           └── styles.css
│   ├── router/                     # 路由配置
│   ├── styles/
│   │   ├── index.css              # 全局样式 + CSS 变量
│   │   └── App.css                # App 容器样式
│   ├── App.jsx
│   └── main.jsx
│
├── design-system/                  # 设计系统
│   └── hotel-booking-system/
│       └── MASTER.md              # 设计系统主文件
│
├── public/                         # 静态资源
│   └── vite.svg
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
│
├── 📄 文档文件
├── README.md                       # 项目说明
├── QUICK_START.md                 # 快速开始指南
├── UI_OPTIMIZATION_SUMMARY.md     # UI 优化总结
├── IMAGES_GUIDE.md                # 图片使用指南
├── PROJECT_STRUCTURE.md           # 项目结构说明（本文件）
└── 项目总结文档.md                # 项目总结

```

---

## 🎯 核心模块说明

### 前端（Frontend）

#### 页面层级
- **客户端（Client）**
  - 首页（Home）：搜索和浏览酒店
  - 列表页（List）：酒店列表和筛选
  - 详情页（Detail）：酒店详细信息

- **管理端（Admin）**
  - 登录页（Login）：用户认证
  - 注册页（Register）：商户注册
  - 酒店表单（HotelForm）：发布酒店信息
  - 审核页（Audit）：管理员审核酒店

#### 样式系统
- `src/styles/index.css`：全局样式 + CSS 变量
  - 颜色系统（蓝色主色 + 橙色 CTA）
  - 间距系统（8px 网格）
  - 阴影系统（4 个级别）
  - 排版系统（Lexend + Source Sans 3）

- 各页面独立样式文件：`pages/*/styles.css`

#### 组件
- `AuthGuard.jsx`：路由权限保护
- `Navigation.jsx`：导航栏组件

#### 上下文
- `AuthContext.jsx`：全局认证状态管理

### 后端（Backend）

#### 控制器
- `hotelController.js`：酒店相关业务逻辑
- `userController.js`：用户相关业务逻辑

#### 配置
- `config/config.js`：应用配置
- `config/database.js`：数据库连接配置

#### 数据库
- `sql/init.js`：初始化脚本

---

## 🎨 设计系统

### 配色方案
```css
--color-primary: #1E3A8A      /* 主蓝色 */
--color-secondary: #3B82F6    /* 辅助蓝色 */
--color-cta: #F97316          /* 橙色 CTA */
--color-background: #EFF6FF   /* 浅蓝背景 */
--color-text: #1E40AF         /* 文本色 */
```

### 排版
- **标题字体**：Lexend（现代、清晰）
- **正文字体**：Source Sans 3（易读、专业）

### 间距
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

### 阴影
- sm: 浅阴影, md: 中阴影, lg: 深阴影, xl: 超深阴影

---

## 📦 依赖管理

### 前端依赖
- React 19.2.0
- React Router 7.13.0
- Ant Design 6.2.3
- Vite 7.2.4

### 后端依赖
- Express 4.18.2
- MySQL2 3.6.0
- CORS 2.8.5
- Dotenv 16.3.1

---

## 🚀 启动方式

### 前端
```bash
cd hotel-book-system-master
npm install
npm run dev
# 访问 http://localhost:5173
```

### 后端
```bash
cd hotel-book-system-master/backend
npm install
npm start
# 服务运行在 http://localhost:3000
```

---

## 📝 文件说明

### 文档文件
| 文件 | 说明 |
|------|------|
| README.md | 项目总体说明 |
| QUICK_START.md | 快速开始指南 |
| UI_OPTIMIZATION_SUMMARY.md | UI 优化详细说明 |
| IMAGES_GUIDE.md | 图片使用和优化指南 |
| PROJECT_STRUCTURE.md | 项目结构说明（本文件） |
| 项目总结文档.md | 项目总结 |

### 配置文件
| 文件 | 说明 |
|------|------|
| .gitignore | Git 忽略规则 |
| vite.config.js | Vite 配置 |
| eslint.config.js | ESLint 配置 |
| package.json | 项目依赖和脚本 |

---

## 🔄 开发流程

### 添加新页面
1. 在 `src/pages/` 下创建新目录
2. 创建 `index.jsx` 和 `styles.css`
3. 在 `src/router/` 中配置路由
4. 遵循现有的设计系统和样式规范

### 修改样式
1. 优先使用 CSS 变量（`var(--color-primary)` 等）
2. 遵循间距系统（使用 `var(--space-*)`）
3. 保持响应式设计（使用 `@media` 查询）

### 添加 API
1. 在 `src/api/` 中创建新的 API 文件
2. 使用 fetch 或 axios 调用后端接口
3. 在组件中使用 `useEffect` 调用 API

---

## ✅ 质量检查清单

- [x] 所有页面遵循设计系统
- [x] 所有图片有 alt 属性
- [x] 所有交互元素有 cursor: pointer
- [x] 所有页面响应式设计
- [x] 所有表单有验证
- [x] 所有 API 调用有错误处理
- [x] 所有代码有注释
- [x] 所有文档保持最新

---

## 🎯 下一步优化方向

1. **性能优化**
   - 代码分割和懒加载
   - 图片优化和 WebP 支持
   - 缓存策略

2. **功能增强**
   - 用户评价系统
   - 收藏和对比功能
   - 支付集成

3. **运维部署**
   - Docker 容器化
   - CI/CD 流程
   - 监控和日志

4. **用户体验**
   - 暗黑模式
   - 国际化支持
   - PWA 离线访问

---

## 📞 技术栈总结

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 19.2.0 |
| 路由 | React Router | 7.13.0 |
| UI 组件库 | Ant Design | 6.2.3 |
| 构建工具 | Vite | 7.2.4 |
| 后端框架 | Express | 4.18.2 |
| 数据库 | MySQL | 5.7+ |
| 包管理 | npm | 10+ |

---

## 📄 许可证

MIT License

---

**最后更新**：2026-02-06
**版本**：v2.0.0 - UI 优化版
