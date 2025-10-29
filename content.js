(function() {
  'use strict';

  console.log('Prism: Content script loaded');

  // Wait for body to be available
  function init() {
    // No need for mouseup or selectionchange listeners since we're removing tooltips
    console.log('Prism: Content script initialized - right-click to save text');
  }

  function showSuccessNotification() {
    const success = document.createElement('div');
    success.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; font-family: sans-serif; font-size: 14px; z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.2); animation: slideIn 0.3s;';
    success.textContent = '✓ Saved! Open extension to view';
    
    const style = document.createElement('style');
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
    document.head.appendChild(style);
    
    document.body.appendChild(success);
    setTimeout(() => {
      success.style.transition = 'opacity 0.3s';
      success.style.opacity = '0';
      setTimeout(() => success.remove(), 300);
    }, 2000);
  }

  async function saveHighlight(text) {
    // Get current page info
    const pageData = {
      type: 'text',
      text: text,
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    };

    // Save to chrome storage
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      highlights.push(pageData);
      chrome.storage.local.set({ highlights: highlights });
    });

    // Show success notification
    showSuccessNotification();
  }

  async function saveImage(imageUrl, imageAlt, pageUrl, pageTitle) {
    // Get current page info
    const pageData = {
      type: 'image',
      imageUrl: imageUrl,
      imageAlt: imageAlt || '',
      url: pageUrl || window.location.href,
      title: pageTitle || document.title,
      timestamp: new Date().toISOString()
    };

    // Save to chrome storage
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      highlights.push(pageData);
      chrome.storage.local.set({ highlights: highlights });
    });

    // Show success notification
    showSuccessNotification();
  }

  async function saveVideo(videoUrl, videoTitle, pageUrl, pageTitle) {
    // Get current page info
    const pageData = {
      type: 'video',
      videoUrl: videoUrl,
      videoTitle: videoTitle || '',
      url: pageUrl || window.location.href,
      title: pageTitle || document.title,
      timestamp: new Date().toISOString()
    };

    // Save to chrome storage
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      highlights.push(pageData);
      chrome.storage.local.set({ highlights: highlights });
    });

    // Show success notification
    showSuccessNotification();
  }

  async function saveAudio(audioUrl, audioTitle, pageUrl, pageTitle) {
    // Get current page info
    const pageData = {
      type: 'audio',
      audioUrl: audioUrl,
      audioTitle: audioTitle || '',
      url: pageUrl || window.location.href,
      title: pageTitle || document.title,
      timestamp: new Date().toISOString()
    };

    // Save to chrome storage
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      highlights.push(pageData);
      chrome.storage.local.set({ highlights: highlights });
    });

    // Show success notification
    showSuccessNotification();
  }

  async function saveWebpage(webpageUrl, webpageTitle, pageUrl, pageTitle) {
    // Get current page info
    const pageData = {
      type: 'webpage',
      webpageUrl: webpageUrl,
      webpageTitle: webpageTitle || '',
      url: pageUrl || window.location.href,
      title: pageTitle || document.title,
      timestamp: new Date().toISOString()
    };

    // Save to chrome storage
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      highlights.push(pageData);
      chrome.storage.local.set({ highlights: highlights });
    });

    // Show success notification
    showSuccessNotification();
  }

  // Listen for messages from background script (for context menu saves)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'save-selected-text') {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText) {
        saveHighlight(selectedText);
        selection.removeAllRanges(); // Clear selection
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No text selected' });
      }
    } else if (request.action === 'save-image') {
      const { imageUrl, imageAlt, pageUrl, pageTitle } = request;
      
      if (imageUrl) {
        saveImage(imageUrl, imageAlt, pageUrl, pageTitle);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No image URL provided' });
      }
    } else if (request.action === 'save-video') {
      const { videoUrl, videoTitle, pageUrl, pageTitle } = request;
      
      if (videoUrl) {
        saveVideo(videoUrl, videoTitle, pageUrl, pageTitle);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No video URL provided' });
      }
    } else if (request.action === 'save-audio') {
      const { audioUrl, audioTitle, pageUrl, pageTitle } = request;
      
      if (audioUrl) {
        saveAudio(audioUrl, audioTitle, pageUrl, pageTitle);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No audio URL provided' });
      }
    } else if (request.action === 'save-webpage') {
      const { webpageUrl, webpageTitle, pageUrl, pageTitle } = request;
      
      if (webpageUrl) {
        saveWebpage(webpageUrl, webpageTitle, pageUrl, pageTitle);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No webpage URL provided' });
      }
    } else if (request.action === 'save-current-page') {
      // Save the current page
      saveWebpage(window.location.href, document.title, window.location.href, document.title);
      sendResponse({ success: true });
    }
    return true;
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
