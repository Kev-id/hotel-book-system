#!/usr/bin/env python3
"""
清洗订单数据 - 从Kaggle订单数据生成符合业务的订单
"""

import pandas as pd
import json
import random
from datetime import datetime, timedelta
import os

random.seed(42)

# 订单状态分布（模拟真实场景）
STATUS_DISTRIBUTION = {
    'completed': 0.50,    # 50% 已完成
    'cancelled': 0.20,    # 20% 已取消
    'confirmed': 0.15,    # 15% 已确认
    'checked_in': 0.05,   # 5% 已入住
    'checked_out': 0.05,  # 5% 已离店
    'pending': 0.05       # 5% 待确认
}

def load_booking_data():
    """加载订单数据"""
    csv_path = os.path.join(os.path.dirname(__file__), '../../data/raw/hotel_bookings.csv')
    
    if not os.path.exists(csv_path):
        print(f"❌ 找不到文件: {csv_path}")
        print("请先运行 1_download_kaggle_data.py 下载数据")
        return None
    
    print(f"📖 读取订单数据: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"✅ 读取 {len(df)} 条订单数据")
    
    return df

def generate_order_status(is_canceled, check_in_date):
    """根据取消状态和入住日期生成订单状态"""
    if is_canceled == 1:
        return 'cancelled'
    
    now = datetime.now()
    check_in = datetime.strptime(check_in_date, '%Y-%m-%d')
    
    # 根据日期判断状态
    if check_in > now + timedelta(days=7):
        # 未来订单
        return random.choices(
            ['pending', 'confirmed'],
            weights=[0.3, 0.7]
        )[0]
    elif check_in > now:
        # 即将入住
        return 'confirmed'
    elif check_in <= now and check_in > now - timedelta(days=30):
        # 最近30天的订单
        return random.choices(
            ['checked_in', 'checked_out', 'completed'],
            weights=[0.1, 0.2, 0.7]
        )[0]
    else:
        # 历史订单
        return 'completed'

def clean_orders(bookings_df, limit=400):
    """清洗订单数据"""
    print(f"\n📋 清洗订单数据 (目标: {limit}条)")
    
    # 随机采样
    sample_df = bookings_df.sample(n=min(limit, len(bookings_df)))
    
    orders = []
    for idx, row in sample_df.iterrows():
        try:
            # 构建入住日期
            year = int(row['arrival_date_year'])
            month = row['arrival_date_month']
            day = int(row['arrival_date_day_of_month'])
            
            # 月份转换
            month_map = {
                'January': 1, 'February': 2, 'March': 3, 'April': 4,
                'May': 5, 'June': 6, 'July': 7, 'August': 8,
                'September': 9, 'October': 10, 'November': 11, 'December': 12
            }
            month_num = month_map.get(month, 1)
            
            check_in_date = f"{year}-{month_num:02d}-{day:02d}"
            check_in = datetime.strptime(check_in_date, '%Y-%m-%d')
            
            # 计算入住天数
            nights = int(row['stays_in_weekend_nights']) + int(row['stays_in_week_nights'])
            if nights == 0:
                nights = 1
            
            check_out = check_in + timedelta(days=nights)
            
            # 生成订单状态
            status = generate_order_status(row['is_canceled'], check_in_date)
            
            # 生成订单ID
            order_id = f"ORD{year}{month_num:02d}{random.randint(100000, 999999)}"
            
            # 随机分配酒店和用户
            hotel_id = random.randint(1, 80)
            user_id = random.randint(1, 200)
            
            # 房型
            room_types = ['标准间', '豪华间', '套房']
            room_type = random.choice(room_types)
            
            # 价格计算
            base_price = random.randint(300, 1500)
            total_price = base_price * nights
            
            # 创建时间（入住前1-30天）
            create_time = check_in - timedelta(days=random.randint(1, 30))
            
            # 取消政策
            cancel_hours = random.choice([24, 48, 72])
            cancel_deadline = check_in - timedelta(hours=cancel_hours)
            cancel_policy = {
                'free_before_hours': cancel_hours,
                'penalty_rate': 0 if cancel_hours >= 48 else 0.3
            }
            
            # 操作日志
            logs = [{
                'time': create_time.isoformat(),
                'action': 'created',
                'operator': 'user'
            }]
            
            if status == 'confirmed':
                logs.append({
                    'time': (create_time + timedelta(hours=random.randint(1, 24))).isoformat(),
                    'action': 'confirmed',
                    'operator': 'merchant'
                })
            elif status == 'cancelled':
                cancel_time = create_time + timedelta(days=random.randint(1, 10))
                logs.append({
                    'time': cancel_time.isoformat(),
                    'action': 'cancelled',
                    'operator': 'user',
                    'reason': random.choice(['行程变更', '找到更好的酒店', '价格原因', '其他'])
                })
            elif status in ['checked_in', 'checked_out', 'completed']:
                logs.append({
                    'time': (create_time + timedelta(hours=2)).isoformat(),
                    'action': 'confirmed',
                    'operator': 'merchant'
                })
                logs.append({
                    'time': check_in.isoformat(),
                    'action': 'checked_in',
                    'operator': 'system'
                })
                if status in ['checked_out', 'completed']:
                    logs.append({
                        'time': check_out.isoformat(),
                        'action': 'checked_out',
                        'operator': 'system'
                    })
                if status == 'completed':
                    logs.append({
                        'time': (check_out + timedelta(days=1)).isoformat(),
                        'action': 'completed',
                        'operator': 'system'
                    })
            
            # 风险标记（10%概率）
            risk_flags = []
            if random.random() < 0.1:
                risk_flags.append('high_complaint_hotel')
            
            order = {
                'id': order_id,
                'userId': user_id,
                'hotelId': hotel_id,
                'roomType': room_type,
                'status': status,
                'checkInDate': check_in_date,
                'checkOutDate': check_out.strftime('%Y-%m-%d'),
                'nights': nights,
                'adults': int(row['adults']),
                'children': int(row['children']) + int(row['babies']),
                'totalPrice': total_price,
                'createTime': create_time.isoformat(),
                'updateTime': datetime.now().isoformat(),
                'cancelDeadline': cancel_deadline.isoformat(),
                'cancelPolicy': cancel_policy,
                'logs': logs,
                'riskFlags': risk_flags
            }
            
            orders.append(order)
            
        except Exception as e:
            print(f"⚠️  跳过第 {idx} 行: {str(e)}")
            continue
    
    print(f"✅ 生成 {len(orders)} 条订单数据")
    return orders

def save_orders(orders):
    """保存订单数据"""
    output_path = os.path.join(os.path.dirname(__file__), '../../data/processed/orders.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)
    
    print(f"💾 保存到: {output_path}")
    
    # 统计信息
    print("\n📊 数据统计:")
    print(f"  总数: {len(orders)} 条")
    
    status_dist = {}
    for order in orders:
        status_dist[order['status']] = status_dist.get(order['status'], 0) + 1
    
    print(f"  状态分布:")
    for status, count in sorted(status_dist.items(), key=lambda x: x[1], reverse=True):
        percentage = count / len(orders) * 100
        print(f"    {status}: {count} ({percentage:.1f}%)")
    
    avg_price = sum(o['totalPrice'] for o in orders) / len(orders)
    avg_nights = sum(o['nights'] for o in orders) / len(orders)
    print(f"  平均订单金额: ¥{avg_price:.2f}")
    print(f"  平均入住天数: {avg_nights:.1f}天")

def main():
    print("🚀 开始清洗订单数据\n")
    
    # 加载数据
    bookings_df = load_booking_data()
    if bookings_df is None:
        return
    
    # 清洗订单
    orders = clean_orders(bookings_df, limit=400)
    
    # 保存数据
    save_orders(orders)
    
    print("\n✅ 订单数据清洗完成！")

if __name__ == '__main__':
    main()
