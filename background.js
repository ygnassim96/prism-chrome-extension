// Service Worker for Prism Extension

// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Prism extension installed');
  
  chrome.contextMenus.create({
    id: 'prism-save-selection',
    title: 'Save to Prism',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'prism-save-link',
    title: 'Save Page to Prism',
    contexts: ['link']
  });
  
  chrome.contextMenus.create({
    id: 'prism-save-page',
    title: 'Save Page to Prism',
    contexts: ['page']
  });
});

// Handle extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Try to send message first (content script might already be loaded)
    await chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' });
  } catch (error) {
    // If content script isn't ready, inject it first
    console.log('Content script not ready, injecting...');
    try {
      // Inject content scripts
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js', 'overlay.js']
      });
      
      // Wait a bit for scripts to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now try to send the message again
      await chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' });
    } catch (injectError) {
      console.error('Error injecting content scripts:', injectError);
      // Some pages (like chrome://) can't have scripts injected
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://'))) {
        console.warn('Cannot inject scripts on system pages');
      }
    }
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'prism-save-selection') {
    // Send message to content script to handle the save
    chrome.tabs.sendMessage(tab.id, { action: 'save-selected-text' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
        // Fallback: save directly if content script isn't available
        const selectedText = info.selectionText;
        if (selectedText && selectedText.trim()) {
          chrome.storage.local.get('highlights', (result) => {
            const highlights = result.highlights || [];
            highlights.push({
              type: 'text',
              text: selectedText.trim(),
              url: tab.url,
              title: tab.title,
              timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({ highlights: highlights });
            console.log('Saved to Prism (fallback):', selectedText.substring(0, 50));
          });
        }
      } else if (response && response.success) {
        console.log('Text saved via content script');
      }
    });
  } else if (info.menuItemId === 'prism-save-link') {
    // Send message to content script to handle webpage save
    chrome.tabs.sendMessage(tab.id, { 
      action: 'save-webpage', 
      webpageUrl: info.linkUrl,
      webpageTitle: info.linkText || '',
      pageUrl: tab.url,
      pageTitle: tab.title
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
        // Fallback: save directly if content script isn't available
        if (info.linkUrl) {
          chrome.storage.local.get('highlights', (result) => {
            const highlights = result.highlights || [];
            highlights.push({
              type: 'webpage',
              webpageUrl: info.linkUrl,
              webpageTitle: info.linkText || '',
              url: tab.url,
              title: tab.title,
              timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({ highlights: highlights });
            console.log('Webpage saved to Prism (fallback):', info.linkUrl);
          });
        }
      } else if (response && response.success) {
        console.log('Webpage saved via content script');
      }
    });
  } else if (info.menuItemId === 'prism-save-page') {
    // Send message to content script to handle current page save
    chrome.tabs.sendMessage(tab.id, { 
      action: 'save-current-page'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
        // Fallback: save directly if content script isn't available
        chrome.storage.local.get('highlights', (result) => {
          const highlights = result.highlights || [];
          highlights.push({
            type: 'webpage',
            webpageUrl: tab.url,
            webpageTitle: tab.title,
            url: tab.url,
            title: tab.title,
            timestamp: new Date().toISOString()
          });
          chrome.storage.local.set({ highlights: highlights });
          console.log('Current page saved to Prism (fallback):', tab.url);
        });
      } else if (response && response.success) {
        console.log('Current page saved via content script');
      }
    });
  }
});

        // Handle messages from content scripts or popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.action === 'analyze') {
            // Any background processing can go here
            sendResponse({ success: true });
          } else if (request.action === 'inject-chartjs') {
            // Inject Chart.js into the sender's tab
            (async () => {
              try {
                if (!sender || !sender.tab || !sender.tab.id) {
                  sendResponse({ success: false, error: 'Invalid sender or tab ID' });
                  return;
                }
                
                const tabId = sender.tab.id;
                
                // Inject Chart.js using executeScript to ensure it runs in the isolated world
                await chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  files: ['lib/chart.min.js'],
                  world: 'ISOLATED' // This ensures it runs in the content script's isolated world
                });
                
                console.log('Chart.js injected successfully into tab:', tabId);
                sendResponse({ success: true });
              } catch (error) {
                console.error('Error injecting Chart.js:', error);
                sendResponse({ success: false, error: error.message });
              }
            })();
            
            // Return true to indicate we'll send response asynchronously
            return true;
          }
          return true;
        });

