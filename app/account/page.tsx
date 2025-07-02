'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, Bell, Package, CreditCard, Settings, AlertTriangle } from "lucide-react";
import { CertifiedSellerDialog } from "@/components/certified-seller-dialog";
import { ProfileImageUploader } from "@/components/profile-image-uploader";
import { getNormalizedImagePath } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useAccount } from '@/lib/use-account';
import Image from 'next/image';

export default function AccountPage() {
  const { account, isLoading, isError, mutate } = useAccount();
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isCertified, setIsCertified] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Initialiser les données du formulaire quand la session est chargée
  useEffect(() => {
    if (account) {
      console.log('User image path:', account.image);
      setName(account.name || "");
      setEmail(account.email || "");
      setProfileImage(account.image || null);
      setIsCertified(!!account.isCertified);
      console.log('Profile image set to:', account.image || null);
    }
  }, [account]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoadingForm(true);
    setError(null);

    if (password && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoadingForm(false);
      return;
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          image: profileImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      // Mettre à jour la session
      await update({
        ...session,
        user: {
          ...account,
          ...data
        }
      });

      // Revalider les données SWR
      await mutate();

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error) {
      setError("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoadingForm(false);
    }
  };
  
  const handleImageUploaded = async (imagePath: string) => {
    try {
      // Mettre à jour l'image dans l'état local
      setProfileImage(imagePath);

      // Mettre à jour l'image dans la base de données
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imagePath,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'image');
      }

      const data = await response.json();

      // Mettre à jour la session
      await update({
        ...session,
        user: {
          ...account,
          ...data
        }
      });

      // Revalider les données SWR
      await mutate();

      toast({
        title: "Succès",
        description: "Image de profil mise à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'image:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'image de profil",
        variant: "destructive",
      });
    }
  };
  
  const handleStartCertification = () => {
    toast({
      title: "Demande de certification",
      description: "Votre demande de certification a été enregistrée. Vous recevrez bientôt un email avec les prochaines étapes.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erreur lors du chargement des données</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container py-10" aria-label="Mon compte">
        {/* En-tête du profil */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <ProfileImageUploader 
              currentImage={profileImage} 
              name={name} 
              onImageUploaded={handleImageUploaded} 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{name || 'Mon compte'}</h1>
                {isCertified && (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4 mr-1 text-emerald-500" />
                    Certifié
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{account?.role}</Badge>
                {account?.role === 'SELLER' && (
                  <Badge variant="secondary" className="text-xs">Vendeur</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bannière pour les vendeurs */}
        {(account?.role === 'SELLER' && !isCertified) && (
          <Alert className="mb-6 bg-primary/10 border-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-medium">Certification de vendeur disponible</AlertTitle>
            <AlertDescription className="flex flex-col space-y-2">
              <p>Améliorez votre visibilité et gagnez la confiance des acheteurs en devenant un vendeur certifié.</p>
              <div className="mt-2">
                <CertifiedSellerDialog 
                  onStartProcess={handleStartCertification} 
                  isCertified={isCertified}
                />
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {account?.role === 'SELLER' && isCertified && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800 font-medium">Vendeur Certifié</AlertTitle>
            <AlertDescription className="flex flex-col space-y-2">
              <p>Félicitations ! Votre compte est certifié. Profitez de tous les avantages des vendeurs certifiés.</p>
              <div className="mt-2">
                <CertifiedSellerDialog 
                  onStartProcess={handleStartCertification}
                  isCertified={isCertified}
                />
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Contenu principal */}
        <Tabs defaultValue="profile" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Sécurité</span>
            </TabsTrigger>
            {account?.role === 'SELLER' && (
              <TabsTrigger value="store" className="gap-2">
                <Package className="h-4 w-4" />
                <span>Ma boutique</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4" />
              <span>Préférences</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles ici.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button form="profile-form" type="submit" disabled={isLoadingForm}>
                  {isLoadingForm ? "Mise à jour..." : "Enregistrer les changements"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Changer de mot de passe</CardTitle>
                <CardDescription>
                  Mettez à jour votre mot de passe pour sécuriser votre compte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="security-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button form="security-form" type="submit" disabled={isLoadingForm}>
                  {isLoadingForm ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet Boutique (pour les vendeurs) */}
          {account?.role === 'SELLER' && (
            <TabsContent value="store" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ma boutique</CardTitle>
                  <CardDescription>
                    Gérez les informations de votre boutique et vos produits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 text-center border border-dashed rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Accédez à votre espace vendeur</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gérez vos produits, suivez vos ventes et personnalisez votre boutique
                    </p>
                    <Button variant="default" className="mt-2">
                      Aller à l'espace vendeur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {/* Onglet Préférences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Gérez vos préférences de notification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center border border-dashed rounded-lg">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Cette fonctionnalité sera bientôt disponible</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Nous travaillons actuellement sur cette fonctionnalité.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
