// Simple logger for content script
const logger = {
  debug: (...args: any[]) => console.debug('[Igni]', ...args),
  info: (...args: any[]) => console.info('[Igni]', ...args),
  warn: (...args: any[]) => console.warn('[Igni]', ...args),
  error: (...args: any[]) => console.error('[Igni]', ...args)
};

console.log('Content script loaded!');

interface ProductData {
  title: string;
  price: string;
  productLink: string;
  img: string;
  inStock?: boolean;
}

// Content script for product pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Content script received message:', request);

  if (request.action === "getProductImage") {
    try {
      const imageUrl = findProductImage();
      console.info('Found product image:', imageUrl);
      sendResponse({ imageUrl });
    } catch (error) {
      console.error('Error finding product image:', error instanceof Error ? error : new Error(String(error)));
      sendResponse({ error: error instanceof Error ? error.message : String(error) });
    }
  }
  return true;
});

function findProductImage(): string | null {
  console.debug('Searching for product image');
  // Try different common selectors for product images
  const selectors = [
    'img[id*="product"][src*="http"]',
    'img[class*="product"][src*="http"]',
    'img[id*="main"][src*="http"]',
    'img[class*="main"][src*="http"]',
    'img[data-image-large-src]',
    '.product-image img',
    '.product-main-image img'
  ];
  // Try to find product name first
  const nameSelectors = [
    'h1[class*="product-title"]',
    'h1[class*="product-name"]',
    'h1[itemprop="name"]',
    '.product-title',
    '.product-name',
    '#product-title',
    '#product-name'
  ];

  let productName = null;
  for (const selector of nameSelectors) {
    const nameElement = document.querySelector(selector);
    if (nameElement?.textContent) {
      productName = nameElement.textContent.trim();
      break;
    }
  }

  // Add image selectors that look for alt text matching product name
  if (productName) {
    selectors.unshift(
      `img[alt="${productName}"]`,
      `img[alt*="${productName}"]`,
      `img[title="${productName}"]`,
      `img[title*="${productName}"]`
    );
  }

  let imageUrl = null;
  
  for (const selector of selectors) {
    const img = document.querySelector(selector);
    if (img) {
      imageUrl = img.getAttribute('data-image-large-src') || 
                img.getAttribute('data-zoom-image') ||
                img.getAttribute('src');
      if (imageUrl) break;
    }
  }

  if (!imageUrl) {
    console.warn('No product image found on page');
  }
  
  return imageUrl;
}

// Content script for Google Lens results page
const isGoogleLensPage = () => {
  // Check if this is a Google search page with Lens results
  return window.location.href.includes('google.com/search') && 
         window.location.href.includes('vsrid=');
};

// Helper function to extract numeric price value
function extractPriceValue(priceString: string): string {
  // Remove all non-numeric characters except decimal point
  const numericPrice = priceString.replace(/[^0-9.]/g, '');
  // Return empty string if no valid number found
  return numericPrice || '';
}

if (isGoogleLensPage()) {
  console.log('Parsing Google Lens results...');
  
  // Wait for results to load
  setTimeout(() => {
    const results: ProductData[] = [];
    
    document.querySelectorAll('div.kb0PBd.cvP2Ce').forEach((productElement: Element) => {
      const title = productElement.querySelector('.R8BTeb.q8U8x.LJEGod.du278d.i0Rdmd')?.textContent || '';
      const rawPrice = productElement.querySelector('.EwVMFc')?.textContent || '';
      const price = extractPriceValue(rawPrice);
      const link = productElement.querySelector('a.LBcIee') as HTMLAnchorElement;
      const productLink = link?.href || '';
      const img = (productElement.querySelector('div.gdOPf.q07dbf.uhHOwf.ez24Df img') as HTMLImageElement)?.src || '';
      const inStock = Boolean(productElement.querySelector('.h2YlCf')?.textContent);

      if (title && price) {
        results.push({ title, price, productLink, img, inStock });
      }
    });

    chrome.runtime.sendMessage({ 
      action: "searchResults", 
      data: results 
    });
  }, 5000); // Adjust timeout as needed
}