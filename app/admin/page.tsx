"use client";

import { Metadata } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Market, Product, Location, Role } from "@/types";
import { 
  Users, Store, ShoppingBag, Package, Plus, Edit, Trash, UserPlus, 
  Settings, Building, MapPin, ArrowRight, BarChart, PieChart, 
  Clock, RefreshCw, Download, Filter, ChevronRight, Bell, Moon, 
  Languages, Database, Save, Trash2, Zap, AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getNormalizedImagePath } from '@/lib/utils';
import RoleProtected from "@/components/RoleProtected";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import Image from "next/image";
import { uploadImage } from "@/lib/utils";
import type { Category } from "@prisma/client";


export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Statistiques
  const stats = [
    {
      title: 'Utilisateurs',
      value: users.length,
      icon: Users,
      color: 'from-blue-500 to-cyan-400',
      textColor: 'text-blue-500'
    },
    {
      title: 'Marchés',
      value: markets.length,
      icon: Store,
      color: 'from-emerald-500 to-teal-400',
      textColor: 'text-emerald-500'
    },
    {
      title: 'Produits',
      value: products.length,
      icon: ShoppingBag,
      color: 'from-purple-500 to-indigo-400',
      textColor: 'text-purple-500'
    },
  ];

  // État pour les dialogues
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreateMarketDialogOpen, setIsCreateMarketDialogOpen] = useState(false);
  const [isUpdateMarketDialogOpen, setIsUpdateMarketDialogOpen] = useState(false);
  const [isDeleteMarketDialogOpen, setIsDeleteMarketDialogOpen] = useState(false);
