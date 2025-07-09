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
import { getNormalizedImagePath } from "@/lib/utils";

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/markets");
      if (!response.ok) throw new Error("Erreur lors du chargement des marchés");
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      setFetchError("Impossible de charger les marchés. Veuillez réessayer plus tard.");
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
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/80 via-emerald-400/40 to-yellow-300/30 py-16 md:py-24">
        {/* Formes décoratives améliorées */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-300/20 rounded-full filter blur-2xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>

        <div className="container relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm text-primary font-medium mb-6 animate-fade-in">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7V6a3 3 0 013-3h12a3 3 0 013 3v1M3 7h18M3 7v11a3 3 0 003 3h12a3 3 0 003-3V7M3 7l9 6 9-6" /></svg>
              Découvrez nos marchés locaux
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-primary via-emerald-400 to-yellow-300 bg-clip-text text-transparent animate-slide-up">
              <span>Marchés</span> du Bénin
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-10 leading-relaxed max-w-xl drop-shadow-md animate-fade-in">
              Explorez les marchés locaux du Bénin et découvrez leurs produits authentiques et artisanaux.
            </p>
          </div>
        </div>

        {/* Vague décorative animée */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto animate-wave">
            <path fill="currentColor" fillOpacity="1" className="text-background" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,160C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <main className="container py-12 md:py-16 relative z-20">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : fetchError ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            {fetchError}
          </div>
        ) : markets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground py-12">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-primary mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7V6a3 3 0 013-3h12a3 3 0 013 3v1M3 7h18M3 7v11a3 3 0 003 3h12a3 3 0 003-3V7M3 7l9 6 9-6" /></svg>
            <span>Aucun marché trouvé</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {markets.map(market => (
              <div key={market.id} className="group bg-muted dark:bg-background/90 border border-border rounded-xl shadow-lg hover:shadow-2xl transition p-4 flex flex-col items-center animate-fade-in">
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 bg-muted">
                  <img src={getNormalizedImagePath(market.image || '') || '/assets/markets-img/default-market.jpg'} alt={market.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1 text-center w-full animate-slide-up">{market.name}</h2>
                <span className="inline-block bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-medium mb-2">{market.location}</span>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{market.description}</p>
                <a href={`/markets/${market.id}`} className="mt-auto inline-block bg-primary text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-primary/90 transition">Découvrir</a>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
