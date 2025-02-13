import { useState, useEffect } from 'react'
import { SimilarProductsPage } from './components/SimilarProductsPage';
import { ComparisonPage } from './components/ComparisonPage';

// interface ProductData {
//   title: string;
//   price: string;
//   productLink: string;
//   img: string;
// }


function App() {
  const [currentPage, setCurrentPage] = useState('similar');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || '';
      console.log("currentUrl", currentUrl);
      setCurrentPage(currentUrl.includes('worldmarket.com') ? 'similar' : 'not');
    });
  }, []);
  const [preferences, setPreferences] = useState({
    notifyExactMatches: true,
    notifySimilarMatches: true,
    showPriceHistory: false
  });

  // useEffect(() => {
  //   // Check if we're in a Chrome extension environment
  //   if (!chrome?.runtime?.onMessage) {
  //     console.warn('Chrome extension APIs not available');
  //     return;
  //   }

  //   // Define the message handler
  //   const messageHandler = (message: any) => {
  //     console.log("In App.tsx, listener for message", message);
  //     if (message.action === "sendProductData") {
  //       setProducts(message.data);
  //     }
  //   };

  //   // Add listener
  //   chrome.runtime.onMessage.addListener(messageHandler);

  //   // Cleanup listener on unmount
  //   return () => {
  //     chrome.runtime.onMessage.removeListener(messageHandler);
  //   };
  // }, []);

  const [similarProducts] = useState([
    {
      name: 'Misty Boucle Accent Chair',
      store: 'TOV Furniture',
      manufacturer: 'Manufacturer',
      price: 649.99,
      savings: 200.00,
      matchPercentage: 100
    },
    {
      name: 'Tov Furniture Misty Cream Boucle Accent Chair',
      store: 'Amazon',
      price: 669.99,
      savings: 180.00,
      matchPercentage: 100
    },
    {
      name: 'AllModern Vivi Leather',
      store: 'The Home Depot',
      verifiedSeller: true,
      price: 659.99,
      savings: 190.00,
      matchPercentage: 77
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
    // Check if we're in a Chrome extension environment
    if (chrome?.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage({ 
          action: "newMatches", 
          count: similarProducts.length,
          data: similarProducts 
        });
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }, [similarProducts]);

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
