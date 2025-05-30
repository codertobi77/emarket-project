"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Market, Product } from "@/types";
import {
  BarChart,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  Package,
  Plus, 
  Edit, 
  Trash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@prisma/client";
import { useUser } from "@/hooks/useUser";

export const dynamic = "force-dynamic";
export default function ManagerDashboardPage() {
  const { user } = useUser();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
      name: "",
      description: "",
    });

  useEffect(() => {
    fetchMarkets();
    fetchProducts();
    fetchCategories(); 
  }, []);

  const fetchMarkets = async () => {
    const where = user?.role === "MANAGER" ? { managerId: user?.id } : {};
    try {
      const response = await fetch(`/api/markets?where=${JSON.stringify(where)}`);
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        fetchCategories();
        setNewCategory({
          name: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord gestionnaire</h1>

        <div className="flex justify-between items-center mb-8">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une catégorie 
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Nom de la catégorie</Label>
                            <Input
                              id="name"
                              value={newCategory.name}
                              onChange={(e) =>
                                setNewCategory({ ...newCategory, name: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={newCategory.description}
                              onChange={(e) =>
                                setNewCategory({ ...newCategory, description: e.target.value })
                              }
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Ajouter le produit
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total des marchés
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{markets.length}</div>
              <p className="text-xs text-muted-foreground">
                +{markets.length - markets.filter((market) => market.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} aujourd'hui
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Nombre de vendeurs sur les marchés
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{markets.reduce((total, market) => total + market.marketSellers.length, 0)}</div>
              <p className="text-xs text-muted-foreground">
                +{markets.map((market) => market.marketSellers.length - market.marketSellers.filter((market) => market.createdAt > new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)).length) } nouveaux ce mois
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Produits en vente
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                +{products.length - products.filter((product) => product.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} aujourd'hui
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Chiffre d'affaires
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4M FCFA</div>
              <p className="text-xs text-muted-foreground">
                +12% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Marchés gérés</CardTitle>
                <CardDescription>
                  Liste des marchés sous votre responsabilité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Vendeurs</TableHead>
                      <TableHead>Produits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {markets.map((market) => (
                      <TableRow key={market.id}>
                        <TableCell className="font-medium">{market.name}</TableCell>
                        <TableCell>{market.location}</TableCell>
                        <TableCell>{market.marketSellers.length}</TableCell>
                        <TableCell>{market.marketSellers.reduce((total, seller) => total + seller.products.length, 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques des ventes</CardTitle>
              <CardDescription>
                Aperçu des ventes par marché
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <BarChart className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Graphique des ventes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">  
            <Card>
            <CardHeader>
              <CardTitle>Derniers produits ajoutés</CardTitle>
              <CardDescription>
                Les produits récemment mis en vente dans vos marchés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Marché</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.slice(0, 5).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image ? `/assets${product.image.replace('public', '')}` : "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.category.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>John Doe</TableCell>
                      <TableCell>Marché Central</TableCell>
                      <TableCell>{product.price} FCFA</TableCell>
                      <TableCell>{product.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Derniers produits ajoutés</CardTitle>
              <CardDescription>
                Les produits récemment mis en vente dans vos marchés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.slice(0, 5).map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>{cat.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div> 
      </main>
      <Footer />
    </div>
  );
}