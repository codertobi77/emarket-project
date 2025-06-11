import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-5">
            <div className="flex items-center">
              <div className="relative">
                <ShoppingBag className="h-7 w-7 mr-3 text-primary" />
                <div className="absolute -inset-1.5 rounded-full bg-primary/5 -z-10"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">MarketBenin</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              La plateforme de gestion des marchés du Bénin, connectant acheteurs et vendeurs dans un écosystème numérique innovant et sécurisé.
            </p>
          </div>
          
          <div className="space-y-5">
            <h3 className="font-medium text-lg bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">Liens rapides</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/marketplace" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Parcourir les produits
                </Link>
              </li>
              <li>
                <Link href="/markets" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Marchés
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Vendeurs
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-5">
            <h3 className="font-medium text-lg bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">Information</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-5">
            <h3 className="font-medium text-lg bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">Légal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-foreground/70 hover:text-primary transition-all duration-200 flex items-center group">
                  <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Politique de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/20 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60 font-medium">
            © {new Date().getFullYear()} <span className="text-primary">MarketBenin</span>. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-6 md:mt-0">
            <Link href="#" className="group">
              <span className="sr-only">Facebook</span>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors duration-200">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <div className="absolute -inset-2 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            </Link>
            <Link href="#" className="group">
              <span className="sr-only">Twitter</span>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors duration-200">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <div className="absolute -inset-2 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            </Link>
            <Link href="#" className="group">
              <span className="sr-only">Instagram</span>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors duration-200">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <div className="absolute -inset-2 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}