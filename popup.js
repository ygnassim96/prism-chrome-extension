document.addEventListener('DOMContentLoaded', () => {
  const highlightsList = document.getElementById('highlights-list');
  const emptyState = document.getElementById('empty-state');

  // Load and display highlights
  function loadHighlights() {
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      
      if (highlights.length === 0) {
        emptyState.style.display = 'block';
        highlightsList.innerHTML = '';
        return;
      }

      emptyState.style.display = 'none';
      highlightsList.innerHTML = '';

      highlights.reverse().forEach((highlight, index) => {
        const li = document.createElement('li');
        li.className = 'highlight-item';

        const text = document.createElement('div');
        text.className = 'highlight-text';
        text.textContent = highlight.text;

        const meta = document.createElement('div');
        meta.className = 'highlight-meta';
        
        const url = document.createElement('a');
        url.href = highlight.url;
        url.target = '_blank';
        url.className = 'highlight-url';
        url.textContent = highlight.title || highlight.url;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'highlight-time';
        timestamp.textContent = formatTimestamp(highlight.timestamp);

        meta.appendChild(url);
        meta.appendChild(timestamp);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', () => deleteHighlight(index));

        li.appendChild(text);
        li.appendChild(meta);
        li.appendChild(deleteBtn);
        highlightsList.appendChild(li);
      });
    });
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

  function deleteHighlight(index) {
    chrome.storage.local.get('highlights', (result) => {
      const highlights = result.highlights || [];
      // We reversed the array for display, so we need to reverse back to delete correctly
      const actualIndex = highlights.length - 1 - index;
      highlights.splice(actualIndex, 1);
      chrome.storage.local.set({ highlights: highlights }, () => {
        loadHighlights();
      });
    });
  }

  // Load highlights when popup opens
  loadHighlights();

  // Listen for storage changes (when new highlight is saved)
  chrome.storage.onChanged.addListener(() => {
    loadHighlights();
  });
});

