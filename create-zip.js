const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'pattern-auto-tab-grouper-v1.1.0.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', function() {
  console.log(`✅ Created pattern-auto-tab-grouper-v1.1.0.zip (${archive.pointer()} bytes)`);
  console.log('📦 Ready for Chrome Web Store submission!');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Add all files from extension directory except source maps
archive.directory('extension/', false, (entry) => {
  if (entry.name.endsWith('.map')) {
    return false; // Exclude source maps
  }
  return entry;
});

archive.finalize();
