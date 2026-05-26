#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate a cheerful and exciting BGM for RPG game
Using MiniMax MCP Tool
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
import json
import time

# Set environment variables for MCP
os.environ["MINIMAX_API_KEY"] = "sk-cp-BuU8nWrptnUfjyWRg8PU7V4A0wGjVuW_cyJRuN5XI6PlVqLGZ2kVqbo1BB10Btz2PDo-qtpIVp9I7_N8-Gils51LZdQ-21ncTRO-umXjfPgTjoBL_xtAlZA"
os.environ["MINIMAX_API_HOST"] = "https://api.minimaxi.com"
os.environ["MINIMAX_MCP_BASE_PATH"] = "f:/AiAgent/myRPGGame/assets"
os.environ["MINIMAX_API_RESOURCE_MODE"] = "local"

OUTPUT_DIR = "f:/AiAgent/myRPGGame/assets"

# Music generation parameters - using music-2.6 model
PROMPT = "欢快热血的RPG游戏背景音乐，节奏明快，旋律激昂，高潮部分充满力量和激情，冒险旅途，充满希望"
LYRICS = """[verse]
晨光穿透森林
勇者踏上旅程
心中充满勇气
远方召唤响起
[chorus]
向前向前不回头
伙伴并肩作战
梦想就在前方
胜利属于我们"""

# Audio settings
SAMPLE_RATE = 44100
BITRATE = 256000
FORMAT = "mp3"


def generate_music():
    """Generate music using MiniMax MCP Tool"""
    
    print("Generating BGM using MCP Tool...")
    print(f"Prompt: {PROMPT}")
    print(f"Sample Rate: {SAMPLE_RATE}, Bitrate: {BITRATE}, Format: {FORMAT}")
    print("-" * 50)
    
    try:
        # Import MCP components after setting environment variables
        from mcp import CallToolResult
        from minimax_mcp.server import music_generation
        
        # Call the MCP tool directly
        result = music_generation(
            prompt=PROMPT,
            lyrics=LYRICS,
            sample_rate=SAMPLE_RATE,
            bitrate=BITRATE,
            format=FORMAT,
            output_directory=OUTPUT_DIR
        )
        
        # Handle the result
        if isinstance(result, CallToolResult):
            if result.content and len(result.content) > 0:
                text_content = result.content[0].text
                print(f"Result: {text_content}")
                
                # Check if successful
                if "Failed" in text_content:
                    print(f"Error: {text_content}")
                    return None
                    
                # Extract file path from result
                if "saved as:" in text_content:
                    file_path = text_content.split("saved as:")[-1].strip()
                    print("-" * 50)
                    print(f"Success! BGM generated!")
                    print(f"File: {file_path}")
                    return file_path
                elif "Music url:" in text_content:
                    url = text_content.split("Music url:")[-1].strip()
                    print("-" * 50)
                    print(f"Success! BGM generated!")
                    print(f"URL: {url}")
                    return url
            else:
                print("Error: No content in result")
                return None
        else:
            # Direct result (string)
            print(f"Result: {result}")
            return str(result)
        
    except ImportError as e:
        print(f"Import Error: {e}")
        print("Trying alternative method using requests...")
        return generate_music_fallback()
    except Exception as e:
        print(f"Error: {e}")
        # Fallback to direct API call if MCP fails
        print("Falling back to direct API call...")
        return generate_music_fallback()


def generate_music_fallback():
    """Fallback method using direct API call"""
    import requests
    from pathlib import Path
    
    API_KEY = os.environ.get("MINIMAX_API_KEY")
    API_HOST = os.environ.get("MINIMAX_API_HOST")
    
    url = f"{API_HOST}/v1/music_generation"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "music-2.6",
        "prompt": PROMPT,
        "lyrics": LYRICS,
        "audio_setting": {
            "sample_rate": SAMPLE_RATE,
            "bitrate": BITRATE,
            "format": FORMAT
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        print(f"API Response: {json.dumps(result, ensure_ascii=False, indent=2)}")
        
        # Check for errors
        if result.get('base_resp', {}).get('status_code') != 0:
            error_msg = result.get('base_resp', {}).get('status_msg', 'Unknown error')
            print(f"API Error: {error_msg}")
            return None
        
        # Get audio data
        data = result.get('data', {})
        audio_hex = data.get('audio', '')
        
        if not audio_hex:
            print("Error: No audio data in response")
            return None
            
        # Convert hex to bytes
        audio_bytes = bytes.fromhex(audio_hex)
        
        # Create output directory if not exists
        output_path = Path(OUTPUT_DIR)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = int(time.time())
        output_file = output_path / f"rpg_bgm_cheerful_{timestamp}.mp3"
        
        # Save audio file
        with open(output_file, 'wb') as f:
            f.write(audio_bytes)
        
        print("-" * 50)
        print(f"Success! BGM generated!")
        print(f"File: {output_file}")
        print(f"Size: {len(audio_bytes) / 1024:.2f} KB")
        
        return str(output_file)
        
    except Exception as e:
        print(f"Error: {e}")
        return None


if __name__ == "__main__":
    generate_music()
