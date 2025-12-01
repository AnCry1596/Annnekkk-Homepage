// SVG Icons
const icons = {
    windows: (color) => `
        <svg class="platform-icon" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 12.5L35.5 8.5L35.5 41.5H0V12.5Z" fill="${color}"/>
            <path d="M40.5 8L78 3.5V41.5H40.5V8Z" fill="${color}"/>
            <path d="M0 46.5H35.5V79.5L0 75.5V46.5Z" fill="${color}"/>
            <path d="M40.5 46.5H78V84.5L40.5 80V46.5Z" fill="${color}"/>
        </svg>
    `,
    macos: (color) => `
        <svg class="platform-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="${color}"/>
        </svg>
    `,
    linux: (color) => `
        <svg class="platform-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 2C12.5 2 8.85 2.02 6.5 4.5C6.5 4.5 4.5 6.84 4.5 10.5C4.5 10.5 4.48 14.16 6.5 16.5L11.71 21.71C11.8 21.8 11.9 21.85 12 21.87C12.1 21.85 12.2 21.8 12.29 21.71L17.5 16.5C17.5 16.5 19.52 14.16 19.5 10.5C19.5 10.5 19.5 6.84 17.5 4.5C17.5 4.5 15.15 2.02 11.5 2C11.83 2 12.17 2 12.5 2Z" stroke="${color}" stroke-width="1.5" fill="none"/>
            <path d="M8.5 10.5L11 13L15.5 8.5" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
    `
};

// Detect if device is mobile
function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();

    // Check for mobile OS
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isWindowsPhone = /windows phone/i.test(userAgent);

    // Check for touch and screen size
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;

    return isAndroid || isIOS || isWindowsPhone || (isTouchDevice && isSmallScreen);
}

// Get mobile device type
function getMobileDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/i.test(userAgent)) {
        return 'iOS';
    } else if (/android/i.test(userAgent)) {
        return 'Android';
    } else if (/windows phone/i.test(userAgent)) {
        return 'Windows Phone';
    }

    return 'Mobile';
}

// Detect user's platform
function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    // Detect OS
    let os = 'unknown';
    let arch = 'x64';

    if (platform.includes('win')) {
        os = 'windows';
    } else if (platform.includes('mac') || platform.includes('darwin')) {
        os = 'macos';
    } else if (platform.includes('linux')) {
        os = 'linux';
    }

    // Detect architecture
    if (userAgent.includes('arm') || userAgent.includes('aarch64')) {
        arch = 'arm64';
    } else if (userAgent.includes('x86_64') || userAgent.includes('x64') || userAgent.includes('amd64')) {
        arch = 'x64';
    }

    // Special handling for Apple Silicon
    if (os === 'macos') {
        // Check for Apple Silicon
        if (userAgent.includes('mac') && (userAgent.includes('arm') || screen.width >= 2560)) {
            arch = 'arm64';
        }
    }

    return { os, arch };
}

// Get recommended platform suffix
function getRecommendedPlatform() {
    const { os, arch } = detectPlatform();

    if (os === 'windows') {
        return arch === 'arm64' ? 'windows-arm64.exe' : 'windows-x64.exe';
    } else if (os === 'macos') {
        return arch === 'arm64' ? 'macos-arm64.dmg' : 'macos-x64.dmg';
    } else if (os === 'linux') {
        return 'linux-x64';
    }

    return null;
}

