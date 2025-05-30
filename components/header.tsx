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
    if (!user?.image) return null;
    
    const imagePath = user.image as string;
    
    if (imagePath.startsWith('/users-img/')) return `/assets${imagePath}`;
    if (imagePath.includes('public/assets/')) return `/${imagePath.split('public/')[1]}`;
    if (imagePath.includes('assets/')) return `/${imagePath}`;
    return `/assets/users-img/${imagePath.split('/').pop()}`;
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-200",
      isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background border-b"
    )}>
      <div className="container flex h-16 items-center px-4 sm:px-6 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold hidden sm:inline-block">MarketBenin</span>
          <span className="text-xl font-bold sm:hidden">MB</span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-4">
          {!loading && user && <MainNav userRole={user.role} />}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Mode Toggle */}
          <ModeToggle />
          
          {/* User Section */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
          ) : !user ? (
            <div className="hidden sm:flex items-center space-x-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">S'inscrire</Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 rounded-full h-8 pl-2 pr-3 hover:bg-accent focus:bg-accent"
                >
                  <Avatar className="h-7 w-7 border border-primary/10">
                    <AvatarImage src={getProfileImage() || `https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline-block truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'SELLER' && (
                  <DropdownMenuItem>
                    <Store className="h-4 w-4 mr-2" />
                    <Link href="/seller">Espace Vendeur</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <Link href="/admin">Administration</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  <Link href="/account">Mon Compte</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  <Link href="/auth/logout">Se déconnecter</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-background/95 backdrop-blur-sm md:hidden overflow-y-auto">
          <div className="container py-6 px-6 flex flex-col divide-y">
            {/* Mobile User Profile - Show only if logged in */}
            {!loading && user && (
              <div className="pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={getProfileImage() || `https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-base font-medium">{user.name}</h3>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Mon compte
                    </Button>
                  </Link>
                  <Link href="/auth/logout" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Navigation Links */}
            <div className={cn("py-4", !loading && user ? "" : "pt-0")}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">NAVIGATION</h3>
              <nav className="grid gap-2">
                <Link
                  href="/"
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === "/" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4 mr-3" />
                  Accueil
                </Link>
                <Link
                  href="/marketplace"
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === "/marketplace" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-4 w-4 mr-3" />
                  Produits
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