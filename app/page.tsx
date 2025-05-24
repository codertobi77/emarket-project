'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowRight, Store, ShieldCheck, Users, ShoppingCart } from "lucide-react";
import { useUser } from "@/hooks/useUser";


export default function Home() {
  const { user } = useUser();
  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24" style={{height: "90dvh", backgroundImage: "url('/assets/hero.jpg')", backgroundSize: "cover", backgroundRepeat: "no-repeat"}}>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                {(!user?.role || ['BUYER', 'SELLER', 'MANAGER', 'ADMIN'].includes(user.role)) && (
                  <>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                      Bienvenue sur la plateforme de gestion des marchés du Bénin
                    </h1>
                    <p className="text-muted-foreground md:text-xl">
                      Connectez-vous avec les marchés locaux, découvrez des produits authentiques, 
                      et participez à l'économie numérique du Bénin.
                    </p>
                  </>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  {(!user?.role || user?.role === 'BUYER') && (
                    <Link href="/marketplace">
                      <Button size="lg" className="w-full sm:w-auto">
                        Explorer les produits
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {(!user?.role || user?.role === 'SELLER') && (
                    <Link href="/auth/register">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Créer un compte
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Notre plateforme offre
              </h2>
              <p className="text-muted-foreground md:text-xl mt-4 max-w-[600px] mx-auto">
                Une solution complète pour tous les acteurs des marchés du Bénin
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pour les acheteurs</h3>
                <p className="text-muted-foreground">
                  Découvrez des produits authentiques, comparez les prix et achetez en toute simplicité.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pour les vendeurs</h3>
                <p className="text-muted-foreground">
                  Étendez votre portée, gérez vos produits et suivez vos ventes en temps réel.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pour les gestionnaires</h3>
                <p className="text-muted-foreground">
                  Supervisez les activités du marché, générez des rapports et optimisez les opérations.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pour les administrateurs</h3>
                <p className="text-muted-foreground">
                  Contrôlez l'ensemble du système, gérez les utilisateurs et assurez la sécurité de la plateforme.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Markets Showcase */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Découvrez nos marchés
              </h2>
              <p className="text-muted-foreground md:text-xl mt-4 max-w-[600px] mx-auto">
                Explorez les principaux marchés du Bénin et leurs produits uniques
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Market Item 1 */}
              <div className="group relative overflow-hidden rounded-xl">
                <img 
                  src="https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg" 
                  alt="Marché de Dantokpa" 
                  className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold">Marché de Dantokpa</h3>
                  <p className="text-white/80 text-sm">Cotonou</p>
                  <Link href="/markets/dantokpa">
                    <Button variant="outline" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                      Voir les produits
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Market Item 2 */}
              <div className="group relative overflow-hidden rounded-xl">
                <img 
                  src="https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg" 
                  alt="Marché de Ganhi" 
                  className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold">Marché de Ganhi</h3>
                  <p className="text-white/80 text-sm">Cotonou</p>
                  <Link href="/markets/ganhi">
                    <Button variant="outline" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                      Voir les produits
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Market Item 3 */}
              <div className="group relative overflow-hidden rounded-xl">
                <img 
                  src="https://images.pexels.com/photos/2977513/pexels-photo-2977513.jpeg" 
                  alt="Marché de Parakou" 
                  className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold">Marché de Parakou</h3>
                  <p className="text-white/80 text-sm">Parakou</p>
                  <Link href="/markets/parakou">
                    <Button variant="outline" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                      Voir les produits
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/markets">
                <Button variant="outline">
                  Voir tous les marchés
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Prêt à rejoindre notre plateforme?
              </h2>
              <p className="md:text-xl mb-8">
                Créez votre compte dès aujourd'hui et profitez de tous les avantages de notre plateforme.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    S'inscrire
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90">
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}