// Get platform display name
function getPlatformDisplayName(suffix) {
    const platformMap = {
        'windows-x64.exe': 'Windows (64-bit)',
        'windows-arm64.exe': 'Windows ARM64',
        'macos-arm64.dmg': 'macOS (Apple Silicon)',
        'macos-x64.dmg': 'macOS (Intel)',
        'linux-x64': 'Linux (64-bit)'
    };
    return platformMap[suffix] || suffix;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Create download card HTML
function createDownloadCard(version, app, platform, isRecommended = false) {
    const fileName = `${version.version}-stable-${app.prefix}-by-annnekkk-${platform.suffix}`;
    const fileUrl = `downloads/V${version.version}/${fileName}`;

    // Get actual file size from the app's files data
    const fileSize = app.files && app.files[platform.suffix]
        ? formatFileSize(app.files[platform.suffix])
        : 'N/A';

    const icon = icons[platform.icon](app.iconColor);
    const recommendedBadge = isRecommended
        ? '<span class="recommended-badge">Recommended for you</span>'
        : '';
    const recommendedClass = isRecommended ? ' recommended' : '';

    return `
        <div class="download-card${recommendedClass}">
            ${recommendedBadge}
            ${icon}
            <div class="platform-name">${platform.name}</div>
            <div class="file-info">
                ${platform.description}
                <span class="file-size">${fileSize}</span>
            </div>
            <a href="${fileUrl}" class="download-btn" download>Download</a>
        </div>
    `;
}

// Create app section HTML
function createAppSection(version, app, downloadData, recommendedPlatform) {
    const downloadsHtml = downloadData.platforms
        .map(platform => {
            const isRecommended = version.isLatest && recommendedPlatform === platform.suffix;
            return createDownloadCard(version, app, platform, isRecommended);
        })
        .join('');

    return `
        <div class="app-section">
            <h3 class="app-title">${app.name}</h3>
            <div class="downloads-grid">
                ${downloadsHtml}
            </div>
        </div>
    `;
}

// Create version section HTML
function createVersionSection(version, downloadData, recommendedPlatform) {
    const latestBadge = version.isLatest
        ? '<span class="latest-badge">LATEST</span>'
        : '';

    const appsHtml = version.apps
        .map(app => createAppSection(version, app, downloadData, recommendedPlatform))
        .join('');

    return `
        <div class="version-section">
            <div class="version-header">
                <span class="version-tag">v${version.version}</span>
                ${latestBadge}
            </div>
            ${appsHtml}
        </div>
    `;
}

// Create mobile warning banner
function createMobileWarningBanner() {
    const deviceType = getMobileDeviceType();

    return `
        <div class="mobile-warning-banner">
            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#f38ba8"/>
            </svg>
            <div class="warning-content">
                <h3>Mobile Device Detected (${deviceType})</h3>
                <p><strong>Note:</strong> CCN & CVV Checker applications are designed for desktop use only.</p>
                <p>These applications will not work on mobile devices. Please download on a desktop computer (Windows, macOS, or Linux) for the best experience.</p>
            </div>
        </div>
    `;
}

// Create recommendation banner
function createRecommendationBanner(recommendedPlatform) {
    if (!recommendedPlatform) return '';

    const { os } = detectPlatform();
    const platformName = getPlatformDisplayName(recommendedPlatform);

    let osIcon = '';
    if (os === 'windows') osIcon = icons.windows('#cba6f7');
    else if (os === 'macos') osIcon = icons.macos('#cba6f7');
    else if (os === 'linux') osIcon = icons.linux('#cba6f7');

    return `
        <div class="recommendation-banner">
            ${osIcon}
            <div class="recommendation-text">
                <h3>Detected: ${platformName}</h3>
                <p>We recommend downloading the version marked below for your system</p>
            </div>
        </div>
    `;
}

// Initialize downloads page
function initializeDownloads() {
    const container = document.getElementById('downloads-container');

    if (!container) {
        console.error('Downloads container not found');
        return;
    }

    try {
        // Check if downloadsData is defined (loaded from downloads-data.js)
        if (typeof downloadsData === 'undefined') {
            throw new Error('Downloads data not loaded. Please run: node generate-downloads.js');
        }

        // Check if mobile device and show warning
        const isMobile = isMobileDevice();
        const mobileWarning = isMobile ? createMobileWarningBanner() : '';

        // Detect recommended platform
        const recommendedPlatform = isMobile ? null : getRecommendedPlatform();
        const bannerHtml = isMobile ? '' : createRecommendationBanner(recommendedPlatform);

        // Generate HTML for all versions
        const versionsHtml = downloadsData.versions
            .map(version => createVersionSection(version, downloadsData, recommendedPlatform))
            .join('');

        container.innerHTML = mobileWarning + bannerHtml + versionsHtml;

    } catch (error) {
        console.error('Error loading downloads:', error);
        container.innerHTML = `
            <div class="version-section">
                <div style="padding: 40px; text-align: center; color: #666;">
                    <h3 style="color: #d32f2f; margin-bottom: 15px;">Failed to load downloads</h3>
                    <p style="margin-bottom: 10px;">${error.message}</p>
                    <p style="font-size: 0.9rem;">
                        To generate the downloads data, run: <code style="background: #f5f5f5; padding: 5px 10px; border-radius: 4px;">node generate-downloads.js</code>
                    </p>
                </div>
            </div>
        `;
    }
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDownloads);
} else {
    initializeDownloads();
}
