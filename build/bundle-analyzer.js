const fs = require('fs');
const path = require('path');

function analyzeBundle() {
  const distDir = path.join(__dirname, '../dist');
  
  try {
    if (!fs.existsSync(distDir)) {
      console.log('❌ No dist directory found. Run "npm run build" first.');
      return;
    }
    
    const files = fs.readdirSync(distDir);
    let totalSize = 0;
    const fileSizes = {};
    
    files.forEach(file => {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      const sizeInBytes = stats.size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      
      fileSizes[file] = {
        bytes: sizeInBytes,
        kb: sizeInKB
      };
      
      totalSize += sizeInBytes;
    });
    
    const totalSizeKB = (totalSize / 1024).toFixed(2);
    
    console.log('📊 Bundle Analysis Report');
    console.log('========================');
    console.log(`📁 Total bundle size: ${totalSizeKB} KB`);
    console.log(`📁 Total files: ${files.length}`);
    console.log('');
    console.log('📄 File breakdown:');
    
    Object.entries(fileSizes)
      .sort(([,a], [,b]) => b.bytes - a.bytes)
      .forEach(([file, size]) => {
        console.log(`  ${file}: ${size.kb} KB (${size.bytes} bytes)`);
      });
    
    console.log('');
    console.log('🎯 Performance Recommendations:');
    
    if (totalSize > 1024 * 1024) { // > 1MB
      console.log('  ⚠️  Bundle is larger than 1MB - consider code splitting');
    }
    
    if (Object.keys(fileSizes).some(file => file.endsWith('.js') && fileSizes[file].bytes > 100 * 1024)) {
      console.log('  ⚠️  Large JavaScript files detected - consider minification');
    }
    
    if (Object.keys(fileSizes).some(file => file.endsWith('.css') && fileSizes[file].bytes > 50 * 1024)) {
      console.log('  ⚠️  Large CSS files detected - consider purging unused styles');
    }
    
    console.log('  ✅ Bundle size looks good for a vanilla JS app');
    
  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
  }
}

analyzeBundle();