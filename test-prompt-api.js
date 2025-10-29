// Test script to verify Chrome Prompt API is working
// Run this in the browser console on any webpage

console.log('Testing Chrome Prompt API...');

// Check if the API is available
if (typeof chrome !== 'undefined' && chrome.ai && chrome.ai.languageModel) {
  console.log('✅ Chrome Prompt API is available!');
  
  // Test a simple prompt
  chrome.ai.languageModel.generate('Say "Hello from Chrome Prompt API!"', {
    maxTokens: 50,
    temperature: 0.1
  }).then(response => {
    console.log('✅ API Response:', response);
    console.log('🎉 Chrome Prompt API is working correctly!');
  }).catch(error => {
    console.error('❌ API Error:', error);
    console.log('The API is available but there might be an issue with the request.');
  });
} else {
  console.log('❌ Chrome Prompt API is not available');
  console.log('Please check:');
  console.log('1. Chrome flag #optimization-guide-on-device-model is enabled');
  console.log('2. Extension is reloaded after adding trial token');
  console.log('3. You are on Chrome version 131 or later');
}
