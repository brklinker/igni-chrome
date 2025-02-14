export interface ProductData {
  title: string;
  price: string;
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