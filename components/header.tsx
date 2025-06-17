"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, X, LogOut, Home, ShoppingCart, ChevronDown, Settings, Store, Package } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useSession } from '@/lib/use-session';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { session, isLoading } = useSession();
  const user = session?.user;

  // Détecter le défilement pour ajouter des effets visuels au header
  useEffect(() => {
    console.log(user, isLoading);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isScrolled && "shadow-sm"
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
          {user && <MainNav userRole={user?.role} />}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Mode Toggle */}
          <ModeToggle />
          
          {/* User Section */}
          { !user ? (
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
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Image
                    src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                    alt={user?.name || 'User Avatar'}
                    className="h-8 w-8 rounded-full"
                    width={32}
                    height={32}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mon compte</span>
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'SELLER' && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller">
                      <Store className="mr-2 h-4 w-4" />
                      <span>Espace vendeur</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Administration</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
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
            {session && (
              <div className="pb-6 mb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                    <AvatarImage src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-start rounded-xl border-primary/20 hover:border-primary hover:bg-primary/5">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      Mon compte
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Navigation Links modernisés */}
            <div className={cn("py-6", session ? "" : "pt-0")}>
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
                
                {session && (user?.role === 'SELLER' || user?.role === 'ADMIN') && (
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
                
                {session && (user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
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
                    <Settings className="h-4 w-4 mr-3" />
                    Espace Manager
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}