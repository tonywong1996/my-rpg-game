#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate skill effect sprites for RPG game
Using MiniMax Image Generation API
Each skill gets a unique effect image
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
import json
import time
import requests
from pathlib import Path

# API 配置
API_KEY = "sk-cp-BuU8nWrptnUfjyWRg8PU7V4A0wGjVuW_cyJRuN5XI6PlVqLGZ2kVqbo1BB10Btz2PDo-qtpIVp9I7_N8-Gils51LZdQ-21ncTRO-umXjfPgTjoBL_xtAlZA"
API_HOST = "https://api.minimaxi.com"
OUTPUT_DIR = "f:/AiAgent/myRPGGame/assets/images/skills"

# 确保输出目录存在
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

# 每个技能的 Prompt 配置
SKILL_PROMPTS = [
    {
        "id": "basic_attack",
        "name": "基础剑诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (a single glowing flying sword:1.4), (golden sword energy trail:1.3), (simple but elegant slashing arc),
(energy slash effect), (warm golden-orange glow), (clean background:1.3), (dark void background:1.2),
(2D illustration game skill icon style:1.3), (straightforward visual),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "sweeping_sword",
        "name": "横扫千军",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (massive sweeping windslash arc:1.4), (cyan-green wind energy:1.3), (multiple sword energy waves),
(wide horizontal slash), (wind swirl particles), (powerful sweeping motion), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "sword_rain",
        "name": "万剑归宗",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (countless swords falling from sky:1.5), (blue-white sword rain:1.4), (dense sword formation),
(holy light shining down), (ethereal sword energy everywhere), (spectacular wide area attack), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "heal_spell",
        "name": "回春术",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (green healing circle:1.4), (nature energy swirl:1.3), (glowing green leaves and vines),
(soothing emerald light), (restorative aura), (gentle sparkling particles), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "ice_spell",
        "name": "寒冰诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (crystal ice shards:1.4), (freezing blue energy:1.3), (frost burst explosion),
(icy mist and snowflakes), (piercing ice crystals), (cold azure glow), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "fire_spell",
        "name": "烈火咒",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (raging fireball explosion:1.4), (blazing red-orange flames:1.3), (intense heat wave),
(fire vortex), (burning embers), (dazzling fire light), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "body_refine",
        "name": "炼体诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (golden body strengthening aura:1.4), (muscle energy lines:1.3), (glowing meridian channels),
(bronze-gold power surge), (body tempering light), (spiritual energy flowing), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "mind_cultivate",
        "name": "凝神诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (mind focus energy:1.4), (purple-blue spiritual light:1.3), (meditation aura),
(concentric energy rings), (calm centering light), (spiritual awakening glow), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "sword_mind",
        "name": "剑心诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (sword heart enlightenment:1.4), (spiritual sword energy:1.3), (transcendent blade aura),
(sword intent manifestation), (ethereal sword spirit), (piercing white-gold light), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "thunder_sword",
        "name": "雷影剑诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (lightning sword slash:1.5), (electric thunder energy:1.4), (brilliant yellow-white lightning bolts),
(thunder clouds with arcs), (electrified sword energy), (dramatic lightning strike), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "phoenix_fire",
        "name": "凤凰火",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (phoenix flame explosion:1.5), (golden-red divine fire:1.4), (phoenix wing shaped flame),
(holy flame vortex), (rebirth fire energy), (majestic fire bird shape), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "moon_heal",
        "name": "月华术",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (moonlight healing:1.5), (silvery-white lunar energy:1.4), (full moon behind flowing light),
(gentle moonbeam shower), (ethereal silver glow), (soothing celestial healing), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "shadow_step",
        "name": "影步",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (dark shadow strike:1.5), (purple-black shadow energy:1.4), (shadow afterimages),
(dark mist and silhouettes), (stealthy dark blade), (eerie purple glow), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "ice_barrier",
        "name": "寒冰障",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (ice barrier shield:1.5), (crystalline frost shield:1.4), (hexagonal ice pattern),
(frozen protective dome), (icy defensive wall), (blue-white frost armor), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
    {
        "id": "void_sword",
        "name": "虚空斩",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (void space slash:1.5), (purple-white dimensional rift:1.4), (tearing reality effect),
(cosmic void energy), (space distortion), (otherworldly blade), (clean dark background:1.2),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details."""
    },
]


def generate_skill_image(skill_info):
    """Generate a skill effect image using MiniMax API"""
    
    skill_id = skill_info["id"]
    skill_name = skill_info["name"]
    prompt = skill_info["prompt"]
    
    print(f"\n{'='*60}")
    print(f"Generating: {skill_name} ({skill_id})")
    print(f"{'='*60}")
    
    url = f"{API_HOST}/v1/image_generation"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "image-01",
        "prompt": prompt,
        "aspect_ratio": "1:1",
        "n": 1,
        "prompt_optimizer": True
    }
    
    try:
        print("  Sending request to MiniMax API...")
        response = requests.post(url, headers=headers, json=payload, timeout=180)
        response.raise_for_status()
        
        result = response.json()
        
        # Check for errors
        if result.get('base_resp', {}).get('status_code') != 0:
            error_msg = result.get('base_resp', {}).get('status_msg', 'Unknown error')
            print(f"  API Error: {error_msg}")
            return None
        
        # Get image data
        data = result.get('data', {})
        
        # Check for image_urls or images
        image_urls = data.get('image_urls', [])
        images = data.get('images', [])
        
        image_bytes = None
        
        if image_urls:
            image_url = image_urls[0]
            print(f"  Downloading image from: {image_url[:60]}...")
            img_response = requests.get(image_url, timeout=60)
            img_response.raise_for_status()
            image_bytes = img_response.content
        elif images:
            image_info = images[0]
            if 'url' in image_info:
                image_url = image_info['url']
                print(f"  Downloading image from: {image_url[:60]}...")
                img_response = requests.get(image_url, timeout=60)
                img_response.raise_for_status()
                image_bytes = img_response.content
            elif 'base64' in image_info:
                import base64
                image_base64 = image_info['base64']
                image_bytes = base64.b64decode(image_base64)
            else:
                print(f"  Error: Unknown image format: {image_info}")
                return None
        else:
            print("  Error: No images in response")
            return None
        
        # Save image file
        output_file = Path(OUTPUT_DIR) / f"skill_{skill_id}.png"
        with open(output_file, 'wb') as f:
            f.write(image_bytes)
        
        print(f"  Success! Saved to: {output_file}")
        print(f"  Size: {len(image_bytes) / 1024:.2f} KB")
        
        return str(output_file)
        
    except requests.exceptions.Timeout:
        print("  Error: Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"  Error: {e}")
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None


def main():
    print("=== Skill Effect Image Generator ===")
    print(f"Total skills: {len(SKILL_PROMPTS)}")
    print(f"Output directory: {OUTPUT_DIR}")
    
    results = []
    
    for i, skill_info in enumerate(SKILL_PROMPTS):
        print(f"\n[{i+1}/{len(SKILL_PROMPTS)}] Processing {skill_info['name']}...")
        
        output = generate_skill_image(skill_info)
        
        if output:
            results.append({"id": skill_info["id"], "name": skill_info["name"], "path": output, "status": "success"})
        else:
            results.append({"id": skill_info["id"], "name": skill_info["name"], "path": None, "status": "failed"})
        
        # 避免请求过快
        if i < len(SKILL_PROMPTS) - 1:
            print("  Waiting 2 seconds before next request...")
            time.sleep(2)
    
    # 打印结果汇总
    print("\n" + "="*60)
    print("RESULTS SUMMARY")
    print("="*60)
    success_count = sum(1 for r in results if r["status"] == "success")
    print(f"Total: {len(results)}, Success: {success_count}, Failed: {len(results) - success_count}")
    
    for r in results:
        status_icon = "✅" if r["status"] == "success" else "❌"
        print(f"  {status_icon} {r['name']} ({r['id']})")
    
    print("\nDone!")


if __name__ == "__main__":
    main()
