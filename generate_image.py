#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate an image for RPG game village scene
Using MiniMax Image Generation API
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
import json
import time
import requests
from pathlib import Path

# Set environment variables
API_KEY = "sk-cp-BuU8nWrptnUfjyWRg8PU7V4A0wGjVuW_cyJRuN5XI6PlVqLGZ2kVqbo1BB10Btz2PDo-qtpIVp9I7_N8-Gils51LZdQ-21ncTRO-umXjfPgTjoBL_xtAlZA"
API_HOST = "https://api.minimaxi.com"
OUTPUT_DIR = "f:/AiAgent/myRPGGame/assets/images"

# Image generation prompt from user
PROMPT = """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3), (modern xianxia anime style:1.4), 
(wide shot of a fantasy newbie village:1.4), (bright sunny daytime), 
(central square with shops and stalls:1.3), (wooden and stone buildings with oriental eaves, floating spirit lanterns, jade decorations), 
(adventurer guild / character center building:1.3) (large signboard, mission board outside, glowing teleportation array at entrance), 
(various NPCs:1.3) (cultivator npcs in varied outfits, some in daoist robes, some in modern xianxia fusion wear, children playing, elder talking), 
(shop details: weapon shop with floating swords displayed, herb shop with glowing plants, talisman stall), 
(cute spirit rabbits and small floating artifacts as ambient life), 
(vibrant, bustling atmosphere:1.2), (clean lines, professional digital illustration, complex but tidy textures), 
(background: distant floating mountains, waterfalls, and a giant ancient sword statue), 
(azure blue sky with soft clouds), (isometric or slightly low angle view), (ethereal yet lively mood), (2D illustration:1.2). 
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no gloomy colors, no spooky elements, no deformed buildings, no ugly faces."""

# Image settings
MODEL = "image-01"
ASPECT_RATIO = "16:9"
N = 1
PROMPT_OPTIMIZER = True


def generate_image():
    """Generate image using MiniMax API"""
    
    print("Generating image using MiniMax API...")
    print(f"Model: {MODEL}, Aspect Ratio: {ASPECT_RATIO}")
    print("-" * 50)
    
    url = f"{API_HOST}/v1/image_generation"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL,
        "prompt": PROMPT,
        "aspect_ratio": ASPECT_RATIO,
        "n": N,
        "prompt_optimizer": PROMPT_OPTIMIZER
    }
    
    try:
        print("Sending request to MiniMax API...")
        response = requests.post(url, headers=headers, json=payload, timeout=180)
        response.raise_for_status()
        
        result = response.json()
        print(f"API Response: {json.dumps(result, ensure_ascii=False, indent=2)}")
        
        # Check for errors
        if result.get('base_resp', {}).get('status_code') != 0:
            error_msg = result.get('base_resp', {}).get('status_msg', 'Unknown error')
            print(f"API Error: {error_msg}")
            return None
        
        # Get image data
        data = result.get('data', {})
        
        # Check for image_urls (newer API format) or images (older format)
        image_urls = data.get('image_urls', [])
        images = data.get('images', [])
        
        if image_urls:
            # Newer API format with image_urls
            image_url = image_urls[0]
            print(f"Downloading image from: {image_url}")
            img_response = requests.get(image_url, timeout=60)
            img_response.raise_for_status()
            image_bytes = img_response.content
        elif images:
            # Older API format with images array
            image_info = images[0]
            if 'url' in image_info:
                image_url = image_info['url']
                print(f"Downloading image from: {image_url}")
                img_response = requests.get(image_url, timeout=60)
                img_response.raise_for_status()
                image_bytes = img_response.content
            elif 'base64' in image_info:
                image_base64 = image_info['base64']
                image_bytes = bytes.fromhex(image_base64)
            else:
                print(f"Error: Unknown image format: {image_info}")
                return None
        else:
            print("Error: No images in response")
            return None
        
        # Create output directory if not exists
        output_path = Path(OUTPUT_DIR)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = int(time.time())
        output_file = output_path / f"village_scene_{timestamp}.png"
        
        # Save image file
        with open(output_file, 'wb') as f:
            f.write(image_bytes)
        
        print("-" * 50)
        print(f"Success! Image generated!")
        print(f"File: {output_file}")
        print(f"Size: {len(image_bytes) / 1024:.2f} KB")
        
        return str(output_file)
        
    except requests.exceptions.Timeout:
        print("Error: Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None


if __name__ == "__main__":
    generate_image()
