const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = '/projects/tasks/auto-group-tabs-mid-pattern-regex/IconKitchen-Output/web/icon-512.png';
const targetDir = path.join(__dirname, 'src/static/icons');

const sizes = [
  { size: 16, name: 'icon16.png' },
  { size: 19, name: 'icon19.png' },
  { size: 48, name: 'icon48.png' },
  { size: 128, name: 'icon128.png' },
  { size: 256, name: 'icon256.png' }
];

async function resizeIcons() {
  console.log('Resizing icons from:', sourceIcon);
  console.log('Target directory:', targetDir);

  for (const { size, name } of sizes) {
    const outputPath = path.join(targetDir, name);
    console.log(`Creating ${name} (${size}x${size})...`);

    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Created ${name}`);
  }

  console.log('\n✓ All icons created successfully!');
}

resizeIcons().catch(err => {
  console.error('Error resizing icons:', err);
  process.exit(1);
});
