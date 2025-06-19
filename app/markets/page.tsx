"use client";

import { useState, useEffect } from "react";
import { Market } from "@/types";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, MapPin, User, ArrowRight, Building } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/markets");
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-[url('/assets/market-pattern.svg')] bg-repeat py-16 md:py-24">
        {/* Formes décoratives */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto md:mx-0">
            <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-6 backdrop-blur-md border border-white/20">
              Découvrez nos marchés locaux
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80">Marchés</span> du Bénin
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed max-w-xl">
              Explorez les marchés locaux du Bénin et découvrez leurs produits authentiques et artisanaux.
            </p>
          </div>
        </div>
        
        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto">
            <path fill="currentColor" fillOpacity="1" className="text-background" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,160C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      <main className="flex-1 container py-12 md:py-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Squelettes de chargement
            Array(8).fill(0).map((_, index) => (
              <Card key={index} className="flex flex-col h-full overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-square bg-muted animate-pulse"></div>
                <CardHeader className="p-4">
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            markets.map((market) => (
              <Link href={`/markets/${market.id}`} key={market.id}>
                <Card className="flex flex-col h-full overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-border/40">
                  <div className="aspect-square relative overflow-hidden">
                    {/* Overlay au survol */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-center pb-4">
                      <span className="text-white font-medium px-4 py-2 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 flex items-center">
                        Voir les produits <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                    <img
                      src={market.image
                        ? market.image.startsWith('/markets-img/') 
                          ? `/assets${market.image}` 
                          : market.image.includes('public/assets/') 
                            ? `/${market.image.split('public/')[1]}`
                            : market.image.includes('assets/') 
                              ? `/${market.image}` 
                              : `/assets/markets-img/${market.image.split('/').pop()}`
                        : "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"}
                      alt={market.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        console.error(`Erreur de chargement de l'image pour le marché ${market.name}:`, market.image);
                        e.currentTarget.src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                      }}
                    />
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {market.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 pt-2 space-y-3">
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {market.description}
                    </CardDescription>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 text-primary/70" />
                      <span>{market.location}</span>
                    </div>
                    {market.manager && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-1 text-primary/70" />
                        <span>Gérant: {market.manager.name}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {user?.role === "MANAGER" && market.managerId === user?.id ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        Vous gérez ce marché
                      </Badge>
                    ) : (
                      <Button variant="default" >
                        Voir les produits
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
