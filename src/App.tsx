import { useState, useEffect } from 'react'
import { SimilarProductsPage } from './components/SimilarProductsPage';
import { ComparisonPage } from './components/ComparisonPage';
import type { Product, ProductData } from './types';
import { logger } from './utils/logger';

function App() {
  const [currentPage] = useState('similar');

  const [preferences, setPreferences] = useState({
    notifyExactMatches: true,
    notifySimilarMatches: true,
    showPriceHistory: false
  });

  const [similarProducts, setSimilarProducts] = useState<Product[]>([
    {
      name: 'Misty Boucle Accent Chair',
      store: 'TOV Furniture',
      manufacturer: 'Manufacturer',
      price: 649.99,
      savings: 200.00,
      matchPercentage: 100,
      link: ''
    },
    {
      name: 'Tov Furniture Misty Cream Boucle Accent Chair',
      store: 'Amazon',
      price: 669.99,
      savings: 180.00,
      matchPercentage: 100,
      link: ''
    },
    {
      name: 'AllModern Vivi Leather',
      store: 'The Home Depot',
      verifiedSeller: true,
      price: 659.99,
      savings: 190.00,
      matchPercentage: 77,
      link: ''
    }
  ]);
  const [currentSaaS] = useState({
    category: 'VPN Services',
    products: [
      {
        name: 'Mullvad VPN',
        monthlyPrice: 6.99,
        yearlyPrice: 59.88,
        badge: 'Best Overall',
        badgeColor: 'blue' as const,
        pros: ['Large server network', 'Strong security features', 'Fast speeds'],
        cons: ['Expensive monthly plan', 'No free tier']
      },
      {
        name: 'ExpressVPN',
        monthlyPrice: 8.95,
        yearlyPrice: 89.95,
        badge: 'Premium Choice',
        badgeColor: 'purple' as const,
        pros: ['Fastest speeds', 'Great for streaming', 'Wide country coverage'],
        cons: ['Premium pricing', 'Fewer simultaneous connections']
      },
      {
        name: 'Surfshark',
        monthlyPrice: 5.95,
        yearlyPrice: 47.88,
        badge: 'Best Value',
        badgeColor: 'green' as const,
        pros: ['Unlimited devices', 'Affordable plans', 'Good features'],
        cons: ['Newer provider', 'Variable speeds']
      }
    ]
  });

  useEffect(() => {
    logger.debug('Setting up product update listener');

    // Let background know popup is open and ready for data
    chrome.runtime.sendMessage({ action: "popupOpened" });
    
    // Listen for product updates
    const messageListener = (message: any) => {
      if (message.action === "tabProductsUpdate") {
        const { products, sourcePrice } = message.data;
        
        if (!products.length) {
          logger.warn('No products available for this tab');
          setSimilarProducts([]);
          return;
        }

        try {
          const formattedProducts = products.map((product: ProductData) => ({
            name: product.title,
            store: new URL(product.productLink).hostname,
            price: product.price,
            savings: sourcePrice ? sourcePrice - product.price : 0,
            matchPercentage: 100,
            link: product.productLink
          }));
          logger.info(`Formatted ${formattedProducts.length} products`);
          setSimilarProducts(formattedProducts);
        } catch (error) {
          logger.error('Error formatting products:', error as Error);
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <div className="w-[400px] h-[500px] bg-white text-gray-800">
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-orange-600">Igni</h1>
        <span className="text-sm text-gray-500">
          Shop items not brands
        </span>
      </header>
      
      <main className="p-4 space-y-4 overflow-y-auto">
        {currentPage === 'similar' ? (
          <SimilarProductsPage
            similarProducts={similarProducts}
            preferences={preferences}
            setPreferences={setPreferences}
          />
        ) : (
          <ComparisonPage
            category={currentSaaS.category}
            products={currentSaaS.products}
          />
        )}
      </main>
    </div>
  );
}

export default App
