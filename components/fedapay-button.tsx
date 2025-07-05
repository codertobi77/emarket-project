'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';

interface FedaPayButtonProps {
  orderId: string;
  amount: number;
  className?: string;
  children?: React.ReactNode;
  returnUrl?: string;
}

export function FedaPayButton({ 
  orderId, 
  amount, 
  className = "", 
  children,
  returnUrl 
}: FedaPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          returnUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      if (data.paymentUrl) {
        // Rediriger vers la page de paiement FedaPay
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast({
        title: "Erreur de paiement",
        description: error instanceof Error ? error.message : "Impossible d'initier le paiement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Traitement...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          {children || `Payer ${amount.toLocaleString()} FCFA`}
        </>
      )}
    </Button>
  );
} 