# Google Analytics Setup Guide

Google Analytics is already configured and integrated into your website! Your Measurement ID is: **G-GQ51VBJW51**

## What's Being Tracked

### Automatic Tracking
- ✅ **Page Views** - Every page visit
- ✅ **Outbound Links** - Clicks to external sites (Telegram)
- ✅ **Mobile Device Detection** - When mobile warning is shown

### Downloads Page
- ✅ **Download Events** - Every download button click with:
  - App name (CCN Checker / CVV Checker)
  - Version (2.0.2, 2.0.1, etc.)
  - Platform (Windows x64, macOS ARM64, etc.)
  - File size
- ✅ **Platform Detection** - What OS was detected for each user
- ✅ **Mobile Warnings** - How many mobile users visit

### Pricing Page
Ready for tracking pricing card clicks (can be added if needed)

### Changelog Page
Ready for tracking version views (can be added if needed)

## Viewing Your Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Select your property (CCN & CVV Checker)

### Key Reports to Check

**Real-time Report**
- See visitors currently on your site
- View active downloads in real-time

**Events Report**
- `download` - See all downloads with details
- `mobile_device_detected` - Mobile user counts
- `platform_detected` - Desktop OS distribution
- `click` - Outbound link clicks

**Acquisition**
- Where your users come from
- Direct traffic, social media, search engines

**Engagement**
- Most popular pages
- Average time on site
- Bounce rate

## Custom Events Available

Your analytics system includes these trackable events:

### Downloads
```javascript
window.analytics.trackDownload(appName, version, platform, fileSize);
```

### Page Views
```javascript
window.analytics.trackPageView(pageName);
```

### Outbound Links
```javascript
window.analytics.trackOutboundLink(url, linkText);
```

### Pricing Clicks
```javascript
window.analytics.trackPricingClick(appName, plan, price);
```

### Mobile Warnings
```javascript
window.analytics.trackMobileWarning();
```

### Platform Detection
```javascript
window.analytics.trackPlatformDetection(platform);
```

### Changelog Views
```javascript
window.analytics.trackChangelogView(version);
```

## Example Queries You Can Run

### Most Downloaded App
Check which app (CCN vs CVV) is more popular

### Most Popular Platform
See which OS users prefer (Windows, macOS, Linux)

### Mobile vs Desktop Traffic
Compare mobile visitors to desktop users

### Download Conversion Rate
Compare page views to actual downloads

### Geographic Distribution
See where your users are located (automatically tracked)

### Peak Usage Times
Identify when users are most active

## Privacy Compliance

Google Analytics 4 (GA4) is GDPR-compliant when configured properly. Your setup:
- ✅ Uses anonymous IP addresses
- ✅ Collects minimal user data
- ✅ No personally identifiable information (PII)
- ✅ Users can opt-out via browser settings

## Troubleshooting

### Not Seeing Data?
1. Wait 24-48 hours after setup (GA4 takes time to start showing data)
2. Check that your Measurement ID is correct: `G-GQ51VBJW51`
3. Visit your site and check browser console for errors
4. Use Google Analytics DebugView for real-time testing

### Testing Analytics
1. Open your website
2. Open browser console (F12)
3. Look for "Google Analytics initialized" message
4. Click download buttons and check for "Event tracked" logs
5. Go to GA4 → Reports → Realtime to see your activity

### Debug Mode
To enable detailed logging, add this to console:
```javascript
window.gtag('config', 'G-GQ51VBJW51', { 'debug_mode': true });
```

## Advanced Configuration

### Custom Dimensions (Optional)
You can add custom dimensions in GA4 to track:
- License tier (Free/Premium)
- User type (New/Returning)
- Language preference
- Device type (Desktop/Mobile/Tablet)

### E-commerce Tracking (For Pricing)
If you want to track pricing selections as e-commerce events, you can enhance the pricing page tracking.

### User Engagement Time
GA4 automatically tracks engagement time, showing how long users actively interact with your site.

## Support

- [Google Analytics Help Center](https://support.google.com/analytics)
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Analytics Academy](https://analytics.google.com/analytics/academy/)

## Your Analytics Dashboard

Once data starts flowing, you'll see:
- Daily active users
- Total downloads per version
- Platform distribution
- User locations (country/city)
- Traffic sources
- Real-time visitor count

**Note:** Data typically appears within 24-48 hours of initial setup.
