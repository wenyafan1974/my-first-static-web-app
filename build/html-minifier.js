const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

// Read the source HTML file
const sourcePath = path.join(__dirname, '../src/index.html');
const outputPath = path.join(__dirname, '../dist/index.html');

async function minifyHTML() {
  try {
  const html = fs.readFileSync(sourcePath, 'utf8');
  
  // Minify HTML with aggressive optimization
  const minified = await minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeTagWhitespace: true,
    sortAttributes: true,
    sortClassName: true
  });
  
  // Ensure dist directory exists
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  
  // Write minified HTML
  fs.writeFileSync(outputPath, minified);
  
  const originalSize = Buffer.byteLength(html, 'utf8');
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
  
  console.log(`✅ HTML minified successfully!`);
  console.log(`📊 Original size: ${originalSize} bytes`);
  console.log(`📊 Minified size: ${minifiedSize} bytes`);
  console.log(`💾 Size reduction: ${savings}%`);
  
  } catch (error) {
    console.error('❌ Error minifying HTML:', error.message);
    process.exit(1);
  }
}

minifyHTML();