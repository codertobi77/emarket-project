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
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface FieldErrors {
  name?: string;
  email?: string;
  location?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("COTONOU");
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Chargement des données
  useEffect(() => {
    // Chargement des localisations
    const locationsData = Object.values(Location);
    setLocations(locationsData);
    console.log(locationsData);
  }, []);

  // Validation des champs
  const validateField = (fieldName: string, value: string): string | undefined => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return "Le nom est requis";
        if (value.trim().length < 2) return "Le nom doit contenir au moins 2 caractères";
        if (value.trim().length > 50) return "Le nom ne peut pas dépasser 50 caractères";
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) return "Le nom ne peut contenir que des lettres et espaces";
        return undefined;
      
      case 'email':
        if (!value.trim()) return "L'email est requis";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return "Format d'email invalide";
        return undefined;
      
      case 'location':
        if (!value) return "L'emplacement est requis";
        return undefined;
      
      case 'password':
        if (!value) return "Le mot de passe est requis";
        if (value.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
        if (value.length > 128) return "Le mot de passe ne peut pas dépasser 128 caractères";
        if (!/(?=.*[a-z])/.test(value)) return "Le mot de passe doit contenir au moins une lettre minuscule";
        if (!/(?=.*[A-Z])/.test(value)) return "Le mot de passe doit contenir au moins une lettre majuscule";
        if (!/(?=.*\d)/.test(value)) return "Le mot de passe doit contenir au moins un chiffre";
        return undefined;
      
      case 'confirmPassword':
        if (!value) return "La confirmation du mot de passe est requise";
        if (value !== password) return "Les mots de passe ne correspondent pas";
        return undefined;
      
      default:
        return undefined;
    }
  };

  // Gestion des événements de focus
  const handleFocus = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Gestion des événements de changement
  const handleChange = (fieldName: string, value: string) => {
    // Mettre à jour la valeur
    switch (fieldName) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'password':
        setPassword(value);
        // Re-valider confirmPassword si il a été touché
        if (touched.confirmPassword) {
          const confirmError = validateField('confirmPassword', confirmPassword);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    // Valider le champ
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Gestion des événements de blur
  const handleBlur = (fieldName: string) => {
    const value = fieldName === 'name' ? name : 
                  fieldName === 'email' ? email : 
                  fieldName === 'location' ? location : 
                  fieldName === 'password' ? password : 
                  confirmPassword;
    
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation complète avant soumission
    const allErrors: FieldErrors = {};
    allErrors.name = validateField('name', name);
    allErrors.email = validateField('email', email);
    allErrors.location = validateField('location', location);
    allErrors.password = validateField('password', password);
    allErrors.confirmPassword = validateField('confirmPassword', confirmPassword);

    setErrors(allErrors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(allErrors).some(error => error !== undefined);
    if (hasErrors) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          location,
          role: "BUYER",
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Messages d'erreur plus clairs pour l'utilisateur
        let errorMessage = "Une erreur est survenue lors de l'inscription";
        
        if (data.message) {
          if (data.message.includes("déjà utilisé") || data.message.includes("already exists")) {
            errorMessage = "Cette adresse email est déjà utilisée";
          } else if (data.message.includes("requis") || data.message.includes("required")) {
            errorMessage = "Tous les champs sont obligatoires";
          } else if (data.message.includes("format") || data.message.includes("invalid")) {
            errorMessage = "Format de données invalide";
          } else {
            errorMessage = data.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter",
      });

      router.push("/auth/login");
    } catch (error) {
      toast({
        title: "Inscription échouée",
        description: error instanceof Error ? error.message : "Impossible de créer votre compte pour le moment. Veuillez réessayer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    return name.trim() && 
           email.trim() && 
           location && 
           password && 
           confirmPassword && 
           Object.values(errors).every(error => !error);
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
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        placeholder="Votre nom"
                        value={name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onFocus={() => handleFocus('name')}
                        onBlur={() => handleBlur('name')}
                        className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                        required
                      />
                      {errors.name && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onFocus={() => handleFocus('email')}
                        onBlur={() => handleBlur('email')}
                        className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                        required
                      />
                      {errors.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Emplacement</Label>
                    <Select 
                      value={location}
                      onValueChange={(value) => handleChange('location', value)}
                    >
                      <SelectTrigger className={errors.location ? "border-red-500 focus:border-red-500" : ""}>
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
                    {errors.location && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onFocus={() => handleFocus('password')}
                        onBlur={() => handleBlur('password')}
                        placeholder="Votre mot de passe"
                        className={`pr-10 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      {errors.password && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        onFocus={() => handleFocus('confirmPassword')}
                        onBlur={() => handleBlur('confirmPassword')}
                        placeholder="Confirmez votre mot de passe"
                        className={`pr-10 ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      {errors.confirmPassword && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !isFormValid()}
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