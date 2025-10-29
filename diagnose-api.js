// Comprehensive Chrome Prompt API diagnostic script
// Run this in the browser console on any webpage

console.log('🔍 Chrome Prompt API Diagnostic Tool');
console.log('=====================================');

// Check Chrome version
console.log('📊 Chrome Version Check:');
console.log('User Agent:', navigator.userAgent);
const chromeVersion = navigator.userAgent.match(/Chrome\/(\d+)/);
if (chromeVersion) {
  const version = parseInt(chromeVersion[1]);
  console.log(`Chrome Version: ${version}`);
  if (version >= 131) {
    console.log('✅ Chrome version is sufficient (131+ required)');
  } else {
    console.log('❌ Chrome version is too old. Please update to version 131 or later.');
  }
} else {
  console.log('❌ Could not detect Chrome version');
}

console.log('\n🔧 API Availability Check:');
console.log('chrome object:', typeof chrome);
console.log('chrome.ai:', typeof chrome?.ai);
console.log('chrome.ai.languageModel:', typeof chrome?.ai?.languageModel);
console.log('chrome.ai.prompt:', typeof chrome?.ai?.prompt);
console.log('chrome.prompt:', typeof chrome?.prompt);

// Check for any available Prompt API
let promptAPI = null;
if (chrome.ai && chrome.ai.languageModel) {
  promptAPI = chrome.ai.languageModel;
  console.log('✅ Found chrome.ai.languageModel API');
} else if (chrome.ai && chrome.ai.prompt) {
  promptAPI = chrome.ai.prompt;
  console.log('✅ Found chrome.ai.prompt API');
} else if (chrome.prompt) {
  promptAPI = chrome.prompt;
  console.log('✅ Found chrome.prompt API');
}

if (promptAPI) {
  console.log('✅ Chrome Prompt API is available!');
  
  // Test the API
  console.log('\n🧪 Testing API call...');
  try {
    let testResponse;
    if (promptAPI.generate) {
      testResponse = await promptAPI.generate('Say "Hello from Chrome Prompt API!"', {
        maxTokens: 50,
        temperature: 0.1
      });
    } else if (promptAPI.create) {
      const model = await promptAPI.create();
      testResponse = await model.generate('Say "Hello from Chrome Prompt API!"', {
        maxTokens: 50,
        temperature: 0.1
      });
    }
    console.log('✅ API Response:', testResponse);
    console.log('🎉 Chrome Prompt API is working correctly!');
  } catch (error) {
    console.error('❌ API Error:', error);
    console.log('The API is available but there might be an issue with the request.');
  }
} else {
  console.log('❌ Chrome Prompt API is not available');
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Go to chrome://flags/');
  console.log('2. Search for "#prompt-api-for-gemini-nano"');
  console.log('3. Set it to "Enabled"');
  console.log('4. Click "Relaunch" to restart Chrome');
  console.log('5. Go to chrome://extensions/');
  console.log('6. Find your Prism extension and click reload (🔄)');
  console.log('7. Run this script again');
}

console.log('\n📋 Extension Check:');
console.log('Extension ID:', chrome.runtime.id);
console.log('Manifest version:', chrome.runtime.getManifest().version);

// Check if we're in an extension context
if (chrome.runtime && chrome.runtime.id) {
  console.log('✅ Running in extension context');
} else {
  console.log('❌ Not running in extension context - this script should be run from a webpage');
}
