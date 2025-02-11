chrome.runtime.onInstalled.addListener(() => {
    // Create new menu item
    chrome.contextMenus.create({
      id: "reverseSearch",
      title: "Find discounted products",
      contexts: ["image"]
    } as chrome.contextMenus.CreateProperties);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "newMatches") {
    updateBadge(message.count);
  }
}); 

chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  if (info.menuItemId === "reverseSearch" && info.srcUrl) {
    const imageUrl: string = info.srcUrl;
    console.log('Creating new tab with URL:', imageUrl);
    
    chrome.tabs.create({ 
      url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`, 
      active: false 
    }, (newTab) => {
      const tabId = newTab.id;
      console.log('New tab created with ID:', tabId);
      if (typeof tabId === 'number') {
        setTimeout(() => {
          console.log('Attempting to inject content script');
          chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"]
          }).then(() => {
            console.log('Content script injected successfully');
          }).catch((err) => {
            console.error('Failed to inject content script:', err);
          });
        }, 5000);
      }
    });
  }
});

function updateBadge(count: number) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#FF5722" }); // Orange to match your theme
  } else {
    chrome.action.setBadgeText({ text: "" }); // Remove badge when count is 0
  }
}
