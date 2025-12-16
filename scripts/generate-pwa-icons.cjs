#!/usr/bin/env node

/**
 * PWA Icon Generation Script
 * Converts SVG icon to multiple PNG sizes required for PWA
 * 
 * Usage: node scripts/generate-pwa-icons.js
 * 
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// PWA icon sizes required
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generatePWAIcons() {
  try {
    console.log('🎨 Generating PWA icons...');
    
    const svgPath = path.join(__dirname, '../public/icon.svg');
    const outputDir = path.join(__dirname, '../public');
    
    // Check if SVG source exists
    if (!fs.existsSync(svgPath)) {
      console.error('❌ Source icon.svg not found!');
      process.exit(1);
    }
    
    // Read SVG content
    const svgBuffer = fs.readFileSync(svgPath);
    console.log('📖 Read SVG source file');
    
    // Generate icons for each size
    for (const size of ICON_SIZES) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      try {
        await sharp(svgBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
          
        console.log(`✅ Generated icon-${size}x${size}.png`);
      } catch (error) {
        console.error(`❌ Failed to generate icon-${size}x${size}.png:`, error.message);
      }
    }
    
    console.log('🎉 PWA icon generation completed!');
    console.log('📁 Icons generated in public/ directory');
    
  } catch (error) {
    console.error('💥 Icon generation failed:', error);
    process.exit(1);
  }
}

// Check if sharp is available
try {
  require('sharp');
} catch (error) {
  console.error('❌ Sharp package not found!');
  console.error('💡 Install it with: npm install sharp');
  console.error('📝 For development: npm install --save-dev sharp');
  process.exit(1);
}

// Run the generator
generatePWAIcons();