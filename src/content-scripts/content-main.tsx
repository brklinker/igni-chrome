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
  price: number;
  productLink: string;
  img: string;
  inStock?: boolean;
}

// Content script for product pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Content script received message:', request);

  if (request.action === "getProductInfo") {
    try {
      const { productImageUrl, productName, productPrice } = getProductInfo();
      console.info('Found the product info', productImageUrl, productName, productPrice);

      sendResponse({ productImageUrl, productName, productPrice });

    } catch (error) {
      console.error('Error finding product image:', error instanceof Error ? error : new Error(String(error)));
      sendResponse({ error: error instanceof Error ? error.message : String(error) });
    }
  }
  return true;
});

// main function for different methods to get product info
function getProductInfo(): { productImageUrl: string | null; productName: string | null; productPrice: number | null } {
  const { productImageUrl, productName, productPrice } = findProductInfoJsonLD();
  console.info('Found the product info', productImageUrl, productName, productPrice);
  return { productImageUrl, productName, productPrice };
}

function findProductInfoJsonLD(): { productImageUrl: string | null; productName: string | null; productPrice: number | null } {
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
  for (const script of jsonLdScripts) {
      try {
          const jsonLdContent = script.textContent;
          if (!jsonLdContent) continue;
          
          const data = JSON.parse(jsonLdContent);
          
          const extractInfo = (product: any) => ({
              productName: product["name"]?.[0]?.["@value"] || product.name || null,
              productPrice: product["offers"]?.[0]?.["price"] || product.offers?.price || null,
              productImageUrl: Array.isArray(product.image) ? product.image[0] : product.image || null,
          });
          
          const objects = Array.isArray(data) ? data : [data];
          console.info('Found the objects', objects);
          for (const obj of objects) {
              console.info('Found the obj', obj);
              if (obj["@type"]?.includes("ProductGroup")) {
                  console.info('Found the ProductGroup', obj);
                  const variants = obj["hasVariant"] || [];
                  console.info('Found the variants', variants);
                  for (const variant of variants) {
                      console.info('Found the variant', variant);
                      if (variant["@type"]?.includes("Product")) {
                          console.info('Found the Product', variant);
                          const productInfo = extractInfo(variant);
                          console.info('Found the productInfo', productInfo);
                          return productInfo; 
                      }
                  }
              }
              if (obj["@type"]?.includes("Product")) {
                  const productInfo = extractInfo(obj);
                  return productInfo;
              }
          }
      } catch (error) {
          console.error("Error parsing JSON-LD data", error);
          continue;
      }
  }
  return { productImageUrl: null, productName: null, productPrice: null };
}


// function findProductInfo(): { imageUrl: string | null; productName: string | null; productPrice: number | null } {
//   console.debug('Searching for product image');
//   // Try different common selectors for product images
//   const selectors = [
//     'img[id*="product"][src*="http"]',
//     'img[class*="product"][src*="http"]',
//     'img[id*="main"][src*="http"]',
//     'img[class*="main"][src*="http"]',
//     'img[data-image-large-src]',
//     '.product-image img',
//     '.product-main-image img'
//   ];
//   // Try to find product name first
//   const nameSelectors = [
//     'h1[class*="product-title"]',
//     'h1[class*="product-name"]',
//     'h1[itemprop="name"]',
//     '.product-title',
//     '.product-name',
//     '#product-title',
//     '#product-name'
//   ];
//   const priceSelectors = [
//     '[itemprop="price"]',
//     '[class*="product-price"]',
//     '[id*="product-price"]',
//     '.price',
//     '#price',
//     '.current-price',
//     '.sale-price',
//     '[data-price]',
//     '[data-product-price]'
//   ];


//   let productName = null;
//   for (const selector of nameSelectors) {
//     const nameElement = document.querySelector(selector);
//     if (nameElement?.textContent) {
//       productName = nameElement.textContent.trim();
//       break;
//     }
//   }

//   // Add image selectors that look for alt text matching product name
//   if (productName) {
//     // Split product name into words and filter out common words
//     const significantWords = productName
//       .toLowerCase()
//       .split(/\s+/)
//       .filter(word => word.length > 2) // Filter out short words
//       .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape special characters

//     // Create selectors that match if the alt/title contains most of the significant words
//     const wordSelectors = significantWords
//       .map(word => [
//         `img[alt*="${word}" i]`,
//         `img[title*="${word}" i]`
//       ])
//       .flat();

//     selectors.unshift(...wordSelectors);
//   }

//   let imageUrl = null;
//   let maxEstimatedQuality = 0;
  
//   for (const selector of selectors) {
//     const img = document.querySelector<HTMLImageElement>(selector);
//     if (img) {
//       const possibleUrls = [
//         img.getAttribute('data-image-large-src'),
//         img.getAttribute('data-zoom-image'),
//         img.getAttribute('data-original'),
//         img.getAttribute('data-super-size-src'),
//         img.getAttribute('data-max-size-src'),
//         img.getAttribute('src')
//       ].filter(Boolean) as string[];

//       for (const url of possibleUrls) {
//         let estimatedQuality = 0;
        
//         // Check URL for resolution indicators
//         const lowerUrl = url.toLowerCase();
//         if (lowerUrl.includes('large')) estimatedQuality += 100;
//         if (lowerUrl.includes('zoom')) estimatedQuality += 200;
//         if (lowerUrl.includes('high')) estimatedQuality += 150;
//         if (lowerUrl.includes('full')) estimatedQuality += 150;
//         if (lowerUrl.includes('original')) estimatedQuality += 200;
//         if (lowerUrl.includes('max')) estimatedQuality += 200;
        
//         // Check for resolution in URL (e.g., 1200x800)
//         const resMatch = url.match(/(\d{3,4})[x×](\d{3,4})/i);
//         if (resMatch) {
//           const area = parseInt(resMatch[1]) * parseInt(resMatch[2]);
//           estimatedQuality += area / 1000;
//         }
        
//         // Check size indicators in the element
//         const width = img.getAttribute('width');
//         const height = img.getAttribute('height');
//         if (width && height) {
//           const area = parseInt(width) * parseInt(height);
//           estimatedQuality += area / 1000;
//         }
        
//         // Prefer URLs that don't contain 'thumb' or 'small'
//         if (lowerUrl.includes('thumb') || lowerUrl.includes('small')) {
//           estimatedQuality -= 200;
//         }

//         if (estimatedQuality > maxEstimatedQuality) {
//           maxEstimatedQuality = estimatedQuality;
//           imageUrl = url;
//         }
//       }
//     }
//   }

//   let productPrice = null;
//   for (const selector of priceSelectors) {
//     const priceElement = document.querySelector(selector);
//     if (priceElement) {
//       // Get all text nodes within the element
//       const walker = document.createTreeWalker(
//         priceElement,
//         NodeFilter.SHOW_TEXT,
//         null
//       );

//       // Check each text node until we find a valid price
//       let node;
//       while ((node = walker.nextNode())) {
//         const priceText = node.textContent?.trim() || '';
//         if (priceText) {
//           const numericPrice = extractPriceValue(priceText);
//           if (numericPrice) {
//             productPrice = numericPrice;
//             break;
//           }
//         }
//       }
      
//       if (productPrice) break; // Exit outer loop if price found
//     }
//   }

//   if (!imageUrl) {
//     console.warn('No product image found on page');
//   }
  
//   return { imageUrl, productName, productPrice };
// }
