const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

// Read the source CSS file
const sourcePath = path.join(__dirname, '../src/styles.css');
const outputPath = path.join(__dirname, '../dist/styles.css');

try {
  const css = fs.readFileSync(sourcePath, 'utf8');
  
  // Minify CSS with optimization
  const minified = new CleanCSS({
    level: {
      1: {
        all: true,
        normalizeUrls: false
      },
      2: {
        all: true,
        mergeNonAdjacentRules: true,
        mergeMedia: true,
        mergeSemantically: true,
        overrideProperties: true,
        removeEmpty: true,
        reduceNonAdjacentRules: true,
        removeDuplicateFontRules: true,
        removeDuplicateMediaBlocks: true,
        removeDuplicateRules: true,
        removeEmpty: true,
        removeUnusedAtRules: true
      }
    },
    format: 'keep-breaks'
  }).minify(css);
  
  // Ensure dist directory exists
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  
  // Write minified CSS
  fs.writeFileSync(outputPath, minified.styles);
  
  const originalSize = Buffer.byteLength(css, 'utf8');
  const minifiedSize = Buffer.byteLength(minified.styles, 'utf8');
  const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
  
  console.log(`✅ CSS minified successfully!`);
  console.log(`📊 Original size: ${originalSize} bytes`);
  console.log(`📊 Minified size: ${minifiedSize} bytes`);
  console.log(`💾 Size reduction: ${savings}%`);
  
  if (minified.warnings.length > 0) {
    console.log(`⚠️  Warnings:`, minified.warnings);
  }
  
} catch (error) {
  console.error('❌ Error minifying CSS:', error.message);
  process.exit(1);
}