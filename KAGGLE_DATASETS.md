# 📊 Kaggle 酒店数据集推荐

## 当前使用的数据集

✅ **Hotel Reviews (515K)** - 已使用
- 来源: Kaggle
- 数量: 515,738 条评价
- 覆盖: 1,493 家欧洲酒店
- 文件: `data/raw/Hotel_Reviews.csv`
- 特点: 包含酒店名称、评分、评价内容、地理位置等

## 推荐的额外数据集

### 1. 🌏 亚洲/中国地区数据集

#### MakeMyTrip Hotel Dataset (印度)
- **链接**: 搜索 "MakeMyTrip hotel dataset" on Kaggle
- **规模**: 615,000+ 酒店
- **地区**: 印度（亚洲市场，价格和星级分布更接近中国）
- **包含**: 酒店名称、位置、价格、评分、设施
- **优势**: 
  - 亚洲市场数据
  - 价格区间更符合中国市场
  - 包含经济型酒店

#### Hotels-50K Global Dataset
- **链接**: 搜索 "Hotels-50K" on Kaggle
- **规模**: 50,000+ 酒店图片
- **地区**: 全球（包含亚洲）
- **包含**: 酒店图片、位置信息
- **优势**: 真实酒店图片数据

### 2. 🏨 通用酒店数据集

#### Hotel Booking Demand
- **链接**: `kaggle.com/jessemostipak/hotel-booking-demand`
- **规模**: 119,390 条预订记录
- **包含**: 预订详情、取消情况、客户类型
- **优势**: 
  - 已在使用（`hotel_bookings.csv`）
  - 包含预订行为数据
  - 适合订单数据生成

#### Expedia Hotel Recommendations
- **链接**: 搜索 "Expedia hotel recommendations" on Kaggle
- **规模**: 37M+ 训练数据
- **包含**: 用户行为、酒店聚类、目的地信息
- **优势**: 
  - 大规模真实数据
  - 包含用户偏好
  - 适合推荐系统

### 3. 📝 评价数据集

#### TripAdvisor Hotel Reviews
- **规模**: 20M+ 评价
- **地区**: 全球
- **语言**: 多语言（包含中文）
- **包含**: 评价文本、评分、时间、用户信息

## 🎯 针对中国市场的建议

### 方案 A: 使用现有数据 + 本地化处理（推荐）
当前已实现，效果良好：
- ✅ 从 Hotel_Reviews.csv 提取 200 家酒店
- ✅ 映射到中国城市（北京、上海、广州等）
- ✅ 调整价格区间符合中国市场
- ✅ 生成中文地址和描述

**优势**: 
- 无需额外下载
- 数据质量高
- 已经过验证

### 方案 B: 补充 MakeMyTrip 数据
如果需要更多真实亚洲酒店数据：

1. 下载 MakeMyTrip 数据集
2. 提取印度酒店信息
3. 映射到中国城市
4. 合并到现有数据

**步骤**:
```bash
# 1. 下载数据集
kaggle datasets download -d datastock/makemytrip-hotel-data

# 2. 解压到 data/raw/
unzip makemytrip-hotel-data.zip -d data/raw/

# 3. 运行处理脚本（需要创建）
python scripts/data-processing/6_process_makemytrip.py
```

### 方案 C: 使用 Hotels-50K 补充图片
为酒店添加真实图片：

1. 下载 Hotels-50K 数据集
2. 提取酒店图片 URL
3. 更新现有酒店的 images 字段

## 📥 如何下载 Kaggle 数据集

### 方法 1: 使用 Kaggle API（推荐）

```bash
# 1. 安装 Kaggle CLI
pip install kaggle

# 2. 配置 API Token
# 从 kaggle.com/account 下载 kaggle.json
# 放到 ~/.kaggle/kaggle.json (Linux/Mac)
# 或 C:\Users\<username>\.kaggle\kaggle.json (Windows)

# 3. 下载数据集
kaggle datasets download -d <dataset-name>
```

### 方法 2: 手动下载

1. 访问 kaggle.com
2. 搜索数据集名称
3. 点击 "Download" 按钮
4. 解压到 `data/raw/` 目录

## 🔄 数据处理流程

当前流程（已实现）:
```
Hotel_Reviews.csv (515K)
    ↓
2_clean_hotels.py (提取酒店信息)
    ↓
hotels.json (200 家酒店)
    ↓
import-data.js (导入数据库)
    ↓
MySQL (220 家酒店 + 566 房型)
```

扩展流程（如需添加新数据）:
```
新数据集.csv
    ↓
6_process_new_dataset.py (处理新数据)
    ↓
合并到 hotels.json
    ↓
重新导入数据库
```

## 💡 当前数据统计

- ✅ 220 家酒店（200 来自 Kaggle + 20 测试数据）
- ✅ 10 个中国城市
- ✅ 星级分布: 3星 24%、4星 61.5%、5星 14.5%
- ✅ 价格区间: ¥151-¥2475
- ✅ 566 种房型
- ✅ 1500 条评价
- ✅ 400 条订单

## 🎯 建议

**当前数据已经足够用于开发和演示**，除非你需要：

1. **更多酒店数量** → 考虑 MakeMyTrip 或 Expedia 数据集
2. **真实酒店图片** → 考虑 Hotels-50K 数据集
3. **中文评价数据** → 需要爬取携程/美团（不在 Kaggle 上）
4. **特定城市数据** → 可以调整现有脚本的城市分布

## 📚 参考资源

- [Kaggle Datasets](https://www.kaggle.com/datasets)
- [Hotel Reviews 515K](https://www.kaggle.com/datasets/jiashenliu/515k-hotel-reviews-data-in-europe)
- [Hotel Booking Demand](https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand)
- [中国开放数据平台](https://www.cnopendata.com/en/data/m/traffic/starred-hotel.html)

---

**最后更新**: 2024
**当前状态**: 数据充足，无需额外下载
