const fs = require('fs');
const path = require('path');

/**
 * Script to rename old files from "-stable-" format to new format
 * Old: {version}-stable-{app}-by-annnekkk-{platform}.{ext}
 * New: {version}-{app}-by-annnekkk-{platform}.{ext}
 *
 * Run this script: node rename-files.js
 */

const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

// Get all version folders
function getVersionFolders() {
    return fs.readdirSync(DOWNLOADS_DIR)
        .filter(item => {
            const itemPath = path.join(DOWNLOADS_DIR, item);
            return fs.statSync(itemPath).isDirectory() && item.match(/^V\d+\.\d+\.\d+$/);
        })
        .sort();
}

// Rename files in a version folder
function renameFilesInVersion(versionFolder) {
    const versionPath = path.join(DOWNLOADS_DIR, versionFolder);
    const files = fs.readdirSync(versionPath);

    let renamedCount = 0;
    let skippedCount = 0;

    files.forEach(filename => {
        // Check if file has old format (contains -stable-)
        if (filename.includes('-stable-')) {
            const newFilename = filename.replace('-stable-', '-');
            const oldPath = path.join(versionPath, filename);
            const newPath = path.join(versionPath, newFilename);

            // Check if new file already exists
            if (fs.existsSync(newPath)) {
                console.log(`  ⚠ Skipped (already exists): ${newFilename}`);
                skippedCount++;
            } else {
                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`  ✓ Renamed: ${filename} → ${newFilename}`);
                    renamedCount++;
                } catch (error) {
                    console.error(`  ✗ Error renaming ${filename}: ${error.message}`);
                }
            }
        }
    });

    return { renamedCount, skippedCount };
}

// Main execution
console.log('🔄 Starting file rename process...\n');

try {
    const versionFolders = getVersionFolders();

    if (versionFolders.length === 0) {
        console.log('No version folders found in downloads directory');
        process.exit(0);
    }

    console.log(`Found ${versionFolders.length} version folder(s): ${versionFolders.join(', ')}\n`);

    let totalRenamed = 0;
    let totalSkipped = 0;

    versionFolders.forEach(folder => {
        console.log(`📁 Processing ${folder}...`);
        const { renamedCount, skippedCount } = renameFilesInVersion(folder);
        totalRenamed += renamedCount;
        totalSkipped += skippedCount;
        console.log();
    });

    console.log('=' .repeat(50));
    console.log(`✅ Rename complete!`);
    console.log(`   Renamed: ${totalRenamed} files`);
    console.log(`   Skipped: ${totalSkipped} files`);
    console.log();
    console.log('Next steps:');
    console.log('1. Run: node generate-downloads.js');
    console.log('2. Test your downloads page');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
