// Overlay panel that shows saved highlights - injected into the page

(function() {
  'use strict';

  let overlay = null;
  let isVisible = false;
  let currentView = 'saved'; // 'saved', 'groups', or 'insights'
  let cachedGroups = null; // Cache for groups to avoid regeneration

  // Listen for messages to show/hide the overlay
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle-overlay') {
      toggleOverlay();
      sendResponse({ success: true });
    } else if (request.action === 'sync-to-cloud') {
      syncToCloud();
      sendResponse({ success: true });
    }
    return true;
  });

  function toggleOverlay() {
    if (isVisible) {
      hideOverlay();
    } else {
      showOverlay();
    }
  }

  function showOverlay() {
    if (overlay) {
      overlay.style.display = 'flex';
      isVisible = true;
      return;
    }

    overlay = document.createElement('div');
    overlay.id = 'prism-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 380px;
      max-height: 600px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 2px solid #e0e0e0;
      z-index: 2147483647;
      padding: 20px;
      font-family: Georgia, 'Times New Roman', serif;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.25s ease-in-out;
    `;

    // Header with segmented toggle
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom: 16px;';
    
            const titleRow = document.createElement('div');
            titleRow.style.cssText = 'display: flex; justify-content: center; align-items: center; margin-bottom: 12px; position: relative;';
            
            const title = document.createElement('h2');
            title.textContent = '🔍 Prism';
            title.style.cssText = 'margin: 0; font-size: 20px; color: #333; font-family: -apple-system, BlinkMacSystemFont, sans-serif;';

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = 'background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 30px; height: 30px; position: absolute; right: 0; top: 50%; transform: translateY(-50%);';
            closeBtn.addEventListener('click', hideOverlay);
            
            titleRow.appendChild(title);
            titleRow.appendChild(closeBtn);
    
    // Segmented toggle
    const toggleWrapper = document.createElement('div');
    toggleWrapper.style.cssText = 'display: flex; background: #f0f0f0; border-radius: 20px; padding: 4px;';
    
    const savedBtn = document.createElement('button');
    savedBtn.textContent = 'Saved Items';
    savedBtn.className = 'toggle-btn saved';
    savedBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: white; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 600; color: #333; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: all 0.2s;';
    savedBtn.addEventListener('click', () => switchView('saved'));
    
    const groupsBtn = document.createElement('button');
    groupsBtn.textContent = 'Groups';
    groupsBtn.className = 'toggle-btn groups';
    groupsBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: transparent; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 500; color: #666; transition: all 0.2s;';
    groupsBtn.addEventListener('click', () => switchView('groups'));
    
    const insightsBtn = document.createElement('button');
    insightsBtn.textContent = 'Insights';
    insightsBtn.className = 'toggle-btn insights';
    insightsBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: transparent; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 500; color: #666; transition: all 0.2s;';
    insightsBtn.addEventListener('click', () => switchView('insights'));
    
    toggleWrapper.appendChild(savedBtn);
    toggleWrapper.appendChild(groupsBtn);
    toggleWrapper.appendChild(insightsBtn);
    
    titleRow.appendChild(title);
    titleRow.appendChild(closeBtn);
    
    header.appendChild(titleRow);
    header.appendChild(toggleWrapper);

    // Container for highlights
    const container = document.createElement('div');
    container.id = 'prism-highlights-container';
    container.style.cssText = 'flex: 1; overflow-y: auto; overflow-x: hidden; padding-bottom: 60px;';
    
    // Empty state
    const emptyState = document.createElement('div');
    emptyState.id = 'prism-empty-state';
    emptyState.textContent = 'No saved highlights yet';
    emptyState.style.cssText = 'text-align: center; padding: 40px 20px; color: #999; font-size: 14px;';
    container.appendChild(emptyState);

            // Refresh button
            const refreshBtn = document.createElement('button');
            refreshBtn.innerHTML = '🔄 Refresh';
            refreshBtn.style.cssText = `
              position: absolute;
              bottom: 16px;
              left: 50%;
              transform: translateX(-50%);
              padding: 10px 24px;
              border: none;
              border-radius: 20px;
              background: #667eea;
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              white-space: nowrap;
            `;
            refreshBtn.addEventListener('click', () => {
              if (currentView === 'saved') {
                loadHighlights();
              } else if (currentView === 'groups') {
                cachedGroups = null; // Clear cache to force regeneration
                chrome.storage.local.remove('cachedGroups'); // Also remove from storage
                loadGroups(true); // Force regeneration
              } else if (currentView === 'insights') {
                loadInsights();
              }
            });

    overlay.appendChild(header);
    overlay.appendChild(container);
    overlay.appendChild(refreshBtn);
    document.body.appendChild(overlay);

            isVisible = true;
            loadCachedGroups();
            loadHighlights();
          }

  function hideOverlay() {
    if (overlay) {
      overlay.style.display = 'none';
      isVisible = false;
    }
  }

  // Load cached groups from storage
  function loadCachedGroups() {
    chrome.storage.local.get('cachedGroups', (result) => {
      if (result.cachedGroups) {
        cachedGroups = result.cachedGroups;
        console.log('Loaded cached groups from storage');
      }
    });
  }

  // Save cached groups to storage
  function saveCachedGroups() {
    if (cachedGroups) {
      chrome.storage.local.set({ cachedGroups: cachedGroups }, () => {
        console.log('Saved cached groups to storage');
      });
    }
  }

  function loadHighlights() {
    if (!overlay || !isVisible) return;
    
    const container = document.getElementById('prism-highlights-container');
    const emptyState = document.getElementById('prism-empty-state');
    
    if (!container) return; // Container not created yet
    
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      
      container.innerHTML = '';
      
      if (highlights.length === 0) {
        const newEmptyState = document.createElement('div');
        newEmptyState.id = 'prism-empty-state';
        newEmptyState.textContent = 'No saved highlights yet';
        newEmptyState.style.cssText = 'text-align: center; padding: 40px 20px; color: #999; font-size: 14px;';
        container.appendChild(newEmptyState);
        return;
      }
      
      highlights.reverse().forEach((highlight, index) => {
        const card = document.createElement('div');
        card.style.cssText = `
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
          position: relative;
        `;
        
        // Create content based on type
        let contentDiv;
        if (highlight.type === 'image') {
          contentDiv = document.createElement('div');
          contentDiv.style.cssText = 'margin-bottom: 12px; padding-right: 30px;';
          
          const img = document.createElement('img');
          img.src = highlight.imageUrl;
          img.alt = highlight.imageAlt || 'Saved image';
          img.style.cssText = 'max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;';
          
          // Add alt text if available
          if (highlight.imageAlt) {
            const altDiv = document.createElement('div');
            altDiv.style.cssText = 'font-size: 14px; color: #666; margin-top: 8px; font-style: italic;';
            altDiv.textContent = highlight.imageAlt;
            contentDiv.appendChild(altDiv);
          }
          
          contentDiv.appendChild(img);
        } else if (highlight.type === 'video') {
          contentDiv = document.createElement('div');
          contentDiv.style.cssText = 'margin-bottom: 12px; padding-right: 30px;';
          
          const videoContainer = document.createElement('div');
          videoContainer.style.cssText = 'background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center;';
          
          const videoIcon = document.createElement('div');
          videoIcon.innerHTML = '🎥';
          videoIcon.style.cssText = 'font-size: 32px; margin-bottom: 8px;';
          
          const videoTitle = document.createElement('div');
          videoTitle.style.cssText = 'font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;';
          videoTitle.textContent = highlight.videoTitle || 'Video';
          
          const videoUrl = document.createElement('div');
          videoUrl.style.cssText = 'font-size: 12px; color: #666; word-break: break-all;';
          videoUrl.textContent = highlight.videoUrl;
          
          videoContainer.appendChild(videoIcon);
          videoContainer.appendChild(videoTitle);
          videoContainer.appendChild(videoUrl);
          contentDiv.appendChild(videoContainer);
        } else if (highlight.type === 'audio') {
          contentDiv = document.createElement('div');
          contentDiv.style.cssText = 'margin-bottom: 12px; padding-right: 30px;';
          
          const audioContainer = document.createElement('div');
          audioContainer.style.cssText = 'background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center;';
          
          const audioIcon = document.createElement('div');
          audioIcon.innerHTML = '🎵';
          audioIcon.style.cssText = 'font-size: 32px; margin-bottom: 8px;';
          
          const audioTitle = document.createElement('div');
          audioTitle.style.cssText = 'font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;';
          audioTitle.textContent = highlight.audioTitle || 'Audio';
          
          const audioUrl = document.createElement('div');
          audioUrl.style.cssText = 'font-size: 12px; color: #666; word-break: break-all;';
          audioUrl.textContent = highlight.audioUrl;
          
          audioContainer.appendChild(audioIcon);
          audioContainer.appendChild(audioTitle);
          audioContainer.appendChild(audioUrl);
          contentDiv.appendChild(audioContainer);
        } else if (highlight.type === 'webpage') {
          contentDiv = document.createElement('div');
          contentDiv.style.cssText = 'margin-bottom: 12px; padding-right: 30px;';
          
          const webpageContainer = document.createElement('div');
          webpageContainer.style.cssText = 'background: #f0f8ff; border-radius: 8px; padding: 16px; border-left: 4px solid #4285f4;';
          
          const webpageIcon = document.createElement('div');
          webpageIcon.innerHTML = '🌐';
          webpageIcon.style.cssText = 'font-size: 24px; margin-bottom: 8px; display: inline-block;';
          
          const webpageTitle = document.createElement('div');
          webpageTitle.style.cssText = 'font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px; line-height: 1.4;';
          webpageTitle.textContent = highlight.webpageTitle || 'Webpage';
          
          const webpageUrl = document.createElement('div');
          webpageUrl.style.cssText = 'font-size: 12px; color: #666; word-break: break-all; margin-bottom: 8px;';
          webpageUrl.textContent = highlight.webpageUrl;
          
          const webpageLink = document.createElement('a');
          webpageLink.href = highlight.webpageUrl;
          webpageLink.target = '_blank';
          webpageLink.style.cssText = 'display: inline-block; background: #4285f4; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;';
          webpageLink.textContent = 'Visit Page';
          
          webpageContainer.appendChild(webpageIcon);
          webpageContainer.appendChild(webpageTitle);
          webpageContainer.appendChild(webpageUrl);
          webpageContainer.appendChild(webpageLink);
          contentDiv.appendChild(webpageContainer);
        } else {
          // Text content (default)
          contentDiv = document.createElement('div');
          contentDiv.style.cssText = 'font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 12px; padding-right: 30px;';
          contentDiv.textContent = highlight.text || highlight.imageAlt || 'Saved content';
        }
        
        const metaDiv = document.createElement('div');
        metaDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #f0f0f0;';
        
        const urlLink = document.createElement('a');
        urlLink.href = highlight.url;
        urlLink.target = '_blank';
        urlLink.style.cssText = 'color: #999; text-decoration: none; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px;';
        urlLink.textContent = highlight.url;
        
        const timeSpan = document.createElement('span');
        timeSpan.style.cssText = 'color: #999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;';
        timeSpan.textContent = formatTimestamp(highlight.timestamp);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.cssText = 'position: absolute; top: 12px; right: 12px; background: rgba(239, 68, 68, 0.1); border: none; cursor: pointer; font-size: 16px; opacity: 0.5; transition: all 0.2s; padding: 6px; border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;';
        
        const actualIndex = highlights.length - 1 - index;
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteHighlight(actualIndex);
        });
        
        metaDiv.appendChild(urlLink);
        metaDiv.appendChild(timeSpan);
        card.appendChild(contentDiv);
        card.appendChild(metaDiv);
        card.appendChild(deleteBtn);
        
        container.appendChild(card);
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function deleteHighlight(actualIndex) {
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      highlights.splice(actualIndex, 1);
      chrome.storage.local.set({ highlights: highlights }, () => {
        loadHighlights();
      });
    });
  }

  // Merge overlapping groups to ensure related content stays together
  function mergeOverlappingGroups(groupedHighlights) {
    const groups = Object.values(groupedHighlights);
    const merged = [];
    const used = new Set();

    for (let i = 0; i < groups.length; i++) {
      if (used.has(i)) continue;
      
      const currentGroup = [...groups[i]];
      used.add(i);

      // Look for overlapping groups
      for (let j = i + 1; j < groups.length; j++) {
        if (used.has(j)) continue;

        const otherGroup = groups[j];
        
        // Check if groups have similar content (same topic/story)
        if (hasOverlappingContent(currentGroup, otherGroup)) {
          currentGroup.push(...otherGroup);
          used.add(j);
        }
      }

      merged.push(currentGroup);
    }

    // Convert back to object format
    const result = {};
    merged.forEach((group, idx) => {
      if (group.length > 0) {
        result[`group_${idx}`] = group;
      }
    });

    return result;
  }

  // Check if two groups have overlapping content (same topic/story)
  function hasOverlappingContent(group1, group2) {
    const text1 = group1.map(h => h.text ? h.text.toLowerCase() : '').join(' ');
    const text2 = group2.map(h => h.text ? h.text.toLowerCase() : '').join(' ');

    // Look for common entities (names, places, events)
    const entities1 = extractEntities(text1);
    const entities2 = extractEntities(text2);

    // If they share significant entities, they're related
    const commonEntities = entities1.filter(e => entities2.includes(e));
    
    // Be more conservative - require multiple shared entities or very specific matches
    return commonEntities.length >= 2 || 
           (commonEntities.length === 1 && commonEntities[0].length > 4); // Longer entity names are more specific
  }

  // Extract potential entities (names, places, etc.) from text
  function extractEntities(text) {
    // Simple entity extraction - look for capitalized words and common patterns
    const entities = [];
    
    // Capitalized words (potential names/places)
    const capitalized = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    entities.push(...capitalized.map(e => e.toLowerCase()));

    // Common patterns
    const patterns = [
      /\b\d{4}\b/g, // Years
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi, // Months
      /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi, // Days
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      entities.push(...matches.map(m => m.toLowerCase()));
    });

    return [...new Set(entities)]; // Remove duplicates
  }

  // Analyze content of each highlight based on its type (with caching)
  async function analyzeHighlightContent(highlights, onlyNewItems = false) {
    const analyzedHighlights = [];
    
    for (const highlight of highlights) {
      // Check if we already have analyzed content for this item
      if (highlight.analyzedContent && !onlyNewItems) {
        analyzedHighlights.push(highlight);
        continue;
      }
      
      // Skip analysis if we already have analyzed content and we're only looking for new items
      if (onlyNewItems && highlight.analyzedContent) {
        analyzedHighlights.push(highlight);
        continue;
      }
      
      let analyzedContent = '';
      
      try {
        // Determine type if missing (for backward compatibility)
        let highlightType = highlight.type;
        if (!highlightType) {
          if (highlight.text) {
            highlightType = 'text';
          } else if (highlight.webpageUrl) {
            highlightType = 'webpage';
          } else if (highlight.imageUrl) {
            highlightType = 'image';
          } else if (highlight.videoUrl) {
            highlightType = 'video';
          } else if (highlight.audioUrl) {
            highlightType = 'audio';
          } else {
            highlightType = 'text'; // Default fallback
          }
        }
        
        console.log(`Analyzing highlight type: ${highlightType}`, highlight);
        
        if (highlightType === 'text') {
          // For text highlights, analyze the actual text content
          analyzedContent = await analyzeTextContent(highlight.text);
        } else if (highlightType === 'webpage') {
          // For webpages, analyze the webpage content
          analyzedContent = await analyzeWebpageContent(highlight.webpageUrl, highlight.webpageTitle);
        } else if (highlightType === 'image') {
          // For images, analyze the image content
          analyzedContent = await analyzeImageContent(highlight.imageUrl, highlight.imageAlt);
        } else if (highlightType === 'video') {
          // For videos, analyze the video content (transcript if available)
          analyzedContent = await analyzeVideoContent(highlight.videoUrl, highlight.videoTitle);
        } else if (highlightType === 'audio') {
          // For audio, analyze the audio content (transcript if available)
          analyzedContent = await analyzeAudioContent(highlight.audioUrl, highlight.audioTitle);
        } else {
          // Fallback for unknown types
          analyzedContent = highlight.text || highlight.imageAlt || highlight.webpageTitle || highlight.videoTitle || highlight.audioTitle || 'Unknown content';
        }
        
        console.log(`Analysis result for ${highlightType}:`, analyzedContent);
      } catch (error) {
        console.error('Error analyzing highlight content:', error);
        // Fallback to basic content
        analyzedContent = highlight.text || highlight.imageAlt || highlight.webpageTitle || highlight.videoTitle || highlight.audioTitle || 'Content analysis failed';
      }
      
      // Add analyzed content to highlight and save to storage
      const analyzedHighlight = {
        ...highlight,
        analyzedContent: analyzedContent
      };
      
      analyzedHighlights.push(analyzedHighlight);
      
      // Save the analyzed content to storage for future use
      await saveAnalyzedContent(highlight.timestamp, analyzedContent);
    }
    
    return analyzedHighlights;
  }

  // Save analyzed content to storage
  async function saveAnalyzedContent(timestamp, analyzedContent) {
    chrome.storage.local.get('analyzedContent', (result) => {
      const analyzedContentCache = result.analyzedContent || {};
      analyzedContentCache[timestamp] = analyzedContent;
      chrome.storage.local.set({ analyzedContent: analyzedContentCache });
    });
  }

  // Load analyzed content from storage
  function loadAnalyzedContent(highlights) {
    return new Promise((resolve) => {
      chrome.storage.local.get('analyzedContent', (result) => {
        const analyzedContentCache = result.analyzedContent || {};
        
        const highlightsWithAnalysis = highlights.map(highlight => {
          if (analyzedContentCache[highlight.timestamp]) {
            return {
              ...highlight,
              analyzedContent: analyzedContentCache[highlight.timestamp]
            };
          }
          return highlight;
        });
        
        resolve(highlightsWithAnalysis);
      });
    });
  }

  // Analyze text content
  async function analyzeTextContent(text) {
    if (!text || text.trim().length === 0) return 'Empty text content';
    
    try {
      if (typeof LanguageModel === 'undefined') {
        return text.substring(0, 200); // Fallback to truncated text
      }
      
      const availability = await LanguageModel.availability();
      if (availability !== 'available') {
        return text.substring(0, 200); // Fallback to truncated text
      }
      
      const session = await LanguageModel.create();
      const prompt = `Analyze this text content and provide a brief summary (under 50 words) of what it's about:\n\n${text.substring(0, 1000)}`;
      const result = await session.prompt(prompt, { language: 'en' });
      session.destroy();
      
      return result.trim() || text.substring(0, 200);
    } catch (error) {
      console.error('Error analyzing text content:', error);
      return text.substring(0, 200);
    }
  }

  // Analyze webpage content
  async function analyzeWebpageContent(url, title) {
    try {
      if (typeof LanguageModel === 'undefined') {
        return `Webpage: ${title || 'Untitled'} (${url})`;
      }
      
      const availability = await LanguageModel.availability();
      if (availability !== 'available') {
        return `Webpage: ${title || 'Untitled'} (${url})`;
      }
      
      const session = await LanguageModel.create();
      const prompt = `Based on this webpage URL and title, what is this webpage likely about? Provide a brief summary (under 50 words):\n\nURL: ${url}\nTitle: ${title || 'No title'}`;
      const result = await session.prompt(prompt, { language: 'en' });
      session.destroy();
      
      return result.trim() || `Webpage: ${title || 'Untitled'}`;
    } catch (error) {
      console.error('Error analyzing webpage content:', error);
      return `Webpage: ${title || 'Untitled'} (${url})`;
    }
  }

  // Analyze image content
  async function analyzeImageContent(imageUrl, altText) {
    try {
      if (typeof LanguageModel === 'undefined') {
        return `Image: ${altText || 'Image without description'}`;
      }
      
      const availability = await LanguageModel.availability();
      if (availability !== 'available') {
        return `Image: ${altText || 'Image without description'}`;
      }
      
      const session = await LanguageModel.create();
      const prompt = `Based on this image URL and alt text, what is this image likely about? Provide a brief description (under 50 words):\n\nURL: ${imageUrl}\nAlt text: ${altText || 'No alt text'}`;
      const result = await session.prompt(prompt, { language: 'en' });
      session.destroy();
      
      return result.trim();
    } catch (error) {
      console.error('Error analyzing image content:', error);
      return `Image: ${altText || 'Image without description'}`;
    }
  }

  // Analyze video content
  async function analyzeVideoContent(videoUrl, videoTitle) {
    try {
      if (typeof LanguageModel === 'undefined') {
        return `Video: ${videoTitle || 'Video without title'}`;
      }
      
      const availability = await LanguageModel.availability();
      if (availability !== 'available') {
        return `Video: ${videoTitle || 'Video without title'}`;
      }
      
      const session = await LanguageModel.create();
      const prompt = `Based on this video URL and title, what is this video likely about? Provide a brief summary (under 50 words):\n\nURL: ${videoUrl}\nTitle: ${videoTitle || 'No title'}`;
      const result = await session.prompt(prompt, { language: 'en' });
      session.destroy();
      
      return result.trim();
    } catch (error) {
      console.error('Error analyzing video content:', error);
      return `Video: ${videoTitle || 'Video without title'}`;
    }
  }

  // Analyze audio content
  async function analyzeAudioContent(audioUrl, audioTitle) {
    try {
      if (typeof LanguageModel === 'undefined') {
        return `Audio: ${audioTitle || 'Audio without title'}`;
      }
      
      const availability = await LanguageModel.availability();
      if (availability !== 'available') {
        return `Audio: ${audioTitle || 'Audio without title'}`;
      }
      
      const session = await LanguageModel.create();
      const prompt = `Based on this audio URL and title, what is this audio likely about? Provide a brief summary (under 50 words):\n\nURL: ${audioUrl}\nTitle: ${audioTitle || 'No title'}`;
      const result = await session.prompt(prompt, { language: 'en' });
      session.destroy();
      
      return result.trim();
    } catch (error) {
      console.error('Error analyzing audio content:', error);
      return `Audio: ${audioTitle || 'Audio without title'}`;
    }
  }

  // AI-powered grouping using Chrome's Prompt API
  async function analyzeAndGroupWithAI(highlights) {
    if (highlights.length === 0) return {};
    
    try {
      // Check if AI API is available (Chrome 138+)
      if (typeof LanguageModel === 'undefined') {
        console.error('LanguageModel API not available. Please use Chrome 138+.');
        return {};
      }
      
      console.log('AI APIs detected, proceeding with AI grouping...');

      // Load cached analyzed content first, then analyze only new items
      const highlightsWithCachedAnalysis = await loadAnalyzedContent(highlights);
      const analyzedHighlights = await analyzeHighlightContent(highlightsWithCachedAnalysis, true);
      
      // Prepare highlights for AI analysis with analyzed content
      const highlightsSummary = analyzedHighlights.map((h, idx) => {
        if (h.type === 'image') {
          return `${idx}: [IMAGE] Content: "${h.analyzedContent}"`;
        } else if (h.type === 'video') {
          return `${idx}: [VIDEO] Content: "${h.analyzedContent}"`;
        } else if (h.type === 'audio') {
          return `${idx}: [AUDIO] Content: "${h.analyzedContent}"`;
        } else if (h.type === 'webpage') {
          return `${idx}: [WEBPAGE] Content: "${h.analyzedContent}"`;
        } else {
          return `${idx}: [TEXT] Content: "${h.analyzedContent}"`;
        }
      }).join('\n\n');
      
      const promptText = `Analyze these ${highlights.length} saved highlights (text, images, videos, audio, and webpages) and organize them into logical groups.

Saved Content:
${highlightsSummary}

CRITICAL GROUPING RULES:
- Group ONLY highlights that relate to the SAME SPECIFIC topic, event, or story
- NEVER combine unrelated topics (e.g., hurricanes and football are completely different)
- Each group should focus on ONE coherent topic or story
- If highlights mention different people, events, companies, or subjects, they MUST be in separate groups
- Look for specific thematic connections, not general similarities
- Prefer more focused groups over broad, vague groupings
- Create 2-5 meaningful groups (prefer more groups with focused content)

Examples of what should be grouped together:
- All highlights about the same specific news story (e.g., "Hurricane Melissa" only)
- All highlights about the same person or company (e.g., "Celtic FC management" only)
- All highlights about the same specific event or topic
- All highlights with the same specific theme or subject

Examples of what should NOT be grouped together:
- Hurricane news + Football news (completely different topics)
- Different companies or people
- Different events or stories
- Unrelated subjects or themes

Return ONLY valid JSON in this format:
{
  "groups": [
    {
      "indices": [0, 2, 5]
    }
  ]
}

Where indices are the numbers from above (0, 1, 2, etc.).`;

      // Step 1: Create LanguageModel session and use Prompt API to group
      const availability = await LanguageModel.availability();
      
      console.log('LanguageModel availability:', availability);
      
      // Handle different availability states
      if (availability === 'unavailable') {
        console.error('LanguageModel not available. Check hardware requirements: chrome://on-device-internals');
        return {};
      } else if (availability === 'downloading') {
        console.log('Model is downloading...');
        return { downloading: true };
      } else if (availability === 'downloadable') {
        console.log('Model needs to be downloaded. Triggering download...');
        // Create session to trigger download - this requires user interaction
        try {
          const session = await LanguageModel.create();
          session.destroy(); // Close session immediately
          console.log('Download triggered. Please wait...');
          return { downloading: true };
        } catch (e) {
          console.error('Error triggering download:', e);
          return {};
        }
      }
      // availability === 'available'
      
      console.log('Creating LanguageModel session...');
      const session = await LanguageModel.create();
      console.log('Session created, prompting AI...');
      const result = await session.prompt(promptText, { language: 'en' });
      console.log('AI response received');
      
      // Parse the JSON response
      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch (e) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = result.match(/\{[^]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON from AI response');
        }
      }
      
      // Convert indices to actual highlight objects
      const groupedHighlights = {};
      parsed.groups.forEach((group, idx) => {
        const highlightObjects = group.indices
          .map(i => highlights[i])
          .filter(h => h != null);

        if (highlightObjects.length > 0) {
          groupedHighlights[`group_${idx}`] = highlightObjects;
        }
      });

      // Post-process to merge any overlapping groups
      const mergedGroups = mergeOverlappingGroups(groupedHighlights);
      
      // Step 2: Use Prompt API to create summary titles for each group
      
      const groupsWithSummaries = {};
      
      for (const groupKey in mergedGroups) {
        const groupHighlights = mergedGroups[groupKey];
        
        try {
          // Combine analyzed content from all highlights in this group
          const combinedText = groupHighlights.map(h => {
            return h.analyzedContent || 'Unknown content';
          }).join(' ');
          
          // Use Prompt API to create a short summary sentence
          const summaryPrompt = `Summarize the following content (text, images, videos, audio, and webpages) into ONE SHORT SENTENCE (under 15 words) that captures the main idea. Focus on the specific topic or story, not multiple unrelated topics:\n\n${combinedText.substring(0, 500)}`;
          
          const summaryResult = await session.prompt(summaryPrompt, { language: 'en' });
          const title = summaryResult.trim();
          
          groupsWithSummaries[title] = {
            description: `Contains ${groupHighlights.length} related highlights`,
            highlights: groupHighlights
          };
        } catch (error) {
          console.error('Error summarizing group:', error);
          // If summarization fails, use a simple fallback
          const title = `Group ${parseInt(groupKey.split('_')[1]) + 1} (${groupHighlights.length} items)`;
          groupsWithSummaries[title] = {
            description: `Contains ${groupHighlights.length} related highlights`,
            highlights: groupHighlights
          };
        }
      }
      
      session.destroy();
      return groupsWithSummaries;
      
    } catch (error) {
      console.error('AI grouping failed:', error);
      return {};
    }
  }

  // Keyword-based fallback grouping
  function analyzeAndGroupHighlights(highlights) {
    const groups = {
      'News & Articles': [],
      'Research & Data': [],
      'Financial & Business': [],
      'Technology & Science': [],
      'General': []
    };

    highlights.forEach(highlight => {
      const text = highlight.text.toLowerCase();
      const url = highlight.url.toLowerCase();
      
      // Analyze and categorize
      const isFinancial = /money|cost|price|budget|revenue|profit|stock|market|financial|economy|dollar|\$/.test(text);
      const isTech = /technology|software|digital|ai|machine|computer|data|algorithm|tech|cyber/.test(text);
      const isResearch = /study|research|analysis|data|findings|study|survey|statistics|percentage|%/.test(text);
      const isNews = /news|article|breaking|update|report|bbc|cnn|reuters/.test(url) || /hurricane|storm|weather|election|government/.test(text);
      
      if (isNews) {
        groups['News & Articles'].push(highlight);
      } else if (isResearch) {
        groups['Research & Data'].push(highlight);
      } else if (isFinancial) {
        groups['Financial & Business'].push(highlight);
      } else if (isTech) {
        groups['Technology & Science'].push(highlight);
      } else {
        groups['General'].push(highlight);
      }
    });

    // Convert to the new format expected by loadGroups
    const formattedGroups = {};
    Object.keys(groups).forEach(title => {
      if (groups[title].length > 0) {
        formattedGroups[title] = {
          description: `Auto-categorized as ${title.toLowerCase()}`,
          highlights: groups[title]
        };
      }
    });

    return formattedGroups;
  }

  async function loadGroups(forceRegenerate = false) {
    if (!overlay || !isVisible) return;

    const container = document.getElementById('prism-highlights-container');
    if (!container) return;

    chrome.storage.local.get('highlights', async (result) => {
      const highlights = result.highlights || [];

      container.innerHTML = '';

      if (highlights.length === 0) {
        const newEmptyState = document.createElement('div');
        newEmptyState.textContent = 'No saved items to group';
        newEmptyState.style.cssText = 'text-align: center; padding: 40px 20px; color: #999; font-size: 14px;';
        container.appendChild(newEmptyState);
        return;
      }

      // If we have cached groups and not forcing regeneration, show them immediately
      if (cachedGroups && Object.keys(cachedGroups).length > 0 && !forceRegenerate) {
        console.log('Loading cached groups');
        displayGroups(container, cachedGroups);
        return;
      }

      // Show loading state for generation/regeneration
      const loadingState = document.createElement('div');
      loadingState.innerHTML = '🤔 Analyzing highlights with AI...';
      loadingState.style.cssText = 'text-align: center; padding: 40px 20px; color: #667eea; font-size: 15px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, sans-serif;';
      container.appendChild(loadingState);

      // Use AI for grouping
      const aiResult = await analyzeAndGroupWithAI(highlights);
      
      // Clear loading state
      container.innerHTML = '';
      
      // Check if download is in progress
      if (aiResult && aiResult.downloading) {
        const downloadingState = document.createElement('div');
        downloadingState.innerHTML = `
          ⬇️ Starting download...
          <div style="font-size: 12px; margin-top: 8px; line-height: 1.6;">
            Click refresh after a few moments to try again
          </div>
        `;
        downloadingState.style.cssText = 'text-align: center; padding: 40px 20px; color: #667eea; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;';
        container.appendChild(downloadingState);
        return;
      }

      const groups = aiResult || {};

      if (Object.keys(groups).length === 0) {
        // Check current availability for better error message
        let errorMessage = '⚠️ AI grouping not available';
        let errorDetails = 'Please use Chrome 138+';

        if (typeof LanguageModel !== 'undefined') {
          try {
            const availability = await LanguageModel.availability();
            if (availability === 'downloadable') {
              errorMessage = '⬇️ Downloading AI model...';
              errorDetails = 'First time use: AI model is being downloaded<br>This may take a few minutes. Please wait.';
            } else if (availability === 'downloading') {
              errorMessage = '⬇️ AI model downloading...';
              errorDetails = 'Download in progress. Please wait...';
            } else if (availability === 'unavailable') {
              errorMessage = '⚠️ Hardware requirements not met';
              errorDetails = 'Needs 22 GB free disk space and 16 GB RAM';
            }
          } catch (e) {
            console.error('Error checking availability:', e);
          }
        }

        const newEmptyState = document.createElement('div');
        newEmptyState.innerHTML = `
          ${errorMessage}
          <div style="font-size: 12px; margin-top: 8px; line-height: 1.6;">
            ${errorDetails}
          </div>
        `;
        newEmptyState.style.cssText = 'text-align: center; padding: 40px 20px; color: #999; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;';
        container.appendChild(newEmptyState);
        return;
      }
      
      // Cache the groups
      cachedGroups = groups;
      saveCachedGroups(); // Save to storage
      
      // Display groups
      displayGroups(container, groups);
    });
  }

  function displayGroups(container, groups) {
    // Create a staggered/masonry grid container
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      padding: 0;
    `;

    // Display groups in staggered format
    Object.keys(groups).forEach(groupName => {
      const groupData = groups[groupName];
      const groupHighlights = groupData.highlights || [];

      if (groupHighlights.length === 0) return;

      // Group card for staggered grid
      const groupCard = document.createElement('div');
      groupCard.style.cssText = `
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        padding: 16px;
        cursor: pointer;
        min-height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      `;

      const title = document.createElement('div');
      title.style.cssText = 'font-size: 14px; font-weight: 600; color: #333; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.4;';
      title.textContent = groupName;

      const desc = document.createElement('div');
      desc.style.cssText = 'font-size: 12px; color: #666; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-style: italic; margin-top: auto;';
      desc.textContent = groupData.description || '';

      groupCard.appendChild(title);
      if (groupData.description) {
        groupCard.appendChild(desc);
      }

      gridContainer.appendChild(groupCard);
    });

    container.appendChild(gridContainer);
  }

  function generateInsights(highlights) {
    const insights = [];
    
    if (highlights.length === 0) {
      return insights;
    }

    // Extract all text for analysis
    const allText = highlights.map(h => h.text).join(' ').toLowerCase();
    
    // Extract key statistics
    const stats = {
      percentages: allText.match(/\d+%/g) || [],
      numbers: allText.match(/\b\d{1,3}(,\d{3})*\b/g) || [],
      years: allText.match(/\b\d{4}\b/g) || [],
      measurements: allText.match(/\d+\s*(inches|feet|meters|miles|km)\b/gi) || []
    };

    // Analyze themes
    const themes = {};
    const commonWords = allText.match(/\b[a-z]{4,}\b/g);
    if (commonWords) {
      commonWords.forEach(word => {
        if (word.length > 4 && !['that', 'this', 'with', 'from', 'have', 'been', 'also', 'more', 'than', 'their', 'there'].includes(word)) {
          themes[word] = (themes[word] || 0) + 1;
        }
      });
    }

    // Generate insights
    
    // Insight 1: Statistics summary
    if (stats.percentages.length > 0) {
      const uniquePercentages = [...new Set(stats.percentages)];
      if (uniquePercentages.length > 0) {
        insights.push({
          title: '📊 Key Numbers',
          text: uniquePercentages.slice(0, 5).join(', ') + ' appear across your highlights.'
        });
      }
    }

    // Insight 2: Dominant theme
    if (Object.keys(themes).length > 0) {
      const sortedThemes = Object.entries(themes).sort((a, b) => b[1] - a[1]);
      const dominantTheme = sortedThemes[0][0];
      insights.push({
        title: '🔍 Recurring Theme',
        text: `The word "${dominantTheme}" appears ${sortedThemes[0][1]} times across your saved highlights.`
      });
    }

    // Insight 3: Time analysis
    const recentHighlights = highlights.filter(h => {
      const date = new Date(h.timestamp);
      const now = new Date();
      return (now - date) < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    if (recentHighlights.length > 0) {
      insights.push({
        title: '⏰ Activity',
        text: `You saved ${recentHighlights.length} highlight(s) in the last 24 hours.`
      });
    }

    // Insight 4: Topic clustering
    const dominantTopics = Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
    
    if (dominantTopics.length >= 2) {
      insights.push({
        title: '🎯 Main Topics',
        text: `Your highlights focus on: ${dominantTopics.join(', ')}.`
      });
    }

    // Insight 5: Sources diversity
    const uniqueDomains = [...new Set(highlights.map(h => {
      try {
        const url = new URL(h.url);
        return url.hostname;
      } catch {
        return h.url;
      }
    }))];
    
    if (uniqueDomains.length > 1) {
      insights.push({
        title: '📚 Source Diversity',
        text: `Content collected from ${uniqueDomains.length} different sources.`
      });
    }

    return insights;
  }

  function loadInsights() {
    if (!overlay || !isVisible) return;
    
    const container = document.getElementById('prism-highlights-container');
    if (!container) return;
    
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      
      container.innerHTML = '';
      
      if (highlights.length === 0) {
        const newEmptyState = document.createElement('div');
        newEmptyState.textContent = 'No insights yet';
        newEmptyState.style.cssText = 'text-align: center; padding: 40px 20px; color: #999; font-size: 14px;';
        container.appendChild(newEmptyState);
        return;
      }

      const insights = generateInsights(highlights);
      
      if (insights.length === 0) {
        const newEmptyState = document.createElement('div');
        newEmptyState.textContent = 'No insights available';
        newEmptyState.style.cssText = 'text-align: center; padding: 40px 20px; color: #999; font-size: 14px;';
        container.appendChild(newEmptyState);
        return;
      }

      insights.forEach(insight => {
        const insightCard = document.createElement('div');
        insightCard.style.cssText = `
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
          border-left: 4px solid #667eea;
        `;
        
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'font-size: 14px; font-weight: 600; color: #333; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;';
        titleDiv.textContent = insight.title;
        
        const textDiv = document.createElement('div');
        textDiv.style.cssText = 'font-size: 15px; line-height: 1.6; color: #555; font-family: Georgia, Times, serif;';
        textDiv.textContent = insight.text;
        
        insightCard.appendChild(titleDiv);
        insightCard.appendChild(textDiv);
        container.appendChild(insightCard);
      });
    });
  }

  function switchView(view) {
    currentView = view;
    
    const savedBtn = overlay.querySelector('.toggle-btn.saved');
    const groupsBtn = overlay.querySelector('.toggle-btn.groups');
    const insightsBtn = overlay.querySelector('.toggle-btn.insights');
    const container = document.getElementById('prism-highlights-container');
    
    // Reset all buttons to inactive style
    savedBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: transparent; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 500; color: #666; transition: all 0.2s;';
    groupsBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: transparent; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 500; color: #666; transition: all 0.2s;';
    insightsBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: transparent; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 500; color: #666; transition: all 0.2s;';
    
    // Activate the selected view
    if (view === 'saved') {
      savedBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: white; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 600; color: #333; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: all 0.2s;';
      container.innerHTML = '';
      loadHighlights();
    } else if (view === 'groups') {
      groupsBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: white; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 600; color: #333; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: all 0.2s;';
      loadGroups(false); // Don't force regeneration when switching tabs
    } else {
      insightsBtn.style.cssText = 'flex: 1; padding: 8px 12px; border: none; border-radius: 16px; background: white; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 600; color: #333; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: all 0.2s;';
      loadInsights();
    }
  }

  // Dynamic group update function
  async function updateGroupsDynamically(oldHighlights, newHighlights) {
    if (!cachedGroups) return;

    const oldCount = oldHighlights.length;
    const newCount = newHighlights.length;

    // If item was added
    if (newCount > oldCount) {
      const newItem = newHighlights[newHighlights.length - 1]; // Last item is the new one
      
      // Try to find the best group for this new item
      let bestGroup = null;
      let bestScore = 0;
      
      for (const groupTitle in cachedGroups) {
        const groupHighlights = cachedGroups[groupTitle].highlights;
        if (groupHighlights.length === 0) continue;
        
        // Simple similarity check - if the new item shares keywords with existing group items
        const similarity = calculateSimilarity(newItem, groupHighlights);
        if (similarity > bestScore && similarity > 0.3) { // Threshold for grouping
          bestScore = similarity;
          bestGroup = groupTitle;
        }
      }
      
      if (bestGroup) {
        // Add to existing group
        cachedGroups[bestGroup].highlights.push(newItem);
        cachedGroups[bestGroup].description = `Contains ${cachedGroups[bestGroup].highlights.length} related highlights`;
        
        // Check if title needs updating (only if it's a significant addition)
        if (cachedGroups[bestGroup].highlights.length > 3) {
          await updateGroupTitleIfNeeded(bestGroup, cachedGroups[bestGroup].highlights);
        }
      } else {
        // Create new group for this item
        const newGroupTitle = `New Topic (${newItem.text.substring(0, 30)}...)`;
        cachedGroups[newGroupTitle] = {
          description: 'Contains 1 related highlight',
          highlights: [newItem]
        };
      }
    }
    // If item was removed
    else if (newCount < oldCount) {
      const removedItem = oldHighlights.find(oldItem => 
        !newHighlights.some(newItem => newItem.timestamp === oldItem.timestamp)
      );
      
      if (removedItem) {
        // Remove from all groups
        for (const groupTitle in cachedGroups) {
          const groupHighlights = cachedGroups[groupTitle].highlights;
          const index = groupHighlights.findIndex(item => item.timestamp === removedItem.timestamp);
          
          if (index !== -1) {
            groupHighlights.splice(index, 1);
            
            if (groupHighlights.length === 0) {
              // Remove empty group
              delete cachedGroups[groupTitle];
            } else {
              // Update description
              cachedGroups[groupTitle].description = `Contains ${groupHighlights.length} related highlights`;
              
              // Check if title needs updating (only if it's a significant removal)
              if (groupHighlights.length > 0) {
                await updateGroupTitleIfNeeded(groupTitle, groupHighlights);
              }
            }
            break;
          }
        }
      }
    }
    
            // Save updated groups to storage
            saveCachedGroups();
            
            // Refresh the groups display
            if (currentView === 'groups') {
              const container = document.getElementById('prism-highlights-container');
              if (container) {
                displayGroups(container, cachedGroups);
              }
            }
  }

  // Calculate similarity between a new item and existing group items
  function calculateSimilarity(newItem, groupItems) {
    const newText = newItem.analyzedContent ? newItem.analyzedContent.toLowerCase() : (newItem.text ? newItem.text.toLowerCase() : '');
    const groupTexts = groupItems.map(item => item.analyzedContent ? item.analyzedContent.toLowerCase() : (item.text ? item.text.toLowerCase() : ''));
    
    // Simple keyword-based similarity
    const newWords = newText.split(/\s+/).filter(word => word.length > 3);
    let totalMatches = 0;
    
    for (const groupText of groupTexts) {
      const groupWords = groupText.split(/\s+/).filter(word => word.length > 3);
      const matches = newWords.filter(word => groupWords.includes(word)).length;
      totalMatches += matches;
    }
    
    return totalMatches / (newWords.length * groupTexts.length);
  }

  // Update group title if needed (only for significant changes)
  async function updateGroupTitleIfNeeded(groupTitle, groupHighlights) {
    try {
      if (typeof LanguageModel === 'undefined') return;
      
      const availability = await LanguageModel.availability();
      if (availability !== 'available') return;
      
      const combinedText = groupHighlights.map(h => h.text).join(' ').substring(0, 500);
      const prompt = `Analyze this text and determine if the current group title "${groupTitle}" still accurately represents the content. If the content has significantly changed, provide a new title. Otherwise, respond with "KEEP_CURRENT_TITLE".

Text: ${combinedText}

Respond with either "KEEP_CURRENT_TITLE" or a new title (under 15 words).`;

      const session = await LanguageModel.create();
      const result = await session.prompt(prompt, { language: 'en' });
      session.destroy();
      
      const newTitle = result.trim();
              if (newTitle !== 'KEEP_CURRENT_TITLE' && newTitle !== groupTitle) {
                // Update the group title
                cachedGroups[newTitle] = cachedGroups[groupTitle];
                delete cachedGroups[groupTitle];
                saveCachedGroups(); // Save updated groups
              }
    } catch (error) {
      console.error('Error updating group title:', error);
    }
  }

  // Automatically analyze and assign new items to groups
  async function autoAnalyzeAndAssignNewItem(newItem) {
    try {
      // Analyze the new item
      const analyzedItems = await analyzeHighlightContent([newItem], true);
      const analyzedItem = analyzedItems[0];
      
      if (!analyzedItem.analyzedContent) {
        console.log('No analyzed content for new item, skipping auto-assignment');
        return;
      }
      
      // Load existing groups
      if (!cachedGroups || Object.keys(cachedGroups).length === 0) {
        console.log('No existing groups, skipping auto-assignment');
        return;
      }
      
      // Find the best group for this item
      let bestGroup = null;
      let bestScore = 0;
      
      for (const groupTitle in cachedGroups) {
        const groupHighlights = cachedGroups[groupTitle].highlights;
        if (groupHighlights.length === 0) continue;
        
        // Calculate similarity with analyzed content
        const similarity = calculateSimilarity(analyzedItem, groupHighlights);
        if (similarity > bestScore && similarity > 0.3) { // Threshold for grouping
          bestScore = similarity;
          bestGroup = groupTitle;
        }
      }
      
      if (bestGroup) {
        // Add to existing group
        cachedGroups[bestGroup].highlights.push(analyzedItem);
        cachedGroups[bestGroup].description = `Contains ${cachedGroups[bestGroup].highlights.length} related highlights`;
        
        // Save updated groups
        saveCachedGroups();
        
        console.log(`Auto-assigned new item to group: ${bestGroup}`);
        
        // Update group title if needed (only if it's a significant addition)
        if (cachedGroups[bestGroup].highlights.length > 3) {
          await updateGroupTitleIfNeeded(bestGroup, cachedGroups[bestGroup].highlights);
        }
      } else {
        // Create new group for this item
        const newGroupTitle = analyzedItem.analyzedContent.substring(0, 50) + '...';
        cachedGroups[newGroupTitle] = {
          description: 'Contains 1 related highlight',
          highlights: [analyzedItem]
        };
        
        // Save updated groups
        saveCachedGroups();
        
        console.log(`Created new group for item: ${newGroupTitle}`);
      }
      
      // Refresh groups display if currently viewing groups
      if (currentView === 'groups' && isVisible) {
        const container = document.getElementById('prism-highlights-container');
        if (container) {
          displayGroups(container, cachedGroups);
        }
      }
      
    } catch (error) {
      console.error('Error in auto-analyze and assign:', error);
    }
  }

          // Listen for storage changes
          chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'local' && changes.highlights) {
              const oldHighlights = changes.highlights.oldValue || [];
              const newHighlights = changes.highlights.newValue || [];
              
              if (isVisible) {
                if (currentView === 'saved') {
                  loadHighlights();
                } else if (currentView === 'groups' && cachedGroups) {
                  // Update groups dynamically when items are added/removed
                  updateGroupsDynamically(oldHighlights, newHighlights);
                }
              }
              
              // Auto-analyze and assign new items to groups
              if (newHighlights.length > oldHighlights.length) {
                const newItem = newHighlights[newHighlights.length - 1]; // Last item is the new one
                autoAnalyzeAndAssignNewItem(newItem);
              }
            }
          });

})();

