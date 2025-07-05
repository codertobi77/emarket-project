"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Validation des champs
  const validateField = (fieldName: string, value: string): string | undefined => {
    switch (fieldName) {
      case 'email':
        if (!value.trim()) return "L'email est requis";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return "Format d'email invalide";
        return undefined;
      
      case 'password':
        if (!value) return "Le mot de passe est requis";
        if (value.length < 1) return "Le mot de passe est requis";
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
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }

    // Valider le champ
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Gestion des événements de blur
  const handleBlur = (fieldName: string) => {
    const value = fieldName === 'email' ? email : password;
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation complète avant soumission
    const allErrors: FieldErrors = {};
    allErrors.email = validateField('email', email);
    allErrors.password = validateField('password', password);

    setErrors(allErrors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(allErrors).some(error => error !== undefined);
    if (hasErrors) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs correctement",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Messages d'erreur plus clairs pour l'utilisateur
        let errorMessage = "Une erreur est survenue lors de la connexion";
        
        // Gérer les erreurs spécifiques de NextAuth
        if (result.error === "CredentialsSignin") {
          errorMessage = "Les identifiants sont incorrects";
        } else if (result.error.includes("email") || result.error.includes("password")) {
          errorMessage = "Les identifiants sont incorrects";
        } else if (result.error.includes("network") || result.error.includes("fetch")) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet";
        }
        
        toast({
          title: "Connexion échouée",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue ! Vous êtes maintenant connecté",
        });
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter pour le moment. Veuillez réessayer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    return email.trim() && 
           password && 
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
        <main aria-label="Connexion à la plateforme">
          <div className="mx-auto max-w-[400px]">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
                <CardDescription className="text-center">
                  Entrez vos identifiants pour accéder à votre compte
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemple@email.com"
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !isFormValid()}
                  >
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Pas encore de compte ?{" "}
                    <Link href="/auth/register" className="text-primary hover:underline">
                      S'inscrire
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