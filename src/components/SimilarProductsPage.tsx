interface Product {
  name: string;
  store: string;
  manufacturer?: string;
  price: number;
  savings: number;
  matchPercentage: number;
  verifiedSeller?: boolean;
  link: string;
}

interface Preferences {
  notifyExactMatches: boolean;
  notifySimilarMatches: boolean;
  showPriceHistory: boolean;
}

interface SimilarProductsPageProps {
  similarProducts: Product[];
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
}

export function SimilarProductsPage({ 
  similarProducts, 
  preferences, 
  setPreferences
}: SimilarProductsPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Similar Items</h2>
      </div>

      <div className="space-y-4">
        {similarProducts.map((product, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                    {product.matchPercentage}% match
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>{product.store}</span>
                  {product.manufacturer && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {product.manufacturer}
                    </span>
                  )}
                  {product.verifiedSeller && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                      Verified Seller
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-orange-500">${product.price}</div>
                <div className="text-sm text-green-600">Save ${product.savings.toFixed(2)}</div>
              </div>
            </div>
            <a 
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors text-sm mt-2 text-center"
            >
              View Item
            </a>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <h3 className="font-semibold mb-3">Preferences</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.notifyExactMatches}
              onChange={(e) => setPreferences({ ...preferences, notifyExactMatches: e.target.checked })}
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm">Notify for exact matches</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.notifySimilarMatches}
              onChange={(e) => setPreferences({ ...preferences, notifySimilarMatches: e.target.checked })}
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm">Notify for similar matches</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.showPriceHistory}
              onChange={(e) => setPreferences({ ...preferences, showPriceHistory: e.target.checked })}
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm">Show price history</span>
          </label>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        Shop items not brands
      </div>
    </div>
  );
}