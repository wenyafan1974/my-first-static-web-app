#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting optimized build process...\n');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('📁 Created dist directory');
}

// Build steps
const buildSteps = [
  {
    name: 'Minify CSS',
    command: 'npx cleancss -o dist/styles.min.css src/styles.css',
    description: 'Minifying CSS for production'
  },
  {
    name: 'Process HTML',
    command: () => {
      // Read and process HTML
      let html = fs.readFileSync('src/index.html', 'utf8');
      
      // Replace CSS reference with minified version
      html = html.replace('styles.css', 'styles.min.css');
      
      // Add performance optimizations
      html = html.replace('<head>', `<head>
  <!-- Resource hints for better performance -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`);
      
      // Write processed HTML
      fs.writeFileSync('dist/index.html', html);
      
      // Now minify it
      execSync('npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --use-short-doctype --minify-css --minify-js -o dist/index.min.html dist/index.html');
      
      // Replace the regular with minified
      fs.renameSync('dist/index.min.html', 'dist/index.html');
    },
    description: 'Processing and minifying HTML'
  }
];

// Execute build steps
buildSteps.forEach((step, index) => {
  try {
    console.log(`${index + 1}. ${step.description}...`);
    
    if (typeof step.command === 'function') {
      step.command();
    } else {
      execSync(step.command, { stdio: 'inherit' });
    }
    
    console.log(`✅ ${step.name} completed\n`);
  } catch (error) {
    console.error(`❌ ${step.name} failed:`, error.message);
    process.exit(1);
  }
});

// Calculate and display bundle sizes
console.log('📊 Bundle Analysis:');
console.log('==================');

const getFileSize = (filePath) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return `${(stats.size / 1024).toFixed(2)} KB`;
  }
  return 'N/A';
};

const getGzipSize = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      const gzipSize = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf8' });
      return `${(parseInt(gzipSize.trim()) / 1024).toFixed(2)} KB`;
    } catch {
      return 'N/A';
    }
  }
  return 'N/A';
};

const files = [
  { name: 'HTML', path: 'dist/index.html' },
  { name: 'CSS', path: 'dist/styles.min.css' }
];

files.forEach(file => {
  const size = getFileSize(file.path);
  const gzipSize = getGzipSize(file.path);
  console.log(`${file.name.padEnd(8)} | ${size.padStart(8)} | ${gzipSize.padStart(8)} (gzipped)`);
});

console.log('\n🎉 Build completed successfully!');
console.log('💡 Run "npm run serve:prod" to test the production build');