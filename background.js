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
    id: 'prism-save-image',
    title: 'Save Image to Prism',
    contexts: ['image']
  });
  
  chrome.contextMenus.create({
    id: 'prism-save-video',
    title: 'Save Video to Prism',
    contexts: ['video']
  });
  
  chrome.contextMenus.create({
    id: 'prism-save-audio',
    title: 'Save Audio to Prism',
    contexts: ['audio']
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
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle overlay
  chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' }).catch(() => {
    // If content script isn't ready, just ignore
  });
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
  } else if (info.menuItemId === 'prism-save-image') {
    // Send message to content script to handle image save
    chrome.tabs.sendMessage(tab.id, { 
      action: 'save-image', 
      imageUrl: info.srcUrl,
      imageAlt: info.altText || '',
      pageUrl: tab.url,
      pageTitle: tab.title
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
        // Fallback: save directly if content script isn't available
        if (info.srcUrl) {
          chrome.storage.local.get('highlights', (result) => {
            const highlights = result.highlights || [];
            highlights.push({
              type: 'image',
              imageUrl: info.srcUrl,
              imageAlt: info.altText || '',
              url: tab.url,
              title: tab.title,
              timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({ highlights: highlights });
            console.log('Image saved to Prism (fallback):', info.srcUrl);
          });
        }
      } else if (response && response.success) {
        console.log('Image saved via content script');
      }
    });
  } else if (info.menuItemId === 'prism-save-video') {
    // Send message to content script to handle video save
    chrome.tabs.sendMessage(tab.id, { 
      action: 'save-video', 
      videoUrl: info.srcUrl,
      videoTitle: info.titleText || '',
      pageUrl: tab.url,
      pageTitle: tab.title
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
        // Fallback: save directly if content script isn't available
        if (info.srcUrl) {
          chrome.storage.local.get('highlights', (result) => {
            const highlights = result.highlights || [];
            highlights.push({
              type: 'video',
              videoUrl: info.srcUrl,
              videoTitle: info.titleText || '',
              url: tab.url,
              title: tab.title,
              timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({ highlights: highlights });
            console.log('Video saved to Prism (fallback):', info.srcUrl);
          });
        }
      } else if (response && response.success) {
        console.log('Video saved via content script');
      }
    });
  } else if (info.menuItemId === 'prism-save-audio') {
    // Send message to content script to handle audio save
    chrome.tabs.sendMessage(tab.id, { 
      action: 'save-audio', 
      audioUrl: info.srcUrl,
      audioTitle: info.titleText || '',
      pageUrl: tab.url,
      pageTitle: tab.title
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError);
        // Fallback: save directly if content script isn't available
        if (info.srcUrl) {
          chrome.storage.local.get('highlights', (result) => {
            const highlights = result.highlights || [];
            highlights.push({
              type: 'audio',
              audioUrl: info.srcUrl,
              audioTitle: info.titleText || '',
              url: tab.url,
              title: tab.title,
              timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({ highlights: highlights });
            console.log('Audio saved to Prism (fallback):', info.srcUrl);
          });
        }
      } else if (response && response.success) {
        console.log('Audio saved via content script');
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
          }
          return true;
        });

