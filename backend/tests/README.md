# 测试脚本目录

所有测试和诊断脚本都集中在这个文件夹中。

## 测试脚本列表

### API 测试
- `test-ai-api.js` - AI 功能 API 测试
- `test-analytics-api.js` - 数据分析 API 测试
- `test-favorite-api.js` - 收藏功能 API 测试
- `test-favorite-simple.js` - 收藏功能简单测试
- `test-all-features.js` - 所有功能综合测试

### 数据测试
- `test-import-data.js` - 数据导入测试

### 诊断工具
- `diagnose-favorite.js` - 收藏功能诊断
- `check-favorites-table.js` - 检查收藏表结构
- `check-hotel-prices.js` - 检查酒店价格数据

### 修复工具
- `fix-favorites-table.js` - 修复收藏表
- `fix-favorites-ai-reason.js` - 修复收藏 AI 推荐理由

## 使用方法

在 backend 目录下运行：

```bash
# API 测试
node tests/test-ai-api.js
node tests/test-analytics-api.js
node tests/test-favorite-api.js

# 综合测试
node tests/test-all-features.js

# 诊断工具
node tests/diagnose-favorite.js
node tests/check-hotel-prices.js
```

## 注意事项

- 运行测试前确保数据库已初始化（`node sql/init.js`）
- 确保 `.env` 文件配置正确
- 某些测试需要服务器运行中
