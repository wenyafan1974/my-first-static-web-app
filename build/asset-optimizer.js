const fs = require('fs');
const path = require('path');

// This script handles asset optimization for images and other static files
// For now, it just copies assets, but can be extended for image optimization

const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');

function copyAssets() {
  try {
    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Copy any additional assets (images, fonts, etc.)
    const files = fs.readdirSync(srcDir);
    let copiedCount = 0;
    
    files.forEach(file => {
      const srcPath = path.join(srcDir, file);
      const distPath = path.join(distDir, file);
      
      // Skip HTML and CSS files (handled by other minifiers)
      if (file.endsWith('.html') || file.endsWith('.css')) {
        return;
      }
      
      // Copy other assets
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, distPath);
        copiedCount++;
        console.log(`📁 Copied: ${file}`);
      }
    });
    
    console.log(`✅ Asset optimization completed!`);
    console.log(`📊 Assets copied: ${copiedCount}`);
    
  } catch (error) {
    console.error('❌ Error optimizing assets:', error.message);
    process.exit(1);
  }
}

// Future: Add image optimization with imagemin
async function optimizeImages() {
  // This would use imagemin to optimize images
  // For now, just copy them
  console.log('🖼️  Image optimization placeholder - images copied as-is');
}

copyAssets();
optimizeImages();