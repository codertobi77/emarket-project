'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowRight, Store, ShieldCheck, Users, ShoppingCart } from "lucide-react";
import { useSession } from "@/lib/use-session";
import { useEffect, useState } from "react";
import { Market } from "@/types";
import { getNormalizedImagePath } from "@/lib/utils";

export default function Home() {
  const { session, isLoading } = useSession();
  const user = session?.user;
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    setIsLoadingMarkets(true);
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
      setIsLoadingMarkets(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1" id="main-content">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background" aria-label="Section d'introduction">
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
          
          {/* Background image with parallax effect */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full" style={{
              height: "100vh",
              backgroundImage: "url('/assets/hero.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed"
            }}></div>
          </div>
          
          {/* Hero Content */}
          <div className="container relative z-20 px-4 md:px-6 py-20 md:py-32 min-h-[90vh] flex items-center justify-center">
            <div className="max-w-3xl">
              <div className="mx-auto max-w-3xl p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] bg-transparent backdrop-blur-sm">
                {(!user?.role || ['BUYER', 'SELLER', 'MANAGER', 'ADMIN'].includes(user?.role)) && (
                  <>
                    <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                      Découvrez les marchés locaux du Bénin
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Plateforme</span> digitale des marchés du Bénin
                    </h1>
                    <p className="text-lg md:text-xl mb-8 leading-relaxed text-foreground/80">
                      Connectez-vous avec les marchés locaux, découvrez des produits authentiques, 
                      et participez à l'économie numérique du Bénin.
                    </p>
                  </>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  {(!user?.role || user?.role === 'BUYER') && (
                    <Link href="/marketplace">
                      <Button size="lg" className="w-full sm:w-auto group transition-all duration-300 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/30 rounded-xl">
                        Explorer les marchés
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  )}
                  {!user && (
                    <Link href="/auth/register">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary/20 hover:border-primary/50 transition-all duration-300 rounded-xl">
                        Créer un compte
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 z-10 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto">
              <path fill="currentColor" fillOpacity="1" className="text-background" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,160C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative overflow-hidden bg-muted/30" aria-label="Fonctionnalités de la plateforme">
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
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block mb-3">
                <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">Fonctionnalités</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Notre plateforme <span className="relative inline-block text-primary">
                  innovante
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/30 rounded-full"></span>
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-[800px] mx-auto">
                Une solution complète et intuitive pour tous les acteurs des marchés du Bénin
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {/* Buyers */}
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-border h-full relative overflow-hidden">
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full opacity-30 blur-xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-2xl inline-flex">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">Pour les acheteurs</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Découvrez des produits authentiques, comparez les prix et achetez en toute simplicité depuis n'importe où.
                  </p>
                </div>
              </div>
              
              {/* Sellers */}
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-border h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-secondary/0 via-secondary/10 to-secondary/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/70 rounded-full opacity-30 blur-xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="bg-gradient-to-br from-secondary to-secondary/70 p-4 rounded-2xl inline-flex">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-secondary transition-colors">Pour les vendeurs</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Étendez votre portée, gérez vos produits et suivez vos ventes en temps réel avec des outils puissants.
                  </p>
                </div>
              </div>
              
              {/* Managers */}
              {/* <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-border h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/70 rounded-full opacity-30 blur-xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="bg-gradient-to-br from-accent to-accent/70 p-4 rounded-2xl inline-flex">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-accent transition-colors">Pour les gestionnaires</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Supervisez les activités du marché, générez des rapports détaillés et optimisez les opérations quotidiennes.
                  </p>
                </div>
              </div> */}
              
              {/* Administrators */}
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-border h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-chart-3/0 via-chart-3/10 to-chart-3/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/70 rounded-full opacity-30 blur-xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="bg-gradient-to-br from-accent to-accent/70 p-4 rounded-2xl inline-flex">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-chart-3 transition-colors">Pour les administrateurs</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Contrôlez l'ensemble du système, gérez les utilisateurs et assurez la sécurité de la plateforme avec des outils avancés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Markets Showcase */}
        <section className="py-24 relative overflow-hidden" aria-label="Marchés en vedette">
          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block mb-3">
                <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">Exploration</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="relative inline-block">
                  Découvrez nos marchés
                  <span className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full"></span>
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-[800px] mx-auto">
                Explorez les principaux marchés du Bénin et découvrez leurs produits uniques et authentiques
              </p>
            </div>
            
            {fetchError && (
              <div className="flex justify-center items-center py-10">
                <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow border border-red-200 text-center">
                  {fetchError}
                </div>
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {markets.slice(0, 3).map((market) => (
                    <div key={market.id} className="group relative h-[400px] overflow-hidden rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-border/50">
                      {/* Glassmorphism overlay with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/10 to-foreground/80 opacity-60 z-10 transition-opacity duration-300 group-hover:opacity-80"></div>
                      
                      {/* Image with zoom effect on hover */}
                      <img 
                        src={getNormalizedImagePath(market.image as string)} 
                        alt={market.name ? `Photo du marché ${market.name}` : "Photo de marché local"}
                        className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
                        }}
                      />
                      
                      {/* Location badge with modern style */}
                      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-foreground/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20 shadow-lg">
                        {market.location}
                      </div>
                      
                      {/* Content with hover animation */}
                      <div className="absolute inset-x-0 bottom-0 z-20 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white text-2xl font-bold mb-3 drop-shadow-md">{market.name}</h3>
                        
                        <div className="transform opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                          <p className="text-white/90 mb-4 line-clamp-2 text-sm">
                            {market.description || "Découvrez les produits uniques de ce marché local au Bénin."}
                          </p>
                          
                          <Link href={`/markets/${market.id}`} className="inline-block">
                            <Button className="bg-white text-primary hover:bg-white/90 transition-all duration-300 shadow-lg rounded-xl">
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
                    <Button variant="outline" size="lg" className="group border-primary/20 hover:border-primary hover:bg-primary/5 text-primary hover:text-primary/90 transition-all duration-300 rounded-xl">
                      <span>Voir tous les marchés</span>
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA Section with modern design */}
        {(!user) && <section className="relative py-24 overflow-hidden">
          {/* Background with gradient and shapes */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent z-0">
            <div className="absolute -top-[400px] -right-[400px] w-[800px] h-[800px] rounded-full bg-white opacity-5"></div>
            <div className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-white opacity-5"></div>
          </div>
          
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}></div>
          </div>
          
          {/* Abstract geometric shapes for visual interest */}
          <div className="absolute top-20 right-20 w-40 h-40 rounded-3xl bg-white opacity-5 rotate-12 hidden lg:block"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-white opacity-5 hidden lg:block"></div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-[900px] mx-auto backdrop-blur-sm bg-white/10 p-10 md:p-14 rounded-[2.5rem] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <div className="text-center text-white">
                <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
                  Rejoignez notre communauté
                </div>
                
                <h2 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                  Prêt à rejoindre notre <span className="relative inline-block">
                    plateforme
                    <svg className="absolute -bottom-4 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5.5C47.6667 1.16667 154.4 -5.9 199 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>?
                </h2>
                
                <p className="text-lg md:text-xl mb-10 text-white/90 max-w-[700px] mx-auto">
                  Créez votre compte dès aujourd'hui et profitez de tous les avantages de notre solution digitale innovante pour les marchés du Bénin.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 hover:shadow-xl transition-all duration-300 font-semibold text-base py-6 px-8 rounded-xl group">
                      Créer un compte
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/20 transition-all duration-300 font-semibold text-base py-6 px-8 rounded-xl">
                      Nous contacter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>}
      </main>
      <Footer />
    </div>
  );
}
