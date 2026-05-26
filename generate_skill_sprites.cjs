// MiniMax Image Generation API for RPG Skill Effects
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_KEY = "sk-cp-BuU8nWrptnUfjyWRg8PU7V4A0wGjVuW_cyJRuN5XI6PlVqLGZ2kVqbo1BB10Btz2PDo-qtpIVp9I7_N8-Gils51LZdQ-21ncTRO-umXjfPgTjoBL_xtAlZA";
const API_HOST = "https://api.minimaxi.com";
const OUTPUT_DIR = path.resolve(__dirname, 'assets/images/skills');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// All 16 skill prompts for MiniMax
const SKILL_PROMPTS = [
    {
        id: "basic_attack",
        name: "基础剑诀",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, a single glowing flying sword with golden sword energy trail, simple but elegant slashing arc, " +
            "energy slash effect, warm golden-orange glow, clean dark void background, " +
            "2D illustration game skill icon style, straightforward visual"
    },
    {
        id: "sweeping_sword",
        name: "横扫千军",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, massive sweeping windslash arc, cyan-green wind energy, " +
            "multiple sword energy waves forming a wide horizontal slash, " +
            "wind swirl particles, powerful sweeping motion, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "sword_rain",
        name: "万剑归宗",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, countless swords falling from sky like rain, blue-white sword rain, dense sword formation, " +
            "holy light shining down, ethereal sword energy everywhere, spectacular wide area attack, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "heal_spell",
        name: "回春术",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, green healing circle, nature energy swirl, glowing green leaves and vines, " +
            "soothing emerald light, restorative aura, gentle sparkling particles, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "ice_spell",
        name: "寒冰诀",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, crystal ice shards, freezing blue energy, frost burst explosion, " +
            "icy mist and snowflakes, piercing ice crystals, cold azure glow, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "fire_spell",
        name: "烈火咒",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, raging fireball explosion, blazing red-orange flames, intense heat wave, " +
            "fire vortex, burning embers, dazzling fire light, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "body_refine",
        name: "炼体诀",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, golden body strengthening aura, muscle energy lines, glowing meridian channels, " +
            "bronze-gold power surge, body tempering light, spiritual energy flowing, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "mind_cultivate",
        name: "凝神诀",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, mind focus energy, purple-blue spiritual light, meditation aura, " +
            "concentric energy rings, calm centering light, spiritual awakening glow, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "sword_mind",
        name: "剑心诀",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, sword heart enlightenment, spiritual sword energy, transcendent blade aura, " +
            "sword intent manifestation, ethereal sword spirit, piercing white-gold light, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "thunder_sword",
        name: "雷影剑诀",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, lightning sword slash, electric thunder energy, brilliant yellow-white lightning bolts, " +
            "thunder clouds with arcs, electrified sword energy, dramatic lightning strike, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "phoenix_fire",
        name: "凤凰火",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, phoenix flame explosion, golden-red divine fire, phoenix wing shaped flame, " +
            "holy flame vortex, rebirth fire energy, majestic fire bird shape, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "moon_heal",
        name: "月华术",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, moonlight healing, silvery-white lunar energy, full moon behind flowing light, " +
            "gentle moonbeam shower, ethereal silver glow, soothing celestial healing, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "shadow_step",
        name: "影步",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, dark shadow strike, purple-black shadow energy, shadow afterimages, " +
            "dark mist and silhouettes, stealthy dark blade, eerie purple glow, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "ice_barrier",
        name: "寒冰障",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, ice barrier shield, crystalline frost shield, hexagonal ice pattern, " +
            "frozen protective dome, icy defensive wall, blue-white frost armor, clean dark background, " +
            "2D illustration game skill icon style"
    },
    {
        id: "void_sword",
        name: "虚空斩",
        prompt: "Masterpiece, best quality, anime style, flat color shading, cel-shaded, vibrant anime colors, " +
            "skill effect, void space slash, purple-white dimensional rift, tearing reality effect, " +
            "cosmic void energy, space distortion, otherworldly blade, clean dark background, " +
            "2D illustration game skill icon style"
    }
];

