#!/usr/bin/env python3
"""
图片下载脚本
用于下载 MiniMax API 返回的图片URL并保存到本地目录
"""

import os
import sys
import requests
from pathlib import Path

def download_image(url: str, output_dir: str, filename: str = None) -> str:
    """
    下载图片到本地目录
    
    Args:
        url: 图片URL
        output_dir: 输出目录
        filename: 可选的文件名
        
    Returns:
        保存的文件路径
    """
    # 确保输出目录存在
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 生成文件名
    if filename is None:
        # 从URL提取或生成时间戳文件名
        if "image_inference_output" in url:
            # 从URL提取文件名
            filename = url.split("/")[-1].split("?")[0]
        else:
            from datetime import datetime
            filename = f"image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    
    # 如果文件名没有扩展名，添加.jpg
    if "." not in filename:
        filename += ".jpg"
    
    file_path = output_path / filename
    
    # 下载图片 - 添加 Referer 头
    print(f"下载图片: {url}")
    print(f"保存到: {file_path}")
    
    headers = {
        'Referer': 'https://hailuoai.video/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, timeout=60, headers=headers)
    response.raise_for_status()
    
    with open(file_path, 'wb') as f:
        f.write(response.content)
    
    print(f"成功保存图片到: {file_path}")
    return str(file_path)


def main():
    if len(sys.argv) < 2:
        print("用法: python download_image.py <图片URL> [输出目录] [文件名]")
        print("示例: python download_image.py https://example.com/image.jpg f:/AiAgent/myRPGGame/assets/images thunder_muscle.png")
        sys.exit(1)
    
    url = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "f:/AiAgent/myRPGGame/assets/images"
    filename = sys.argv[3] if len(sys.argv) > 3 else None
    
    try:
        file_path = download_image(url, output_dir, filename)
        print(f"\n完成！文件保存位置: {file_path}")
    except Exception as e:
        print(f"下载失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
