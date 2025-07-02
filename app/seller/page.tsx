"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types";
import { Plus, Edit, Trash, Package, Boxes, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@prisma/client";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function SellerDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: 0,
    image: "",
    category: "",
    // image: "",
    // marketId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login');
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "SELLER") {
      router.push('/');
      return;
    }

    if (status === "authenticated") {
      fetchProducts();
      fetchCategories();
      setIsLoading(false);
    }
  }, [status, session, router]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      console.log('Produits récupérés depuis l\'API dans seller:', data);
      // Vérifier les chemins d'images
      data.forEach((product: Product) => {
        console.log(`Seller - Produit ${product.name} - Chemin d'image original:`, product.image);
      });
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };


  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        fetchProducts();
        setNewProduct({
          name: "",
          description: "",
          price: "",
          stock: 0,
          image: "",
          category: "",
          // marketId: "",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setIsEditDialogOpen(true);
    setProductToEdit(product);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;
    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...productToEdit }),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        fetchProducts();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productToDelete.id }),
      });

      if (response.ok) {
        fetchProducts();
        setIsDeleteDialogOpen(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Calculer les statistiques
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
  const outOfStock = products.filter(p => p.stock <= 0).length;

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
      <main className="flex-1 container py-8" aria-label="Tableau de bord vendeur">
        {/* En-tête avec statistiques */}
        <div className="mb-10">
          {/* Ligne supérieure avec titre et bouton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
                Tableau de bord vendeur
              </h1>
              <p className="text-muted-foreground">Gérez vos produits et suivez votre activité</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="group bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 px-6 py-6 text-base rounded-xl">
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Ajouter un produit
                </Button>
              </DialogTrigger>
              
              {/* Boîte de dialogue d'ajout de produit */}
              <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-sm border-border/50">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Ajouter un nouveau produit
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom du produit</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, description: e.target.value })
                        }
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Prix (FCFA)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, price: e.target.value })
                          }
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })
                          }
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Catégorie</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="image">Image</Label>
                      <Input
                        id="image"
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append("image", file);
                            formData.append("folder", 'products-img');
                            fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            })
                              .then((res) => res.json())
                              .then((data) => {
                                setNewProduct({
                                  ...newProduct,
                                  image: `public/assets/products-img/${data.filename}`,
                                });
                              })
                              .catch((error) => console.error(error));
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
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
                      Ajouter le produit
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
                  <p className="text-sm font-medium text-muted-foreground">Produits</p>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    {totalProducts}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-background to-muted/50 border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock total</p>
                  <p className="text-3xl font-bold">{totalStock}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                  <Boxes className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-background to-muted/50 border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rupture de stock</p>
                  <p className="text-3xl font-bold">{outOfStock}</p>
                </div>
                <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des produits */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-6">
                        <Package className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Aucun produit trouvé</p>
                        <Button 
                          variant="ghost" 
                          className="mt-2 text-primary"
                          onClick={() => setIsAddDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un produit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={
                                product.image
                                  ? product.image.startsWith('/products-img/')
                                    ? `/assets${product.image}`
                                    : product.image.includes('public/assets/')
                                    ? `/${product.image.split('public/')[1]}`
                                    : product.image.includes('assets/')
                                    ? `/${product.image}`
                                    : `/assets/products-img/${product.image.split('/').pop()}`
                                  : "/placeholder-product.svg"
                              }
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-product.svg";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          {product.category?.name || 'Non catégorisé'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {parseFloat(product.price as unknown as string).toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "h-2 w-2 rounded-full",
                            product.stock > 10 ? "bg-green-500" : "bg-amber-500"
                          )} />
                          {product.stock}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Boîte de dialogue de modification de produit */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-sm border-border/50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Modifier le produit
                </DialogTitle>
              </DialogHeader>
              
              {productToEdit && (
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Nom du produit</Label>
                      <Input
                        id="edit-name"
                        value={productToEdit.name}
                        onChange={(e) =>
                          setProductToEdit({ ...productToEdit, name: e.target.value } as Product)
                        }
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={productToEdit.description || ""}
                        onChange={(e) =>
                          setProductToEdit({ ...productToEdit, description: e.target.value } as Product)
                        }
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-price">Prix (FCFA)</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          value={productToEdit.price as unknown as string}
                          onChange={(e) =>
                            setProductToEdit({ ...productToEdit, price: e.target.value } as unknown as Product)
                          }
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="edit-stock">Stock</Label>
                        <Input
                          id="edit-stock"
                          type="number"
                          value={productToEdit.stock}
                          onChange={(e) =>
                            setProductToEdit({
                              ...productToEdit,
                              stock: parseInt(e.target.value) || 0,
                            } as Product)
                          }
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Catégorie</Label>
                      <Select
                        value={productToEdit.category?.id || ""}
                        onValueChange={(value) =>
                          setProductToEdit({ ...productToEdit, category: { id: value, name: '' } } as Product)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-image">Image</Label>
                      <Input
                        id="edit-image"
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append("image", file);
                            formData.append("folder", 'products-img');
                            fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            })
                              .then((res) => res.json())
                              .then((data) => {
                                setProductToEdit({
                                  ...productToEdit,
                                  image: `public/assets/products-img/${data.filename}`,
                                } as Product);
                              })
                              .catch((error) => console.error(error));
                          }
                        }}
                        className="mt-1"
                      />
                      {productToEdit.image && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Image actuelle :</p>
                          <img 
                            src={
                              productToEdit.image.startsWith('/products-img/')
                                ? `/assets${productToEdit.image}`
                                : productToEdit.image.includes('public/assets/')
                                ? `/${productToEdit.image.split('public/')[1]}`
                                : productToEdit.image.includes('assets/')
                                ? `/${productToEdit.image}`
                                : `/assets/products-img/${productToEdit.image.split('/').pop()}`
                            }
                            alt={productToEdit.name}
                            className="h-20 w-20 object-cover rounded-md border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-product.svg";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Enregistrer les modifications
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Boîte de dialogue de confirmation de suppression */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[450px] bg-background/95 backdrop-blur-sm border-border/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Supprimer le produit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
                </p>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (productToDelete) {
                        handleConfirmDelete();
                        setIsDeleteDialogOpen(false);
                      }
                    }}
                  >
                    Supprimer définitivement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}