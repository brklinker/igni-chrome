import { useState } from 'react';

interface SaaSProduct {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge: string;
  badgeColor: 'blue' | 'purple' | 'green' | undefined;
  pros: string[];
  cons: string[];
}

interface ComparisonPageProps {
  category: string;
  products: SaaSProduct[];
}

const getBadgeColors = (color: 'blue' | 'purple' | 'green') => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700'
  };
  return colors[color] || colors.blue;
};

export function ComparisonPage({
  category,
  products
}: ComparisonPageProps) {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const toggleExpand = (productName: string) => {
    setExpandedProduct(expandedProduct === productName ? null : productName);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{category}</h2>
        </div>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{product.name}</h3>
                {product.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded ${getBadgeColors(product.badgeColor || 'blue')}`}>
                    {product.badge}
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Pricing Section */}
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span>Monthly</span>
                <span className="font-semibold">${product.monthlyPrice}/mo</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span>Yearly</span>
                <div>
                  <span className="font-semibold">${(product.yearlyPrice / 12).toFixed(2)}/mo</span>
                  <span className="text-sm text-green-600 ml-2">
                    Save ${((product.monthlyPrice * 12) - product.yearlyPrice).toFixed(2)}/yr
                  </span>
                </div>
              </div>

              {/* Pros & Cons Dropdown */}
              <button
                onClick={() => toggleExpand(product.name)}
                className="w-full text-left p-2 bg-white rounded flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Pros & Cons</span>
                <span className={`transform transition-transform ${
                  expandedProduct === product.name ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </button>
              
              {expandedProduct === product.name && (
                <div className="space-y-2 text-sm p-2 bg-white rounded">
                  <div className="text-green-600">
                    {product.pros.map((pro, i) => (
                      <div key={i}>✓ {pro}</div>
                    ))}
                  </div>
                  <div className="text-red-600 mt-1">
                    {product.cons.map((con, i) => (
                      <div key={i}>✗ {con}</div>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors text-sm">
                Visit Website
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}