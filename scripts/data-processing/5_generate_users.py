#!/usr/bin/env python3
"""
生成用户数据
"""

from faker import Faker
import json
import random
import os
from datetime import datetime, timedelta

fake = Faker('zh_CN')
random.seed(42)

def generate_users(count=150):
    """生成用户数据"""
    print(f"\n👥 生成用户数据 (目标: {count}条)")
    
    users = []
    
    # 生成管理员
    users.append({
        'id': 1,
        'username': 'admin',
        'email': 'admin@hotel.com',
        'phone': '13800138000',
        'password': 'admin123',  # 实际使用时应该加密
        'role': 'admin',
        'preferences': {
            'business': True,
            'leisure': True,
            'budget': 'luxury'
        },
        'favorites': [],
        'createTime': (datetime.now() - timedelta(days=730)).isoformat()
    })
    
    # 生成商户
    for i in range(2, 12):
        users.append({
            'id': i,
            'username': f'merchant{i}',
            'email': fake.email(),
            'phone': fake.phone_number(),
            'password': 'merchant123',
            'role': 'merchant',
            'preferences': {
                'business': True,
                'leisure': False,
                'budget': 'mid-range'
            },
            'favorites': [],
            'createTime': (datetime.now() - timedelta(days=random.randint(180, 730))).isoformat()
        })
    
    # 生成普通用户
    for i in range(12, count + 1):
        # 随机偏好
        preferences = {
            'business': random.random() > 0.5,
            'leisure': random.random() > 0.5,
            'budget': random.choice(['economy', 'mid-range', 'luxury'])
        }
        
        # 随机收藏（0-10个酒店）
        favorites = random.sample(range(1, 81), k=random.randint(0, 10))
        
        user = {
            'id': i,
            'username': fake.user_name(),
            'email': fake.email(),
            'phone': fake.phone_number(),
            'password': 'user123',
            'role': 'user',
            'preferences': preferences,
            'favorites': favorites,
            'createTime': (datetime.now() - timedelta(days=random.randint(1, 730))).isoformat()
        }
        
        users.append(user)
    
    print(f"✅ 生成 {len(users)} 条用户数据")
    return users

def save_users(users):
    """保存用户数据"""
    output_path = os.path.join(os.path.dirname(__file__), '../../data/processed/users.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)
    
    print(f"💾 保存到: {output_path}")
    
    # 统计信息
    print("\n📊 数据统计:")
    print(f"  总数: {len(users)} 条")
    
    role_dist = {}
    for user in users:
        role_dist[user['role']] = role_dist.get(user['role'], 0) + 1
    
    print(f"  角色分布:")
    for role, count in sorted(role_dist.items()):
        print(f"    {role}: {count}")
    
    # 偏好统计
    business_count = sum(1 for u in users if u['preferences']['business'])
    leisure_count = sum(1 for u in users if u['preferences']['leisure'])
    
    print(f"  偏好统计:")
    print(f"    商务出行: {business_count} ({business_count/len(users)*100:.1f}%)")
    print(f"    休闲度假: {leisure_count} ({leisure_count/len(users)*100:.1f}%)")

def main():
    print("🚀 开始生成用户数据\n")
    
    # 生成用户
    users = generate_users(count=150)
    
    # 保存数据
    save_users(users)
    
    print("\n✅ 用户数据生成完成！")

if __name__ == '__main__':
    main()
