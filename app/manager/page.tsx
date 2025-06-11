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
import { Category } from "@prisma/client";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Store, Users, ShoppingBag, TrendingUp, Package, Plus, Edit, Trash } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ManagerDashboardPage() {
  const { user } = useUser();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  // Calcul des statistiques
  const totalMarkets = markets.length;
  const totalProducts = products.length;
  const totalCategories = categories.length;

  useEffect(() => {
    fetchMarkets();
    fetchProducts();
    fetchCategories(); 
  }, []);

  const fetchMarkets = async () => {
    setIsLoading(true);
    const where = user?.role === "MANAGER" ? { managerId: user?.id } : {};
    try {
      const response = await fetch(`/api/markets?where=${JSON.stringify(where)}`);
      if (!response.ok) throw new Error("Erreur lors du chargement des marchés");
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les marchés",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Erreur lors du chargement des produits");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Erreur lors du chargement des catégories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive",
      });
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
        toast({
          title: "Succès",
          description: "La catégorie a été ajoutée avec succès",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout de la catégorie");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'ajout de la catégorie",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchCategories();
        toast({
          title: "Succès",
          description: "La catégorie a été supprimée avec succès",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression de la catégorie');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression',
        variant: 'destructive',
      });
    }
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="flex-1 container py-8">
        {/* En-tête avec titre et statistiques */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
                Tableau de bord Manager
              </h1>
              <p className="text-muted-foreground">Gérez vos marchés et catégories</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="group bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 px-6 py-6 text-base rounded-xl"
                >
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Ajouter une catégorie
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur-sm border-border/50">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Nouvelle catégorie
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la catégorie</Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, description: e.target.value })
                      }
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Ajouter la catégorie
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-background to-muted/50 border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marchés</p>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    {totalMarkets}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Store className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-background to-muted/50 border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Produits</p>
                  <p className="text-3xl font-bold">{totalProducts}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-background to-muted/50 border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Catégories</p>
                  <p className="text-3xl font-bold">{totalCategories}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Grille de contenu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carte des marchés */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Vos marchés</h2>
                    <p className="text-sm text-muted-foreground">Liste des marchés que vous gérez</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {markets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Store className="mx-auto h-10 w-10 mb-2 opacity-50" />
                      <p>Aucun marché trouvé</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {markets.map((market) => (
                        <div 
                          key={market.id}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Store className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{market.name}</h3>
                              <p className="text-sm text-muted-foreground">{market.location}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {}}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Carte des catégories */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Catégories</h2>
                    <p className="text-sm text-muted-foreground">Gérez vos catégories de produits</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="mx-auto h-10 w-10 mb-2 opacity-50" />
                      <p>Aucune catégorie trouvée</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div 
                          key={category.id}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {category.description || 'Aucune description'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {}}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}