import { Category } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'MANAGER' | 'ADMIN';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: Category;
  // image: string;
  sellerId: string;
  marketId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Market {
  id: string;
  name: string;
  location: string | 'COTONOU' | 'BOHICON' | 'PORTO-NOVO';
  description: string;
  managerId: string;
  manager: User;
  image?: string; // Ajout de la propriété image
  marketSellers: MarketSeller[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketSeller {
  id: string;
  sellerId: string;
  marketId: string;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  products: OrderItem[];
  status: string | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}