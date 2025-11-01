(function() {
  'use strict';

  // Prevent duplicate initialization if script is injected multiple times
  if (window.prismContentInitialized) {
    console.log('Prism content script already initialized, skipping...');
    return;
  }
  window.prismContentInitialized = true;

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

  // Extract main content from page
  function extractPageContent() {
    try {
      // Try to find main article content
      const article = document.querySelector('article') || 
                      document.querySelector('[role="article"]') ||
                      document.querySelector('main') ||
                      document.querySelector('.article') ||
                      document.querySelector('.content') ||
                      document.body;
      
      // Clone to avoid modifying DOM
      const clone = article.cloneNode(true);
      
      // Remove unwanted elements
      clone.querySelectorAll('script, style, nav, aside, footer, header, .ad, .advertisement, .sidebar, .social-share, .comments, noscript').forEach(el => el.remove());
      
      // Get text content and clean up
      let text = clone.innerText || clone.textContent || '';
      
      // Clean up excessive whitespace
      text = text.replace(/\s+/g, ' ').trim();
      
      // Limit to reasonable size (5000 chars should be enough for context)
      if (text.length > 5000) {
        text = text.substring(0, 5000) + '...';
      }
      
      return text;
    } catch (e) {
      console.error('Error extracting page content:', e);
      return '';
    }
  }

  async function saveHighlight(text) {
    // Extract full page content for context
    const sourceContent = extractPageContent();
    
    // Get current page info
    const pageData = {
      type: 'text',
      text: text,
      sourceContent: sourceContent,
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

  async function saveWebpage(webpageUrl, webpageTitle, pageUrl, pageTitle) {
    // Extract full page content
    const sourceContent = extractPageContent();
    
    // Get current page info
    const pageData = {
      type: 'webpage',
      webpageUrl: webpageUrl,
      webpageTitle: webpageTitle || '',
      sourceContent: sourceContent,
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
