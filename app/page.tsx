'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowRight, Store, ShieldCheck, Users, ShoppingCart } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { Market } from "@/types";


export default function Home() {
  const { user } = useUser();
  const [markets, setMarkets] = useState<Market[]>([]);

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
    <div className="flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Fond avec effet de superposition dégradé */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 z-10"></div>
          
          {/* Image de fond avec effet parallaxe */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full" style={{
              height: "100vh",
              backgroundImage: "url('/assets/hero.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed"
            }}></div>
          </div>
          
          {/* Contenu */}
          <div className="container relative z-20 px-4 md:px-6 py-20 md:py-32 min-h-[90vh] flex items-center">
            <div className="max-w-3xl">
              <div className="p-6 md:p-8 backdrop-blur-sm bg-background/60 rounded-2xl shadow-2xl border border-primary/20">
                {(!user?.role || ['BUYER', 'SELLER', 'MANAGER', 'ADMIN'].includes(user.role)) && (
                  <>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Plateforme</span> de gestion des marchés du Bénin
                    </h1>
                    <p className="text-lg md:text-xl mb-8 leading-relaxed">
                      Connectez-vous avec les marchés locaux, découvrez des produits authentiques, 
                      et participez à l'économie numérique du Bénin.
                    </p>
                  </>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  {(!user?.role || user?.role === 'BUYER') && (
                    <Link href="/marketplace">
                      <Button size="lg" className="w-full sm:w-auto group transition-all duration-300 shadow-lg hover:shadow-primary/30">
                        Explorer les produits
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  )}
                  {(!user?.role || user?.role === 'SELLER') && (
                    <Link href="/auth/register">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
                        Créer un compte
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Vague décorative en bas */}
          <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 z-10 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto">
              <path fill="currentColor" fillOpacity="1" className="text-background" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,160C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative overflow-hidden">
          {/* Éléments décoratifs en arrière-plan */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] rounded-full bg-primary"></div>
            <div className="absolute -bottom-[400px] -left-[400px] w-[800px] h-[800px] rounded-full bg-blue-500"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block">
                <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">Fonctionnalités</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Notre plateforme <span className="text-primary">innovante</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-[700px] mx-auto">
                Une solution complète et intuitive pour tous les acteurs des marchés du Bénin
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              {/* Acheteurs */}
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="bg-gradient-to-br from-background to-background/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-primary/5 h-full relative overflow-hidden">
                  {/* Effet brillant au survol */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-500 rounded-full opacity-30 blur-xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="bg-gradient-to-br from-primary to-blue-500 p-4 rounded-2xl inline-flex">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">Pour les acheteurs</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Découvrez des produits authentiques, comparez les prix et achetez en toute simplicité depuis n'importe où.
                  </p>
                </div>
              </div>
              
              {/* Vendeurs */}
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="bg-gradient-to-br from-background to-background/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-primary/5 h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full opacity-30 blur-xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-4 rounded-2xl inline-flex">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-blue-500 transition-colors">Pour les vendeurs</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Étendez votre portée, gérez vos produits et suivez vos ventes en temps réel avec des outils puissants.
                  </p>
                </div>
              </div>
              
              {/* Gestionnaires */}
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="bg-gradient-to-br from-background to-background/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-primary/5 h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full opacity-30 blur-xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-2xl inline-flex">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-indigo-500 transition-colors">Pour les gestionnaires</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Supervisez les activités du marché, générez des rapports détaillés et optimisez les opérations quotidiennes.
                  </p>
                </div>
              </div>
              
              {/* Administrateurs */}
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="bg-gradient-to-br from-background to-background/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-primary/5 h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-30 blur-xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl inline-flex">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-purple-500 transition-colors">Pour les administrateurs</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Contrôlez l'ensemble du système, gérez les utilisateurs et assurez la sécurité de la plateforme avec des outils avancés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Markets Showcase */}
        <section className="py-24 relative overflow-hidden">
          {/* Fond avec motif en grille */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block">
                <span className="inline-block px-4 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-3">Exploration</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="relative inline-block">
                  Découvrez nos marchés
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full"></span>
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-[700px] mx-auto">
                Explorez les principaux marchés du Bénin et découvrez leurs produits uniques et authentiques
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {markets.slice(0, 3).map((market) => (
                <div key={market.id} className="group relative h-[400px] overflow-hidden rounded-2xl shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 opacity-60 z-10 transition-opacity duration-300 group-hover:opacity-70"></div>
                  
                  {/* Image avec effet de zoom au survol */}
                  <img 
                    src={
                      market.image
                        ? market.image.startsWith('/markets-img/')
                          ? `/assets${market.image}`
                          : market.image.includes('public/assets/')
                            ? `/${market.image.split('public/')[1]}`
                            : market.image.includes('assets/')
                              ? `/${market.image}`
                              : `/assets/markets-img/${market.image.split('/').pop()}`
                        : "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"
                    } 
                    alt={market.name} 
                    className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                    }}
                  />
                  
                  {/* Badge de localisation */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/10">
                    {market.location}
                  </div>
                  
                  {/* Contenu au survol avec animation */}
                  <div className="absolute inset-x-0 bottom-0 z-20 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-2xl font-bold mb-3 drop-shadow-md">{market.name}</h3>
                    
                    <div className="transform opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                      <p className="text-white/90 mb-4 line-clamp-2 text-sm">
                        {market.description || "Découvrez les produits uniques de ce marché local au Bénin."}
                      </p>
                      
                      <Link href={`/markets/${market.id}`} className="inline-block">
                        <Button className="bg-white text-primary hover:bg-white/90 transition-all duration-300 shadow-lg">
                          Voir les produits
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-12">
              <Link href="/markets">
                <Button variant="outline" size="lg" className="group border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                  <span>Voir tous les marchés</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden">
          {/* Arrière-plan avec dégradé et forme */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 z-0">
            <div className="absolute -top-[400px] -right-[400px] w-[800px] h-[800px] rounded-full bg-white opacity-5"></div>
            <div className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-white opacity-5"></div>
          </div>
          
          {/* Motif de points */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}></div>
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-[800px] mx-auto backdrop-blur-sm bg-white/10 p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl">
              <div className="text-center text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Prêt à rejoindre notre <span className="relative inline-block">plateforme
                    <span className="absolute -bottom-1 left-0 right-0 h-1 bg-white rounded-full"></span>
                  </span>?
                </h2>
                <p className="text-lg md:text-xl mb-10 text-white/90">
                  Créez votre compte dès aujourd'hui et profitez de tous les avantages de notre solution digitale innovante pour les marchés du Bénin.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 hover:shadow-lg transition-all duration-300 font-semibold text-base py-6 px-8">
                      Créer un compte
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/20 transition-all duration-300 font-semibold text-base py-6 px-8">
                      Nous contacter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}