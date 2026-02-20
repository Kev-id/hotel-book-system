# 🚀 酒店预订系统 - 快速启动指南

## ✅ 系统状态

### 数据库
- ✅ 数据库已初始化
- ✅ 220 家酒店数据（200家来自 Kaggle 数据集 + 20家测试数据）
- ✅ 566 种房型
- ✅ 400 条订单数据
- ✅ 1500 条评价数据

### 数据分布
- 城市分布：武汉 29家、广州 24家、上海 23家、西安 22家、成都 20家等10个城市
- 星级分布：3星 48家（24%）、4星 123家（61.5%）、5星 29家（14.5%）
- 价格区间：¥151-¥2475，平均 ¥939
- 数据完整性：100% 有图片、标签、描述

### 服务状态
- ✅ 后端服务运行在: http://localhost:5000
- ✅ 前端服务运行在: http://localhost:5174

## 📋 访问地址

### 用户端
- 首页: http://localhost:5174/
- 酒店列表: http://localhost:5174/list
- 酒店详情: http://localhost:5174/detail/:id

### 管理端
- 登录: http://localhost:5174/admin/login
- 注册: http://localhost:5174/admin/register
- 酒店录入: http://localhost:5174/admin/hotel-form
- 审核管理: http://localhost:5174/admin/audit
- 商户状态: http://localhost:5174/admin/merchant-status
- 价格日历: http://localhost:5174/admin/price-calendar

## 👤 测试账号

### 管理员账号
- 用户名: `admin1`
- 密码: `123456`
- 权限: 审核酒店、管理系统

### 商户账号
- 用户名: `merchant1`
- 密码: `123456`
- 权限: 录入酒店、管理自己的酒店

### 自定义账号
- 用户名: `icc`
- 密码: `Wang2006`
- 角色: 管理员

## 🔧 常用命令

### 启动服务
```bash
# 启动后端（在 backend 目录）
cd hotel-book-system-master/backend
npm start

# 启动前端（在项目根目录）
cd hotel-book-system-master
npm run dev
```

### 数据库操作
```bash
# 重新导入数据
cd hotel-book-system-master
node backend/sql/migrate-v3.js
node backend/sql/import-data.js
node backend/sql/create-room-types.js
```

### 测试 API
```bash
cd hotel-book-system-master
node test-api.js
```

## 📊 API 端点

### 酒店相关
- `GET /api/hotels` - 获取酒店列表
- `GET /api/hotels/:id` - 获取酒店详情
- `GET /api/hotels/:id/room-types` - 获取酒店房型
- `POST /api/hotels` - 新增酒店
- `PATCH /api/hotels/:id` - 更新酒店
- `DELETE /api/hotels/:id` - 删除酒店

### 价格日历
- `GET /api/hotels/price-calendar/query` - 查询价格
- `POST /api/hotels/price-calendar` - 设置单日价格
- `POST /api/hotels/price-calendar/batch` - 批量设置价格
- `GET /api/hotels/price-calendar/calculate` - 计算总价

### 用户相关
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录

## 🎯 功能清单

### 已完成功能
- ✅ 用户注册/登录
- ✅ 角色权限控制（管理员/商户/用户）
- ✅ 酒店列表展示
- ✅ 酒店详情页
- ✅ 酒店搜索和筛选
- ✅ 商户酒店录入
- ✅ 管理员审核
- ✅ 价格日历管理
- ✅ 房型管理
- ✅ 数据导入（Kaggle 数据集）

### 数据来源
- 酒店数据: Kaggle Hotel Bookings 数据集
- 评价数据: Kaggle Hotel Reviews 数据集
- 共 100 家酒店，覆盖多个城市

## 🐛 故障排查

### 前端无法获取数据
1. 检查后端是否运行: `curl http://localhost:5000/api/hotels`
2. 检查前端代理配置: `vite.config.js`
3. 查看浏览器控制台错误

### 数据库连接失败
1. 检查 MySQL 服务是否运行
2. 检查 `backend/.env` 配置
3. 确认数据库 `hotel_booking` 已创建

### 端口被占用
```bash
# Windows 查看端口占用
netstat -ano | findstr :5000
netstat -ano | findstr :5174

# 结束进程
taskkill /F /PID <进程ID>
```

## 📝 开发建议

1. 修改后端代码后需要重启后端服务
2. 修改前端代码会自动热更新
3. 数据库结构变更需要运行迁移脚本
4. 使用 `test-api.js` 验证 API 功能

## 🎉 下一步

系统已完全就绪！你可以：
1. 访问 http://localhost:5174/ 查看前端页面
2. 使用测试账号登录管理后台
3. 浏览 100 家酒店数据
4. 测试搜索、筛选、详情等功能
5. 继续开发新功能

---

最后更新: 2024
