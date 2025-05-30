"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShoppingBag } from "lucide-react";
import { Market } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  role: z.enum(["BUYER", "SELLER", "MANAGER", "ADMIN"]),
  marketId: z.string().optional(),
  location: z.enum(["COTONOU", "BOHICON", "PORTO-NOVO"]).optional(),
}).refine((data) => {
  if (data.role === "SELLER") {
    return data.marketId !== undefined;
  }
  return true;
}, {
  message: "Veuillez choisir le marché dans lequel vous êtes si vous êtes un Vendeur",
  path: ["marketId"],
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "BUYER",
      marketId: "",
      location: undefined,
    },
  });

  useEffect(() => {
    async function fetchMarkets() {
      const response = await fetch("/api/markets");
      const data = await response.json();
      setMarkets(data);
    }
    fetchMarkets();
  }, []);



  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      // This would be replaced with an actual API call
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        router.push("/auth/login");
      } else {
        const data = await response.json();
        throw new Error(data.message || "Échec de l'inscription");
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md space-y-6 p-6 bg-card rounded-lg shadow-md">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Créer un compte</h1>
            <p className="text-muted-foreground">
              Inscrivez-vous pour accéder à la plateforme
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nom@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez votre localisation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COTONOU">Cotonou</SelectItem>
                            <SelectItem value="BOHICON">Bohicon</SelectItem>
                            <SelectItem value="PORTO-NOVO">Porto-Novo</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BUYER">Acheteur</SelectItem>
                        <SelectItem value="SELLER">Vendeur</SelectItem>
                        <SelectItem value="MANAGER">Gestionnaire de marché</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.getValues('role') === "SELLER" && (
                <FormField
                  control={form.control}
                  name="marketId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marché</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un marché" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {markets.map((market) => (
                              <SelectItem key={market.id} value={market.id}>
                                {market.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Vous avez déjà un compte?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}