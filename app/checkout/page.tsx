'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CartItem } from '@/types';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, ArrowLeft, CreditCard, MapPin } from 'lucide-react';

export default function CheckoutPage() {
  const [address, setAddress] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login');
      return;
    }

    if (status === "authenticated") {
      const cartKey = `${session?.user?.id || 'nobody'}-cart`;
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCart(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (error) {
          console.error('Error parsing cart:', error);
          setCart([]);
        }
      }
      setLoading(false);
    }
  }, [status, session?.user?.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast({
        title: "Adresse requise",
        description: "Veuillez entrer une adresse de livraison",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          address,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la commande');
      }

      // Vider le panier
      const cartKey = `${session?.user?.id}-cart`;
      localStorage.removeItem(cartKey);
      
      toast({
        title: "Commande confirmée",
        description: "Votre commande a été enregistrée avec succès",
      });

      router.push('/account/orders');
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la commande",
        variant: "destructive"
      });
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 2000; // Frais de livraison fixes
  const total = subtotal + shipping;

  if (loading || status === "loading") {
    return <div>Chargement...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center py-16">
            <div className="mb-6 text-muted-foreground/50 bg-background/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-border/40">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Votre panier est vide</h3>
            <p className="text-muted-foreground mb-8">
              Ajoutez des produits à votre panier pour passer commande
            </p>
            <Button onClick={() => router.push('/marketplace')}>
              Continuer vos achats
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Formulaire d'adresse */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Adresse de livraison</CardTitle>
                  <CardDescription>
                    Entrez l'adresse où vous souhaitez recevoir votre commande
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse complète</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Votre adresse de livraison"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">
                      Confirmer la commande
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>

            {/* Résumé de la commande */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                          <img
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.price.toLocaleString()} FCFA × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {(item.price * item.quantity).toLocaleString()} FCFA
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frais de livraison</span>
                      <span>{shipping.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{total.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 