"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, X, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {useUser} from "@/hooks/useUser";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";


export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user} = useUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <ShoppingBag className="h-6 w-6 mr-2" />
          <span className="text-xl font-bold">MarketBenin</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden ml-auto md:flex md:items-center md:space-x-4">
          {user && <MainNav userRole={user.role} />}
          
          {!user ? (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Se connecter</Button>
              </Link>
              <Link href="/auth/register">
                <Button>S'inscrire</Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background py-2 px-1 shadow-lg">
                <DropdownMenuItem className="flex items-center space-x-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground">
                  <User className="h-4 w-4" />
                  <Link href="/account">
                    <span className="font-medium">Mon Compte</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground">
                  <LogOut className="h-4 w-4" />
                  <Link href="/auth/logout">
                    <span className="font-medium">Se d&eacute;connecter</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center ml-auto md:hidden">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="ml-2">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b">
          <div className="container py-4 px-4 sm:px-6 flex flex-col space-y-4">
            <Link
              href="/"
              className={`text-sm font-medium ${
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/marketplace"
              className={`text-sm font-medium ${
                pathname === "/marketplace" ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Produits
            </Link>
            
            {(user && (user.role === 'SELLER' || user.role === 'ADMIN')) && (
              <Link
                href="/seller"
                className={`text-sm font-medium ${
                  pathname === "/seller" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Espace Vendeur
              </Link>
            )}
            
            {(user && (user.role === 'MANAGER' || user.role === 'ADMIN')) && (
              <Link
                href="/manager"
                className={`text-sm font-medium ${
                  pathname === "/manager" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Gestion du Marché
              </Link>
            )}
            
            {user && (user.role === 'ADMIN') && (
              <Link
                href="/admin"
                className={`text-sm font-medium ${
                  pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Administration
              </Link>
            )}
            
            {!user ? (
              <div className="flex flex-col space-y-2">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Se connecter</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">S'inscrire</Button>
                </Link>
              </div>
            ) : (
              <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Mon compte
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}