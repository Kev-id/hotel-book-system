#!/usr/bin/env python3
"""
一键运行所有数据处理脚本
"""

import subprocess
import sys
import os

def run_script(script_name, description):
    """运行单个脚本"""
    print(f"\n{'='*60}")
    print(f"🚀 {description}")
    print(f"{'='*60}\n")
    
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            check=True,
            capture_output=False
        )
        print(f"\n✅ {description} - 完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ {description} - 失败")
        return False

def main():
    print("""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        🏨 酒店预订系统 - 数据处理工具链 v3.0              ║
║                                                          ║
║        基于Kaggle真实数据集                               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    scripts = [
        ('1_download_kaggle_data.py', '步骤1: 下载Kaggle数据集'),
        ('2_clean_hotels.py', '步骤2: 清洗酒店数据'),
        ('3_clean_orders.py', '步骤3: 清洗订单数据'),
        ('4_clean_reviews.py', '步骤4: 清洗评价数据'),
        ('5_generate_users.py', '步骤5: 生成用户数据'),
    ]
    
    success_count = 0
    for script, description in scripts:
        if run_script(script, description):
            success_count += 1
        else:
            print(f"\n⚠️  {description} 失败，是否继续？(y/n)")
            choice = input().strip().lower()
            if choice != 'y':
                break
    
    print(f"\n{'='*60}")
    print(f"📊 处理完成: {success_count}/{len(scripts)} 个步骤成功")
    print(f"{'='*60}\n")
    
    if success_count == len(scripts):
        print("✅ 所有数据处理完成！")
        print("\n📁 生成的文件:")
        print("  - data/processed/hotels.json")
        print("  - data/processed/orders.json")
        print("  - data/processed/reviews.json")
        print("  - data/processed/users.json")
        print("\n🎯 下一步:")
        print("  运行数据库导入脚本: node backend/sql/import-data.js")
    else:
        print("⚠️  部分步骤失败，请检查错误信息")

if __name__ == '__main__':
    main()
