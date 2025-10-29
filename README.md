# Prism Chrome Extension

A powerful Chrome extension that helps you save and organize highlights from any webpage using AI-powered grouping and analysis.

## ✨ Features

- **Save Any Content**: Right-click to save text, images, videos, audio files, and entire webpages
- **AI-Powered Grouping**: Automatically groups related content using Chrome's Prompt API
- **Smart Analysis**: Analyzes content to create meaningful summaries and insights
- **Clean Interface**: Beautiful white frosted glass overlay with intuitive navigation
- **Local Storage**: All data stored locally for privacy

## 🚀 Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Prism extension will appear in your Chrome toolbar

## 📖 How to Use

### Saving Content
- **Text**: Select any text and right-click → "Save to Prism"
- **Images**: Right-click on any image → "Save Image to Prism"
- **Videos**: Right-click on any video → "Save Video to Prism"
- **Audio**: Right-click on any audio file → "Save Audio to Prism"
- **Webpages**: Right-click on any link → "Save Page to Prism"
- **Current Page**: Right-click anywhere on the page → "Save Page to Prism"

### Viewing Saved Content
- Click the Prism extension icon in your toolbar
- Navigate between three tabs:
  - **Saved Items**: View all your saved content
  - **Groups**: AI-organized groups of related content
  - **Insights**: AI-generated summaries and insights

## 🛠️ Technical Details

- **Manifest Version**: 3
- **AI Integration**: Chrome Prompt API for content analysis and grouping
- **Storage**: Chrome Storage API (local)
- **Content Scripts**: Injected into all webpages for seamless integration

## 📁 Project Structure

```
prism-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js            # Content script for saving
├── overlay.js            # Main UI overlay
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🔧 Development

The extension uses:
- **Chrome Extension Manifest V3**
- **Chrome Prompt API** for AI analysis
- **Chrome Storage API** for data persistence
- **Chrome Context Menus API** for right-click functionality

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you encounter any issues or have questions, please open an issue on GitHub.
