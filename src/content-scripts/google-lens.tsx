import { ProductData } from '../types';

// Helper function to extract numeric price value
function extractPriceValue(priceString: string): number | null {
  // Remove all non-numeric characters except decimal point
  const numericPrice = priceString.replace(/[^0-9.]/g, '');
  // Convert to number or return null if invalid
  const price = parseFloat(numericPrice);
  return isNaN(price) ? null : price;
}

// Check if this is a Google search page with Lens results
const isGoogleLensPage = () => {
  return window.location.href.includes('google.com/search') && 
         window.location.href.includes('vsrid=');
};

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