"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, Package, Store, Settings } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

interface NavProps {
  userRole?: 'BUYER' | 'SELLER' | 'MANAGER' | 'ADMIN' | string | null;
}

export function MainNav({ userRole }: NavProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Accueil",
      active: pathname === "/",
      roles: ['BUYER', 'SELLER', 'MANAGER', 'ADMIN', null],
    },
    {
      href: "/marketplace",
      label: "Produits",
      active: pathname === "/marketplace",
      roles: ['BUYER', 'SELLER', 'MANAGER', 'ADMIN', null],
      icon: <ShoppingBag className="h-4 w-4 mr-2" />,
    },
    {
      href: "/seller",
      label: "Espace Vendeur",
      active: pathname === "/seller",
      roles: ['SELLER', 'ADMIN'],
      icon: <Package className="h-4 w-4 mr-2" />,
    },
    {
      href: "/manager",
      label: "Gestion du Marché",
      active: pathname === "/manager",
      roles: ['MANAGER', 'ADMIN'],
      icon: <Store className="h-4 w-4 mr-2" />,
    },
    {
      href: "/admin",
      label: "Administration",
      active: pathname === "/admin",
      roles: ['ADMIN'],
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes
        .filter((route) => !userRole || route.roles.includes(userRole))
        .map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {route.icon}
            {route.label}
          </Link>
        ))}
      <div className="ml-auto">
        <ModeToggle />
      </div>
    </nav>
  );
}