const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Crypto Miner Profit Calculator...');

// Controleer of electron-builder is geïnstalleerd
try {
  require('electron-builder');
} catch (error) {
  console.log('📦 Installing electron-builder...');
  execSync('npm install --save-dev electron-builder', { stdio: 'inherit' });
}

// Maak dist directory als deze niet bestaat
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Build de applicatie
console.log('🔨 Building application...');
try {
  execSync('npx electron-builder --win --publish=never', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
  console.log('📁 Check the dist/ folder for your executable');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 