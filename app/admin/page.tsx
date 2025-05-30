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
  DialogDescription,
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
    image: "",
  });
  const [updatedMarket, setUpdatedMarket] = useState<Market>({
    id: "",
    name: "",
    location: "",
    description: "",
    managerId: "",
    image: "",
    marketSellers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    manager: {} as User,
  });

  const [deletedMarket, setDeletedMarket] = useState<Market>();

  const [isUpdateMarketDialogOpen, setIsUpdateMarketDialogOpen] = useState(false);
  const [isDeleteMarketDialogOpen, setIsDeleteMarketDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [deletedUser, setDeletedUser] = useState<User>();
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "BUYER",
    marketId: "",
    location: "COTONOU",
  });


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
      // Vérifier que les champs obligatoires sont remplis
      if (!newMarket.name || !newMarket.location || !newMarket.description || !newMarket.managerId) {
        console.error("Tous les champs obligatoires doivent être remplis");
        return;
      }
      
      // Afficher les données qui seront envoyées
      console.log("Données du marché à créer:", newMarket);
      console.log("Chemin de l'image:", newMarket.image);
      
      // Assurer que l'image est incluse dans les données envoyées
      const marketData = {
        ...newMarket,
        // Si l'image est vide, utiliser une image par défaut
        image: newMarket.image || "public/assets/markets-img/default-market.jpg"
      };
      
      const response = await fetch("/api/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(marketData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Marché créé avec succès:", result);
        
        setIsCreateMarketDialogOpen(false);
        setNewMarket({
          name: "",
          location: "",
          description: "",
          managerId: "",
          image: "",
        });
        fetchMarkets();
      } else {
        const error = await response.text();
        console.error("Erreur lors de la création du marché:", error);
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
      image: "",
    });
  };

  // Fonction spécifique pour mettre à jour les utilisateurs
  const handleUpdateUser = async (userId: string) => {
    try {
      console.log('Mise à jour de l\'utilisateur avec ID:', userId);
      // Implémenter la logique de mise à jour de l'utilisateur ici
      // Pour l'instant, nous affichons simplement un message
      console.log('Fonction de mise à jour d\'utilisateur à implémenter');
      
      // TODO: Implémenter la logique réelle de mise à jour des utilisateurs
      // via une requête à l'API
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };


  // Fonction améliorée pour la mise à jour des marchés
  const handleUpdateMarket = () => {
    console.log('Début de la mise à jour du marché...');
    
    // Vérification des données
    if (!updatedMarket || !updatedMarket.id) {
      console.error('Aucun marché sélectionné pour la mise à jour');
      return;
    }
    
    if (!updatedMarket.name || !updatedMarket.location || !updatedMarket.description || !updatedMarket.managerId) {
      console.error('Données incomplètes pour la mise à jour du marché:', { 
        name: updatedMarket.name, 
        location: updatedMarket.location,
        description: updatedMarket.description,
        managerId: updatedMarket.managerId 
      });
      return;
    }
    
    // Créer un objet avec les données mises à jour, en s'assurant que l'image est incluse
    try {
      // S'assurer que l'image n'est pas vide
      const imageToUse = updatedMarket.image || "public/assets/markets-img/default-market.jpg";
      console.log('Image utilisée pour la mise à jour:', imageToUse);
      
      const marketData = {
        id: updatedMarket.id,
        name: updatedMarket.name,
        location: updatedMarket.location,
        description: updatedMarket.description,
        managerId: updatedMarket.managerId,
        image: imageToUse
      };
      
      console.log('Données complètes pour la mise à jour:', marketData);
      
      // Stocker les données pour une utilisation ultérieure
      localStorage.setItem('marketToUpdate', JSON.stringify(marketData));
      
      // Solution simplifiée: soumettre un formulaire HTML natif 
      // qui sera envoyé en dehors de React/Next.js
      const formElement = document.createElement('form');
      formElement.method = 'POST'; // Utiliser POST au lieu de PUT pour la compatibilité
      formElement.action = `/api/markets/update?id=${updatedMarket.id}`; // API spéciale pour la mise à jour
      
      // Ajouter un champ caché avec les données
      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'marketData';
      dataInput.value = JSON.stringify(marketData);
      formElement.appendChild(dataInput);
      
      // Fermer la boîte de dialogue et réinitialiser l'état avant de soumettre
      setIsUpdateMarketDialogOpen(false);
      setUpdatedMarket({
        id: "",
        name: "",
        location: "",
        description: "",
        managerId: "",
        image: "",
        marketSellers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        manager: {} as User,
      });
      
      console.log('Utilisation d\'une soumission de formulaire native pour contourner le problème...');
      
      // Ajouter le formulaire au document et le soumettre
      document.body.appendChild(formElement);
      formElement.submit();
      document.body.removeChild(formElement);      
    } catch (error) {
      console.error("Exception lors de la soumission du formulaire:", error);
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

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsDeleteUserDialogOpen(false);
        setDeletedUser(undefined);
        fetchUsers();
      } else {
        console.error("Erreur lors de la suppression de l'utilisateur");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Vérifier que les champs obligatoires sont remplis
      if (!newUser.name || !newUser.email || !newUser.password || !newUser.confirmPassword) {
        console.error("Tous les champs obligatoires doivent être remplis");
        return;
      }
      
      // Vérifier que les mots de passe correspondent
      if (newUser.password !== newUser.confirmPassword) {
        console.error("Les mots de passe ne correspondent pas");
        return;
      }
      
      // Vérifier que l'utilisateur a un marché s'il est vendeur
      if (newUser.role === "SELLER" && !newUser.marketId) {
        console.error("Un vendeur doit être associé à un marché");
        return;
      }
      
      // Préparer les données pour l'API
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        marketId: newUser.role === "SELLER" ? newUser.marketId : undefined,
        location: newUser.location,
      };
      
      // Envoyer les données à l'API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Réinitialiser le formulaire et fermer la boîte de dialogue
        setIsCreateUserDialogOpen(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "BUYER",
          marketId: "",
          location: "COTONOU",
        });
        // Rafraîchir la liste des utilisateurs
        fetchUsers();
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de la création de l'utilisateur:", errorData.message);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };
  
  const handleCancelCreateUser = () => {
    setIsCreateUserDialogOpen(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "BUYER",
      marketId: "",
      location: "COTONOU",
    });
  };



  return (
    <RoleProtected allowedRoles={["ADMIN"]}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Administration</h1>
            <div className="flex gap-4">
              <Button onClick={() => setIsCreateUserDialogOpen(true)}>
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
                <DialogTitle>Ajouter un nouveau marché</DialogTitle>
                <DialogDescription>Remplissez le formulaire pour créer un nouveau marché.</DialogDescription>
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
                                          formData.append("folder", 'markets-img');
                                          // const formData = {
                                          //   image: file,
                                          //   folder: 'products-img',
                                          // }
                                          console.log('Envoi du fichier pour nouveau marché:', file.name);
                                          fetch("/api/upload", {
                                            method: "POST",
                                            body: formData,
                                          })
                                            .then((res) => {
                                              if (!res.ok) {
                                                throw new Error(`Erreur HTTP: ${res.status}`);
                                              }
                                              return res.json();
                                            })
                                            .then((data) => {
                                              // Créer le nouveau chemin d'image
                                              const newImagePath = `public/assets/markets-img/${data.filename}`;
                                              console.log('Chemin d\'image généré pour nouveau marché:', newImagePath);
                                              
                                              // Mettre à jour l'état avec le nouveau chemin
                                              setNewMarket(prevState => {
                                                const newState = {
                                                  ...prevState,
                                                  image: newImagePath
                                                };
                                                console.log('Nouvel état après mise à jour:', newState);
                                                return newState;
                                              });
                                            })
                                            .catch((error) => console.error(error));
                                        }
                                      }}
                                    />
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
                <DialogDescription>Modifiez les informations du marché.</DialogDescription>
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
                                          formData.append("folder", 'markets-img');
                                          console.log('Envoi du fichier:', file.name);
                                          fetch("/api/upload", {
                                            method: "POST",
                                            body: formData,
                                          })
                                            .then((res) => {
                                              if (!res.ok) {
                                                throw new Error(`Erreur HTTP: ${res.status}`);
                                              }
                                              return res.json();
                                            })
                                            .then((data) => {
                                              const newImagePath = `public/assets/markets-img/${data.filename}`;
                                              console.log('Chemin d\'image généré:', newImagePath);
                                              setUpdatedMarket(prevState => {
                                                const newState = {
                                                  ...prevState,
                                                  image: newImagePath
                                                };
                                                console.log('Nouvel état après mise à jour:', newState);
                                                return newState;
                                              });
                                            })
                                            .catch((error) => console.error(error));
                                        }
                                      }}
                                    />
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

          <div>
            <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
              <DialogContent>
                <DialogTitle>Supprimer l'utilisateur</DialogTitle>
                {deletedUser && (<form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDeleteUser(deletedUser.id);
                  }}
                >
                  <div className="space-y-4">
                    <p>Êtes-vous sûr de vouloir supprimer l'utilisateur {deletedUser.name} ?</p>
                    <p className="text-red-500 text-sm">Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.</p>
                    <div className="flex justify-end gap-4">
                      <Button type="submit" variant="destructive" className="w-full">
                        Oui, supprimer
                      </Button>
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => setIsDeleteUserDialogOpen(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </form>)}
              </DialogContent>
            </Dialog>
          </div>
          
          <div>
            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
              <DialogContent>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                <DialogDescription>Remplissez le formulaire pour créer un nouvel utilisateur.</DialogDescription>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={newUser.confirmPassword}
                      onChange={(e) =>
                        setNewUser({ ...newUser, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Rôle</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUYER">Acheteur</SelectItem>
                        <SelectItem value="SELLER">Vendeur</SelectItem>
                        <SelectItem value="MANAGER">Gestionnaire</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newUser.role === "SELLER" && (
                    <div>
                      <Label htmlFor="marketId">Marché</Label>
                      <Select
                        value={newUser.marketId}
                        onValueChange={(value) =>
                          setNewUser({ ...newUser, marketId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un marché" />
                        </SelectTrigger>
                        <SelectContent>
                          {markets.map((market) => (
                            <SelectItem key={market.id} value={market.id}>
                              {market.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    <Select
                      value={newUser.location}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, location: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une localisation" />
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
                  
                  <div className="flex justify-end gap-4">
                    <Button type="submit" className="w-full">
                      Ajouter l'utilisateur
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleCancelCreateUser}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
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
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  de {users.filter(user => user.role === "SELLER").length} vendeurs dans {markets.length} marchés
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
                                      <DialogDescription>Modifiez les informations de l'utilisateur.</DialogDescription>
                                      <form onSubmit={(e) => {
                                        e.preventDefault();
                                        // Utiliser une fonction appropriée pour les utilisateurs
                                        handleUpdateUser(user.id);
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
                                <DropdownMenuItem onClick={() => {
                                  setDeletedUser(user);
                                  setIsDeleteUserDialogOpen(true);
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
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  market.image
                                    ? market.image.startsWith('/markets-img/')
                                      ? `/assets${market.image}`
                                      : market.image.includes('public/assets/')
                                        ? `/${market.image.split('public/')[1]}`
                                        : market.image.includes('assets/')
                                          ? `/${market.image}`
                                          : `/assets/markets-img/${market.image.split('/').pop()}`
                                    : "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"
                                }
                                alt={market.name}
                                className="w-10 h-10 object-cover rounded-md border"
                                onError={e => {
                                  (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                                }}
                              />
                              <span className="font-medium">{market.name}</span>
                            </div>
                          </TableCell>
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
                                    // Créer un nouvel objet qui correspond au type attendu
                                    setUpdatedMarket({
                                      ...market,
                                      // Garantir que toutes les propriétés requises sont présentes
                                      image: market.image || "",
                                    });
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
