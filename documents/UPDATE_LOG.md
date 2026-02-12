# 更新日志 - v2.1.0

## 📅 更新时间
2026年2月6日

## 🎯 本次更新概述
本次更新主要修复了系统中的关键 Bug，优化了用户体验，并改进了标签匹配逻辑。

---

## 🐛 Bug 修复

### 1. 用户注册功能修复
**问题描述**：用户无法成功注册账号

**根本原因**：前端注册表单字段名与后端不匹配
- 前端发送：`confirmPassword`
- 后端期望：`confirmPwd`

**解决方案**：
- 修改 `src/pages/admin/Register/index.jsx`
- 将表单字段名统一为 `confirmPwd`

**影响范围**：用户注册功能

---

### 2. 管理员登录问题修复
**问题描述**：管理员账号 `icc` 无法登录

**根本原因**：数据库中 `icc` 账号的角色被错误设置为 `merchant`（商户）而非 `admin`（管理员）

**解决方案**：
- 执行 SQL 更新：`UPDATE users SET role = 'admin' WHERE username = 'icc'`
- 修改 `backend/sql/init.js`，确保初始化时正确设置角色

**当前可用管理员账号**：
- 账号1：`admin1` / `123456`
- 账号2：`icc` / `Wang2006`

---

### 3. 管理员审核操作失败修复
**问题描述**：管理员点击"通过"或"驳回"按钮时显示"操作失败"

**根本原因**：数据库 `hotels` 表缺少 `rejectReason` 字段

**解决方案**：
- 添加数据库字段：`ALTER TABLE hotels ADD COLUMN rejectReason VARCHAR(500) DEFAULT NULL`
- 更新 `backend/sql/migrate.js`，添加字段迁移逻辑
- 优化 `src/api/hotelApi.js` 的错误处理

**影响范围**：管理员审核功能（通过/驳回）

---

## ✨ 功能优化

### 1. 标签匹配逻辑优化
**优化前**：商户选择标签时，必须完全匹配预设组合才能生成介绍（过于严格）

**优化后**：改为灵活的部分匹配逻辑
- 五星豪华酒店：需满足 4/5 项（WiFi、停车场、健身房、游泳池、SPA）
- 商务酒店：需满足 2/3 项（WiFi、停车场、健身房）
- 会议酒店：需满足 2/3 项（WiFi、会议室、餐厅）
- 文化特色酒店：需满足 3/5 项（WiFi、中餐厅、停车场、茶楼、健身房）
- 经济酒店：需满足 1/2 项（WiFi、前台24小时）

**实现方式**：
```javascript
// 新的匹配逻辑
const matchTagCombination = (selectedTags) => {
  for (const combination of TAG_COMBINATIONS) {
    const matchCount = selectedTags.filter(tag => 
      combination.tags.includes(tag)
    ).length;
    
    if (matchCount >= combination.minMatch) {
      return combination.description;
    }
  }
  return '';
};
```

**影响范围**：商户酒店录入页面

---

## 🔧 技术改进

### 1. 数据库迁移脚本完善
- 添加 `rejectReason` 字段的迁移逻辑
- 确保所有必要字段都包含在迁移脚本中

### 2. 错误处理优化
- 改进前端 API 调用的错误日志
- 添加更详细的错误信息输出

### 3. 代码质量提升
- 删除临时测试脚本
- 清理冗余文档（11个过程性文档）
- 保留核心文档（README、CHANGELOG、QUICK_START、项目总结）

---

## 📊 测试验证

### 功能测试结果
- ✅ 用户注册：正常
- ✅ 管理员登录：正常
- ✅ 商户登录：正常
- ✅ 酒店录入：正常
- ✅ 标签匹配：正常
- ✅ 审核通过：正常
- ✅ 审核驳回：正常
- ✅ 酒店删除：正常

### 数据库测试结果
```
通过审核：✓ 成功
驳回审核：✓ 成功
```

---

## 📝 文件变更统计

### 修改的文件（17个）
- `backend/.env`
- `backend/controllers/hotelController.js`
- `backend/sql/init.js`
- `backend/sql/migrate.js`
- `src/api/hotelApi.js`
- `src/api/userApi.js`
- `src/components/Navigation.css`
- `src/components/Navigation.jsx`
- `src/context/AuthContext.jsx`
- `src/pages/admin/Audit/index.jsx`
- `src/pages/admin/HotelForm/index.jsx`
- `src/pages/admin/HotelForm/styles.css`
- `src/pages/admin/Login/index.jsx`
- `src/pages/admin/Register/index.jsx`
- `src/pages/client/Detail/index.jsx`
- `src/pages/client/Detail/styles.css`
- `src/router/index.jsx`
- `vite.config.js`

### 新增的文件（1个）
- `src/pages/admin/MerchantStatus/` 目录及相关文件

### 删除的文件（11个冗余文档）
- BUG_FIXES.md
- DATABASE_GUIDE.md
- GIT_COMMIT_SUMMARY.md
- HOTEL_TAGS_FEATURE.md
- IMAGES_GUIDE.md
- IMPLEMENTATION_SUMMARY.md
- POST_COMMIT_UPDATES.md
- PROJECT_STRUCTURE.md
- ROLE_UPDATE_GUIDE.md
- SYSTEM_CHECK_REPORT.md
- UI_OPTIMIZATION_SUMMARY.md

---

## 🚀 升级指南

### 对于现有部署

1. **更新代码**
```bash
git pull origin master
```

2. **运行数据库迁移**
```bash
cd backend
node sql/migrate.js
```

3. **重启服务**
```bash
# 重启后端
npm start

# 重启前端
npm run dev
```

### 对于新部署

按照 `QUICK_START.md` 中的步骤进行全新安装。

---

## 🔮 下一步计划

1. 添加酒店图片上传功能
2. 实现用户收藏功能
3. 添加酒店评价系统
4. 优化搜索性能
5. 添加数据统计面板

---

## 👥 贡献者
- 开发者：陈凯文
- 更新日期：2026-02-06
