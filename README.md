# 🏨 酒店预订系统

一个基于 React + Vite + Express + MySQL 的专业酒店预订平台，采用现代化设计和完整的功能实现。

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Node](https://img.shields.io/badge/Node.js-18+-green)

---

## ✨ 主要特性

### 🎨 UI/UX 优化（v2.0.0 新增）
- ✅ 专业设计系统（基于 UI/UX Pro Max）
- ✅ 参考携程官网风格
- ✅ 完整的响应式设计
- ✅ 流畅的动画效果
- ✅ 无障碍优化（WCAG AA）

### 🏨 核心功能
- ✅ 酒店搜索和筛选
- ✅ 酒店详情查看
- ✅ 用户认证系统
- ✅ 商户酒店发布
- ✅ 管理员审核系统

### 📱 技术特点
- ✅ 前后端分离架构
- ✅ 响应式设计（375px - 1440px）
- ✅ 高质量图片集成
- ✅ 完善的文档
- ✅ 生产级代码质量

---

## � 快速开始

### 前置要求
- Node.js 18+
- npm 10+
- MySQL 5.7+

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

### 启动服务

```bash
# 启动后端服务（端口 3000）
cd backend
npm start

# 新开终端，启动前端服务（端口 5173）
npm run dev
```

### 访问应用

打开浏览器访问：
- **本地访问**：http://localhost:5173
- **网络访问**：http://192.168.x.x:5173

---

## 📁 项目结构

```
hotel-book-system-master/
├── backend/                          # 后端服务
│   ├── config/                      # 配置文件
│   ├── controllers/                 # 业务逻辑
│   ├── routes/                      # 路由定义
│   ├── sql/                         # 数据库脚本
│   ├── server.js                    # 服务器入口
│   └── package.json
│
├── src/                             # 前端源代码
│   ├── api/                         # API 接口
│   ├── components/                  # 公共组件
│   ├── context/                     # 状态管理
│   ├── pages/                       # 页面组件
│   │   ├── admin/                  # 管理端
│   │   └── client/                 # 客户端
│   ├── router/                      # 路由配置
│   ├── styles/                      # 全局样式
│   ├── App.jsx
│   └── main.jsx
│
├── design-system/                   # 设计系统
│   └── hotel-booking-system/
│       └── MASTER.md               # 设计规范
│
├── 📄 文档
├── README.md                        # 项目说明（本文件）
├── QUICK_START.md                  # 快速开始指南
├── CHANGELOG.md                    # 更新日志
├── UI_OPTIMIZATION_SUMMARY.md      # UI 优化说明
├── IMAGES_GUIDE.md                 # 图片使用指南
└── PROJECT_STRUCTURE.md            # 项目结构详解
```

---

## 🎨 设计系统

### 配色方案
```css
主色：#1E3A8A（专业蓝）
辅助色：#3B82F6（浅蓝）
强调色：#F97316（行动橙）
背景色：#EFF6FF（浅蓝背景）
文本色：#1E40AF（深蓝）
```

### 排版
- **标题字体**：Lexend（现代、清晰）
- **正文字体**：Source Sans 3（易读、专业）

### 响应式断点
| 设备 | 宽度 | 布局 |
|------|------|------|
| 手机 | < 480px | 单列 |
| 平板 | 480px - 768px | 两列 |
| 桌面 | > 768px | 多列 |

---

## 📖 页面说明

### 客户端页面

#### 🏠 首页（/）
- 渐变轮播 Hero 区域
- 酒店搜索表单
- 特色功能展示

#### 📋 列表页（/list）
- 酒店卡片列表
- 排序和筛选
- 分页控件

#### 🏨 详情页（/detail/:id）
- 酒店信息展示
- 设施介绍
- 固定预订栏

### 管理端页面

#### 🔐 登录页（/admin/login）
- 用户认证
- 角色选择

#### 📝 注册页（/admin/register）
- 商户注册
- 表单验证

#### 🏢 酒店表单（/admin/hotel-form）
- 酒店信息发布
- 步骤条指引

#### ✅ 审核页（/admin/audit）
- 酒店审核管理
- 状态更新

---

## 🔧 技术栈

### 前端
- **框架**：React 19.2.0
- **路由**：React Router 7.13.0
- **UI 组件**：Ant Design 6.2.3
- **构建工具**：Vite 7.2.4
- **样式**：CSS3 + CSS Variables

### 后端
- **框架**：Express 4.18.2
- **数据库**：MySQL 5.7+
- **驱动**：MySQL2 3.6.0
- **中间件**：CORS、Body Parser

### 开发工具
- **代码检查**：ESLint 9.39.1
- **包管理**：npm 10+
- **版本控制**：Git

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [QUICK_START.md](./QUICK_START.md) | 快速开始指南 |
| [CHANGELOG.md](./CHANGELOG.md) | 更新日志 |
| [UI_OPTIMIZATION_SUMMARY.md](./UI_OPTIMIZATION_SUMMARY.md) | UI 优化详细说明 |
| [IMAGES_GUIDE.md](./IMAGES_GUIDE.md) | 图片使用和优化指南 |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | 项目结构详解 |

---

## 🎯 核心功能

### 用户功能
- [x] 浏览酒店列表
- [x] 搜索和筛选酒店
- [x] 查看酒店详情
- [x] 用户登录/注册
- [x] 预订酒店（UI 已准备）

### 商户功能
- [x] 发布酒店信息
- [x] 编辑酒店信息
- [x] 查看发布状态
- [x] 管理酒店列表

### 管理员功能
- [x] 审核酒店信息
- [x] 批准/拒绝发布
- [x] 查看所有酒店
- [x] 用户管理

---

## 🌟 v2.0.0 更新亮点

### 🎨 UI/UX 优化
- 完整的设计系统（基于 UI/UX Pro Max）
- 参考携程官网风格
- 专业的配色方案
- 流畅的动画效果

### 🖼️ 图片优化
- 高质量 Unsplash 图片
- 首页轮播图（3张）
- 特色卡片图片（3张）
- 列表和详情页图片
- 懒加载和悬停效果

### 📱 响应式设计
- 完美适配所有设备
- 375px - 1440px 宽度支持
- 移动端优化
- 触摸友好的交互

### ♿ 无障碍优化
- WCAG AA 标准
- 文本对比度 ≥ 4.5:1
- 键盘导航支持
- 屏幕阅读器友好

---

## 🚀 性能优化

- ✅ CSS 变量系统减少重复代码
- ✅ 图片懒加载
- ✅ GPU 加速动画
- ✅ 避免布局抖动
- ✅ 响应式图片

---

## 📝 开发指南

### 添加新页面
1. 在 `src/pages/` 下创建新目录
2. 创建 `index.jsx` 和 `styles.css`
3. 在 `src/router/` 中配置路由
4. 遵循设计系统规范

### 修改样式
1. 优先使用 CSS 变量
2. 遵循间距系统
3. 保持响应式设计
4. 参考 `src/styles/index.css`

### 添加 API
1. 在 `src/api/` 中创建新文件
2. 使用 fetch 调用后端接口
3. 在组件中使用 `useEffect`

---

## 🐛 常见问题

### Q: 如何修改数据库连接？
A: 编辑 `backend/config/database.js` 文件，修改数据库配置。

### Q: 如何添加新的酒店图片？
A: 参考 [IMAGES_GUIDE.md](./IMAGES_GUIDE.md) 文件。

### Q: 如何自定义配色方案？
A: 修改 `src/styles/index.css` 中的 CSS 变量。

### Q: 如何部署到生产环境？
A: 参考 [QUICK_START.md](./QUICK_START.md) 中的部署指南。

---

## 📞 技术支持

- 📧 Email: support@example.com
- 💬 Issues: [GitHub Issues](https://github.com/example/issues)
- 📖 Wiki: [项目 Wiki](https://github.com/example/wiki)

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 👥 贡献者

- 🎨 UI/UX 设计：Kiro AI
- 💻 前端开发：React Team
- 🔧 后端开发：Express Team

---

## 🎉 致谢

感谢以下开源项目和资源：
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Ant Design](https://ant.design/)
- [Unsplash](https://unsplash.com/)
- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

---

**版本**：v2.0.0  
**最后更新**：2026-02-06  
**维护者**：Hotel Booking Team

---

## 🚀 下一步计划

- [ ] 用户评价系统
- [ ] 收藏和对比功能
- [ ] 支付集成
- [ ] 订单管理
- [ ] 暗黑模式
- [ ] 国际化支持
- [ ] PWA 离线访问

欢迎 Star ⭐ 和 Fork 🍴！
