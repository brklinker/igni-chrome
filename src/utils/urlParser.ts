// Common product URL patterns
const PRODUCT_INDICATORS = [
  '/product/',
  '/products/',
  '/dp/',
  '/item/',
  '/p/',
  '/pd/',
];

export function isProductPage(url: string): boolean {
  if (!url) return false;
  
  return PRODUCT_INDICATORS.some(indicator => 
    url.toLowerCase().includes(indicator.toLowerCase())
  );
} 