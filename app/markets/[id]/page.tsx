"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, User, Market } from "@/types";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Store, Tag, User as UserIcon, MapPin, Filter, FilterX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Cart } from "@/components/cart";
import { useSession } from "next-auth/react";

export default function MarketProductsPage() {
  const pathname = usePathname();
  const marketId = pathname.split("/")[2];
  
  const [market, setMarket] = useState<Market | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (marketId) {
      fetchMarket();
      fetchProducts();
      fetchSellers();
      fetchCategories();
    }
  }, [marketId, selectedSeller, category]);

  const fetchMarket = async () => {
    try {
      const params = new URLSearchParams();
      if (marketId) params.append("marketId", marketId as string);
      const response = await fetch(`/api/markets?${params.toString()}`);
      const data = await response.json();
      setMarket(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching market:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (marketId) params.append("marketId", marketId as string);
      if (selectedSeller && selectedSeller !== 'all') params.append("sellerId", selectedSeller);
      if (category && category !== 'all') params.append("category", category);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      console.log('Produits récupérés depuis l\'API pour le marché:', data);
      
      // Vérifier les chemins d'images
      data.forEach((product: Product) => {
        console.log(`Marché - Produit ${product.name} - Chemin d'image original:`, product.image);
      });
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
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

  const handleAddToCart = async (product: Product) => {
    try {
      // Récupérer le panier existant ou initialiser un tableau vide
      const cartKey = `${user?.id || "nobody"}-cart`;
      const existingCart = localStorage.getItem(cartKey);
      const cart = existingCart ? JSON.parse(existingCart) : [];
      
      const existingItem = cart.find((item: any) => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Stock insuffisant",
            description: `Il n'y a plus assez de stock pour ${product.name}`,
            variant: "destructive"
          });
          return;
        }
        existingItem.quantity += 1;
      } else {
        if (product.stock < 1) {
          toast({
            title: "Stock épuisé",
            description: `Désolé, ${product.name} n'est plus disponible`,
            variant: "destructive"
          });
          return;
        }
        cart.push({ 
          ...product, 
          quantity: 1,
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
          image: product.image ? getNormalizedImagePath(product.image) : ""
        });
      }
      
      localStorage.setItem(cartKey, JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      
      // // Update product stock in database
      // const response = await fetch('/api/products', {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ 
      //     id: product.id,
      //     stock: product.stock - 1 
      //   }),
      // });
      
      // if (!response.ok) {
      //   throw new Error("Failed to update product stock");
      // }
      
      // Update local product stock to reflect the change
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id ? { ...p, stock: p.stock - 1 } : p
        )
      );
      
      toast({
        title: "Produit ajouté",
        description: `${product.name} a été ajouté à votre panier`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout au panier",
        variant: "destructive"
      });
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await fetch(`/api/users?marketId=${marketId}`);
      const data = await response.json();
      setSellers(data.filter((user: User) => user.role === "SELLER"));
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !category || category === "all" || product.category?.id === category || product.category?.name === category;
    const matchesSeller = !selectedSeller || selectedSeller === "all" || product.sellerId === selectedSeller || product.seller?.sellerId === selectedSeller;
    return matchesSearch && matchesCategory && matchesSeller;
  });

  // Fonction utilitaire pour normaliser les chemins d'images
  const getNormalizedImagePath = (imagePath: string) => {
    if (!imagePath) return "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
    
    if (imagePath.startsWith('/products-img/')) return `/assets${imagePath}`;
    if (imagePath.includes('public/assets/')) return `/${imagePath.split('public/')[1]}`;
    if (imagePath.includes('assets/')) return `/${imagePath}`;
    return `/assets/products-img/${imagePath.split('/').pop()}`;
  };

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
      
      {/* Hero Banner du marché */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-accent py-12 md:py-16">
        {/* Pattern d'arrière-plan */}
        <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-accent/20"></div>
        
        {/* Formes décoratives */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="container relative z-10">
          <Link href="/markets" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour aux marchés
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Image du marché */}
            <div className="w-full md:w-1/3 lg:w-1/4 aspect-square rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl relative">
            <img
                    src={getNormalizedImagePath(market?.image || "")}
                    alt={market?.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      console.error(`Erreur de chargement de l'image pour ${market?.name}:`, market?.image);
                      e.currentTarget.src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                    }}
                  />
            </div>
            
            {/* Informations du marché */}
            <div className="flex-1">
              <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-4 backdrop-blur-md border border-white/20">
                Marché local
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {market?.name || "Chargement..."}
              </h1>
              <p className="text-white/80 text-base md:text-lg mb-6 leading-relaxed max-w-2xl">
                {market?.description || "Description du marché en cours de chargement..."}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 border border-white/20">
                  <MapPin className="h-4 w-4 mr-2 text-white/70" />
                  {market?.location || "Localisation"}
                </div>
                {market?.manager && (
                  <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 border border-white/20">
                    <UserIcon className="h-4 w-4 mr-2 text-white/70" />
                    Gérant: {market.manager.name}
                  </div>
                )}
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
      
      <main className="flex-1 container py-12 relative z-20">
        {/* Barre de recherche et filtres */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Produits du marché</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {isFilterOpen ? (
                <>
                  <FilterX className="h-4 w-4" /> Masquer les filtres
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4" /> Afficher les filtres
                </>
              )}
            </Button>
          </div>
          
          <div className="relative w-full backdrop-blur-md bg-card/80 rounded-2xl overflow-hidden p-1.5 border border-border shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center bg-background/95 rounded-xl overflow-hidden">
              <Search className="ml-4 text-primary h-5 w-5" />
              <Input
                placeholder="Rechercher un produit..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-2 py-6 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filtres dépliables */}
          <div className={cn(
            "mt-4 bg-card/80 backdrop-blur-md rounded-2xl border border-border/40 shadow-sm overflow-hidden transition-all duration-500 ease-in-out",
            isFilterOpen ? "max-h-96 opacity-100 p-6" : "max-h-0 opacity-0 p-0 border-0"
          )}>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium block text-foreground/70 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary/70" />
                  Vendeur
                </label>
                <Select value={selectedSeller || undefined} onValueChange={setSelectedSeller}>
                  <SelectTrigger className="w-full bg-background/60 border-border/60 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Tous les vendeurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les vendeurs</SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium block text-foreground/70 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary/70" />
                  Catégorie
                </label>
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
            </div>
          </div>
        </div>
        
        {/* Grille de produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Squelettes de chargement
            Array(8).fill(0).map((_, index) => (
              <Card key={index} className="flex flex-col h-full overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-square bg-muted animate-pulse"></div>
                <CardContent className="flex-1 p-4 space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 bg-muted rounded animate-pulse w-1/2 mt-4"></div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                </CardFooter>
              </Card>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col h-full overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-border/40">
                <div className="aspect-square relative overflow-hidden">
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <Badge variant="destructive" className="text-sm font-medium px-3 py-1">
                        Rupture de stock
                      </Badge>
                    </div>
                  )}
                  <img
                    src={getNormalizedImagePath(product.image || "")}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      console.error(`Erreur de chargement de l'image pour ${product.name}:`, product.image);
                      e.currentTarget.src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                    }}
                  />
                </div>
                <CardContent className="flex-1 p-4">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-lg font-bold text-primary">{product.price as number} FCFA</p>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      Stock: {product.stock}
                    </Badge>
                  </div>
                  {product.seller && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <UserIcon className="h-3 w-3 mr-1 text-primary/70" />
                      Vendeur: {product.seller.seller.name}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full"
                    variant={product.stock === 0 ? "secondary" : "default"}
                  >
                    {product.stock === 0 ? (
                      "Indisponible"
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Ajouter au panier
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted/30 p-6 rounded-full mb-4">
                <Store className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground max-w-md">
                Aucun produit ne correspond à votre recherche. Essayez de modifier vos critères de recherche ou de revenir plus tard.
              </p>
            </div>
          )}
        </div>
      </main>
      <Cart />
      <Footer />
    </div>
  );
}
