import json
from collections import Counter

# 读取酒店数据
with open('data/processed/hotels.json', 'r', encoding='utf-8') as f:
    hotels = json.load(f)

print(f"📊 酒店数据分析报告\n")
print(f"总酒店数: {len(hotels)}\n")

# 城市分布
cities = Counter([h['city'] for h in hotels])
print("🏙️  城市分布:")
for city, count in cities.most_common(15):
    print(f"   {city}: {count} 家")

# 星级分布
stars = Counter([h['stars'] for h in hotels])
print("\n⭐ 星级分布:")
for star in sorted(stars.keys(), reverse=True):
    print(f"   {star}星: {stars[star]} 家 ({stars[star]/len(hotels)*100:.1f}%)")

# 价格分布
prices = [h['basePrice'] for h in hotels]
print(f"\n💰 价格统计:")
print(f"   最低: ¥{min(prices)}")
print(f"   最高: ¥{max(prices)}")
print(f"   平均: ¥{sum(prices)//len(prices)}")
print(f"   中位数: ¥{sorted(prices)[len(prices)//2]}")

# 价格区间
price_ranges = {
    '0-200': 0,
    '200-500': 0,
    '500-1000': 0,
    '1000-2000': 0,
    '2000+': 0
}
for price in prices:
    if price < 200:
        price_ranges['0-200'] += 1
    elif price < 500:
        price_ranges['200-500'] += 1
    elif price < 1000:
        price_ranges['500-1000'] += 1
    elif price < 2000:
        price_ranges['1000-2000'] += 1
    else:
        price_ranges['2000+'] += 1

print(f"\n💵 价格区间分布:")
for range_name, count in price_ranges.items():
    print(f"   ¥{range_name}: {count} 家 ({count/len(hotels)*100:.1f}%)")

# 评分分布
ratings = [h['rating'] for h in hotels]
print(f"\n⭐ 评分统计:")
print(f"   平均评分: {sum(ratings)/len(ratings):.2f}")
print(f"   最高评分: {max(ratings)}")
print(f"   最低评分: {min(ratings)}")

# 数据完整性
with_images = sum(1 for h in hotels if h.get('images') and len(h['images']) > 0)
with_tags = sum(1 for h in hotels if h.get('tags') and len(h['tags']) > 0)
with_desc = sum(1 for h in hotels if h.get('description'))

print(f"\n📋 数据完整性:")
print(f"   有图片: {with_images}/{len(hotels)} ({with_images/len(hotels)*100:.1f}%)")
print(f"   有标签: {with_tags}/{len(hotels)} ({with_tags/len(hotels)*100:.1f}%)")
print(f"   有描述: {with_desc}/{len(hotels)} ({with_desc/len(hotels)*100:.1f}%)")

# 问题诊断
print(f"\n⚠️  数据特点分析:")
issues = []

if len(cities) < 10:
    issues.append(f"城市覆盖较少（仅 {len(cities)} 个城市）")

low_price = price_ranges['0-200']
if low_price > len(hotels) * 0.3:
    issues.append(f"低价酒店较多（{low_price} 家，占 {low_price/len(hotels)*100:.1f}%）")

high_star = stars.get(5, 0) + stars.get(4, 0)
if high_star > len(hotels) * 0.7:
    issues.append(f"高星级酒店比例高（4-5星共 {high_star} 家，占 {high_star/len(hotels)*100:.1f}%）")

if with_images < len(hotels) * 0.9:
    issues.append(f"部分酒店缺少图片（{len(hotels)-with_images} 家）")

if issues:
    for issue in issues:
        print(f"   ⚠️  {issue}")
else:
    print("   ✅ 数据分布合理")

print(f"\n💡 建议:")
print("   - 当前数据来自 Kaggle，已包含 80 家真实酒店")
print("   - 可以考虑:")
print("     1. 增加更多城市的酒店（目前主要集中在几个大城市）")
print("     2. 平衡价格分布（增加中高端酒店）")
print("     3. 补充缺失的图片数据")
print("     4. 从其他数据源导入更多酒店")
