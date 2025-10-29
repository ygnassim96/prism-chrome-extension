# Chrome Prompt API Setup Guide

To enable the Chrome Prompt API in your Prism extension, follow these steps:

## 1. Update Chrome Version
- Ensure you're using **Chrome version 131 or later**
- Check your version: `chrome://version/`
- Update if necessary

## 2. Enable Required Chrome Flags
1. Go to `chrome://flags/`
2. Search for `#optimization-guide-on-device-model`
3. Set it to **Enabled**
4. Restart Chrome

## 3. Register for Origin Trial
1. Visit [Chrome Origin Trials](https://developer.chrome.com/origintrials/)
2. Register your extension for the AI Language Model trial
3. You'll receive a trial token

## 4. Update Extension Configuration
1. Replace `YOUR_TRIAL_TOKEN_HERE` in `manifest.json` with your actual trial token
2. The manifest.json is already configured with the required permissions

## 5. Reload Extension
1. Go to `chrome://extensions/`
2. Find your Prism extension
3. Click the reload button (🔄)

## 6. Test the API
1. Open the extension on any webpage
2. Click "Extract Content" then "Next"
3. Check the console for "Prompt API is supported" message

## Troubleshooting

### If you see "Chrome Prompt API not available":
1. Verify Chrome version is 131+
2. Check that the flag is enabled
3. Ensure trial token is correctly added to manifest.json
4. Reload the extension after making changes

### If you get API errors:
1. Check that your trial token is valid and not expired
2. Verify the extension has the correct permissions
3. Try restarting Chrome completely

## Current Configuration
Your extension is now configured with:
- ✅ `aiLanguageModelOriginTrial` permission
- ✅ Trial token placeholder (needs your actual token)
- ✅ Proper API calls using `chrome.ai.languageModel.generate()`
- ✅ Error handling for missing API

Once you complete these steps, the extension will use the real Chrome Prompt API instead of the fallback system!
