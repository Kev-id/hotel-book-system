#!/usr/bin/env python3
"""
下载Kaggle数据集
使用前需要配置Kaggle API Token
"""

import os
import subprocess
import sys

# Kaggle数据集列表
DATASETS = [
    {
        'name': 'hotel-booking-demand',
        'url': 'jessemostipak/hotel-booking-demand',
        'files': ['hotel_bookings.csv']
    },
    {
        'name': 'hotel-reviews',
        'url': 'jiashenliu/515k-hotel-reviews-data-in-europe',
        'files': ['Hotel_Reviews.csv']
    }
]

def check_kaggle_setup():
    """检查Kaggle API是否配置"""
    kaggle_json = os.path.expanduser('~/.kaggle/kaggle.json')
    if not os.path.exists(kaggle_json):
        print("❌ Kaggle API未配置")
        print("\n请按以下步骤配置：")
        print("1. 访问 https://www.kaggle.com/settings")
        print("2. 点击 'Create New API Token'")
        print("3. 下载 kaggle.json 文件")
        print("4. 将文件放到 ~/.kaggle/ 目录")
        print("5. 在Linux/Mac上运行: chmod 600 ~/.kaggle/kaggle.json")
        return False
    return True

def download_dataset(dataset_url, output_dir):
    """下载单个数据集"""
    print(f"\n📥 下载数据集: {dataset_url}")
    
    try:
        cmd = f"kaggle datasets download -d {dataset_url} -p {output_dir} --unzip"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ 下载成功")
            return True
        else:
            print(f"❌ 下载失败: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ 下载出错: {str(e)}")
        return False

def main():
    print("🚀 开始下载Kaggle数据集\n")
    
    # 检查Kaggle配置
    if not check_kaggle_setup():
        sys.exit(1)
    
    # 创建输出目录
    output_dir = os.path.join(os.path.dirname(__file__), '../../data/raw')
    os.makedirs(output_dir, exist_ok=True)
    
    # 下载所有数据集
    success_count = 0
    for dataset in DATASETS:
        if download_dataset(dataset['url'], output_dir):
            success_count += 1
    
    print(f"\n✅ 完成！成功下载 {success_count}/{len(DATASETS)} 个数据集")
    print(f"📁 数据保存在: {output_dir}")
    
    # 检查文件
    print("\n📋 已下载的文件:")
    for root, dirs, files in os.walk(output_dir):
        for file in files:
            if file.endswith('.csv'):
                filepath = os.path.join(root, file)
                size_mb = os.path.getsize(filepath) / (1024 * 1024)
                print(f"  - {file} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    main()
