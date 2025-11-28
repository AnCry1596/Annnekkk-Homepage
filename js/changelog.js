/**
 * Dynamically generate changelog entries from changelog-data.js
 */

function getMonthYear(version) {
    // You can customize this mapping or read from a date file
    const versionDates = {
        '2.0.1': '28 November 2025',
        '2.0.0': '23 November 2025'
    };
    return versionDates[version] || '';
}

function createChangelogSection(title, emoji, items) {
    if (!items || items.length === 0) return '';

    const itemsList = items.map(item => `<li>${item}</li>`).join('\n                            ');

    return `
                    <div class="changelog-section">
                        <h3>${emoji} ${title}</h3>
                        <ul>
                            ${itemsList}
                        </ul>
                    </div>`;
}

function createVersionEntry(versionData) {
    const latestBadge = versionData.isLatest
        ? '<span class="badge badge-latest">Latest</span>'
        : '';

    const dateStr = getMonthYear(versionData.version);
    const dateDisplay = dateStr ? `<span class="changelog-date">${dateStr}</span>` : '';

    const newSection = createChangelogSection('New Features', '✨', versionData.new);
    const improvedSection = createChangelogSection('Improvements', '🔧', versionData.improved);
    const fixedSection = createChangelogSection('Bug Fixes', '🐛', versionData.fixed);
    const breakingSection = createChangelogSection('Breaking Changes', '💥', versionData.breaking);

    return `
            <div class="changelog-entry">
                <div class="changelog-version">
                    <h2>Version ${versionData.version}</h2>
                    ${latestBadge}
                    ${dateDisplay}
                </div>
                <div class="changelog-content">
                    ${newSection}
                    ${improvedSection}
                    ${fixedSection}
                    ${breakingSection}
                </div>
            </div>`;
}

function initializeChangelog() {
    const container = document.querySelector('.changelog-container');

    if (!container) {
        console.error('Changelog container not found');
        return;
    }

    if (typeof changelogData === 'undefined') {
        console.error('Changelog data not loaded. Please run: node generate-downloads.js');
        container.innerHTML = '<p style="color: var(--ctp-red); text-align: center;">Error: Changelog data not available</p>';
        return;
    }

    if (!changelogData.versions || changelogData.versions.length === 0) {
        container.innerHTML = '<p style="color: var(--ctp-subtext0); text-align: center;">No changelog entries found</p>';
        return;
    }

    const changelogHtml = changelogData.versions
        .map(version => createVersionEntry(version))
        .join('');

    container.innerHTML = changelogHtml;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChangelog);
} else {
    initializeChangelog();
}
