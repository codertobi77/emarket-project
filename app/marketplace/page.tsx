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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-primary py-12 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Marketplace</h1>
            <p className="text-white/80 text-lg mb-8">Découvrez des produits authentiques des marchés locaux du Bénin</p>
            
            <div className="relative w-full max-w-lg backdrop-blur-sm bg-white/10 rounded-xl overflow-hidden p-1 border border-white/20 shadow-xl">
              <div className="flex items-center bg-background rounded-lg overflow-hidden">
                <Search className="ml-3 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Rechercher un produit..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  variant="ghost" 
                  className="h-9 w-9 p-0 mr-1 hover:bg-primary/10"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  {isFilterOpen ? 
                    <FilterX className="h-5 w-5 text-primary" /> : 
                    <Filter className="h-5 w-5 text-primary" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto">
            <path fill="currentColor" fillOpacity="1" className="text-background" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,160C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      <main className="flex-1 container py-12">
        {/* Filtres */}
        <div 
          className={`mb-8 p-4 bg-muted/50 backdrop-blur-sm rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-300 ${isFilterOpen ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0 p-0 border-0'}`}>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Marché</label>
              <Select value={selectedMarket || undefined} onValueChange={setSelectedMarket}>
                <SelectTrigger className="w-full">
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
            <div>
              <label className="text-sm font-medium mb-2 block">Catégorie</label>
              <Select value={category || undefined} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
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
                className="w-full" 
                onClick={() => {
                  setSelectedMarket(null);
                  setCategory(null);
                  setSearchQuery("");
                }}>
                <FilterX className="h-4 w-4 mr-2" />
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        </div>
        
        {/* Statut et Statistiques */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Produits
              {selectedMarket && selectedMarket !== 'all' && markets.find(m => m.id === selectedMarket) && (
                <span> de <span className="text-primary">{markets.find(m => m.id === selectedMarket)?.name}</span></span>
              )}  
              {category && category !== 'all' && (
                <span> - Catégorie <span className="text-primary">{category}</span></span>
              )}
            </h2>
            <p className="text-muted-foreground">{filteredProducts.length} produits trouvés</p>
          </div>
          <div className="flex gap-2">
            {selectedMarket && selectedMarket !== 'all' && (
              <Badge variant="outline" className="gap-1 px-3 py-1.5 border-primary/30 group cursor-pointer hover:bg-primary/5"
                onClick={() => setSelectedMarket(null)}>
                <span>{markets.find(m => m.id === selectedMarket)?.name}</span>
                <span className="text-primary group-hover:bg-primary/10 rounded-full p-0.5">&times;</span>
              </Badge>
            )}
            {category && category !== 'all' && (
              <Badge variant="outline" className="gap-1 px-3 py-1.5 border-primary/30 group cursor-pointer hover:bg-primary/5"
                onClick={() => setCategory(null)}>
                <span>{category}</span>
                <span className="text-primary group-hover:bg-primary/10 rounded-full p-0.5">&times;</span>
              </Badge>
            )}
          </div>
        </div>
        
        {/* Grille de produits */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-muted/50 rounded-xl h-[400px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="group opacity-100 transform-none transition-all duration-300">
                <Card className="flex flex-col h-full overflow-hidden backdrop-blur-sm border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
                  <div className="aspect-square relative overflow-hidden">
                    {/* Image avec effet de zoom au survol */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={product.normalizedImagePath || "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                        }}
                      />
                    </div>
                    
                    {/* Badge de catégorie */}
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-primary/90 hover:bg-primary text-white backdrop-blur-sm">
                        <Tag className="h-3 w-3 mr-1" />
                        {product.category}
                      </Badge>
                    </div>
                    
                    {/* Indicateur de stock */}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                        <Badge variant="destructive" className="text-sm py-1.5 px-3 font-semibold">
                          Rupture de stock
                        </Badge>
                      </div>
                    )}
                    
                    {/* Effet de superposition au survol */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-10">
                      <div className="w-full">
                        <h3 className="text-white font-bold truncate mb-1">{product.name}</h3>
                        <p className="text-white/80 text-sm line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex items-center text-amber-500">
                        <Star className="fill-current h-4 w-4" />
                        <span className="text-sm ml-1">4.5</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 h-10">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency', 
                          currency: 'XOF',
                          maximumFractionDigits: 0
                        }).format(product.price)}
                      </p>
                      <p className={cn(
                        "text-sm px-2 py-0.5 rounded",
                        product.stock > 10 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        product.stock > 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {product.stock > 10 ? "En stock" : 
                         product.stock > 0 ? `${product.stock} restants` : 
                         "Rupture de stock"}
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full group transition-all duration-300"
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
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
            <div className="mb-4 text-muted-foreground/50">
              <ShoppingCart className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou votre recherche.
            </p>
            <Button 
              variant="outline" 
              className="mx-auto" 
              onClick={() => {
                setSelectedMarket(null);
                setCategory(null);
                setSearchQuery("");
              }}>
              <FilterX className="h-4 w-4 mr-2" />
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}