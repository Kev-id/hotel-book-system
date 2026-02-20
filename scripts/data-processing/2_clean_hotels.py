#!/usr/bin/env python3
"""
清洗酒店数据 - 从评价数据中提取酒店信息
"""

import pandas as pd
import json
import random
from faker import Faker
import os

fake = Faker('zh_CN')
random.seed(42)

# 中国主要城市
CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安', '南京', '武汉']

# 酒店标签池
TAGS_POOL = [
    '免费取消', '近地铁', '含早餐', '免费WiFi', '停车场', 
    '健身房', '游泳池', '商务中心', '会议室', '接送服务',
    '24小时前台', '行李寄存', '洗衣服务', '禁烟客房'
]

# 设施列表
FACILITIES_POOL = [
    'WiFi', '停车场', '健身房', '游泳池', '餐厅', '酒吧',
    '会议室', '商务中心', '洗衣服务', '行李寄存', '24小时前台',
    '禁烟客房', '空调', '暖气', '电梯', '无障碍设施'
]

def load_reviews_data():
    """加载评价数据"""
    csv_path = os.path.join(os.path.dirname(__file__), '../../data/raw/Hotel_Reviews.csv')
    
    if not os.path.exists(csv_path):
        print(f"❌ 找不到文件: {csv_path}")
        print("请先运行 1_download_kaggle_data.py 下载数据")
        return None
    
    print(f"📖 读取评价数据: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"✅ 读取 {len(df)} 条评价数据")
    
    return df

def extract_hotels(reviews_df, limit=200):
    """从评价数据中提取酒店信息"""
    print(f"\n🏨 提取酒店信息 (目标: {limit}条)")
    
    # 获取唯一酒店并计算统计信息
    hotel_stats = reviews_df.groupby('Hotel_Name').agg({
        'Reviewer_Score': ['mean', 'count'],
        'Hotel_Address': 'first'
    }).reset_index()
    
    hotel_stats.columns = ['name', 'avg_score', 'review_count', 'address']
    
    # 按评价数量排序，选择前N个
    hotel_stats = hotel_stats.sort_values('review_count', ascending=False).head(limit)
    
    hotels = []
    for idx, row in hotel_stats.iterrows():
        # 转换评分为5分制
        rating = round(row['avg_score'] / 2, 1)
        
        # 随机分配中国城市
        city = random.choice(CITIES)
        
        # 生成中文地址
        address = f"{city}市{fake.street_name()}{fake.building_number()}号"
        
        # 更合理的星级分配：根据评分和随机因素
        # 目标分布：3星 30%，4星 50%，5星 20%
        rand_factor = random.random()
        if rating >= 4.5 and rand_factor > 0.3:
            stars = 5
        elif rating >= 4.0 and rand_factor > 0.2:
            stars = 4
        elif rating >= 3.5:
            stars = random.choice([3, 4])  # 3.5-4.0 分的酒店可能是3星或4星
        else:
            stars = 3
        
        # 根据星级确定价格范围 - 更广的价格区间
        if stars == 5:
            base_price = random.randint(1000, 2500)
        elif stars == 4:
            base_price = random.randint(500, 1500)
        else:
            base_price = random.randint(150, 600)
        
        # 生成房型
        rooms = [
            {
                'type': '标准间',
                'price': base_price,
                'inventory': random.randint(10, 30),
                'area': random.randint(20, 30),
                'bedType': random.choice(['单人床', '双人床', '大床'])
            },
            {
                'type': '豪华间',
                'price': int(base_price * 1.5),
                'inventory': random.randint(5, 20),
                'area': random.randint(30, 45),
                'bedType': random.choice(['双人床', '大床', '双床'])
            },
            {
                'type': '套房',
                'price': int(base_price * 2.5),
                'inventory': random.randint(2, 10),
                'area': random.randint(50, 80),
                'bedType': '大床+沙发床'
            }
        ]
        
        # 取消政策
        cancel_hours = random.choice([24, 48, 72])
        cancel_policy = {
            'free_before_hours': cancel_hours,
            'penalty_rate': 0 if cancel_hours >= 48 else random.choice([0.1, 0.3]),
            'description': f'入住前{cancel_hours}小时可免费取消'
        }
        
        hotel = {
            'id': idx + 1,
            'name': row['name'],
            'city': city,
            'address': address,
            'stars': stars,
            'basePrice': base_price,
            'rating': rating,
            'reviewCount': int(row['review_count']),
            'tags': random.sample(TAGS_POOL, k=random.randint(4, 7)),
            'facilities': random.sample(FACILITIES_POOL, k=random.randint(8, 12)),
            'images': [
                f'https://picsum.photos/800/600?random={idx}1',
                f'https://picsum.photos/800/600?random={idx}2',
                f'https://picsum.photos/800/600?random={idx}3'
            ],
            'rooms': rooms,
            'coordinates': {
                'lat': round(random.uniform(22.5, 40.0), 6),
                'lng': round(random.uniform(103.0, 121.5), 6)
            },
            'checkInTime': '14:00',
            'checkOutTime': '12:00',
            'cancelPolicy': cancel_policy,
            'description': f'{row["name"]}位于{city}市中心，交通便利，设施完善。',
            'status': 'published'
        }
        
        hotels.append(hotel)
    
    print(f"✅ 提取 {len(hotels)} 条酒店数据")
    return hotels

def save_hotels(hotels):
    """保存酒店数据"""
    output_path = os.path.join(os.path.dirname(__file__), '../../data/processed/hotels.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(hotels, f, ensure_ascii=False, indent=2)
    
    print(f"💾 保存到: {output_path}")
    
    # 打印统计信息
    print("\n📊 数据统计:")
    print(f"  总数: {len(hotels)} 条")
    
    cities = {}
    stars_dist = {}
    for hotel in hotels:
        cities[hotel['city']] = cities.get(hotel['city'], 0) + 1
        stars_dist[hotel['stars']] = stars_dist.get(hotel['stars'], 0) + 1
    
    print(f"  城市分布: {dict(sorted(cities.items(), key=lambda x: x[1], reverse=True))}")
    print(f"  星级分布: {dict(sorted(stars_dist.items()))}")
    
    avg_price = sum(h['basePrice'] for h in hotels) / len(hotels)
    print(f"  平均价格: ¥{avg_price:.2f}")

def main():
    print("🚀 开始清洗酒店数据\n")
    
    # 加载评价数据
    reviews_df = load_reviews_data()
    if reviews_df is None:
        return
    
    # 提取酒店信息 - 增加到200家
    hotels = extract_hotels(reviews_df, limit=200)
    
    # 保存数据
    save_hotels(hotels)
    
    print("\n✅ 酒店数据清洗完成！")

if __name__ == '__main__':
    main()
