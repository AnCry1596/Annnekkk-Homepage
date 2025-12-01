/**
 * Google Analytics and Event Tracking
 *
 * To use this file:
 * 1. Sign up for Google Analytics at https://analytics.google.com
 * 2. Create a new GA4 property
 * 3. Copy your Measurement ID (G-XXXXXXXXXX)
 * 4. Replace 'G-XXXXXXXXXX' below with your actual ID
 */

// Google Analytics Configuration
const GA_MEASUREMENT_ID = 'G-GQ51VBJW51'; // Replace with your actual Measurement ID

// Initialize Google Analytics
function initializeAnalytics() {
    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.warn('Google Analytics not configured. Please set your Measurement ID in js/analytics.js');
        return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        'send_page_view': true
    });

    console.log('Google Analytics initialized');
}

// Track custom events
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
        console.log('Event tracked:', eventName, eventParams);
    }
}

// Track download events
function trackDownload(appName, version, platform, fileSize) {
    trackEvent('download', {
        'event_category': 'Downloads',
        'event_label': `${appName} v${version} - ${platform}`,
        'app_name': appName,
        'version': version,
        'platform': platform,
        'file_size': fileSize
    });
}

// Track page views
function trackPageView(pageName) {
    trackEvent('page_view', {
        'page_title': pageName,
        'page_location': window.location.href,
        'page_path': window.location.pathname
    });
}

// Track outbound links
function trackOutboundLink(url, linkText) {
    trackEvent('click', {
        'event_category': 'Outbound Links',
        'event_label': linkText,
        'url': url
    });
}

// Track pricing card clicks
function trackPricingClick(appName, plan, price) {
    trackEvent('select_item', {
        'event_category': 'Pricing',
        'event_label': `${appName} - ${plan}`,
        'app_name': appName,
        'plan': plan,
        'price': price
    });
}

// Track mobile device warning
function trackMobileWarning() {
    trackEvent('mobile_device_detected', {
        'event_category': 'User Experience',
        'event_label': 'Mobile Warning Shown'
    });
}

// Track platform detection
function trackPlatformDetection(detectedPlatform) {
    trackEvent('platform_detected', {
        'event_category': 'User Experience',
        'event_label': detectedPlatform
    });
}

// Track changelog views
function trackChangelogView(version) {
    trackEvent('view_item', {
        'event_category': 'Changelog',
        'event_label': `Version ${version}`,
        'version': version
    });
}

// Auto-track all external links
function setupOutboundLinkTracking() {
    document.addEventListener('click', function(event) {
        const target = event.target.closest('a');
        if (!target) return;

        const href = target.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes(window.location.hostname)) {
            trackOutboundLink(href, target.textContent || href);
        }
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeAnalytics();
        setupOutboundLinkTracking();
    });
} else {
    initializeAnalytics();
    setupOutboundLinkTracking();
}

// Export functions for use in other scripts
window.analytics = {
    trackEvent,
    trackDownload,
    trackPageView,
    trackOutboundLink,
    trackPricingClick,
    trackMobileWarning,
    trackPlatformDetection,
    trackChangelogView
};
