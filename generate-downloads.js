const fs = require('fs');
const path = require('path');

/**
 * Script to automatically scan the downloads folder and generate
 * a configuration file with actual file sizes
 *
 * Run this script whenever you add new versions:
 * node generate-downloads.js
 */

const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const CHANGELOG_DIR = path.join(__dirname, 'changelog');
const OUTPUT_FILE = path.join(__dirname, 'js', 'downloads-data.js');
const CHANGELOG_OUTPUT_FILE = path.join(__dirname, 'js', 'changelog-data.js');

// Configuration for apps and platforms
const config = {
    apps: [
        { name: 'CCN Checker', prefix: 'ccn-Checker', iconColor: '#cba6f7' },
        { name: 'CVV Checker', prefix: 'cvv-Checker', iconColor: '#f5c2e7' }
    ],
    platforms: [
        { name: 'Windows x64', suffix: 'windows-x64.exe', description: 'For 64-bit Windows systems', icon: 'windows' },
        { name: 'Windows ARM64', suffix: 'windows-arm64.exe', description: 'For ARM64 Windows systems', icon: 'windows' },
        { name: 'macOS ARM64', suffix: 'macos-arm64.dmg', description: 'For Apple Silicon (M1/M2/M3)', icon: 'macos' },
        { name: 'macOS x64', suffix: 'macos-x64.dmg', description: 'For Intel-based Macs', icon: 'macos' },
        { name: 'Linux x64', suffix: 'linux-x64', description: 'For 64-bit Linux systems', icon: 'linux' }
    ]
};

// Get file size
function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (err) {
        console.warn(`Warning: Could not get size for ${filePath}`);
        return 0;
    }
}

// Extract version from folder name (e.g., "V2.0.1" -> "2.0.1")
function extractVersion(folderName) {
    return folderName.replace(/^V/, '');
}

// Scan downloads directory
function scanDownloads() {
    if (!fs.existsSync(DOWNLOADS_DIR)) {
        console.error(`Error: Downloads directory not found at ${DOWNLOADS_DIR}`);
        process.exit(1);
    }

    const versionFolders = fs.readdirSync(DOWNLOADS_DIR)
        .filter(item => {
            const itemPath = path.join(DOWNLOADS_DIR, item);
            return fs.statSync(itemPath).isDirectory() && item.match(/^V\d+\.\d+\.\d+$/);
        })
        .sort((a, b) => {
            // Sort versions in descending order (newest first)
            const versionA = extractVersion(a).split('.').map(Number);
            const versionB = extractVersion(b).split('.').map(Number);

            for (let i = 0; i < 3; i++) {
                if (versionB[i] !== versionA[i]) {
                    return versionB[i] - versionA[i];
                }
            }
            return 0;
        });

    if (versionFolders.length === 0) {
        console.error('Error: No version folders found in downloads directory');
        process.exit(1);
    }

    console.log(`Found ${versionFolders.length} version(s): ${versionFolders.join(', ')}`);

    const versions = versionFolders.map((folder, index) => {
        const version = extractVersion(folder);
        const versionPath = path.join(DOWNLOADS_DIR, folder);
        const isLatest = index === 0; // First item is latest due to sort

        console.log(`\nScanning version ${version}...`);

        const apps = config.apps.map(app => {
            const files = {};

            config.platforms.forEach(platform => {
                const fileName = `${version}-stable-${app.prefix}-by-annnekkk-${platform.suffix}`;
                const filePath = path.join(versionPath, fileName);
                const fileSize = getFileSize(filePath);

                if (fileSize > 0) {
                    files[platform.suffix] = fileSize;
                    console.log(`  ✓ ${fileName} (${formatBytes(fileSize)})`);
                } else {
                    console.log(`  ✗ ${fileName} (not found)`);
                }
            });

            return {
                name: app.name,
                prefix: app.prefix,
                iconColor: app.iconColor,
                files: files
            };
        });

        return {
            version: version,
            isLatest: isLatest,
            apps: apps
        };
    });

    return {
        versions: versions,
        platforms: config.platforms
    };
}

// Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Scan changelog directory
function scanChangelog() {
    if (!fs.existsSync(CHANGELOG_DIR)) {
        console.warn(`Warning: Changelog directory not found at ${CHANGELOG_DIR}`);
        return { versions: [] };
    }

    const versionFolders = fs.readdirSync(CHANGELOG_DIR)
        .filter(item => {
            const itemPath = path.join(CHANGELOG_DIR, item);
            return fs.statSync(itemPath).isDirectory() && item.match(/^V\d+\.\d+\.\d+$/);
        })
        .sort((a, b) => {
            // Sort versions in descending order (newest first)
            const versionA = extractVersion(a).split('.').map(Number);
            const versionB = extractVersion(b).split('.').map(Number);

            for (let i = 0; i < 3; i++) {
                if (versionB[i] !== versionA[i]) {
                    return versionB[i] - versionA[i];
                }
            }
            return 0;
        });

    if (versionFolders.length === 0) {
        console.warn('Warning: No version folders found in changelog directory');
        return { versions: [] };
    }

    console.log(`\nFound ${versionFolders.length} changelog version(s): ${versionFolders.join(', ')}`);

    const versions = versionFolders.map((folder, index) => {
        const version = extractVersion(folder);
        const versionPath = path.join(CHANGELOG_DIR, folder);
        const isLatest = index === 0; // First item is latest due to sort

        console.log(`\nScanning changelog ${version}...`);

        // Read changelog files
        const changelogData = {
            version: version,
            isLatest: isLatest,
            date: '',
            new: [],
            improved: [],
            fixed: [],
            breaking: []
        };

        // Read date.txt
        const dateFile = path.join(versionPath, 'date.txt');
        if (fs.existsSync(dateFile)) {
            const content = fs.readFileSync(dateFile, 'utf8').trim();
            changelogData.date = content;
            console.log(`  ✓ date.txt (${content})`);
        }

        // Read new.txt
        const newFile = path.join(versionPath, 'new.txt');
        if (fs.existsSync(newFile)) {
            const content = fs.readFileSync(newFile, 'utf8');
            changelogData.new = content
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            console.log(`  ✓ new.txt (${changelogData.new.length} items)`);
        }

        // Read improved.txt
        const improvedFile = path.join(versionPath, 'improved.txt');
        if (fs.existsSync(improvedFile)) {
            const content = fs.readFileSync(improvedFile, 'utf8');
            changelogData.improved = content
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            console.log(`  ✓ improved.txt (${changelogData.improved.length} items)`);
        }

        // Read fixed.txt
        const fixedFile = path.join(versionPath, 'fixed.txt');
        if (fs.existsSync(fixedFile)) {
            const content = fs.readFileSync(fixedFile, 'utf8');
            changelogData.fixed = content
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            console.log(`  ✓ fixed.txt (${changelogData.fixed.length} items)`);
        }

        // Read breaking.txt (optional)
        const breakingFile = path.join(versionPath, 'breaking.txt');
        if (fs.existsSync(breakingFile)) {
            const content = fs.readFileSync(breakingFile, 'utf8');
            changelogData.breaking = content
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            console.log(`  ✓ breaking.txt (${changelogData.breaking.length} items)`);
        }

        return changelogData;
    });

    return { versions: versions };
}

// Main execution
try {
    console.log('Scanning downloads folder...\n');
    const data = scanDownloads();

    // Ensure js directory exists
    const jsDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(jsDir)) {
        fs.mkdirSync(jsDir, { recursive: true });
    }

    // Write downloads data to file as JavaScript module
    const jsContent = `// This file is auto-generated by generate-downloads.js
// Do not edit manually - run: node generate-downloads.js

const downloadsData = ${JSON.stringify(data, null, 2)};
`;

    fs.writeFileSync(OUTPUT_FILE, jsContent);

    console.log(`\n✓ Successfully generated ${OUTPUT_FILE}`);
    console.log(`  Total versions: ${data.versions.length}`);
    console.log(`  Latest version: ${data.versions[0].version}`);

    // Scan and generate changelog data
    console.log('\n' + '='.repeat(50));
    console.log('Scanning changelog folder...');
    const changelogData = scanChangelog();

    if (changelogData.versions.length > 0) {
        // Write changelog data to file as JavaScript module
        const changelogJsContent = `// This file is auto-generated by generate-downloads.js
// Do not edit manually - run: node generate-downloads.js

const changelogData = ${JSON.stringify(changelogData, null, 2)};
`;

        fs.writeFileSync(CHANGELOG_OUTPUT_FILE, changelogJsContent);

        console.log(`\n✓ Successfully generated ${CHANGELOG_OUTPUT_FILE}`);
        console.log(`  Total changelog versions: ${changelogData.versions.length}`);
        console.log(`  Latest changelog version: ${changelogData.versions[0].version}`);
    } else {
        console.log('\n⚠ No changelog data found, skipping changelog-data.js generation');
    }

} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
