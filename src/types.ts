export interface ProductData {
  title: string;
  price: number;
  productLink: string;
  img: string;
  inStock?: boolean;
}

export interface Product {
  name: string;
  store: string;
  price: number;
  savings: number;
  matchPercentage: number;
  manufacturer?: string;
  verifiedSeller?: boolean;
  link: string;
}

export interface RelatedProductsResult {
  products: ProductData[];
  sourcePrice: number | null;
} 