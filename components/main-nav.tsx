"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, Package, Store, Settings } from "lucide-react";

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
      href: "/markets",
      label: "Marchés",
      active: pathname === "/markets",
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
    <nav className="flex items-center space-x-5 lg:space-x-8">
      {routes
        .filter((route) => !userRole || route.roles.includes(userRole))
        .map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center text-sm font-medium transition-all duration-200 relative group",
              route.active 
                ? "text-primary" 
                : "text-foreground/70 hover:text-primary"
            )}
          >
            {route.icon && (
              <div className="relative mr-2">
                {React.cloneElement(route.icon as React.ReactElement, { 
                  className: cn(
                    "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                    (route.icon as React.ReactElement).props.className
                  )
                })}
                {route.active && (
                  <span className="absolute -inset-1 rounded-full bg-primary/10 -z-10"></span>
                )}
              </div>
            )}
            {route.label}
            {route.active && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full transform scale-x-100 origin-left"></span>
            )}
            {!route.active && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"></span>
            )}
          </Link>
        ))}
      <div className="ml-auto">
      </div>
    </nav>
  );
}