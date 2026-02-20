# 🏨 酒店预订系统 - 数据处理工具链

基于Kaggle真实数据集的数据清洗和处理工具。

---

## 📋 数据源

### Kaggle数据集

1. **Hotel Booking Demand** (119,390条订单)
   - 链接: https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand
   - 用途: 订单数据

2. **515K Hotel Reviews Data in Europe** (515,000条评价)
   - 链接: https://www.kaggle.com/datasets/jiashenliu/515k-hotel-reviews-data-in-europe
   - 用途: 酒店信息、评价数据

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd scripts/data-processing
pip install -r requirements.txt
```

### 2. 配置Kaggle API

1. 访问 https://www.kaggle.com/settings
2. 点击 "Create New API Token"
3. 下载 `kaggle.json` 文件
4. 将文件放到 `~/.kaggle/` 目录

**Windows:**
```powershell
mkdir $env:USERPROFILE\.kaggle
move kaggle.json $env:USERPROFILE\.kaggle\
```

**Linux/Mac:**
```bash
mkdir -p ~/.kaggle
mv kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

### 3. 运行数据处理

**方式A: 一键运行（推荐）**
```bash
python run_all.py
```

**方式B: 分步运行**
```bash
# 步骤1: 下载Kaggle数据
python 1_download_kaggle_data.py

# 步骤2: 清洗酒店数据
python 2_clean_hotels.py

# 步骤3: 清洗订单数据
python 3_clean_orders.py

# 步骤4: 清洗评价数据
python 4_clean_reviews.py

# 步骤5: 生成用户数据
python 5_generate_users.py
```

---

## 📊 输出数据

### 生成的JSON文件

```
data/processed/
├── hotels.json      # 80条酒店数据
├── orders.json      # 400条订单数据
├── reviews.json     # 300条评价数据
└── users.json       # 150条用户数据
```

### 数据结构

#### hotels.json
```json
{
  "id": 1,
  "name": "酒店名称",
  "city": "北京",
  "address": "详细地址",
  "stars": 5,
  "basePrice": 800,
  "rating": 4.5,
  "reviewCount": 120,
  "tags": ["免费取消", "近地铁", "含早餐"],
  "facilities": ["WiFi", "停车场", "健身房"],
  "images": ["url1", "url2"],
  "rooms": [
    {
      "type": "标准间",
      "price": 800,
      "inventory": 20,
      "area": 25,
      "bedType": "大床"
    }
  ],
  "coordinates": {"lat": 39.9, "lng": 116.4},
  "checkInTime": "14:00",
  "checkOutTime": "12:00",
  "cancelPolicy": {
    "free_before_hours": 48,
    "penalty_rate": 0,
    "description": "入住前48小时可免费取消"
  }
}
```

#### orders.json
```json
{
  "id": "ORD202601123456",
  "userId": 10,
  "hotelId": 5,
  "roomType": "豪华间",
  "status": "confirmed",
  "checkInDate": "2026-03-15",
  "checkOutDate": "2026-03-17",
  "nights": 2,
  "adults": 2,
  "children": 0,
  "totalPrice": 1600,
  "createTime": "2026-02-20T10:30:00",
  "updateTime": "2026-02-20T11:00:00",
  "cancelDeadline": "2026-03-13T14:00:00",
  "cancelPolicy": {
    "free_before_hours": 48,
    "penalty_rate": 0
  },
  "logs": [
    {
      "time": "2026-02-20T10:30:00",
      "action": "created",
      "operator": "user"
    }
  ],
  "riskFlags": []
}
```

#### reviews.json
```json
{
  "id": 1,
  "userId": 15,
  "hotelId": 3,
  "orderId": "ORD202601123456",
  "overallRating": 4.5,
  "dimensions": {
    "cleanliness": 4.8,
    "service": 4.5,
    "soundproof": 3.8,
    "location": 4.7,
    "facilities": 4.3
  },
  "content": "酒店位置很好，房间干净整洁...",
  "images": [],
  "tags": ["干净", "位置方便", "服务好"],
  "sentiment": "positive",
  "helpful": 12,
  "reported": false,
  "merchantReply": {
    "content": "感谢您的评价！",
    "time": "2026-02-21T10:00:00"
  },
  "createTime": "2026-02-20T15:00:00"
}
```

