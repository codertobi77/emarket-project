"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, X, LogOut, Home, ShoppingCart, ChevronDown, Settings, Store } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useUser } from "@/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";


export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {user, loading} = useUser();

  // Détecter le défilement pour ajouter des effets visuels au header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Préparer le chemin d'image pour l'avatar de l'utilisateur
  const getProfileImage = () => {
    if (!user?.image) return undefined;
    
    const imagePath = user.image as string;
    
    if (imagePath.startsWith('/users-img/')) return `/assets${imagePath}`;
    if (imagePath.includes('public/assets/')) return `/${imagePath.split('public/')[1]}`;
    if (imagePath.includes('assets/')) return `/${imagePath}`;
    return `/assets/users-img/${imagePath.split('/').pop()}`;
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "bg-background/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)]" 
        : "bg-background border-b border-border/40"
    )}>
      <div className="container flex h-16 items-center px-4 sm:px-6 justify-between">
        {/* Logo modernisé */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <ShoppingBag className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute -inset-1 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-bold hidden sm:inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">e-Axi</span>
          <span className="text-xl font-bold sm:hidden bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">e-Axi</span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-4">
          {!loading && user && <MainNav userRole={user.role} />}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Mode Toggle */}
          <ModeToggle />
          
          {/* User Section */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse"></div>
          ) : !user ? (
            <div className="hidden sm:flex items-center space-x-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground hover:bg-primary/5 transition-all duration-200 rounded-xl">
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
                  S'inscrire
                </Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 rounded-full h-9 pl-2 pr-3 hover:bg-primary/5 focus:bg-primary/5 border border-transparent hover:border-primary/10 transition-all duration-200"
                >
                  <img
                    src={getProfileImage()}
                    className="h-7 w-7 rounded-full object-cover border-4 border-primary/10 group-hover:opacity-80 transition-opacity cursor-pointer"
                    onError={(e) => {
                      console.error('Erreur de chargement de l\'image:', e.currentTarget.src);
                      // Afficher une lettre à la place de l'image en cas d'erreur
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm font-medium hidden sm:inline-block truncate max-w-[100px] text-foreground/90">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-primary/70 hidden sm:block transition-transform duration-200 ease-in-out" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 border border-border/50 shadow-lg rounded-xl">
                <DropdownMenuLabel className="font-normal rounded-lg p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                {user.role === 'SELLER' && (
                  <DropdownMenuItem className="rounded-lg hover:bg-primary/5 transition-colors duration-200 py-2 px-3">
                    <Store className="h-4 w-4 mr-2 text-primary" />
                    <Link href="/seller" className="flex-1">Espace Vendeur</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem className="rounded-lg hover:bg-primary/5 transition-colors duration-200 py-2 px-3">
                    <Settings className="h-4 w-4 mr-2 text-accent" />
                    <Link href="/admin" className="flex-1">Administration</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="rounded-lg hover:bg-primary/5 transition-colors duration-200 py-2 px-3">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  <Link href="/account" className="flex-1">Mon Compte</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem className="rounded-lg hover:bg-red-500/10 transition-colors duration-200 py-2 px-3 text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  <Link href="/auth/logout" className="flex-1">Se déconnecter</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Bouton de menu mobile modernisé */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu} 
            className="md:hidden relative p-2 rounded-full hover:bg-primary/5 transition-all duration-200"
          >
            <div className="absolute inset-0 rounded-full bg-primary/5 scale-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"></div>
            {isMenuOpen ? 
              <X className="h-5 w-5 text-primary transition-transform duration-300 ease-out" /> : 
              <Menu className="h-5 w-5 text-primary transition-transform duration-300 ease-out" />
            }
          </Button>
        </div>
      </div>

      {/* Menu mobile modernisé */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-background/98 backdrop-blur-md md:hidden overflow-y-auto">
          <div className="container py-8 px-6 flex flex-col divide-y divide-border/30">
            {/* Mobile User Profile - Show only if logged in */}
            {!loading && user && (
              <div className="pb-6 mb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                    <AvatarImage src={getProfileImage() || `https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-start rounded-xl border-primary/20 hover:border-primary hover:bg-primary/5">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      Mon compte
                    </Button>
                  </Link>
                  <Link href="/auth/logout" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Navigation Links modernisés */}
            <div className={cn("py-6", !loading && user ? "" : "pt-0")}>
              <h3 className="text-sm font-semibold text-primary/80 mb-4 tracking-wider">NAVIGATION</h3>
              <nav className="grid gap-3">
                <Link
                  href="/"
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                    pathname === "/" 
                      ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/10" 
                      : "text-foreground/80 hover:bg-primary/5 hover:text-primary hover:border-primary/10 border border-transparent"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span className="font-medium">Accueil</span>
                </Link>
                <Link
                  href="/marketplace"
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200",
                    pathname === "/marketplace" 
                      ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/10" 
                      : "text-foreground/80 hover:bg-primary/5 hover:text-primary hover:border-primary/10 border border-transparent"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  <span className="font-medium">Produits</span>
                </Link>
                
                {!loading && user && (user.role === 'SELLER' || user.role === 'ADMIN') && (
                  <Link
                    href="/seller"
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === "/seller" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Store className="h-4 w-4 mr-3" />
                    Espace Vendeur
                  </Link>
                )}
                
                {!loading && user && (user.role === 'MANAGER' || user.role === 'ADMIN') && (
                  <Link
                    href="/manager"
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === "/manager" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Store className="h-4 w-4 mr-3" />
                    Gestion du Marché
                  </Link>
                )}
                
                {!loading && user && (user.role === 'ADMIN') && (
                  <Link
                    href="/admin"
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === "/admin" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Administration
                  </Link>
                )}
              </nav>
            </div>
            
            {/* Authentication - Show only if not logged in */}
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-full h-10 rounded bg-muted animate-pulse"></div>
              </div>
            ) : !user && (
              <div className="pt-4 mt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">COMPTE</h3>
                <div className="space-y-3">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="block">
                    <Button className="w-full justify-start">
                      Créer un compte
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}