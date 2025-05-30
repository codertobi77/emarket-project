"use client";

import { useState, useEffect } from "react";
import { Market } from "@/types";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const { user } = useUser();

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await fetch("/api/markets");
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">Marchés</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {markets.map((market) => (
            <Card key={market.id} className="flex flex-col">
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
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
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                  onError={(e) => {
                    console.error(`Erreur de chargement de l'image pour le marché ${market.name}:`, market.image);
                    e.currentTarget.src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                  }}
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold">{market.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <CardDescription className="text-sm text-muted-foreground mb-2">
                  {market.description}
                </CardDescription>
                <CardDescription className="text-sm text-muted-foreground mb-2">
                  Localisation: {market.location}
                </CardDescription>
                {market.manager && (
                  <CardDescription className="text-sm text-muted-foreground mb-2">
                    Gérant: {market.manager.name}
                  </CardDescription>
                )}
                {user?.role === "MANAGER" && market.managerId === user?.id && (
                  <Button variant="default" className="mt-4">
                    Gérer le marché
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
