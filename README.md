# Downloads Page

A beautiful, automated downloads page for CCN & CVV Checker applications built with Catppuccin Mocha theme.

## Features

- **Automatic File Detection**: Scans downloads folder and generates data automatically
- **Catppuccin Mocha Theme**: Beautiful dark theme with pastel accents
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dynamic Generation**: No hardcoded file sizes or versions
- **Multiple Platforms**: Support for Windows (x64, ARM64), macOS (Apple Silicon, Intel), and Linux

## Project Structure

```
Homepage/
├── index.html              # Main HTML file
├── assets/
│   └── styles.css         # Catppuccin-themed styles
├── js/
│   ├── downloads.js       # Main JavaScript logic
│   └── downloads-data.js  # Auto-generated data file
├── downloads/
│   ├── V2.0.1/           # Version 2.0.1 files
│   └── V2.0.0/           # Version 2.0.0 files
└── generate-downloads.js  # Script to scan and generate data
```

## Adding New Versions

When you release a new version:

1. Create a new folder in `downloads/` (e.g., `V2.0.2/`)
2. Add your release files following the naming pattern:
   ```
   {version}-stable-{app-prefix}-by-annnekkk-{platform}.{ext}
   ```
   Example: `2.0.2-stable-ccn-Checker-by-annnekkk-windows-x64.exe`

3. Run the generator script:
   ```bash
   node generate-downloads.js
   ```

4. Commit and push changes:
   ```bash
   git add .
   git commit -m "Add version 2.0.2"
   git push
   ```

The script automatically:
- Detects all versions
- Calculates actual file sizes
- Marks the latest version
- Updates the downloads page

## GitHub Pages Deployment

### First Time Setup

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin master
   ```

2. Go to your repository on GitHub
3. Click **Settings** → **Pages**
4. Under "Source", select:
   - **Branch**: `master` (or `main`)
   - **Folder**: `/ (root)`
5. Click **Save**

Your site will be available at: `https://yourusername.github.io/repository-name/`

### Updating the Site

Whenever you make changes:

```bash
# After running generate-downloads.js or making any changes
git add .
git commit -m "Update downloads"
git push
```

GitHub Pages will automatically rebuild and deploy your site (takes 1-2 minutes).

## Custom Domain (Optional)

To use a custom domain:

1. In your repository settings → Pages, add your custom domain
2. Create a `CNAME` file in the root with your domain:
   ```
   downloads.yourdomain.com
   ```
3. Configure your DNS:
   - Add a CNAME record pointing to `yourusername.github.io`

## Technologies Used

- **HTML5**: Structure
- **CSS3**: Catppuccin Mocha theme with CSS variables
- **Vanilla JavaScript**: Dynamic content generation
- **Node.js**: Build script for generating data
- **Fraunces Font**: Google Fonts typography

## Color Scheme

Uses [Catppuccin Mocha](https://github.com/catppuccin/catppuccin) color palette:
- Background: Base (#1e1e2e) & Crust (#11111b)
- Accents: Mauve (#cba6f7) & Pink (#f5c2e7)
- Text: Text (#cdd6f4) & Subtext (#a6adc8)
- Latest Badge: Green (#a6e3a1)

## License

© 2025 Annnekkk. All rights reserved.
