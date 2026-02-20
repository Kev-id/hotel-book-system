#!/usr/bin/env python3
"""
清洗评价数据 - 生成5维度评分和情感标签
"""

import pandas as pd
import json
import random
from datetime import datetime, timedelta
import os
import re

random.seed(42)

# 情感关键词（简单规则）
POSITIVE_KEYWORDS = ['好', '干净', '舒适', '方便', '满意', '推荐', '不错', 'good', 'clean', 'comfortable', 'nice', 'excellent']
NEGATIVE_KEYWORDS = ['差', '脏', '吵', '不好', '失望', '糟糕', 'bad', 'dirty', 'noisy', 'poor', 'terrible']

def load_reviews_data():
    """加载评价数据"""
    csv_path = os.path.join(os.path.dirname(__file__), '../../data/raw/Hotel_Reviews.csv')
    
    if not os.path.exists(csv_path):
        print(f"❌ 找不到文件: {csv_path}")
        return None
    
    print(f"📖 读取评价数据: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"✅ 读取 {len(df)} 条评价数据")
    
    return df

def generate_dimensions(overall_score):
    """基于总分生成5维度评分"""
    base = overall_score / 2  # 转换为5分制
    
    dimensions = {
        'cleanliness': round(base + random.uniform(-0.5, 0.5), 1),
        'service': round(base + random.uniform(-0.5, 0.5), 1),
        'soundproof': round(base + random.uniform(-0.8, 0.3), 1),  # 隔音通常评分较低
        'location': round(base + random.uniform(-0.3, 0.5), 1),
        'facilities': round(base + random.uniform(-0.5, 0.5), 1)
    }
    
    # 确保评分在1-5之间
    for key in dimensions:
        dimensions[key] = max(1.0, min(5.0, dimensions[key]))
    
    return dimensions

def generate_tags(dimensions, content):
    """基于维度评分和内容生成标签"""
    tags = []
    
    # 基于维度评分
    if dimensions['cleanliness'] >= 4.5:
        tags.append('干净')
    elif dimensions['cleanliness'] <= 2.5:
        tags.append('卫生差')
    
    if dimensions['soundproof'] <= 3.0:
        tags.append('隔音差')
    elif dimensions['soundproof'] >= 4.5:
        tags.append('安静')
    
    if dimensions['service'] >= 4.5:
        tags.append('服务好')
    elif dimensions['service'] <= 2.5:
        tags.append('服务差')
    
    if dimensions['location'] >= 4.5:
        tags.append('位置方便')
    
    if dimensions['facilities'] >= 4.5:
        tags.append('设施完善')
    
    # 基于内容关键词
    content_lower = content.lower()
    if any(kw in content_lower for kw in ['breakfast', '早餐', 'food']):
        if any(kw in content_lower for kw in POSITIVE_KEYWORDS):
            tags.append('早餐好')
    
    if any(kw in content_lower for kw in ['wifi', '网络', 'internet']):
        if any(kw in content_lower for kw in POSITIVE_KEYWORDS):
            tags.append('网络好')
    
    return list(set(tags))[:5]  # 最多5个标签

def analyze_sentiment(overall_score, content):
    """分析情感倾向"""
    # 基于评分
    if overall_score >= 8.0:
        base_sentiment = 'positive'
    elif overall_score >= 6.0:
        base_sentiment = 'neutral'
    else:
        base_sentiment = 'negative'
    
    # 基于内容关键词微调
    content_lower = content.lower()
    positive_count = sum(1 for kw in POSITIVE_KEYWORDS if kw in content_lower)
    negative_count = sum(1 for kw in NEGATIVE_KEYWORDS if kw in content_lower)
    
    if positive_count > negative_count + 2:
        return 'positive'
    elif negative_count > positive_count + 2:
        return 'negative'
    else:
        return base_sentiment

def clean_reviews(reviews_df, limit=300):
    """清洗评价数据"""
    print(f"\n💬 清洗评价数据 (目标: {limit}条)")
    
    # 过滤掉空评价
    reviews_df = reviews_df[
        (reviews_df['Positive_Review'] != 'No Positive') | 
        (reviews_df['Negative_Review'] != 'No Negative')
    ]
    
    # 随机采样
    sample_df = reviews_df.sample(n=min(limit, len(reviews_df)))
    
    reviews = []
    for idx, row in sample_df.iterrows():
        try:
            # 合并正面和负面评价
            positive = row['Positive_Review'] if row['Positive_Review'] != 'No Positive' else ''
            negative = row['Negative_Review'] if row['Negative_Review'] != 'No Negative' else ''
            content = f"{positive} {negative}".strip()
            
            # 限制长度
            if len(content) > 500:
                content = content[:500] + '...'
            
            # 总评分
            overall_score = row['Reviewer_Score']
            overall_rating = round(overall_score / 2, 1)
            
            # 生成5维度评分
            dimensions = generate_dimensions(overall_score)
            
            # 生成标签
            tags = generate_tags(dimensions, content)
            
            # 情感分析
            sentiment = analyze_sentiment(overall_score, content)
            
            # 解析日期
            try:
                review_date = datetime.strptime(row['Review_Date'], '%m/%d/%Y')
            except:
                review_date = datetime.now() - timedelta(days=random.randint(1, 365))
            
            # 商家回复（10%概率）
            merchant_reply = None
            if random.random() < 0.1:
                reply_templates = [
                    '感谢您的评价，我们会继续努力提升服务质量！',
                    '非常感谢您的反馈，我们已经记录您的建议。',
                    '感谢您的入住，期待再次为您服务！',
                    '感谢您的宝贵意见，我们会及时改进。'
                ]
                merchant_reply = {
                    'content': random.choice(reply_templates),
                    'time': (review_date + timedelta(days=random.randint(1, 7))).isoformat()
                }
            
            review = {
                'id': idx + 1,
                'userId': random.randint(1, 200),
                'hotelId': random.randint(1, 80),
                'orderId': f'ORD{random.randint(100000, 999999)}',
                'overallRating': overall_rating,
                'dimensions': dimensions,
                'content': content,
                'images': [],  # 图片暂时为空
                'tags': tags,
                'sentiment': sentiment,
                'helpful': random.randint(0, 50),
                'reported': False,
                'merchantReply': merchant_reply,
                'createTime': review_date.isoformat()
            }
            
            reviews.append(review)
            
        except Exception as e:
            print(f"⚠️  跳过第 {idx} 行: {str(e)}")
            continue
    
    print(f"✅ 生成 {len(reviews)} 条评价数据")
    return reviews

def save_reviews(reviews):
    """保存评价数据"""
    output_path = os.path.join(os.path.dirname(__file__), '../../data/processed/reviews.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)
    
    print(f"💾 保存到: {output_path}")
    
    # 统计信息
    print("\n📊 数据统计:")
    print(f"  总数: {len(reviews)} 条")
    
    # 情感分布
    sentiment_dist = {}
    for review in reviews:
        sentiment_dist[review['sentiment']] = sentiment_dist.get(review['sentiment'], 0) + 1
    
    print(f"  情感分布:")
    for sentiment, count in sorted(sentiment_dist.items(), key=lambda x: x[1], reverse=True):
        percentage = count / len(reviews) * 100
        print(f"    {sentiment}: {count} ({percentage:.1f}%)")
    
    # 评分分布
    rating_ranges = {'5分': 0, '4-5分': 0, '3-4分': 0, '3分以下': 0}
    for review in reviews:
        rating = review['overallRating']
        if rating >= 4.5:
            rating_ranges['5分'] += 1
        elif rating >= 4.0:
            rating_ranges['4-5分'] += 1
        elif rating >= 3.0:
            rating_ranges['3-4分'] += 1
        else:
            rating_ranges['3分以下'] += 1
    
    print(f"  评分分布:")
    for range_name, count in rating_ranges.items():
        percentage = count / len(reviews) * 100
        print(f"    {range_name}: {count} ({percentage:.1f}%)")
    
    # 标签统计
    all_tags = []
    for review in reviews:
        all_tags.extend(review['tags'])
    
    tag_counts = {}
    for tag in all_tags:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    print(f"  热门标签:")
    for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"    {tag}: {count}次")

def main():
    print("🚀 开始清洗评价数据\n")
    
    # 加载数据
    reviews_df = load_reviews_data()
    if reviews_df is None:
        return
    
    # 清洗评价
    reviews = clean_reviews(reviews_df, limit=300)
    
    # 保存数据
    save_reviews(reviews)
    
    print("\n✅ 评价数据清洗完成！")

if __name__ == '__main__':
    main()
