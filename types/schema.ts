import { Role, OrderStatus, Location } from "@prisma/client";

/**
 * User roles in the system
 */
export { Role };

/**
 * Order status values
 */
export { OrderStatus };

/**
 * Location values for markets and users
 */
export { Location };

/**
 * Type guard to check if a value is a valid Role
 */
export const isRole = (value: string): value is Role => {
  return Object.values(Role).includes(value as Role);
};

/**
 * Type guard to check if a value is a valid OrderStatus
 */
export const isOrderStatus = (value: string): value is OrderStatus => {
  return Object.values(OrderStatus).includes(value as OrderStatus);
};

/**
 * Type guard to check if a value is a valid Location
 */
export const isLocation = (value: string): value is Location => {
  return Object.values(Location).includes(value as Location);
};

/**
 * Array of all possible Role values
 */
export const ROLES = Object.values(Role);

/**
 * Array of all possible OrderStatus values
 */
export const ORDER_STATUSES = Object.values(OrderStatus);

/**
 * Array of all possible Location values
 */
export const LOCATIONS = Object.values(Location);

/**
 * Type-safe way to get the display name for a Role
 */
export const getRoleDisplayName = (role: Role): string => {
  const names: Record<Role, string> = {
    [Role.ADMIN]: "Administrator",
    [Role.MANAGER]: "Market Manager",
    [Role.SELLER]: "Seller",
    [Role.BUYER]: "Buyer",
  };
  return names[role] || role;
};

/**
 * Type-safe way to get the display name for an OrderStatus
 */
export const getOrderStatusDisplayName = (status: OrderStatus): string => {
  const names: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "Pending",
    [OrderStatus.CONFIRMED]: "Confirmed",
    [OrderStatus.SHIPPED]: "Shipped",
    [OrderStatus.DELIVERED]: "Delivered",
    [OrderStatus.CANCELLED]: "Cancelled",
  };
  return names[status] || status;
};

/**
 * Type-safe way to get the display name for a Location
 */
export const getLocationDisplayName = (location: Location): string => {
  const names: Record<Location, string> = {
    [Location.COTONOU]: "Cotonou",
    [Location.BOHICON]: "Bohicon",
    [Location.PORTO_NOVO]: "Porto-Novo",
  };
  return names[location] || location;
};
