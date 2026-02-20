import pandas as pd
import os

print("📊 检查原始 Kaggle 数据\n")

# 检查 hotel_bookings.csv
bookings_file = 'data/raw/hotel_bookings.csv'
if os.path.exists(bookings_file):
    df = pd.read_csv(bookings_file)
    print(f"✅ hotel_bookings.csv")
    print(f"   总行数: {len(df):,}")
    print(f"   列数: {len(df.columns)}")
    print(f"\n   酒店类型分布:")
    print(df['hotel'].value_counts())
    print(f"\n   前5行数据:")
    print(df.head())
else:
    print(f"❌ 未找到 {bookings_file}")

print("\n" + "="*60 + "\n")

# 检查 Hotel_Reviews.csv
reviews_file = 'data/raw/Hotel_Reviews.csv'
if os.path.exists(reviews_file):
    df_reviews = pd.read_csv(reviews_file, nrows=1000)  # 只读前1000行
    print(f"✅ Hotel_Reviews.csv")
    print(f"   总行数: ~{len(df_reviews):,}+ (仅读取前1000行)")
    print(f"   列数: {len(df_reviews.columns)}")
    print(f"\n   酒店数量: {df_reviews['Hotel_Name'].nunique()}")
    print(f"\n   前10个酒店:")
    print(df_reviews['Hotel_Name'].value_counts().head(10))
else:
    print(f"❌ 未找到 {reviews_file}")
