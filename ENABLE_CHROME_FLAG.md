# How to Enable Chrome Prompt API Flag

## 🚨 Current Status
Your extension is working with the **fallback system** but the **Chrome Prompt API is not enabled**. Follow these steps to enable the full AI system.

## 📋 Step-by-Step Instructions

### Step 1: Enable the Chrome Flag
1. **Open Chrome** and go to: `chrome://flags/`
2. **Search for**: `#optimization-guide-on-device-model`
3. **Set the dropdown** to: `Enabled`
4. **Click "Relaunch"** button at the bottom
5. **Wait for Chrome to restart**

### Step 2: Reload the Extension
1. Go to: `chrome://extensions/`
2. Find your **Prism extension**
3. Click the **reload button** (🔄)
4. Wait for it to reload

### Step 3: Test the API
1. **Open any webpage** (like the charitable giving page)
2. **Open browser console** (F12 → Console tab)
3. **Copy and paste** the contents of `diagnose-api.js`
4. **Press Enter**
5. You should see: `✅ Chrome Prompt API is available!`

### Step 4: Test the Extension
1. **Click the Prism extension icon**
2. **Click "Extract Content"** → **"Analyze Page"**
3. You should see: `Prompt API is supported` (instead of fallback warning)

## 🔍 Verification

**✅ Success indicators:**
- Console shows "Prompt API is supported"
- No fallback warning in the extension
- AI-powered analysis works

**❌ If still not working:**
- Check that the flag is actually enabled
- Make sure Chrome was restarted (not just refreshed)
- Verify the extension was reloaded after Chrome restart
- Check browser console for any errors

## 🐛 Common Issues

**"Flag not found":**
- Make sure you're on Chrome 131+ (you have 141, so this should work)
- Try searching for just "optimization-guide" if the full name doesn't work

**"API still not available after restart":**
- Double-check the flag is enabled
- Try disabling and re-enabling the flag
- Check if your organization has disabled experimental features

**"Extension not working":**
- Reload the extension after enabling the flag
- Check the extension console for errors
- Try disabling and re-enabling the extension

## 📞 Need Help?

If you're still having issues:
1. Run the `diagnose-api.js` script and share the output
2. Check the extension console in `chrome://extensions/`
3. Verify your Chrome version is 131 or later

The extension will work with the fallback system, but enabling the flag will give you the full AI-powered experience!
