"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, User } from "@/types";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@prisma/client";
import { Input } from "@/components/ui/input";

export default function MarketProductsPage() {
  const pathname = usePathname();
  const marketId = pathname.split("/")[2];
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (marketId) {
      fetchProducts();
      fetchSellers();
      fetchCategories();
    }
  }, [marketId, selectedSeller]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (marketId) params.append("marketId", marketId as string);
      if (selectedSeller) params.append("sellerId", selectedSeller);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      console.log('Produits récupérés depuis l\'API pour le marché:', data);
      // Vérifier les chemins d'images
      data.forEach((product: Product) => {
        console.log(`Marché - Produit ${product.name} - Chemin d'image original:`, product.image);
      });
      setProducts(data);
      setSellers(data.filter((product: { seller: any; }) => product.seller));   
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const handleAddToCart = (product: Product) => {
    // Ajouter le produit au panier
  };

  const fetchSellers = async () => {
    try {
      const response = await fetch(`/api/users?marketId=${marketId}`);
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Header />
      <main className="flex-1 container py-8">
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">Produits</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Rechercher un produit..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
          <Select value={selectedSeller || undefined} onValueChange={setSelectedSeller}>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Tous les Vendeurs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les marchés</SelectItem>
                          {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.name}
                </SelectItem>
              ))}
                        </SelectContent>
                      </Select>
          <Select value={category || undefined} onValueChange={setCategory}>
                        <SelectTrigger className="w-full md:w-48">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                <img
                  src={product.image
                    ? product.image.startsWith('/products-img/') 
                      ? `/assets${product.image}` 
                      : product.image.includes('public/assets/') 
                        ? `/${product.image.split('public/')[1]}`
                        : product.image.includes('assets/') 
                          ? `/${product.image}` 
                          : `/assets/products-img/${product.image.split('/').pop()}`
                    : "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                  onError={(e) => {
                    console.error(`Erreur de chargement de l'image pour ${product.name}:`, product.image);
                    e.currentTarget.src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                  }}
                />
              </div>
              <CardContent className="flex-1 p-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {product.description}
                </p>
                <p className="text-lg font-bold">{product.price} FCFA</p>
                <p className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" disabled={product.stock === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      </main>
      
      <Footer />
    </div>
  );
}