// Negative prompt to avoid unwanted elements
const NEGATIVE_PROMPT = "No photorealistic, no 3D rendering, no text, no watermark, no complex scene, no character, no face, no human, no messy details.";

function makeRequest(skillInfo) {
    return new Promise((resolve, reject) => {
        const skillId = skillInfo.id;
        const skillName = skillInfo.name;
        const prompt = skillInfo.prompt + ", " + NEGATIVE_PROMPT;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`[${skillId}] Generating: ${skillName}`);
        console.log(`${'='.repeat(60)}`);

        const url = new URL(`${API_HOST}/v1/image_generation`);

        const payload = JSON.stringify({
            model: "image-01",
            prompt: prompt,
            aspect_ratio: "1:1",
            n: 1
        });

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            timeout: 180000,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    // Check for errors
                    const statusCode = result?.base_resp?.status_code;
                    if (statusCode && statusCode !== 0) {
                        const errorMsg = result?.base_resp?.status_msg || 'Unknown error';
                        console.log(`  API Error: ${errorMsg}`);
                        resolve(null);
                        return;
                    }

                    // Get image URL
                    const imageUrls = result?.data?.image_urls || [];
                    const images = result?.data?.images || [];
                    let imageUrl = null;

                    if (imageUrls.length > 0) {
                        imageUrl = imageUrls[0];
                    } else if (images.length > 0) {
                        imageUrl = images[0]?.url || null;
                    }

                    if (!imageUrl) {
                        console.log(`  Error: No image URL in response`);
                        console.log(`  Response: ${JSON.stringify(result).substring(0, 500)}`);
                        resolve(null);
                        return;
                    }

                    // Download the image
                    console.log(`  Downloading image...`);
                    
                    const imgReq = https.get(imageUrl, (imgRes) => {
                        const chunks = [];
                        imgRes.on('data', (chunk) => chunks.push(chunk));
                        imgRes.on('end', () => {
                            const buffer = Buffer.concat(chunks);
                            
                            // Save file
                            const outputFile = path.join(OUTPUT_DIR, `skill_${skillId}.png`);
                            fs.writeFileSync(outputFile, buffer);
                            
                            console.log(`  ✅ Saved: skill_${skillId}.png (${(buffer.length / 1024).toFixed(2)} KB)`);
                            resolve(outputFile);
                        });
                    });
                    
                    imgReq.on('error', (err) => {
                        console.log(`  Error downloading image: ${err.message}`);
                        resolve(null);
                    });
                    
                    imgReq.setTimeout(60000, () => {
                        imgReq.destroy();
                        console.log(`  Error: Download timeout`);
                        resolve(null);
                    });

                } catch (e) {
                    console.log(`  Error parsing response: ${e.message}`);
                    console.log(`  Raw response: ${data.substring(0, 500)}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            console.log(`  Request error: ${err.message}`);
            resolve(null);
        });

        req.on('timeout', () => {
            req.destroy();
            console.log(`  Error: Request timeout`);
            resolve(null);
        });

        req.write(payload);
        req.end();
    });
}

async function main() {
    console.log('=== RPG Skill Effect Image Generator ===');
    console.log(`Total skills to generate: ${SKILL_PROMPTS.length}`);
    console.log(`Output directory: ${OUTPUT_DIR}\n`);

    // Process one by one
    for (let i = 0; i < SKILL_PROMPTS.length; i++) {
        const skill = SKILL_PROMPTS[i];
        console.log(`\n[${i + 1}/${SKILL_PROMPTS.length}] ${skill.name} (${skill.id})`);
        
        const result = await makeRequest(skill);
        
        // Wait between requests to avoid rate limiting
        if (i < SKILL_PROMPTS.length - 1) {
            console.log('  Waiting 3 seconds before next request...');
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('GENERATION COMPLETE');
    console.log('='.repeat(60));
    
    // Check which files were created
    const files = fs.readdirSync(OUTPUT_DIR);
    console.log(`Files in ${OUTPUT_DIR}:`);
    files.forEach(f => {
        const stats = fs.statSync(path.join(OUTPUT_DIR, f));
        console.log(`  ${f} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
}

main().catch(console.error);
