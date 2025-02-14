import { isProductPage } from './utils/urlParser';
import { logger } from './utils/logger';
import { ProductData } from './types';

chrome.runtime.onInstalled.addListener(() => {
    // Create new menu item
    chrome.contextMenus.create({
      id: "searchProductImage",
      title: "Find discounted products",
      contexts: ["image"]
    } as chrome.contextMenus.CreateProperties);
});

chrome.webNavigation.onCompleted.addListener((details) => {
  logger.debug('Navigation completed', details);
  
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        logger.error('Error getting tab info:', chrome.runtime.lastError);
        return;
      }

      if (!tab.url) {
        logger.warn('Tab URL is undefined');
        return;
      }

      if (isProductPage(tab.url)) {
        logger.info('Product page detected:', tab.url);
        getRelatedProducts(details.tabId)
          .then(async products => {
            logger.info(`Found ${products.length} related products`);
            const topProducts = await findTopProducts(products);
            chrome.storage.local.set({ 
              cachedProducts: topProducts,
              lastUpdated: Date.now()
            }, () => {
              if (chrome.runtime.lastError) {
                logger.error('Error saving to storage:', chrome.runtime.lastError);
                return;
              }
              logger.debug('Products cached successfully');
              updateBadge(products.length);
            });
          })
          .catch(error => {
            logger.error('Failed to get related products:', error);
          });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "newMatches") {
    updateBadge(message.count);
  }
}); 

chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  if (info.menuItemId === "searchProductImage" && info.srcUrl) {
    const imageUrl: string = info.srcUrl;
    const results = await handleImageSearch(imageUrl);
    const topProducts = await findTopProducts(results.data);
    // Send results to any listening services
    chrome.runtime.sendMessage({
      action: "imageSearchComplete",
      data: topProducts
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

async function getRelatedProducts(tabId: number): Promise<ProductData[]> {
  logger.info(`Getting related products for tab ${tabId}`);
  
  try {
    const imageUrl = await getProductImage(tabId);
    if (!imageUrl) {
      const error = new Error('No product image found on the page');
      logger.error('Product image fetch failed', error);
      throw error;
    }
    logger.info('Product image found:', imageUrl);

    const results = await handleImageSearch(imageUrl);
    
    logger.info(`Found ${results.data.length} products before filtering`);
    const topProducts = await findTopProducts(results.data);
    logger.info(`Filtered down to ${topProducts.length} top products`);
    return topProducts;

  } catch (error) {
    logger.error('Error in getRelatedProducts:', error);
    throw error;
  }
}

async function handleImageSearch(imageUrl: string): Promise<{ data: ProductData[] }> {
  // 1. Create a hidden tab with Google Lens
  const searchTab = await chrome.tabs.create({ 
    url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`,
    active: false // Keep tab hidden from user
  });

  // 2. Inject content script to parse results
  await chrome.scripting.executeScript({
    target: { tabId: searchTab.id! },
    files: ["content.js"]
  });

  // 3. Wait for results from content script
  const results = await new Promise((resolve) => {
    const listener = (message: any, sender: chrome.runtime.MessageSender) => {
      if (message.action === "searchResults" && sender.tab?.id === searchTab.id) {
        chrome.runtime.onMessage.removeListener(listener);
        // Close the search tab
        chrome.tabs.remove(searchTab.id!);
        resolve(message.data);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
  });
  console.log('Results:', results);

  return { data: results as ProductData[] };
}

export async function findTopProducts(productData: ProductData[]): Promise<ProductData[]> {
  // Filter products under $500
  const filteredProducts = productData.filter(product => {
    // Remove '$' and convert to number
    const price = parseFloat(product.price.replace('$', ''));
    return !isNaN(price) && price < 500;
  });

  // Return top 3 products
  return filteredProducts.slice(0, 3);
}

async function getProductImage(tabId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: "getProductImage" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response.imageUrl);
    });
  });
} 