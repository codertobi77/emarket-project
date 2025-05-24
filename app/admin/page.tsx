"use client";

import { useState, useEffect } from "react";
import RoleProtected from "../../components/RoleProtected";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { User, Market, Product } from "@/types";
import {
  Users,
  Store,
  ShoppingBag,
  Settings,
  UserPlus,
  Building,
  Edit,
  Trash,
} from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
  const [isCreateMarketDialogOpen, setIsCreateMarketDialogOpen] = useState(false);
  const [newMarket, setNewMarket] = useState({
    name: "",
    location: "",
    description: "",
    managerId: "",
  });
  const [updatedMarket, setUpdatedMarket] = useState({
    id: "",
    name: "",
    location: "",
    description: "",
    managerId: "",
  });

  const [deletedMarket, setDeletedMarket] = useState<Market>();

  const [isUpdateMarketDialogOpen, setIsUpdateMarketDialogOpen] = useState(false);
  const [isDeleteMarketDialogOpen, setIsDeleteMarketDialogOpen] = useState(false);


  useEffect(() => {
    fetchUsers();
    fetchMarkets();
    fetchProducts();
    fetchLocations();
  }, []);



  // Fetch users and markets data
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  

  // Fetch products data
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
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

  // Fetch locations data
  const fetchLocations = async () => {
    try {
      const data = [
        { id: 1, name: "COTONOU" },
        { id: 2, name: "BOHICON" },
        { id: 3, name: "PORTO-NOVO" },
      ];
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };


  const managerUsers = users.filter((user) => user.role === "MANAGER");
  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMarket),
      });

      if (response.ok) {
        setIsCreateMarketDialogOpen(false);
        setNewMarket({
          name: "",
          location: "",
          description: "",
          managerId: "",
        });
        fetchMarkets();
      }
    } catch (error) {
      console.error("Error creating market:", error);
    }
  };

  const handleCancelCreateMarket = () => {
    setIsCreateMarketDialogOpen(false);
    setNewMarket({
      name: "",
      location: "",
      description: "",
      managerId: "",
    });
  };



  const handleUpdateMarket = async () => {
    try {
      console.log(updatedMarket);
      const response = await fetch(`/api/markets?id=${updatedMarket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMarket),
      });

      if (response.ok) {
        setIsUpdateMarketDialogOpen(false);
        setUpdatedMarket({
          id: "",
          name: "",
          location: "",
          description: "",
          managerId: "",
        });
        fetchMarkets();
      }
    } catch (error) {
      console.error("Error updating market:", error);
    }
  };

  const handleDeleteMarket = async (marketId: string) => {
    try {
      const response = await fetch(`/api/markets?id=${marketId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsDeleteMarketDialogOpen(false);
        setDeletedMarket(undefined);
        fetchMarkets();
      }
    } catch (error) {
      console.error("Error deleting market:", error);
    }
  };



  return (
    <RoleProtected allowedRoles={["ADMIN"]}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Administration</h1>
            <div className="flex gap-4">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un utilisateur
              </Button>
              <Button onClick={() => setIsCreateMarketDialogOpen(true)}>
                <Building className="h-4 w-4 mr-2" />
                Ajouter un marché
              </Button>
            </div>
          </div>

          <div>
            <Dialog open={isCreateMarketDialogOpen} onOpenChange={setIsCreateMarketDialogOpen}>
              <DialogContent>
                <DialogTitle>Ajouter un marché</DialogTitle>
                <form onSubmit={handleCreateMarket} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du marché</Label>
                    <Input
                      id="name"
                      value={newMarket.name}
                      onChange={(e) =>
                        setNewMarket({ ...newMarket, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Emplacement</Label>
                    <Select
                      value={newMarket.location}
                      onValueChange={(value) =>
                        setNewMarket({ ...newMarket, location: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un emplacement" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name.charAt(0) + location.name.substring(1, location.name.length).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMarket.description}
                      onChange={(e) =>
                        setNewMarket({
                          ...newMarket,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="managerId">Gérant</Label>
                    <Select
                      value={newMarket.managerId}
                      onValueChange={(value) =>
                        setNewMarket({ ...newMarket, managerId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un gérant" />
                      </SelectTrigger>
                      <SelectContent>
                        {managerUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button type="submit" className="w-full">
                      Ajouter le marché
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleCancelCreateMarket}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Dialog open={isUpdateMarketDialogOpen} onOpenChange={setIsUpdateMarketDialogOpen}>
              {/* <DialogTrigger asChild>
                <Button className="mb-4" type="button">
                  Mettre à jour le marché
                </Button>
              </DialogTrigger> */}
              <DialogContent className="space-y-6 px-6 py-4 sm:px-8 sm:py-6">
                <DialogTitle>Mettre à jour le marché</DialogTitle>
                <form
                  onSubmit={handleUpdateMarket}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="name">Nom du marché</Label>
                    <Input
                      id="name"
                      value={updatedMarket.name}
                      onChange={(e) =>
                        setUpdatedMarket({
                          ...updatedMarket,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={updatedMarket.location}
                      onChange={(e) =>
                        setUpdatedMarket({
                          ...updatedMarket,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={updatedMarket.description}
                      onChange={(e) =>
                        setUpdatedMarket({
                          ...updatedMarket,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="managerId">Gestionnaire</Label>
                    <Select
                      value={updatedMarket.managerId}
                      onValueChange={(value) =>
                        setUpdatedMarket({
                          ...updatedMarket,
                          managerId: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un gestionnaire" />
                      </SelectTrigger>
                      <SelectContent>
                        {managerUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button type="submit" className="w-full">
                      Mettre à jour le marché
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => setIsUpdateMarketDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Dialog open={isDeleteMarketDialogOpen} onOpenChange={setIsDeleteMarketDialogOpen}>
              <DialogContent>
                <DialogTitle>Supprimer le marché</DialogTitle>
                {deletedMarket && (<form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDeleteMarket(deletedMarket.id);
                  }}
                >
                  <div className="space-y-4">
                    <p>Êtes-vous sûr de vouloir supprimer le marché {deletedMarket.name} ?</p>
                    <div className="flex justify-end gap-4">
                      <Button type="submit" className="w-full">
                        Oui, supprimer
                      </Button>
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => setIsDeleteMarketDialogOpen(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </form>)}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total utilisateurs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{users.length - users.filter((user) => user.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} ce mois
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Marchés actifs
                </CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{markets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Dans {markets.map(market => market.location).filter((value, index, self) => self.indexOf(value) === index).length} villes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total produits
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* <div className="text-2xl font-bold">{products.length}</div> */}
                <p className="text-xs text-muted-foreground">
                  {/* +{products.length - products.filter((product) => product.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} aujourd'hui */}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Système
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-green-600">
                  Opérationnel
                </div>
                <p className="text-xs text-muted-foreground">
                  Dernière mise à jour: 2h
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="markets">Marchés</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>
                    Liste de tous les utilisateurs enregistrés sur la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        {/* <TableHead>Statut</TableHead> */}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          {/* <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? "Actif" : "Inactif"}
                            </span>
                          </TableCell> */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Gérer
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent sideOffset={5}>
                                <DropdownMenuItem>
                                  {/* <Dialog>
                                    <DialogTrigger asChild>
                                      <div className="flex items-center">
                                        <Edit className="mr-1 h-4 w-4" style={{display: 'inline-block'}} /> 
                                        <span className="ml-1">Modifier</span>
                                      </div>
                                    </DialogTrigger>
                                    <DialogContent className="w-[400px]">
                                      <DialogTitle>Mettre à jour l'utilisateur</DialogTitle>
                                      <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleUpdateMarket(user.id);
                                      }}>
                                        <div>
                                          <FormLabel>Nom</FormLabel>
                                          <Input type="text" defaultValue={user.name} />
                                        </div>
                                        <div>
                                          <FormLabel>Email</FormLabel>
                                          <Input type="text" defaultValue={user.email} />
                                        </div>
                                        <div>
                                          <FormLabel>Rôle</FormLabel>
                                          <Input type="text" defaultValue={user.role} />
                                        </div>
                                        <Button type="submit">Mettre à jour</Button>
                                      </form>
                                    </DialogContent>
                                  </Dialog> */}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('Delete')}>
                                  <div className="flex items-center">
                                    <Trash className="mr-1 h-4 w-4" style={{display: 'inline-block'}} /> 
                                    <span className="ml-1">Supprimer</span>
                                  </div>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="markets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des marchés</CardTitle>
                  <CardDescription>
                    Vue d'ensemble et gestion des marchés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Marché</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Gestionnaire</TableHead>
                        {/* <TableHead>Vendeurs</TableHead> */}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {markets.map((market) => (
                        <TableRow key={market.id}>
                          <TableCell>{market.name}</TableCell>
                          <TableCell>{market.description}</TableCell>
                          <TableCell>{market.location.charAt(0) + market.location.substring(1, market.location.length).toLowerCase()}</TableCell>
                          <TableCell>{market.manager.name}</TableCell>
                          {/* <TableCell>{market.sellersCount}</TableCell> */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Gérer
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent sideOffset={5}>
                                <DropdownMenuItem onClick={() => {
                                    setIsUpdateMarketDialogOpen(true); 
                                    setUpdatedMarket(market);
                                  }}>
                                  <div className="flex items-center" >
                                    <Edit className="mr-1 h-4 w-4" style={{display: 'inline-block'}} /> 
                                    <span className="ml-1">Modifier</span>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setIsDeleteMarketDialogOpen(true);
                                  setDeletedMarket(market);
                                }}>
                                  <div className="flex items-center">
                                    <Trash className="mr-1 h-4 w-4" style={{display: 'inline-block'}} /> 
                                    <span className="ml-1">Supprimer</span>
                                  </div>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rapports et statistiques</CardTitle>
                  <CardDescription>
                    Analyses et rapports détaillés de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                      Module de rapports en développement
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres système</CardTitle>
                  <CardDescription>
                    Configuration générale de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Maintenance programmée</h3>
                        <p className="text-sm text-muted-foreground">
                          Planifier une maintenance du système
                        </p>
                      </div>
                      <Button variant="outline">Configurer</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Sauvegarde des données</h3>
                        <p className="text-sm text-muted-foreground">
                          Gérer les sauvegardes automatiques
                        </p>
                      </div>
                      <Button variant="outline">Configurer</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Paramètres des notifications système
                        </p>
                      </div>
                      <Button variant="outline">Configurer</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        
        </main>
        <Footer />
      </div>
    </RoleProtected>
  );
}
