import { Category, Prisma } from "@prisma/client";
import { Role, Location, OrderStatus } from "./schema";

export { Role, Location, OrderStatus } from "./schema";

// Forward declarations or careful ordering might be needed for complex circular dependencies,
// but TypeScript interfaces usually handle this well.

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string; // Typically not exposed on client-side types
  role: Role; // User role in the system
  location?: Location | null; // User's location
  image?: string | null; // Schema: String?
  createdAt?: Date;
  updatedAt?: Date;
  session?: string | null; // Added from schema
  // Consider adding relations if fetched and used client-side:
  orders?: Order[];
  soldItems?: OrderItem[]; // If 'soldItems' is a custom aggregation
  market?: Market[]; // If user can manage multiple markets
  marketSellers?: MarketSellers[];
}

// Renamed from MarketSeller to MarketSellers to match Prisma Model
export interface MarketSellers {
  // id: string; // Prisma's MarketSellers uses a composite @@id([marketId, sellerId])
  marketId: string;
  sellerId: string;
  // Relations
  market: Market;
  seller: User;
  products: Product[];
  // createdAt & updatedAt removed as they are not in Prisma's MarketSellers model
}

export interface Product {
  id: string;
  name: string;
  description: string | null; // Schema: String?
  price: Prisma.Decimal | number; // Updated to Prisma.Decimal
  stock: number;
  image: string | null; // Schema: String?
  sellerId: string | null; // Schema: String?
  marketId: string | null; // Schema: String?
  categoryId: string | null; // Added from schema (field for relation)
  createdAt: Date;
  updatedAt: Date;
  normalizedImagePath?: string; // Custom field, kept as optional

  // Relations
  seller?: MarketSellers | null; // Updated type to MarketSellers and nullable
  category?: Category | null; // Relation is optional in schema
  // orderItems?: OrderItem[];
}

export interface Market {
  id: string;
  name: string;
  location: Location; // Updated to Enum
  description: string | null; // Schema: String?
  managerId: string;
  image?: string | null; // Schema: String?
  createdAt: Date;
  updatedAt: Date;

  // Relations
  manager: User;
  marketSellers: MarketSellers[];
}

export interface OrderItem {
  id: string; // Added from schema
  orderId: string; // Added from schema
  productId: string;
  sellerId: string; // Added from schema
  quantity: number;
  unitPrice: Prisma.Decimal; // Updated to Prisma.Decimal
  createdAt: Date; // Added from schema
  updatedAt: Date; // Added from schema

  // Relations
  order: Order;
  product: Product;
  seller: User;
}

export interface Order {
  id: string;
  buyerId: string;
  // sellerId: string; // sellerId is on OrderItem, not directly on Order in schema
  status: OrderStatus; // Updated to Enum
  totalAmount: Prisma.Decimal; // Updated to Prisma.Decimal
  createdAt: Date;
  updatedAt: Date;

  // Relations
  buyer: User;
  items: OrderItem[]; // Renamed from 'products' for clarity and consistency with schema relation name
}