const [isUpdateUserDialogOpen, setIsUpdateUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  
  // État pour les formulaires
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "SELLER",
    location: "COTONOU",
    phone: "",
    marketId: ""
  });
  
  const [newMarket, setNewMarket] = useState<{
    name: string;
    location: string;
    description: string;
    image: string;
  }>({
    name: "",
    location: "COTONOU",
    description: "",
    image: ""
  });
  
  // État pour la validation du formulaire de marché
  const [marketErrors, setMarketErrors] = useState<{
    name?: string;
    location?: string;
    description?: string;
  }>({});
  const [marketTouched, setMarketTouched] = useState<Record<string, boolean>>({});
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);
  
  const [updatedMarket, setUpdatedMarket] = useState<Market>({
    id: "",
    name: "",
    location: "COTONOU",
    description: "",
    managerId: "",
    image: "",
    marketSellers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    manager: {} as User
  });
  
  const [deletedMarket, setDeletedMarket] = useState<Market>();

  const [updatedUser, setUpdatedUser] = useState<User>({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "SELLER",
  });
  
  const [deletedUser, setDeletedUser] = useState<User>();

  const [isUploadingMarketImage, setIsUploadingMarketImage] = useState(false);
  const [marketImageError, setMarketImageError] = useState<string | null>(null);

  // --- État pour les catégories ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editCategory, setEditCategory] = useState<{ id: string, name: string, description: string | null }>({ id: '', name: '', description: '' });
  const [deleteCategory, setDeleteCategory] = useState<{ id: string, name: string }>({ id: '', name: '' });
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // --- Fetch catégories ---
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      setCategoryError("Erreur lors du chargement des catégories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // --- Charger les catégories au mount et après chaque action ---
  useEffect(() => { fetchCategories(); }, []);

  // --- Création catégorie ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    if (!newCategory.name || !newCategory.description) {
      setCategoryError('Nom et description requis');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) throw new Error('Erreur API');
      setIsCreateCategoryDialogOpen(false);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (e) {
      setCategoryError("Erreur lors de la création");
    }
  };

  // --- Edition catégorie ---
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    if (!editCategory.name || !editCategory.description) {
      setCategoryError('Nom et description requis');
      return;
    }
    try {
      const res = await fetch(`/api/categories?id=${editCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCategory.name, description: editCategory.description }),
      });
      if (!res.ok) throw new Error('Erreur API');
      setIsEditCategoryDialogOpen(false);
      setEditCategory({ id: '', name: '', description: '' });
      fetchCategories();
    } catch (e) {
      setCategoryError("Erreur lors de la modification");
    }
  };

  // --- Suppression catégorie ---
  const handleDeleteCategory = async () => {
    setCategoryError(null);
    try {
      const res = await fetch(`/api/categories?id=${deleteCategory.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur API');
      setIsDeleteCategoryDialogOpen(false);
      setDeleteCategory({ id: '', name: '' });
      fetchCategories();
    } catch (e) {
      setCategoryError("Erreur lors de la suppression");
    }
  };

  // Chargement des données
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login');
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push('/');
      return;
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Chargement des utilisateurs
      const usersResponse = await fetch('/api/users', { credentials: 'include' });
      const usersData = await usersResponse.json();
      setUsers(usersData);
      
      // Chargement des marchés
      const marketsResponse = await fetch('/api/markets', { credentials: 'include' });
      const marketsData = await marketsResponse.json();
      setMarkets(marketsData);
      
      // Chargement des produits
      const productsResponse = await fetch('/api/products', { credentials: 'include' });
      const productsData = await productsResponse.json();
      setProducts(productsData);
      
      // Chargement des localisations
      const locationsData = Object.values(Location);
      setLocations(locationsData);
    } catch (error) {
      setFetchError("Impossible de charger les données. Veuillez réessayer plus tard.");
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaires d'événements
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.marketId) {
      alert('Veuillez sélectionner un marché.');
      return;
    }
    if (!newUser.phone) {
      alert('Veuillez renseigner le contact téléphonique.');
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newUser,
          role: 'SELLER',
          marketId: newUser.marketId,
          phone: newUser.phone,
        }),
      });
      if (response.ok) {
        const createdUser = await response.json();
        setUsers([...users, createdUser]);
        setIsCreateUserDialogOpen(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "SELLER",
          location: "COTONOU",
          phone: "",
          marketId: ""
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création du vendeur:', error);
    }
  };
  
  // Validation des champs du marché
  const validateMarketField = (fieldName: string, value: string): string | undefined => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return "Le nom du marché est requis";
        if (value.trim().length < 3) return "Le nom doit contenir au moins 3 caractères";
        if (value.trim().length > 100) return "Le nom ne peut pas dépasser 100 caractères";
        return undefined;
      
      case 'location':
        if (!value) return "L'emplacement est requis";
        return undefined;
      
      case 'description':
        if (!value.trim()) return "La description est requise";
        if (value.trim().length < 10) return "La description doit contenir au moins 10 caractères";
        if (value.trim().length > 500) return "La description ne peut pas dépasser 500 caractères";
        return undefined;
      
      default:
        return undefined;
    }
  };

  // Gestion des événements de focus pour le marché
  const handleMarketFocus = (fieldName: string) => {
    setMarketTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Gestion des événements de changement pour le marché
  const handleMarketChange = (fieldName: string, value: string) => {
    setNewMarket(prev => ({ ...prev, [fieldName]: value }));
    
    // Valider le champ
    const error = validateMarketField(fieldName, value);
    setMarketErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Gestion des événements de blur pour le marché
  const handleMarketBlur = (fieldName: string) => {
    const value = newMarket[fieldName as keyof typeof newMarket] as string;
    const error = validateMarketField(fieldName, value);
    setMarketErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Vérifier si le formulaire de marché est valide
  const isMarketFormValid = () => {
    return !marketErrors.name && 
           !marketErrors.location && 
           !marketErrors.description && 
           newMarket.name.trim() && 
           newMarket.location && 
           newMarket.description.trim();
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingMarket(true);

    // Validation complète avant soumission
    const allErrors: typeof marketErrors = {};
    allErrors.name = validateMarketField('name', newMarket.name);
    allErrors.location = validateMarketField('location', newMarket.location);
    allErrors.description = validateMarketField('description', newMarket.description);
    setMarketErrors(allErrors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(allErrors).some(error => error !== undefined);
    if (hasErrors) {
      setIsCreatingMarket(false);
      return;
    }

    try {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newMarket),
      });
      
      if (response.ok) {
        const createdMarket = await response.json();
        setMarkets([...markets, createdMarket]);
        setIsCreateMarketDialogOpen(false);
        setNewMarket({
          name: "",
          location: "COTONOU",
          description: "",
          image: ""
        });
        setMarketErrors({});
        setMarketTouched({});
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la création du marché:', errorData);
      }
    } catch (error) {
      console.error('Erreur lors de la création du marché:', error);
    } finally {
      setIsCreatingMarket(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedUser),
      });
      
      if (response.ok) {
        const updatedUserData = await response.json();
        setUsers(users.map(user => 
          user.id === updatedUserData.id ? updatedUserData : user
        ));
        setIsUpdateUserDialogOpen(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }
  };
  
  const handleUpdateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/markets/${updatedMarket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedMarket),
      });
      
      if (response.ok) {
        const updatedMarketData = await response.json();
        setMarkets(markets.map(market => 
          market.id === updatedMarketData.id ? updatedMarketData : market
        ));
        setIsUpdateMarketDialogOpen(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du marché:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletedUser) return;
    
    try {
      const response = await fetch(`/api/users?id=${deletedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== deletedUser.id));
        setIsDeleteUserDialogOpen(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  };
  
  const handleDeleteMarket = async () => {
    if (!deletedMarket) return;
    
    try {
      const response = await fetch(`/api/markets?id=${deletedMarket.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setMarkets(markets.filter(market => market.id !== deletedMarket.id));
        setIsDeleteMarketDialogOpen(false);
        setDeletedMarket(undefined);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du marché:', error);
    }
  };

  // Handler pour l'image du marché (drag'n'drop ou file picker)
  const handleMarketImageChange = async (file: File) => {
    if (!file) return;
    setIsUploadingMarketImage(true);
    setMarketImageError(null);
    const path = await uploadImage(file, 'markets-img');
    if (path) {
      setNewMarket({ ...newMarket, image: path });
    } else {
      setMarketImageError("Erreur lors de l'upload de l'image");
    }
    setIsUploadingMarketImage(false);
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
  // Rendu principal
  return (
    <RoleProtected allowedRoles={["ADMIN"]}>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <main className="flex-1 container py-8" aria-label="Tableau de bord administrateur">
          {/* En-tête de la page */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Tableau de bord administrateur
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les utilisateurs, marchés, produits et paramètres système
            </p>
            <div className="flex gap-4 mt-6">
              <Button 
                onClick={() => setIsCreateUserDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un vendeur
              </Button>
              <Button 
                onClick={() => setIsCreateMarketDialogOpen(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Building className="mr-2 h-4 w-4" />
                Ajouter un marché
              </Button>
            </div>
          </div>
          
          {fetchError && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg text-center">
              {fetchError}
            </div>
          )}
          
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
                <CardHeader className={`bg-gradient-to-r ${stat.color} text-white p-4 flex flex-row items-center justify-between`}>
                  <CardTitle className="text-xl font-semibold">{stat.title}</CardTitle>
                  <div className="p-2 bg-white/20 rounded-full">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      <span>Voir détails</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Navigation par onglets */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-background">
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="markets" className="data-[state=active]:bg-background">
                Marchés
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-background">
                Produits
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-background">
                Catégories
              </TabsTrigger>
              
              <TabsTrigger value="reports" className="data-[state=active]:bg-background">
                Rapports
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-background">
                Paramètres
              </TabsTrigger>
              
            </TabsList>
            
            {/* Onglet Aperçu */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Utilisateurs récents */}
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Utilisateurs récents</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')} className="text-primary">
                        <span>Voir tout</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>Les 5 derniers utilisateurs ajoutés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={user.image} 
                                alt={user.name} 
                                onError={(e) => {
                                  // Utiliser une image par défaut spécifique au rôle de l'utilisateur
                                  e.currentTarget.src = '/assets/users-img/default-avatar.svg';
                                }}
                              />
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'MANAGER' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Marchés récents */}
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Marchés récents</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('markets')} className="text-primary">
                        <span>Voir tout</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>Les 5 derniers marchés ajoutés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {markets.slice(0, 5).map((market) => (
                        <div key={market.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden">
                              {/* <Image
                                src={getNormalizedImagePath(market.image as string)}
                                alt={market.name ? `Image de ${market.name}` : 'Image du marché'}
                                width={56}
                                height={56}
                                className="h-20 w-2rounded-full object-cover border-2 border-primary/10"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg";
                                }}
                              /> */}
                              <Avatar>
                                <AvatarImage 
                                  src={market.image as string} 
                                  alt={market.name} 
                                  onError={(e) => {
                                    // Utiliser une image par défaut spécifique au rôle de l'utilisateur
                                    (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg";
                                  }}
                                />
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-medium">{market.name}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <MapPin className="mr-1 h-3 w-3" />
                            {market.location}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Statistiques d'activité */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Activité utilisateurs</CardTitle>
                      <div className="p-1.5 bg-muted rounded-md">
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <CardDescription>Tendances d'activité sur 30 jours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-end justify-between gap-2">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const height = Math.random() * 100;
                        return (
                          <div key={i} className="relative group">
                            <div 
                              className="w-5 bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-sm transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-700" 
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              {Math.round(height)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Connexions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        <span>Mis à jour il y a 2h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Performance des marchés</CardTitle>
                      <div className="p-1.5 bg-muted rounded-md">
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <CardDescription>Par localisation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-[200px]">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="15" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            stroke="url(#gradient)" 
                            strokeWidth="15" 
                            strokeDasharray="251.2" 
                            strokeDashoffset="50.24" 
                            transform="rotate(-90 50 50)" 
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">80%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm">Paris</span>
                        <span className="text-sm font-semibold ml-auto">45%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Lyon</span>
                        <span className="text-sm font-semibold ml-auto">25%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Marseille</span>
                        <span className="text-sm font-semibold ml-auto">20%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm">Autres</span>
                        <span className="text-sm font-semibold ml-auto">10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Onglet Utilisateurs */}
            <TabsContent value="users" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Liste des utilisateurs</CardTitle>
                    <Button 
                      onClick={() => setIsCreateUserDialogOpen(true)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                  <CardDescription>Gérez tous les utilisateurs de la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Aucun utilisateur trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage 
                                  src={user.image as string} 
                                  alt={user.name} 
                                  onError={(e) => {
                                    // Utiliser une image par défaut spécifique au rôle de l'utilisateur
                                    (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg";
                                  }}
                                />
                              </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'MANAGER' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                      <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setUpdatedUser({...user, id: user.id});
                                    setIsUpdateUserDialogOpen(true);
                                  }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => {
                                      setDeletedUser(user);
                                      setIsDeleteUserDialogOpen(true);
                                    }}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Onglet Marchés */}
            <TabsContent value="markets" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Liste des marchés</CardTitle>
                    <Button 
                      onClick={() => setIsCreateMarketDialogOpen(true)}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                  <CardDescription>Gérez tous les marchés de la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Marché</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Vendeurs</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {markets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Aucun marché trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        markets.map((market) => (
                          <TableRow key={market.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md overflow-hidden">
                                <Avatar>
                                  <AvatarImage 
                                    src={market.image as string} 
                                    alt={market.name} 
                                    onError={(e) => {
                                      // Utiliser une image par défaut spécifique au rôle de l'utilisateur
                                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg";
                                    }}
                                  />
                              </Avatar>
                                </div>
                                <div>
                                  <p className="font-medium">{market.name}</p>
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{market.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <MapPin className="mr-1 h-3 w-3" />
                                {market.location}
                              </Badge>
                            </TableCell>
                            <TableCell>{market.marketSellers?.length || 0}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                      <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setUpdatedMarket(market);
                                    setIsUpdateMarketDialogOpen(true);
                                  }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => {
                                      setDeletedMarket(market);
                                      setIsDeleteMarketDialogOpen(true);
                                    }}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Onglet Produits */}
            <TabsContent value="products" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Liste des produits</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrer
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Tous les produits disponibles sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Marché</TableHead>
                        <TableHead>Vendeur</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md overflow-hidden">
                                <Avatar>
                                  <AvatarImage 
                                    src={product.image as string} 
                                    alt={product.name} 
                                    onError={(e) => {
                                      // Utiliser une image par défaut spécifique au rôle de l'utilisateur
                                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg";
                                    }}
                                  />
                              </Avatar>
                                </div>
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{product.category?.name || 'Non catégorisé'}</TableCell>
                            <TableCell>{product.price as number} FCFA</TableCell>
                            <TableCell>{product.seller?.market?.name || 'Non assigné'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage 
                                  src={product.seller?.seller.image} 
                                  alt={product.seller?.seller.name} 
                                  onError={(e) => {
                                    e.currentTarget.src = '/assets/users-img/default-avatar.svg';
                                  }}
                                />
                                  <AvatarFallback>{product.seller?.seller.name?.substring(0, 2).toUpperCase() || 'NA'}</AvatarFallback>
                                </Avatar>
                                <span>{product.seller?.seller.name || 'Non assigné'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                      <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Onglet Rapports */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Carte d'activité utilisateurs */}
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Activité utilisateurs</CardTitle>
                      <div className="p-1.5 bg-muted rounded-md">
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <CardDescription>Tendances d'activité sur 30 jours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-end justify-between gap-2">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const height = Math.random() * 100;
                        return (
                          <div key={i} className="relative group">
                            <div 
                              className="w-5 bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-sm transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-700" 
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              {Math.round(height)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Connexions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        <span>Mis à jour il y a 2h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Carte de performance des marchés */}
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Performance des marchés</CardTitle>
                      <div className="p-1.5 bg-muted rounded-md">
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <CardDescription>Par localisation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-[200px]">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="15" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            stroke="url(#gradient)" 
                            strokeWidth="15" 
                            strokeDasharray="251.2" 
                            strokeDashoffset="50.24" 
                            transform="rotate(-90 50 50)" 
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">80%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm">Paris</span>
                        <span className="text-sm font-semibold ml-auto">45%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Lyon</span>
                        <span className="text-sm font-semibold ml-auto">25%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Marseille</span>
                        <span className="text-sm font-semibold ml-auto">20%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm">Autres</span>
                        <span className="text-sm font-semibold ml-auto">10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tableau d'historique des transactions */}
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Historique des transactions</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrer
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Transactions récentes sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Transaction</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">#TRX-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{['JD', 'ML', 'AB', 'CD', 'EF'][i]}</AvatarFallback>
                              </Avatar>
                              <span>{['Jean Dupont', 'Marie Lambert', 'Alex Blanc', 'Claire Dubois', 'Eric Faure'][i]}</span>
                            </div>
                          </TableCell>
                          <TableCell>{['Tomates bio', 'Fromage de chèvre', 'Miel artisanal', 'Panier légumes', 'Huile d\'olive'][i]}</TableCell>
                          <TableCell>{(Math.random() * 50 + 5).toFixed(2)} €</TableCell>
                          <TableCell>{new Date(Date.now() - i * 86400000).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={(['default', 'outline', 'secondary', 'destructive', 'default'] as const)[i]}>
                              {['Complété', 'En attente', 'Traitement', 'Annulé', 'Complété'][i]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline">
                      Voir l'historique complet
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Onglet Paramètres */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paramètres généraux */}
                <Card className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Paramètres généraux</CardTitle>
                      <div className="p-1.5 bg-muted rounded-md">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <CardDescription>Configuration de l'application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mode sombre</Label>
                        <p className="text-sm text-muted-foreground">Activer le thème sombre pour l'interface</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications</Label>
                        <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Langue</Label>
                      <Select defaultValue="fr">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sauvegarde des données */}
                <Card className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Sauvegarde des données</CardTitle>
                      <div className="p-1.5 bg-muted rounded-md">
                        <Database className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <CardDescription>Configuration des sauvegardes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sauvegarde automatique</Label>
                        <p className="text-sm text-muted-foreground">Activer les sauvegardes quotidiennes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fréquence</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une fréquence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Toutes les heures</SelectItem>
                          <SelectItem value="daily">Quotidienne</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuelle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full" variant="outline">
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder maintenant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Maintenance système */}
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Maintenance système</CardTitle>
                    <div className="p-1.5 bg-muted rounded-md">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <CardDescription>Options de maintenance et performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-muted">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Nettoyage du cache</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground mb-4">Supprimer les fichiers temporaires pour libérer de l'espace</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Nettoyer
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-muted">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Mises à jour</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground mb-4">Vérifier et installer les dernières mises à jour</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Vérifier
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-muted">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Mode maintenance</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground mb-4">Mettre le site en mode maintenance</p>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="maintenance-mode">Activer</Label>
                          <Switch id="maintenance-mode" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Onglet Catégories */}
            <TabsContent value="categories" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Liste des catégories</CardTitle>
                    <Button onClick={() => setIsCreateCategoryDialogOpen(true)} size="sm" className="bg-gradient-to-r from-yellow-400 to-emerald-400 hover:from-yellow-500 hover:to-emerald-500 transition-all duration-200">
                      <Plus className="mr-2 h-4 w-4" /> Ajouter
                    </Button>
                  </div>
                  <CardDescription>Gérez les catégories de produits</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCategories ? (
                    <div className="text-center py-8 text-muted-foreground">Chargement...</div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Aucune catégorie trouvée</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((cat) => (
                          <TableRow key={cat.id}>
                            <TableCell>{cat.name}</TableCell>
                            <TableCell>{cat.description}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => { setEditCategory({ ...cat, description: cat.description ?? '' }); setIsEditCategoryDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDeleteCategory(cat); setIsDeleteCategoryDialogOpen(true); }}><Trash className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  {categoryError && <div className="text-red-500 text-sm mt-2">{categoryError}</div>}
                </CardContent>
              </Card>
              {/* Dialog création */}
              <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter une catégorie</DialogTitle>
                    <DialogDescription>Créez une nouvelle catégorie de produit</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Nom</Label>
                      <Input id="cat-name" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-desc">Description</Label>
                      <Textarea id="cat-desc" value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} required />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" type="button" onClick={() => setIsCreateCategoryDialogOpen(false)}>Annuler</Button>
                      <Button type="submit">Créer</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              {/* Dialog édition */}
              <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Modifier la catégorie</DialogTitle>
                    <DialogDescription>Modifiez les informations de la catégorie</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-cat-name">Nom</Label>
                      <Input id="edit-cat-name" value={editCategory.name} onChange={e => setEditCategory({ ...editCategory, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-cat-desc">Description</Label>
                      <Textarea id="edit-cat-desc" value={editCategory.description ?? ''} onChange={e => setEditCategory({ ...editCategory, description: e.target.value })} required />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" type="button" onClick={() => setIsEditCategoryDialogOpen(false)}>Annuler</Button>
                      <Button type="submit">Enregistrer</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              {/* Dialog suppression */}
              <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Supprimer la catégorie</DialogTitle>
                    <DialogDescription>Cette action est irréversible.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">Voulez-vous vraiment supprimer la catégorie <span className="font-semibold">{deleteCategory.name}</span> ?</div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" type="button" onClick={() => setIsDeleteCategoryDialogOpen(false)}>Annuler</Button>
                    <Button type="button" variant="destructive" onClick={handleDeleteCategory}>Supprimer</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
        {/* Dialogues modaux */}
        {/* Dialogue de mise à jour d'utilisateur */}
        <Dialog open={isUpdateUserDialogOpen} onOpenChange={setIsUpdateUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-auto flex flex-col">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>Modifiez les informations de l'utilisateur</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  value={updatedUser.name} 
                  onChange={(e) => setUpdatedUser({...updatedUser, name: e.target.value})}
                  placeholder="Jean Dupont" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={updatedUser.email} 
                  onChange={(e) => setUpdatedUser({...updatedUser, email: e.target.value})}
                  placeholder="jean.dupont@example.com" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select 
                  value={updatedUser.role} 
                  onValueChange={(value) => setUpdatedUser({...updatedUser, role: value as Role})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="SELLER">Vendeur</SelectItem>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-image">Photo de profil</Label>
                <Input
                  id="user-image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Optionnel : upload direct ou conversion en URL base64 pour aperçu rapide
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUpdatedUser({ ...updatedUser, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {updatedUser.image && (
                  <img
                    src={updatedUser.image}
                    alt="Aperçu de l'image de profil"
                    className="mt-2 rounded-md w-24 h-24 object-cover border"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsUpdateUserDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Mettre à jour</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialogue d'ajout d'utilisateur */}
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-auto flex flex-col">
            <DialogHeader>
              <DialogTitle>Ajouter un vendeur</DialogTitle>
              <DialogDescription>Créez un nouveau vendeur sur la plateforme</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="John Doe" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="john.doe@example.com" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={newUser.password} 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact téléphonique</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="ex: +229 90 00 00 00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Emplacement</Label>
                <Select 
                  value={newUser.location}
                  onValueChange={(value) => setNewUser({ ...newUser, location: value as Location })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un emplacement" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="market">Marché</Label>
                <Select
                  value={newUser.marketId}
                  onValueChange={(value) => setNewUser({ ...newUser, marketId: value })}
                  required
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
            
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsCreateUserDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Dialogue d'ajout de marché */}
        <Dialog open={isCreateMarketDialogOpen} onOpenChange={setIsCreateMarketDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-screen overflow-y-auto flex flex-col">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-center">Créer un marché</DialogTitle>
              <DialogDescription className="text-center">
                Ajoutez un nouveau marché à la plateforme
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMarket}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="market-name">Nom du marché</Label>
                  <div className="relative">
                    <Input 
                      id="market-name" 
                      value={newMarket.name} 
                      onChange={(e) => handleMarketChange('name', e.target.value)}
                      onFocus={() => handleMarketFocus('name')}
                      onBlur={() => handleMarketBlur('name')}
                      placeholder="Marché de Gbégamey" 
                      className={marketErrors.name ? "border-red-500 focus:border-red-500" : ""}
                      required 
                    />
                    {marketErrors.name && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {marketErrors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {marketErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market-location">Emplacement</Label>
                  <Select 
                    value={newMarket.location}
                    onValueChange={(value) => handleMarketChange('location', value)}
                  >
                    <SelectTrigger className={marketErrors.location ? "border-red-500 focus:border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionner un emplacement" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {marketErrors.location && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {marketErrors.location}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market-description">Description</Label>
                  <div className="relative">
                    <Textarea 
                      id="market-description" 
                      value={newMarket.description as string} 
                      onChange={(e) => handleMarketChange('description', e.target.value)}
                      onFocus={() => handleMarketFocus('description')}
                      onBlur={() => handleMarketBlur('description')}
                      placeholder="Décrivez le marché, ses caractéristiques, ses horaires..." 
                      rows={4}
                      className={marketErrors.description ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {marketErrors.description && (
                      <div className="absolute right-3 top-3">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {marketErrors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {marketErrors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market-image">Image du marché (optionnel)</Label>
                  <div
                    id="market-image-dropzone"
                    className="border-2 border-dashed border-primary/40 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition hover:border-primary/80 bg-muted/30"
                    onDragOver={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        handleMarketImageChange(file);
                      }
                    }}
                    onClick={() => {
                      document.getElementById('market-image-input')?.click();
                    }}
                    style={{ minHeight: '96px' }}
                  >
                    <Input
                      id="market-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleMarketImageChange(file);
                        }
                      }}
                    />
                    {newMarket.image ? (
                      <img
                        src={newMarket.image}
                        alt="Aperçu de l'image du marché"
                        className="rounded-lg w-32 h-24 object-cover border shadow-sm"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Glissez-déposez une image ici ou cliquez pour sélectionner un fichier</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4 pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreatingMarket || !isMarketFormValid()}
                >
                  {isCreatingMarket ? "Création..." : "Créer le marché"}
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsCreateMarketDialogOpen(false);
                    setNewMarket({
                      name: "",
                      location: "COTONOU",
                      description: "",
                      image: ""
                    });
                    setMarketErrors({});
                    setMarketTouched({});
                  }}
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Dialogue de modification de marché */}
        <Dialog open={isUpdateMarketDialogOpen} onOpenChange={setIsUpdateMarketDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-auto flex flex-col">
            <DialogHeader>
              <DialogTitle>Modifier le marché</DialogTitle>
              <DialogDescription>Modifiez les informations du marché</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateMarket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="update-market-name">Nom du marché</Label>
                <Input 
                  id="update-market-name" 
                  value={updatedMarket.name} 
                  onChange={(e) => setUpdatedMarket({...updatedMarket, name: e.target.value})}
                  placeholder="Marché de Gbégamey" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Emplacement</Label>
                <Select 
                  value={updatedMarket.location}
                  onValueChange={(value) => setUpdatedMarket({ ...updatedMarket, location: value as Location })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un emplacement" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="update-market-description">Description</Label>
                <Textarea 
                  id="update-market-description" 
                  value={updatedMarket.description || ''}
                  onChange={(e) => setUpdatedMarket({...updatedMarket, description: e.target.value})}
                  placeholder="Description du marché..." 
                  rows={3} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="market-image">Image du marché</Label>
                <Input
                  id="market-image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Optionnel : upload direct ou conversion en URL base64 pour aperçu rapide
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUpdatedMarket({ ...updatedMarket, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {updatedMarket.image && (
                  <img
                    src={updatedMarket.image}
                    alt="Aperçu de l'image du marché"
                    className="mt-2 rounded-md w-24 h-24 object-cover border"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsUpdateMarketDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Mettre à jour</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Dialogue de suppression de marché */}
        <Dialog open={isDeleteMarketDialogOpen} onOpenChange={setIsDeleteMarketDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-auto flex flex-col">
            <DialogHeader>
              <DialogTitle>Supprimer le marché</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce marché ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/50 p-4 rounded-md mb-4">
              <p className="font-medium">{deletedMarket?.name}</p>
              <p className="text-sm text-muted-foreground">{deletedMarket?.location}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteMarketDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteMarket}>
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogue de suppression de vendeur */}
        <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-auto flex flex-col">
            <DialogHeader>
              <DialogTitle>Supprimer le vendeur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer le vendeur ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/50 p-4 rounded-md mb-4">
              <p className="font-medium">{deletedUser?.name}</p>
              <p className="text-sm text-muted-foreground">{deletedUser?.email}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteUserDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleProtected>
  );
}
