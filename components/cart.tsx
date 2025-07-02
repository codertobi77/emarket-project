"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/lib/use-session";
import { CartItem } from "@/types";

export function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { session, isLoading } = useSession();

  useEffect(() => {
    setIsClient(true);
    const cartKey = `${session?.user?.id || "nobody"}-cart`;
    const storedCart = localStorage.getItem(cartKey);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCart(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (error) {
        console.error('Error parsing cart:', error);
        setCart([]);
      }
    } else {
      setCart([]);
    }

    // Listen for cart updates from other components
    const handleStorageChange = () => {
      const updatedCart = localStorage.getItem(cartKey);
      if (updatedCart) {
        try {
          const parsedCart = JSON.parse(updatedCart);
          setCart(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (error) {
          console.error('Error parsing cart:', error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [session?.user?.id]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem(`${session?.user?.id}-cart`, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem(`${session?.user?.id}-cart`, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
    
    toast({
      title: "Produit retiré",
      description: "Le produit a été retiré de votre panier",
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isClient) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-14 w-14 rounded-full shadow-lg"
        size="icon"
        aria-label="Ouvrir le panier"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <Badge className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full p-0">
            {totalItems}
          </Badge>
        )}
      </Button>

      
      {isOpen && (
        <Card className="absolute bottom-full right-0 mb-4 w-80 overflow-hidden shadow-xl" role="dialog" aria-modal="true" aria-label="Panier">
          <CardHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Votre Panier</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <div className="max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <CardContent className="flex h-40 flex-col items-center justify-center p-4 text-center">
                <ShoppingCart className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Votre panier est vide</p>
              </CardContent>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.id} className="group relative p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <img
                          src={item.image || '/placeholder-product.jpg'}
                          alt={item.name ? `Photo du produit ${item.name}` : "Photo de produit local"}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString()} FCFA × {item.quantity}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
            <CardFooter className="border-t p-4">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sous-total</span>
                  <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    router.push('/checkout');
                    setIsOpen(false);
                  }}
                >
                  Passer la commande
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
