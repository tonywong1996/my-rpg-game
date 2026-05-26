#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate skill effect sprites v2 - with transparent background processing
Uses MiniMax API to generate images, then removes dark backgrounds
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

# 每个技能的 Prompt 配置 - 统一要求纯黑背景，方便后续去背
SKILL_PROMPTS = [
    {
        "id": "basic_attack",
        "name": "基础剑诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (a single glowing flying sword:1.5), (golden sword energy trail:1.4), (arc slash),
(energy slash effect), (warm golden-orange glow), (pure black background:1.5), (no background elements:1.4),
(2D illustration game skill icon style:1.3), (straightforward visual),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "sweeping_sword",
        "name": "横扫千军",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (massive sweeping windslash arc:1.5), (cyan-green wind energy:1.4), (multiple sword energy waves),
(wide horizontal slash), (wind swirl particles), (powerful sweeping motion), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "sword_rain",
        "name": "万剑归宗",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (countless swords falling from sky:1.5), (blue-white sword rain:1.4), (dense sword formation),
(holy light shining down), (ethereal sword energy everywhere), (spectacular wide area attack), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "heal_spell",
        "name": "回春术",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (green healing circle:1.5), (nature energy swirl:1.4), (glowing green leaves and vines),
(soothing emerald light), (restorative aura), (gentle sparkling particles), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "ice_spell",
        "name": "寒冰诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (crystal ice shards:1.5), (freezing blue energy:1.4), (frost burst explosion),
(icy mist and snowflakes), (piercing ice crystals), (cold azure glow), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "fire_spell",
        "name": "烈火咒",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (raging fireball explosion:1.5), (blazing red-orange flames:1.4), (intense heat wave),
(fire vortex), (burning embers), (dazzling fire light), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "body_refine",
        "name": "炼体诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (golden body strengthening aura:1.5), (muscle energy lines:1.4), (glowing meridian channels),
(bronze-gold power surge), (body tempering light), (spiritual energy flowing), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "mind_cultivate",
        "name": "凝神诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (mind focus energy:1.5), (purple-blue spiritual light:1.4), (meditation aura),
(concentric energy rings), (calm centering light), (spiritual awakening glow), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "sword_mind",
        "name": "剑心诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (sword heart enlightenment:1.5), (spiritual sword energy:1.4), (transcendent blade aura),
(sword intent manifestation), (ethereal sword spirit), (piercing white-gold light), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "thunder_sword",
        "name": "雷影剑诀",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (lightning sword slash:1.5), (electric thunder energy:1.4), (brilliant yellow-white lightning bolts),
(thunder clouds with arcs), (electrified sword energy), (dramatic lightning strike), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "phoenix_fire",
        "name": "凤凰火",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (phoenix flame explosion:1.5), (golden-red divine fire:1.4), (phoenix wing shaped flame),
(holy flame vortex), (rebirth fire energy), (majestic fire bird shape), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "moon_heal",
        "name": "月华术",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (moonlight healing:1.5), (silvery-white lunar energy:1.4), (full moon behind flowing light),
(gentle moonbeam shower), (ethereal silver glow), (soothing celestial healing), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "shadow_step",
        "name": "影步",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (dark shadow strike:1.5), (purple-black shadow energy:1.4), (shadow afterimages),
(dark mist and silhouettes), (stealthy dark blade), (eerie purple glow), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "ice_barrier",
        "name": "寒冰障",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (ice barrier shield:1.5), (crystalline frost shield:1.4), (hexagonal ice pattern),
(frozen protective dome), (icy defensive wall), (blue-white frost armor), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
    {
        "id": "void_sword",
        "name": "虚空斩",
        "prompt": """Masterpiece, best quality, (anime style:1.4), (flat color shading:1.2), (cel-shaded:1.2), (vibrant anime colors:1.3),
(skill effect:1.3), (void space slash:1.5), (purple-white dimensional rift:1.4), (tearing reality effect),
(cosmic void energy), (space distortion), (otherworldly blade), (pure black background:1.5),
(2D illustration game skill icon style:1.3),
Negative prompt: No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details, no gradient background, no clouds."""
    },
]


def remove_dark_background(image_path, threshold=30):
    """Remove near-black background and convert to RGBA with transparency"""
    try:
        from PIL import Image
        import numpy as np
        
        img = Image.open(image_path).convert('RGBA')
        data = np.array(img)
        
        # Create mask: pixels where R, G, B are all below threshold
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
        
        # Near-black detection
        dark_mask = (r < threshold) & (g < threshold) & (b < threshold)
        
        # Also detect very dark pixels (luminance < threshold*3)
        luminance = r.astype(float) + g.astype(float) + b.astype(float)
        very_dark_mask = luminance < threshold * 3
        
        # Combine masks
        bg_mask = dark_mask | very_dark_mask
        
        # Set alpha to 0 for background pixels
        data[bg_mask, 3] = 0
        
        # Feather edges slightly (dilate the non-transparent area)
        result = Image.fromarray(data)
        result.save(image_path, 'PNG')
        print(f"  ✅ Transparent background applied: {image_path}")
        return True
    except Exception as e:
        print(f"  ⚠️ Background removal failed: {e}")
        return False


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
        
        print(f"  Saved raw image to: {output_file}")
        print(f"  Size: {len(image_bytes) / 1024:.2f} KB")
        
        # Remove dark background and save as transparent PNG
        remove_dark_background(str(output_file))
        
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
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate skill effect images')
    parser.add_argument('--all', action='store_true', help='Generate all skills')
    parser.add_argument('--skill', type=str, help='Generate specific skill by id')
    parser.add_argument('--reprocess', action='store_true', help='Only reprocess existing images (remove background)')
    args = parser.parse_args()
    
    print("=== Skill Effect Image Generator v2 ===")
    print(f"Output directory: {OUTPUT_DIR}")
    
    if args.reprocess:
        print("\n--- Reprocessing existing images (background removal only) ---")
        for skill_info in SKILL_PROMPTS:
            skill_id = skill_info["id"]
            file_path = Path(OUTPUT_DIR) / f"skill_{skill_id}.png"
            if file_path.exists():
                print(f"  Processing: {skill_info['name']} ({skill_id})...")
                remove_dark_background(str(file_path))
            else:
                print(f"  ⚠️ File not found: {skill_id}")
        print("\nDone!")
        return
    
    if args.skill:
        # Generate single skill
        skill_info = next((s for s in SKILL_PROMPTS if s["id"] == args.skill), None)
        if skill_info:
            generate_skill_image(skill_info)
        else:
            print(f"Error: Unknown skill id '{args.skill}'")
        return
    
    if args.all:
        # Generate all skills
        results = []
        for i, skill_info in enumerate(SKILL_PROMPTS):
            print(f"\n[{i+1}/{len(SKILL_PROMPTS)}] Processing {skill_info['name']}...")
            output = generate_skill_image(skill_info)
            if output:
                results.append({"id": skill_info["id"], "name": skill_info["name"], "status": "success"})
            else:
                results.append({"id": skill_info["id"], "name": skill_info["name"], "status": "failed"})
            if i < len(SKILL_PROMPTS) - 1:
                print("  Waiting 2 seconds...")
                time.sleep(2)
        
        # Print summary
        print("\n" + "="*60)
        print("RESULTS SUMMARY")
        print("="*60)
        success_count = sum(1 for r in results if r["status"] == "success")
        print(f"Total: {len(results)}, Success: {success_count}, Failed: {len(results) - success_count}")
        for r in results:
            status_icon = "✅" if r["status"] == "success" else "❌"
            print(f"  {status_icon} {r['name']} ({r['id']})")
        print("\nDone!")
        return
    
    # Default: show help
    parser.print_help()


if __name__ == "__main__":
    main()
