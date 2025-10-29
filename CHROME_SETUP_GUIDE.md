# Chrome Prompt API Setup Guide

## Current Status
✅ Chrome Version: 141.0.7390.123 (Required: 131+)  
❌ Chrome Flag: Not enabled  
✅ Origin Trial Token: Configured  

## Step-by-Step Setup

### 1. Enable Chrome Flag
1. Open Chrome and go to `chrome://flags/`
2. Search for `#optimization-guide-on-device-model`
3. Set it to **Enabled**
4. Click **Relaunch** to restart Chrome

### 2. Get Origin Trial Token
1. Go to [Chrome Origin Trials](https://developer.chrome.com/origintrials/)
2. Click "Register for Origin Trial"
3. Fill out the form:
   - **Origin**: `chrome-extension://YOUR_EXTENSION_ID`
   - **Trial**: AI Language Model
   - **Description**: Prism Extension for data analysis
4. Copy the trial token you receive

### 3. Update Extension ID
1. Go to `chrome://extensions/`
2. Find your Prism extension
3. Copy the Extension ID (looks like: `abcdefghijklmnopqrstuvwxyz123456`)
4. Replace `YOUR_EXTENSION_ID` in the origin trial form

### 4. Update manifest.json
✅ **COMPLETED** - Trial token has been added to manifest.json

### 5. Reload Extension
1. Go to `chrome://extensions/`
2. Find your Prism extension
3. Click the reload button (🔄)

## Testing the Setup

After completing these steps, test the extension:
1. Open any webpage
2. Click the Prism extension icon
3. Click "Extract Content" then "Analyze Page"
4. Check the console for "Prompt API is supported" message

## Troubleshooting

### If you still see "Chrome Prompt API not available":
1. Verify the flag is enabled: `chrome://flags/#optimization-guide-on-device-model`
2. Check that your trial token is valid and not expired
3. Ensure the extension ID matches what you registered
4. Try restarting Chrome completely

### Alternative: Use a Different AI API
If the Chrome Prompt API continues to have issues, we can integrate with:
- OpenAI API
- Anthropic Claude API
- Google Gemini API

Let me know if you'd like to set up one of these alternatives instead.