#### users.json
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@hotel.com",
  "phone": "13800138000",
  "password": "admin123",
  "role": "admin",
  "preferences": {
    "business": true,
    "leisure": true,
    "budget": "luxury"
  },
  "favorites": [1, 5, 10],
  "createTime": "2024-02-20T10:00:00"
}
```

---

## 🎯 数据特点

### 业务字段完整
- ✅ 订单状态机（6种状态）
- ✅ 评价5维度评分
- ✅ 取消规则和政策
- ✅ 操作日志记录
- ✅ 风险标记

### 数据真实性
- ✅ 基于Kaggle真实数据集
- ✅ 评分分布符合实际
- ✅ 订单状态分布合理
- ✅ 评价内容真实

### 携程风格
- ✅ 5维度评分（卫生、服务、隔音、位置、设施）
- ✅ 自动标签生成
- ✅ 情感分析
- ✅ 商家回复

---

## 🔧 自定义配置

### 修改数据量

编辑各个脚本中的 `limit` 参数：

```python
# 2_clean_hotels.py
hotels = extract_hotels(reviews_df, limit=80)  # 修改这里

# 3_clean_orders.py
orders = clean_orders(bookings_df, limit=400)  # 修改这里

# 4_clean_reviews.py
reviews = clean_reviews(reviews_df, limit=300)  # 修改这里

# 5_generate_users.py
users = generate_users(count=150)  # 修改这里
```

### 修改城市列表

编辑 `2_clean_hotels.py`:

```python
CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都']
```

### 修改标签和设施

编辑 `2_clean_hotels.py`:

```python
TAGS_POOL = ['免费取消', '近地铁', '含早餐', ...]
FACILITIES_POOL = ['WiFi', '停车场', '健身房', ...]
```

---

## 🐛 常见问题

### Q1: Kaggle API下载失败？
**A**: 检查网络连接，或手动下载数据集后放到 `data/raw/` 目录

### Q2: 找不到CSV文件？
**A**: 确保已运行步骤1下载数据，检查 `data/raw/` 目录

### Q3: 编码错误？
**A**: 确保使用UTF-8编码，Python 3.7+

### Q4: 数据量不够？
**A**: 修改各脚本中的 `limit` 参数

---

## 📈 数据统计

运行完成后会显示：

```
📊 数据统计:
  酒店: 80条
    城市分布: {'北京': 15, '上海': 12, ...}
    星级分布: {3: 10, 4: 35, 5: 35}
    平均价格: ¥850.00

  订单: 400条
    状态分布:
      completed: 200 (50.0%)
      cancelled: 80 (20.0%)
      confirmed: 60 (15.0%)
      ...
    平均订单金额: ¥1,250.00
    平均入住天数: 2.5天

  评价: 300条
    情感分布:
      positive: 180 (60.0%)
      neutral: 90 (30.0%)
      negative: 30 (10.0%)
    评分分布:
      5分: 120 (40.0%)
      4-5分: 120 (40.0%)
      3-4分: 45 (15.0%)
      3分以下: 15 (5.0%)

  用户: 150条
    角色分布:
      admin: 1
      merchant: 10
      user: 139
```

---

## 🎯 下一步

数据处理完成后：

1. **导入数据库**
   ```bash
   cd ../../backend
   node sql/import-data.js
   ```

2. **验证数据**
   - 检查数据库表
   - 测试API接口

3. **开始开发**
   - 任务11: 订单管理系统
   - 任务12: 用户评价系统

---

**版本**: v3.0  
**更新时间**: 2026-02-20  
**维护者**: Hotel Booking Team
