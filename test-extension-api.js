// Test Chrome Prompt API from Extension Context
// Run this in the extension's background script console

// Go to chrome://extensions/ → Find your Prism extension → Click "service worker" link
// Then paste this script in the console that opens

console.log('🔍 Testing Chrome Prompt API from Extension Context...');

// Test the API detection
chrome.runtime.sendMessage({ action: 'testPromptAPI' }, (response) => {
  if (response && response.success) {
    const data = response.data;
    console.log('📊 Test Results:');
    console.log(`Chrome Version: ${data.chromeVersion} (${data.versionSufficient ? '✅ Sufficient' : '❌ Too old'})`);
    console.log(`API Type: ${data.apiType}`);
    console.log(`Prompt API Available: ${data.promptAPIAvailable ? '✅ Yes' : '❌ No'}`);
    console.log('Available APIs:', data.availableAPIs);
    
    if (data.testResult) {
      console.log('🧪 API Test Result:', data.testResult);
      if (data.testResult.includes('Hello from Chrome Prompt API')) {
        console.log('🎉 Chrome Prompt API is working correctly!');
      } else {
        console.log('⚠️ API responded but with unexpected result');
      }
    }
  } else {
    console.error('❌ Test failed:', response?.error || 'Unknown error');
  }
});
