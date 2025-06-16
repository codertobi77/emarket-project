'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { Order, OrderStatus } from '@prisma/client';
import { Package, ArrowLeft } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login');
      return;
    }

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'CONFIRMED':
        return 'info';
      case 'SHIPPED':
        return 'warning';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading || status === "loading") {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <h1 className="text-2xl font-bold mb-8">Mes Commandes</h1>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6 text-muted-foreground/50 bg-background/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-border/40">
                <Package className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Aucune commande</h3>
              <p className="text-muted-foreground mb-8">
                Vous n'avez pas encore passé de commande
              </p>
              <Button onClick={() => router.push('/marketplace')}>
                Découvrir les produits
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      Commande #{order.id.slice(0, 8)}
                    </CardTitle>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium">
                          {order.totalAmount.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 