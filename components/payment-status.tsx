'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { PaymentStatus } from '@prisma/client';

interface PaymentStatusProps {
  transactionId: string;
  initialStatus: PaymentStatus;
  onStatusChange?: (status: PaymentStatus) => void;
}

export function PaymentStatusComponent({ 
  transactionId, 
  initialStatus, 
  onStatusChange 
}: PaymentStatusProps) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [isChecking, setIsChecking] = useState(false);

  const checkPaymentStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`/api/payments/webhook?transactionId=${transactionId}`);
      const data = await response.json();

      if (response.ok && data.payment) {
        const newStatus = data.payment.status;
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        
        if (newStatus === 'APPROVED') {
          toast({
            title: "Paiement confirmé",
            description: "Votre paiement a été confirmé avec succès !",
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le statut du paiement",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
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

  const getStatusIcon = (status: PaymentStatus) => {
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

  const getStatusText = (status: PaymentStatus) => {
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

  // Vérifier automatiquement le statut toutes les 30 secondes si en attente
  useEffect(() => {
    if (status === 'PENDING') {
      const interval = setInterval(checkPaymentStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [status, transactionId]);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusColor(status)} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {getStatusText(status)}
      </Badge>
      
      {status === 'PENDING' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={checkPaymentStatus}
          disabled={isChecking}
          className="h-6 w-6 p-0"
        >
          {isChecking ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
} 