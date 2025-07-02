"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Location } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("COTONOU");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const router = useRouter();


     // Chargement des données
     useEffect(() => {
      // Chargement des localisations
      const locationsData = Object.values(Location);
      setLocations(locationsData);
      console.log(locationsData);
    }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    if (image) {
      formData.append("file", new Blob([image], { type: "image/" }));
      formData.append("folder", "users-img");
      
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const { url } = await response.json();
          try {
            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name,
                email,
                location,
                role: "BUYER",
                password,
                image: url,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || "Erreur lors de l'inscription");
            }

            toast({
              title: "Inscription réussie",
              description: "Vous pouvez maintenant vous connecter",
            });

            router.push("/auth/login");
          } catch (error) {
            toast({
              title: "Erreur",
              description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        } else {
          toast({
            title: "Erreur lors de l'upload de l'image",
            description: "Veuillez réessayer",
            variant: "destructive",
          });

        }
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error);
        toast({
          title: "Erreur lors de l'upload de l'image",
          description: "Veuillez réessayer",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-muted/30">
      {/* Decorative elements in background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] rounded-full bg-primary"></div>
        <div className="absolute -bottom-[400px] -left-[400px] w-[800px] h-[800px] rounded-full bg-accent"></div>
      </div>
      
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "30px 30px"
        }}></div>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <main aria-label="Inscription à la plateforme">
          <div className="mx-auto max-w-[400px]">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
                <CardDescription className="text-center">
                  Créez votre compte pour commencer
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom Complet</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Votre nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Emplacement</Label>
                  <Select 
                    value={location}
                    onValueChange={(value) => setLocation(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un emplacement" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.toString()} value={loc.toString()}>
                          {loc.toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-image">Image de profil</Label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    tabIndex={0}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                      else {
                        toast({
                          title: "Format d'image invalide",
                          description: "Veuillez choisir une image valide",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Input
                      id="user-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        } else {
                        toast({
                          title: "Format d'image invalide",
                          description: "Veuillez choisir une image valide",
                          variant: "destructive",
                        });
                      }
                      }}
                    />
                    <label htmlFor="user-image" className="cursor-pointer">
                      {image ? (
                        <div className="relative">
                          <img
                            src={image}
                            alt="Aperçu de l'image de profil"
                            className="mx-auto rounded-md w-32 h-32 object-cover border"
                          />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Cliquez ou glissez-déposez pour changer l'image
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-muted-foreground"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Cliquez ou glissez-déposez une image ici
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Se connecter
                  </Link>
                </p>
              </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}