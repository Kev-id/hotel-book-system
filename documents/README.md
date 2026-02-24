# 项目文档目录

本目录包含酒店预订系统的所有技术文档和指南。

## 📚 核心文档

### 快速开始
- **[../QUICK-START.md](../QUICK-START.md)** - ⚡ 5 分钟快速启动（推荐）
- **[../SETUP.md](../SETUP.md)** - 📖 详细的项目初始化步骤
- **[../README.md](../README.md)** - 📋 项目概览和功能介绍

### 功能文档
- **[AI-FEATURES-README.md](AI-FEATURES-README.md)** - 🤖 AI 功能详细说明
  - AI 智能回复评价
  - 收藏推荐理由生成
  - 评价质量检测
  - 数据分析洞察

- **[AI智能回复功能-最终版.md](AI智能回复功能-最终版.md)** - AI 回复功能实现细节

### 项目管理
- **[HANDOVER-GUIDE.md](HANDOVER-GUIDE.md)** - 🔄 项目交接指南
  - 项目架构说明
  - 开发规范
  - 部署流程

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 🚀 部署指南
- **[CHANGELOG.md](CHANGELOG.md)** - 📝 更新日志
- **[UPDATE_LOG.md](UPDATE_LOG.md)** - 更新记录

## 🗂️ 专题文档

### AI 相关
- `AI-Innovation-Plan-v4.md` - AI 创新方案（英文）
- `AI增强创新方案-v4.0.md` - AI 增强方案（中文）
- `AI-API-Quick-Reference.md` - AI API 快速参考
- `AI-API-Selection-Guide.md` - AI API 选择指南

### 开发指南
- `Agent-Handover-Guide.md` - Agent 开发交接
- `如何使用Agent辅助开发.md` - Agent 使用指南
- `商家账号测试指南.md` - 商户功能测试

### 数据相关
- `AI数据生成模板/` - 📊 数据生成提示词和示例
  - 酒店列表生成
  - 评价数据生成
  - 数据格式说明
- `酒店数据扩展计划.md` - 数据扩展方案

### 其他
- `第五期前端训练营大作业说明.pdf` - 项目需求文档
- `MANUAL_PUSH_GUIDE.md` - 手动推送指南

## 📦 归档文档

`archive/` 目录包含历史文档和状态报告：
- Task 实现总结（Task12, Task13, Task14）
- 问题修复记录
- 旧版快速开始指南
- 项目状态报告
- Git 提交记录

这些文档保留用于参考，但可能已过时。

## 🔍 文档使用指南

### 🆕 新手入门（按顺序阅读）
1. **[../QUICK-START.md](../QUICK-START.md)** - 5 分钟快速启动
2. **[../SETUP.md](../SETUP.md)** - 详细安装步骤
3. **[../README.md](../README.md)** - 了解项目功能
4. **[HANDOVER-GUIDE.md](HANDOVER-GUIDE.md)** - 了解项目架构

### 💻 开发功能
1. 查看 [../backend/README.md](../backend/README.md) 了解 API
2. 查看 [HANDOVER-GUIDE.md](HANDOVER-GUIDE.md) 了解架构
3. 参考 `如何使用Agent辅助开发.md` 提高效率

### 🤖 使用 AI 功能
1. 阅读 [AI-FEATURES-README.md](AI-FEATURES-README.md)
2. 查看 `AI-API-Quick-Reference.md` 快速参考
3. 运行 `backend/tests/test-ai-api.js` 测试

### 📊 生成测试数据
1. 查看 `AI数据生成模板/` 目录
2. 使用提供的提示词生成数据
3. 运行数据导入脚本

### 🚀 部署上线
1. 阅读 [DEPLOYMENT.md](DEPLOYMENT.md)
2. 按照步骤配置生产环境
3. 运行部署脚本

## 📝 文档维护规范

### 更新文档
- 功能变更时及时更新对应文档
- 保持文档与代码同步
- 使用清晰的标题和代码示例
- 添加必要的截图和图表

### 添加新文档
- 放在对应的分类目录
- 更新本 README 的索引
- 使用 Markdown 格式
- 遵循现有文档的风格

### 归档旧文档
- 过时的文档移至 `archive/`
- 保留重要的历史记录
- 在归档文档中注明过时原因和日期

## 🔗 相关链接

- [项目根目录 README](../README.md)
- [快速启动指南](../QUICK-START.md)
- [详细安装指南](../SETUP.md)
- [后端 API 文档](../backend/README.md)
- [测试脚本说明](../backend/tests/README.md)
- [数据库脚本](../backend/sql/)

## 💡 文档编写提示

- 所有文档使用 Markdown 格式
- 代码示例使用语法高亮（\`\`\`语言）
- 使用 emoji 增强可读性（适度使用）
- 保持文档简洁清晰
- 提供实际可运行的示例
- 及时更新过时内容

## ❓ 获取帮助

如有疑问：
1. 查看对应的详细文档
2. 运行测试脚本诊断问题
3. 检查后端控制台的错误日志
4. 查看 `archive/` 中的历史问题解决方案

---

**最后更新：** 2024-02-24  
**维护者：** 项目团队
