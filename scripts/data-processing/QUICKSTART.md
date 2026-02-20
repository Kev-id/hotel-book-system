# 🚀 快速开始 - 5分钟完成数据处理

## 📝 前置检查

```bash
# 检查Python版本（需要3.7+）
python --version

# 检查pip
pip --version
```

---

## ⚡ 三步完成

### 步骤1: 安装依赖（1分钟）

```bash
cd hotel-book-system-master/scripts/data-processing
pip install -r requirements.txt
```

### 步骤2: 配置Kaggle API（2分钟）

**Windows用户:**
```powershell
# 创建目录
mkdir $env:USERPROFILE\.kaggle

# 下载kaggle.json后，移动到该目录
# 从 https://www.kaggle.com/settings 获取
```

**Mac/Linux用户:**
```bash
mkdir -p ~/.kaggle
# 下载kaggle.json后
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

### 步骤3: 运行数据处理（2分钟）

```bash
python run_all.py
```

---

## ✅ 验证结果

检查生成的文件：

```bash
# Windows
dir ..\..\data\processed

# Mac/Linux
ls -lh ../../data/processed/
```

应该看到：
- `hotels.json` - 约80条
- `orders.json` - 约400条
- `reviews.json` - 约300条
- `users.json` - 约150条

---

## 🎯 下一步

数据准备好后，运行数据库导入：

```bash
cd ../../backend
node sql/import-data.js
```

---

## 🐛 遇到问题？

### 问题1: Kaggle API未配置

**错误信息**: `❌ Kaggle API未配置`

**解决方案**:
1. 访问 https://www.kaggle.com/settings
2. 点击 "Create New API Token"
3. 下载 kaggle.json
4. 按步骤2配置

### 问题2: 网络下载失败

**解决方案**: 手动下载数据集

1. 访问 https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand
2. 点击 Download
3. 解压到 `data/raw/` 目录

4. 访问 https://www.kaggle.com/datasets/jiashenliu/515k-hotel-reviews-data-in-europe
5. 点击 Download
6. 解压到 `data/raw/` 目录

然后跳过步骤1，直接运行步骤2-5：

```bash
python 2_clean_hotels.py
python 3_clean_orders.py
python 4_clean_reviews.py
python 5_generate_users.py
```

### 问题3: 依赖安装失败

```bash
# 使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 💡 提示

- 首次下载Kaggle数据约需1-2分钟
- 数据处理总共约需2-3分钟
- 生成的JSON文件可以直接查看和编辑
- 如果需要重新生成，删除 `data/processed/` 目录后重新运行

---

**准备好了吗？开始吧！** 🎉
