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
  Languages, Database, Save, Trash2, Zap
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
import RoleProtected from "@/components/RoleProtected";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    {
      title: 'Localisations',
      value: locations.length,
      icon: MapPin,
      color: 'from-amber-500 to-orange-400',
      textColor: 'text-amber-500'
    }
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
    role: "USER",
    image: "",
    location: "COTONOU"
  });
  
  const [newMarket, setNewMarket] = useState<Omit<Market, 'id' | 'createdAt' | 'updatedAt' | 'marketSellers' | 'manager'>>({
    name: "",
    location: "COTONOU",
    description: "",
    managerId: "",
    image: ""
  });
  
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
    image: "",
  });
  
  const [deletedUser, setDeletedUser] = useState<User>();

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
    try {
      // Chargement des utilisateurs
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();
      setUsers(usersData);
      
      // Chargement des marchés
      const marketsResponse = await fetch('/api/markets');
      const marketsData = await marketsResponse.json();
      setMarkets(marketsData);
      
      // Chargement des produits
      const productsResponse = await fetch('/api/products');
      const productsData = await productsResponse.json();
      setProducts(productsData);
      
      // Chargement des localisations
      const locationsData = Object.values(Location);
      setLocations(locationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaires d'événements
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        const createdUser = await response.json();
        setUsers([...users, createdUser]);
        setIsCreateUserDialogOpen(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "USER",
          location: "COTONOU",
          image: ""
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
    }
  };
  
  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          managerId: "",
          image: ""
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création du marché:', error);
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
      const response = await fetch(`/api/users/${deletedUser.id}`, {
        method: 'DELETE',
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
      const response = await fetch(`/api/markets/${deletedMarket.id}`, {
        method: 'DELETE',
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
        <main className="flex-1 container py-8">
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
                Ajouter un utilisateur
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
          
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                              <img 
                                src={
                                  market.image?.startsWith('/markets-img/') ? `/assets${market.image}` :
                                  market.image?.includes('public/assets/') ? `/${market.image.split('public/')[1]}` :
                                  market.image?.includes('assets/') ? `/${market.image}` :
                                  market.image ? `/assets/markets-img/${market.image.split('/').pop()}` :
                                  "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg"
                                } 
                                alt={market.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg";
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{market.name}</p>
                              <p className="text-sm text-muted-foreground">{market.location}</p>
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
                        <TableHead>Manager</TableHead>
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
                                  <img 
                                    src={
                                      market.image?.startsWith('/markets-img/') ? `/assets${market.image}` :
                                      market.image?.includes('public/assets/') ? `/${market.image.split('public/')[1]}` :
                                      market.image?.includes('assets/') ? `/${market.image}` :
                                      market.image ? `/assets/markets-img/${market.image.split('/').pop()}` :
                                      "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg"
                                    } 
                                    alt={market.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg";
                                    }}
                                  />
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
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage 
                                  src={market.manager?.image} 
                                  alt={market.manager?.name} 
                                  onError={(e) => {
                                    e.currentTarget.src = '/assets/users-img/default-avatar.svg';
                                  }}
                                />
                                </Avatar>
                                <span>{market.manager?.name || 'Non assigné'}</span>
                              </div>
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
                                  <img 
                                    src={
                                      product.image?.startsWith('/products-img/') ? `/assets${product.image}` :
                                      product.image?.includes('public/assets/') ? `/${product.image.split('public/')[1]}` :
                                      product.image?.includes('assets/') ? `/${product.image}` :
                                      product.image ? `/assets/products-img/${product.image.split('/').pop()}` :
                                      "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"
                                    } 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                                    }}
                                  />
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
          </Tabs>
        </main>
        <Footer />
        {/* Dialogues modaux */}
        {/* Dialogue de mise à jour d'utilisateur */}
        <Dialog open={isUpdateUserDialogOpen} onOpenChange={setIsUpdateUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un utilisateur</DialogTitle>
              <DialogDescription>Créez un nouvel utilisateur sur la plateforme</DialogDescription>
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
                <Label htmlFor="role">Rôle</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="SELLER">Vendeur</SelectItem>
                    <SelectItem value="BUYER">Acheteur</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="user-image">Image du marché</Label>
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
                        setNewUser({ ...newUser, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {newUser.image && (
                  <img
                    src={newUser.image}
                    alt="Aperçu de l'image du marché"
                    className="mt-2 rounded-md w-24 h-24 object-cover border"
                  />
                )}
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un marché</DialogTitle>
              <DialogDescription>Créez un nouveau marché sur la plateforme</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMarket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="market-name">Nom du marché</Label>
                <Input 
                  id="market-name" 
                  value={newMarket.name} 
                  onChange={(e) => setNewMarket({...newMarket, name: e.target.value})}
                  placeholder="Marché de Gbégamey" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Emplacement</Label>
                <Select 
                  value={newMarket.location}
                  onValueChange={(value) => setNewMarket({ ...newMarket, location: value as Location })}
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
                <Label htmlFor="market-description">Description</Label>
                <Textarea 
                  id="market-description" 
                  value={newMarket.description as string} 
                  onChange={(e) => setNewMarket({...newMarket, description: e.target.value})}
                  placeholder="Description du marché..." 
                  rows={3} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="market-manager">Manager</Label>
                <Select 
                  value={newMarket.managerId} 
                  onValueChange={(value) => setNewMarket({...newMarket, managerId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => user.role === 'MANAGER')
                      .map(manager => (
                        <SelectItem key={manager.id} value={manager.id || ''}>
                          {manager.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
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
                        setNewMarket({ ...newMarket, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {newMarket.image && (
                  <img
                    src={newMarket.image}
                    alt="Aperçu de l'image du marché"
                    className="mt-2 rounded-md w-24 h-24 object-cover border"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsCreateMarketDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Dialogue de modification de marché */}
        <Dialog open={isUpdateMarketDialogOpen} onOpenChange={setIsUpdateMarketDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
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
                <Label htmlFor="update-market-manager">Manager</Label>
                <Select 
                  value={updatedMarket.managerId} 
                  onValueChange={(value) => setUpdatedMarket({...updatedMarket, managerId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => user.role === 'MANAGER')
                      .map(manager => (
                        <SelectItem key={manager.id} value={manager.id || ''}>
                          {manager.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
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
          <DialogContent className="sm:max-w-[425px]">
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

        {/* Dialogue de suppression de marché */}
        <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Supprimer l'utilisateur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer l'utilisateur ? Cette action est irréversible.
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
