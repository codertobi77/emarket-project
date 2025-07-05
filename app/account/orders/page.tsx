'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { Order, OrderStatus, PaymentStatus } from '@prisma/client';
import { Package, ArrowLeft, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { FedaPayButton } from '@/components/fedapay-button';

interface OrderWithItems extends Order {
  items: any[];
  payments: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
      setFetchError("Impossible de charger les commandes. Veuillez réessayer plus tard.");
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

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'FAILED':
        return 'destructive';
      case 'CANCELLED':
        return 'destructive';
      case 'REFUNDED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-3 w-3" />;
      case 'APPROVED':
        return <CheckCircle className="h-3 w-3" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Payée';
      case 'FAILED':
        return 'Échoué';
      case 'CANCELLED':
        return 'Annulé';
      case 'REFUNDED':
        return 'Remboursé';
      default:
        return status;
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12" aria-label="Mes commandes">
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

          {fetchError && (
            <div className="text-center py-8">
              <div className="mb-4 text-red-600">{fetchError}</div>
            </div>
          )}
          {!fetchError && (orders.length === 0 ? (
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
          ) :
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      Commande #{order.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPaymentStatusColor(order.paymentStatus)} className="flex items-center gap-1">
                        {getPaymentStatusIcon(order.paymentStatus)}
                        {getPaymentStatusText(order.paymentStatus)}
                      </Badge>
                      <Badge variant={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
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
                          {Number(order.totalAmount).toLocaleString()} FCFA
                        </span>
                      </div>
                      {order.address && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Adresse</span>
                          <span className="text-right max-w-xs truncate">{order.address}</span>
                        </div>
                      )}
                      {order.items && order.items.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Produits commandés :</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{item.product?.name || 'Produit'} × {item.quantity}</span>
                                <span>{Number(item.unitPrice).toLocaleString()} FCFA</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Bouton de paiement pour les commandes en attente */}
                      {order.paymentStatus === 'PENDING' && (
                        <div className="border-t pt-4">
                          <FedaPayButton
                            orderId={order.id}
                            amount={Number(order.totalAmount)}
                            className="w-full"
                            returnUrl={`${window.location.origin}/account/orders`}
                          >
                            Payer maintenant
                          </FedaPayButton>
                        </div>
                      )}
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