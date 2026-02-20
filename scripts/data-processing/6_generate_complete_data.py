#!/usr/bin/env python3
"""
生成完整的业务数据 - 支持任务11-16的所有功能
包括：订单、评价、收藏、用户偏好、价格历史等
"""

import json
import random
from datetime import datetime, timedelta
from faker import Faker
import os

fake = Faker('zh_CN')
random.seed(42)

# 加载现有酒店数据
def load_hotels():
    hotels_path = os.path.join(os.path.dirname(__file__), '../../data/processed/hotels.json')
    with open(hotels_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 加载现有用户数据
def load_users():
    users_path = os.path.join(os.path.dirname(__file__), '../../data/processed/users.json')
    with open(users_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 生成订单数据（任务11）
def generate_orders(hotels, users, count=500):
    """
    生成完整的订单数据，包含：
    - 订单状态机的所有状态
    - 取消政策和截止时间
    - 操作日志
    - 风险标记
    - 价格计算
    """
    print(f"\n📋 生成订单数据 (目标: {count}条)")
    
    orders = []
    statuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled']
    status_weights = [0.1, 0.15, 0.05, 0.05, 0.45, 0.2]  # 完成和取消的比例较高
    
    for i in range(count):
        hotel = random.choice(hotels)
        user = random.choice(users)
        
        # 生成入住日期（过去3个月到未来3个月）
        days_offset = random.randint(-90, 90)
        check_in_date = datetime.now() + timedelta(days=days_offset)
        nights = random.randint(1, 7)
        check_out_date = check_in_date + timedelta(days=nights)
        
        # 选择房型和价格
        room = random.choice(hotel['rooms'])
        base_price = room['price']
        total_price = base_price * nights
        
        # 随机添加服务费和税费
        service_fee = round(total_price * 0.05, 2)
        tax = round(total_price * 0.06, 2)
        final_price = total_price + service_fee + tax
        
        # 选择订单状态
        status = random.choices(statuses, weights=status_weights)[0]
        
        # 根据入住日期调整状态的合理性
        if days_offset > 7:  # 未来订单
            status = random.choice(['pending', 'confirmed'])
        elif days_offset > 0:  # 即将入住
            status = random.choice(['confirmed', 'pending'])
        elif days_offset > -7:  # 最近入住
            status = random.choice(['checked_in', 'checked_out', 'completed'])
        else:  # 过去订单
            status = random.choice(['completed', 'cancelled'])
        
        # 生成取消截止时间
        cancel_policy = hotel.get('cancelPolicy', {
            'free_before_hours': random.choice([24, 48, 72]),
            'penalty_rate': random.choice([0, 0.1, 0.3]),
            'description': '入住前可免费取消'
        })
        
        cancel_deadline = check_in_date - timedelta(hours=cancel_policy['free_before_hours'])
        
        # 生成操作日志
        logs = [
            {
                'time': (check_in_date - timedelta(days=random.randint(1, 30))).isoformat(),
                'action': 'created',
                'operator': 'user',
                'note': '用户创建订单'
            }
        ]
        
        if status != 'pending':
            logs.append({
                'time': (check_in_date - timedelta(days=random.randint(1, 20))).isoformat(),
                'action': 'confirmed',
                'operator': 'merchant',
                'note': '商家确认订单'
            })
        
        if status in ['checked_in', 'checked_out', 'completed']:
            logs.append({
                'time': check_in_date.isoformat(),
                'action': 'checked_in',
                'operator': 'system',
                'note': '用户已入住'
            })
        
        if status in ['checked_out', 'completed']:
            logs.append({
                'time': check_out_date.isoformat(),
                'action': 'checked_out',
                'operator': 'system',
                'note': '用户已离店'
            })
        
        if status == 'completed':
            logs.append({
                'time': (check_out_date + timedelta(days=random.randint(1, 3))).isoformat(),
                'action': 'completed',
                'operator': 'system',
                'note': '订单已完成'
            })
        
        if status == 'cancelled':
            cancel_time = check_in_date - timedelta(days=random.randint(1, 15))
            logs.append({
                'time': cancel_time.isoformat(),
                'action': 'cancelled',
                'operator': 'user',
                'reason': random.choice([
                    '行程变更',
                    '找到更合适的酒店',
                    '价格原因',
                    '个人原因',
                    '酒店设施不符合预期'
                ]),
                'refundRate': 1.0 if cancel_time < cancel_deadline else (1 - cancel_policy['penalty_rate'])
            })
        
        # 生成风险标记（任务11差异化功能）
        risk_flags = []
        
        # 随机添加风险标记
        if random.random() < 0.1:  # 10%的订单有风险提示
            risk_type = random.choice([
                {
                    'type': 'high_complaint_hotel',
                    'message': '该酒店近期差评率较高，请谨慎预订',
                    'severity': 'warning'
                },
                {
                    'type': 'high_cancel_rate',
                    'message': '该酒店近期取消订单较多',
                    'severity': 'info'
                },
                {
                    'type': 'price_fluctuation',
                    'message': '该酒店价格波动较大，建议关注价格变化',
                    'severity': 'info'
                }
            ])
            risk_flags.append(risk_type)
        
        order = {
            'id': f'ORD{1000 + i}',
            'userId': user['id'],
            'hotelId': hotel['id'],
            'hotelName': hotel['name'],
            'roomType': room['type'],
            'status': status,
            'checkInDate': check_in_date.strftime('%Y-%m-%d'),
            'checkOutDate': check_out_date.strftime('%Y-%m-%d'),
            'nights': nights,
            'adults': random.randint(1, 3),
            'children': random.randint(0, 2),
            'basePrice': base_price,
            'totalPrice': round(final_price, 2),
            'serviceFee': service_fee,
            'tax': tax,
            'cancelDeadline': cancel_deadline.isoformat(),
            'cancelPolicy': cancel_policy,
            'logs': logs,
            'riskFlags': risk_flags,
            'createTime': logs[0]['time'],
            'updateTime': logs[-1]['time'],
            # 联系信息
            'contactName': user.get('username', fake.name()),
            'contactPhone': user.get('phone', fake.phone_number()),
            # 特殊需求
            'specialRequests': random.choice([
                None,
                '需要无烟房',
                '需要高楼层',
                '需要安静的房间',
                '需要婴儿床',
                '需要加床'
            ]) if random.random() < 0.3 else None
        }
        
        orders.append(order)
    
    print(f"✅ 生成 {len(orders)} 条订单数据")
    print(f"   状态分布:")
    for status in statuses:
        count = len([o for o in orders if o['status'] == status])
        print(f"   - {status}: {count} 条 ({count/len(orders)*100:.1f}%)")
    
    return orders

# 生成评价数据（任务12）
def generate_reviews(hotels, users, orders, count=800):
    """
    生成完整的评价数据，包含：
    - 5维度评分（清洁、服务、设施、位置、性价比）
    - 评价内容（正面+负面）
    - 评价标签
    - 情感分析
    - 点赞数
    - 商家回复
    - 评价图片
    """
    print(f"\n💬 生成评价数据 (目标: {count}条)")
    
    reviews = []
    
    # 评价标签池
    positive_tags = [
        '位置好', '服务好', '干净卫生', '性价比高', '设施齐全',
        '房间宽敞', '早餐丰富', '交通便利', '环境优美', '安静舒适'
    ]
    
    negative_tags = [
        '隔音差', '设施陈旧', '服务态度差', '卫生一般', '位置偏僻',
        '房间小', '价格偏高', '早餐单调', '网络不好', '停车不便'
    ]
    
    # 评价内容模板
    positive_templates = [
        '酒店位置很好，交通便利，房间干净整洁，服务态度也很好。',
        '性价比很高，设施齐全，早餐丰富，下次还会选择这里。',
        '房间宽敞明亮，床很舒服，睡得很好，推荐！',
        '前台服务很热情，帮忙解决了很多问题，非常满意。',
        '环境优美，安静舒适，适合度假休闲。'
    ]
    
    negative_templates = [
        '隔音效果不太好，晚上能听到隔壁的声音。',
        '设施有些陈旧，需要更新维护。',
        '房间比较小，和图片有些差距。',
        '早餐种类不多，味道一般。',
        '停车位紧张，不太方便。'
    ]
    
    # 只为已完成的订单生成评价
    completed_orders = [o for o in orders if o['status'] == 'completed']
    
    # 随机选择订单生成评价（不是所有完成的订单都有评价）
    review_orders = random.sample(completed_orders, min(count, len(completed_orders)))
    
    for i, order in enumerate(review_orders):
        hotel = next((h for h in hotels if h['id'] == order['hotelId']), None)
        if not hotel:
            continue
        
        user = next((u for u in users if u['id'] == order['userId']), None)
        if not user:
            continue
        
        # 生成5维度评分
        base_rating = random.uniform(3.0, 5.0)
        dimensions = {
            'cleanliness': round(base_rating + random.uniform(-0.5, 0.5), 1),
            'service': round(base_rating + random.uniform(-0.5, 0.5), 1),
            'facilities': round(base_rating + random.uniform(-0.5, 0.5), 1),
            'location': round(base_rating + random.uniform(-0.5, 0.5), 1),
            'value': round(base_rating + random.uniform(-0.5, 0.5), 1)
        }
        
        # 确保评分在1-5之间
        for key in dimensions:
            dimensions[key] = max(1.0, min(5.0, dimensions[key]))
        
        overall_rating = round(sum(dimensions.values()) / len(dimensions), 1)
        
        # 根据评分生成内容和标签
        if overall_rating >= 4.0:
            sentiment = 'positive'
            content = random.choice(positive_templates)
            tags = random.sample(positive_tags, k=random.randint(2, 4))
        elif overall_rating >= 3.0:
            sentiment = 'neutral'
            content = random.choice(positive_templates) + ' ' + random.choice(negative_templates)
            tags = random.sample(positive_tags + negative_tags, k=random.randint(2, 4))
        else:
            sentiment = 'negative'
            content = random.choice(negative_templates)
            tags = random.sample(negative_tags, k=random.randint(2, 4))
        
        # 生成评价图片（30%的评价有图片）
        images = []
        if random.random() < 0.3:
            num_images = random.randint(1, 4)
            images = [f'https://picsum.photos/800/600?random=review{i}{j}' for j in range(num_images)]
        
        # 生成商家回复（50%的评价有回复）
        merchant_reply = None
        if random.random() < 0.5:
            reply_time = datetime.fromisoformat(order['updateTime']) + timedelta(days=random.randint(1, 5))
            merchant_reply = {
                'content': random.choice([
                    '感谢您的评价，我们会继续努力提供更好的服务！',
                    '非常感谢您的反馈，我们会及时改进。',
                    '感谢您的支持，期待您的再次光临！',
                    '感谢您的宝贵意见，我们会认真对待。'
                ]),
                'time': reply_time.isoformat(),
                'replier': '酒店管理员'
            }
        
        review = {
            'id': 1000 + i,
            'userId': user['id'],
            'userName': user.get('username', fake.name()),
            'hotelId': hotel['id'],
            'hotelName': hotel['name'],
            'orderId': order['id'],
            'overallRating': overall_rating,
            'dimensions': dimensions,
            'content': content,
            'images': images,
            'tags': tags,
            'sentiment': sentiment,
            'helpful': random.randint(0, 50),
            'reported': False,
            'merchantReply': merchant_reply,
            'createTime': (datetime.fromisoformat(order['updateTime']) + timedelta(days=random.randint(1, 7))).isoformat()
        }
        
        reviews.append(review)
    
    print(f"✅ 生成 {len(reviews)} 条评价数据")
    print(f"   情感分布:")
    for sentiment in ['positive', 'neutral', 'negative']:
        count = len([r for r in reviews if r['sentiment'] == sentiment])
        print(f"   - {sentiment}: {count} 条 ({count/len(reviews)*100:.1f}%)")
    
    return reviews

# 生成收藏数据（任务13）
def generate_favorites(hotels, users, count=300):
    """
    生成收藏数据，包含：
    - 收藏时间
    - 收藏分类（商务/度假/性价比）
    - 收藏备注
    """
    print(f"\n⭐ 生成收藏数据 (目标: {count}条)")
    
    favorites = []
    categories = ['business', 'vacation', 'value', 'family', 'luxury']
    category_names = {
        'business': '商务出行',
        'vacation': '度假休闲',
        'value': '性价比',
        'family': '亲子出游',
        'luxury': '豪华享受'
    }
    
    for i in range(count):
        user = random.choice(users)
        hotel = random.choice(hotels)
        
        # 根据酒店星级自动分类
        if hotel['stars'] >= 5:
            category = random.choice(['luxury', 'business'])
        elif hotel['stars'] >= 4:
            category = random.choice(['business', 'vacation', 'family'])
        else:
            category = random.choice(['value', 'family'])
        
        favorite = {
            'id': 1000 + i,
            'userId': user['id'],
            'hotelId': hotel['id'],
            'hotelName': hotel['name'],
            'category': category,
            'categoryName': category_names[category],
            'note': random.choice([
                None,
                '下次出差可以考虑',
                '适合带家人来',
                '性价比不错',
                '位置很好',
                '环境优美'
            ]) if random.random() < 0.4 else None,
            'createTime': (datetime.now() - timedelta(days=random.randint(1, 180))).isoformat()
        }
        
        favorites.append(favorite)
    
    print(f"✅ 生成 {len(favorites)} 条收藏数据")
    print(f"   分类分布:")
    for cat in categories:
        count = len([f for f in favorites if f['category'] == cat])
        print(f"   - {category_names[cat]}: {count} 条")
    
    return favorites

# 生成价格历史数据（任务14、16）
def generate_price_history(hotels, days=90):
    """
    生成价格历史数据，用于：
    - 价格趋势分析
    - 智能定价建议
    """
    print(f"\n💰 生成价格历史数据 (最近{days}天)")
    
    price_history = []
    
    for hotel in hotels:
        base_price = hotel['basePrice']
        
        for day_offset in range(-days, 1):
            date = datetime.now() + timedelta(days=day_offset)
            
            # 周末价格上涨
            is_weekend = date.weekday() >= 5
            weekend_factor = 1.2 if is_weekend else 1.0
            
            # 节假日价格上涨
            is_holiday = date.month in [1, 2, 5, 10] and date.day <= 7
            holiday_factor = 1.5 if is_holiday else 1.0
            
            # 随机波动
            random_factor = random.uniform(0.9, 1.1)
            
            final_price = round(base_price * weekend_factor * holiday_factor * random_factor, 2)
            
            # 入住率（影响定价）
            occupancy_rate = random.uniform(0.5, 0.95)
            
            price_history.append({
                'hotelId': hotel['id'],
                'date': date.strftime('%Y-%m-%d'),
                'price': final_price,
                'occupancyRate': round(occupancy_rate, 2),
                'isWeekend': is_weekend,
                'isHoliday': is_holiday
            })
    
    print(f"✅ 生成 {len(price_history)} 条价格历史记录")
    
    return price_history

# 生成用户偏好数据（任务13、16）
def generate_user_preferences(users):
    """
    生成用户偏好数据，用于：
    - 个性化推荐
    - 智能对比
    """
    print(f"\n👤 生成用户偏好数据")
    
    for user in users:
        user['preferences'] = {
            'priceRange': {
                'min': random.choice([100, 200, 300, 500]),
                'max': random.choice([500, 800, 1000, 2000])
            },
            'starPreference': random.choice([3, 4, 5]),
            'facilities': random.sample([
                'WiFi', '停车场', '健身房', '游泳池', '餐厅',
                '会议室', '商务中心', '洗衣服务'
            ], k=random.randint(3, 6)),
            'location': random.choice(['市中心', '商业区', '景区附近', '交通枢纽']),
            'purpose': random.choice(['business', 'vacation', 'family']),
            'bookingFrequency': random.choice(['frequent', 'occasional', 'rare'])
        }
        
        user['favorites'] = []
    
    print(f"✅ 更新 {len(users)} 个用户的偏好数据")
    
    return users

# 保存数据
def save_data(data, filename):
    output_path = os.path.join(os.path.dirname(__file__), f'../../data/processed/{filename}')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"💾 保存到: {output_path}")

def main():
    print("🚀 开始生成完整业务数据\n")
    print("=" * 60)
    
    # 加载基础数据
    print("\n📖 加载基础数据...")
    hotels = load_hotels()
    users = load_users()
    print(f"✅ 加载 {len(hotels)} 家酒店")
    print(f"✅ 加载 {len(users)} 个用户")
    
    # 生成各类数据
    orders = generate_orders(hotels, users, count=500)
    reviews = generate_reviews(hotels, users, orders, count=800)
    favorites = generate_favorites(hotels, users, count=300)
    price_history = generate_price_history(hotels, days=90)
    users = generate_user_preferences(users)
    
    # 保存数据
    print("\n" + "=" * 60)
    print("\n💾 保存数据...")
    save_data(orders, 'orders_complete.json')
    save_data(reviews, 'reviews_complete.json')
    save_data(favorites, 'favorites.json')
    save_data(price_history, 'price_history.json')
    save_data(users, 'users_complete.json')
    
    # 统计信息
    print("\n" + "=" * 60)
    print("\n📊 数据生成完成！")
    print(f"\n数据统计:")
    print(f"  - 酒店: {len(hotels)} 家")
    print(f"  - 用户: {len(users)} 个")
    print(f"  - 订单: {len(orders)} 条")
    print(f"  - 评价: {len(reviews)} 条")
    print(f"  - 收藏: {len(favorites)} 条")
    print(f"  - 价格历史: {len(price_history)} 条")
    
    print(f"\n🎯 支持的功能:")
    print(f"  ✅ 任务11: 订单管理系统（订单状态机、风险预警、取消提醒）")
    print(f"  ✅ 任务12: 用户评价系统（5维度评分、情感分析、商家回复）")
    print(f"  ✅ 任务13: 收藏与智能对比（收藏分类、用户偏好）")
    print(f"  ✅ 任务14: 数据分析看板（价格趋势、入住率分析）")
    print(f"  ✅ 任务15: 评价智能分析（情感分析、标签提取）")
    print(f"  ✅ 任务16: 智能定价建议（价格历史、趋势分析）")
    
    print(f"\n🎉 所有数据生成完成！")

if __name__ == '__main__':
    main()
