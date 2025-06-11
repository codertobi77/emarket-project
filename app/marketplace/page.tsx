"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, Market } from "@/types";
import { Search, ShoppingCart, Star, Filter, FilterX, ChevronRight, Tag } from "lucide-react";
import { Category } from "@prisma/client";
// Pas besoin de framer-motion
import { cn } from "@/lib/utils";


export const dynamic = "force-dynamic";
export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  useEffect(() => {
    fetchProducts();
    fetchMarkets();
    fetchCategories();
  }, [selectedMarket, category]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedMarket && selectedMarket !== 'all') params.append("marketId", selectedMarket);
      if (category && category !== 'all') params.append("category", category);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      
      // Vérifier et normaliser les chemins d'images
      const normalizedData = data.map((product: Product) => {
        // S'assurer que le produit a toujours une image par défaut si l'original est invalide
        if (!product.image || product.image.trim() === '') {
          product.image = "default-product.jpg";
        }
        
        return {
          ...product,
          normalizedImagePath: getNormalizedImagePath(product.image)
        };
      });
      
      setProducts(normalizedData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMarkets = async () => {
    try {
      const response = await fetch("/api/markets");
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  // Fonction utilitaire pour normaliser les chemins d'images
  const getNormalizedImagePath = (imagePath: string) => {
    if (!imagePath) return "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
    
    if (imagePath.startsWith('/products-img/')) return `/assets${imagePath}`;
    if (imagePath.includes('public/assets/')) return `/${imagePath.split('public/')[1]}`;
    if (imagePath.includes('assets/')) return `/${imagePath}`;
    return `/assets/products-img/${imagePath.split('/').pop()}`;
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    // Affichage du chargement
    if (isLoading) {
      return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
          <Header />
          <main className="flex-1 container py-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-accent py-16 md:py-24">
        {/* Pattern d'arrière-plan */}
        <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-accent/20"></div>
        
        {/* Formes décoratives */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto md:mx-0">
            <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-6 backdrop-blur-md border border-white/20">
              Produits locaux & authentiques
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80">Découvrez</span> nos produits
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed max-w-xl">
              Explorer les produits authentiques des marchés locaux du Bénin, directement de la source au consommateur.
            </p>
            
            <div className="relative w-full max-w-xl backdrop-blur-md bg-white/10 rounded-2xl overflow-hidden p-1.5 border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
              <div className="flex items-center bg-background/95 rounded-xl overflow-hidden">
                <Search className="ml-4 text-primary h-5 w-5" />
                <Input
                  placeholder="Rechercher un produit..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-2 py-6 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  variant="ghost" 
                  className="h-10 w-10 p-0 mr-2 hover:bg-primary/10 rounded-full group transition-all duration-300"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  {isFilterOpen ? 
                    <FilterX className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" /> : 
                    <Filter className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto">
            <path fill="currentColor" fillOpacity="1" className="text-background" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,160C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      <main className="flex-1 container py-12 md:py-16 relative z-20">
        {/* Filtres */}
        <div 
          className={`mb-8 bg-background/80 backdrop-blur-md rounded-2xl border border-border/40 shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${isFilterOpen ? 'max-h-96 opacity-100 mb-8 p-6' : 'max-h-0 opacity-0 mb-0 p-0 border-0'}`}>
          <h3 className="text-lg font-semibold mb-4 text-foreground/90 flex items-center">
            <Filter className="h-4 w-4 mr-2 text-primary" />
            Filtrer les produits
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium mb-2 block text-foreground/70">Marché</label>
              <Select value={selectedMarket || undefined} onValueChange={setSelectedMarket}>
                <SelectTrigger className="w-full bg-background/60 border-border/60 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Tous les marchés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les marchés</SelectItem>
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium mb-2 block text-foreground/70">Catégorie</label>
              <Select value={category || undefined} onValueChange={setCategory}>
                <SelectTrigger className="w-full bg-background/60 border-border/60 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 md:col-span-1 flex items-end">
              <Button 
                variant="outline" 
                className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200" 
                onClick={() => {
                  setSelectedMarket(null);
                  setCategory(null);
                  setSearchQuery("");
                }}>
                <FilterX className="h-4 w-4 mr-2 text-primary" />
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        </div>
        
        {/* Statut et Statistiques */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Produits
              {selectedMarket && selectedMarket !== 'all' && markets.find(m => m.id === selectedMarket) && (
                <span className="text-foreground"> de <span className="text-primary font-bold">{markets.find(m => m.id === selectedMarket)?.name}</span></span>
              )}  
              {category && category !== 'all' && (
                <span className="text-foreground"> - Catégorie <span className="text-primary font-bold">{category}</span></span>
              )}
            </h2>
            <p className="text-muted-foreground text-lg">{filteredProducts.length} produits trouvés</p>
          </div>
          <div className="flex gap-2">
            {selectedMarket && selectedMarket !== 'all' && (
              <Badge variant="outline" className="gap-1 px-4 py-2 border-primary/30 group cursor-pointer hover:bg-primary/5 rounded-full transition-all duration-300 hover:shadow-md hover:border-primary/50"
                onClick={() => setSelectedMarket(null)}>
                <span>{markets.find(m => m.id === selectedMarket)?.name}</span>
                <span className="text-primary ml-1 group-hover:bg-primary/10 rounded-full p-0.5 transition-all duration-300 group-hover:rotate-90">&times;</span>
              </Badge>
            )}
            {category && category !== 'all' && (
              <Badge variant="outline" className="gap-1 px-4 py-2 border-primary/30 group cursor-pointer hover:bg-primary/5 rounded-full transition-all duration-300 hover:shadow-md hover:border-primary/50"
                onClick={() => setCategory(null)}>
                <span>{category}</span>
                <span className="text-primary ml-1 group-hover:bg-primary/10 rounded-full p-0.5 transition-all duration-300 group-hover:rotate-90">&times;</span>
              </Badge>
            )}
          </div>
        </div>
        
        {/* Grille de produits */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="relative rounded-2xl h-[400px] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm border border-border/20">
                <div className="absolute inset-0 animate-pulse opacity-30 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
                <div className="h-1/2 w-full bg-muted/20 absolute top-0"></div>
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                  <div className="h-4 w-2/3 bg-muted/40 rounded-full"></div>
                  <div className="h-3 w-full bg-muted/30 rounded-full"></div>
                  <div className="h-3 w-5/6 bg-muted/30 rounded-full"></div>
                  <div className="h-8 w-full bg-muted/40 rounded-full mt-6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="group opacity-100 transform-none transition-all duration-300 hover:-translate-y-1">
                <Card className="flex flex-col h-full overflow-hidden backdrop-blur-md bg-background/80 border-border/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 rounded-2xl">
                  <div className="aspect-square relative overflow-hidden rounded-t-xl">
                    {/* Image avec effet de zoom au survol */}
                    <div className="absolute inset-0 overflow-hidden bg-muted/20">
                      <img
                        src={product.normalizedImagePath || "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                        }}
                      />
                      {/* Overlay de dégradé subtil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/5 via-transparent to-transparent"></div>
                    </div>
                    
                    {/* Badge de catégorie */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-primary/90 hover:bg-primary text-white backdrop-blur-md border border-white/10 shadow-md transition-all duration-300 px-3 py-1">
                        <Tag className="h-3 w-3 mr-1.5" />
                        {typeof product.category === 'object' && product.category !== null 
                          ? (product.category as any).name || 'Catégorie'
                          : product.category || 'Catégorie'}
                      </Badge>
                    </div>
                    
                    {/* Prix en badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-white/20 text-foreground font-bold shadow-md">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency', 
                          currency: 'XOF',
                          maximumFractionDigits: 0
                        }).format(product.price as number)}
                      </Badge>
                    </div>
                    
                    {/* Indicateur de stock */}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                        <Badge variant="destructive" className="text-sm py-2 px-4 font-semibold shadow-lg border border-white/10">
                          Rupture de stock
                        </Badge>
                      </div>
                    )}
                    
                    {/* Effet de superposition au survol */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-5 z-10">
                      <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-bold truncate mb-2 text-lg">{product.name}</h3>
                        <p className="text-white/90 text-sm line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex items-center text-amber-500">
                        <Star className="fill-current h-4 w-4" />
                        <span className="text-sm ml-1 font-medium">4.5</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        "text-sm px-3 py-1 rounded-full font-medium",
                        product.stock > 10 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        product.stock > 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {product.stock > 10 ? "En stock" : 
                         product.stock > 0 ? `${product.stock} restants` : 
                         "Rupture de stock"}
                      </p>
                      
                      <p className="text-sm text-muted-foreground">
                        {markets.find(m => m.id === product.marketId)?.name || "Marché local"}
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-5 pt-0">
                    <Button 
                      className="w-full group bg-primary hover:bg-primary/90 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20 rounded-xl"
                      variant={product.stock === 0 ? "outline" : "default"} 
                      disabled={product.stock === 0}>
                      <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      {product.stock === 0 ? "Indisponible" : "Ajouter au panier"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-md rounded-2xl border border-dashed border-muted-foreground/20 shadow-sm">
            <div className="mb-6 text-muted-foreground/50 bg-background/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-border/40">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground/90">Aucun produit trouvé</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
              Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou votre recherche.
            </p>
            <Button 
              variant="outline" 
              className="mx-auto border-primary/30 hover:border-primary text-primary hover:bg-primary/5 transition-all duration-300 px-6 py-5 h-auto font-medium text-base rounded-xl" 
              onClick={() => {
                setSelectedMarket(null);
                setCategory(null);
                setSearchQuery("");
              }}>
              <FilterX className="h-5 w-5 mr-2" />
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}