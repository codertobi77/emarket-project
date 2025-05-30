'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Info } from 'lucide-react';

interface CertifiedSellerDialogProps {
  onStartProcess?: () => void;
}

export function CertifiedSellerDialog({ onStartProcess }: CertifiedSellerDialogProps) {
  const [open, setOpen] = useState(false);

  const handleStartProcess = () => {
    if (onStartProcess) {
      onStartProcess();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-medium">
          En savoir plus
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            <span>Devenez un Vendeur Certifié</span>
          </DialogTitle>
          <DialogDescription className="text-lg pt-2">
            Augmentez votre visibilité et inspirez confiance à vos clients.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          <p className="leading-relaxed">
            Les vendeurs certifiés bénéficient de nombreux avantages :
          </p>
          
          <ul className="space-y-2 list-disc pl-6">
            <li>Meilleur référencement dans les résultats de recherche</li>
            <li>Badge de certification affiché sur votre profil et vos produits</li>
            <li>Taux de commission réduits sur les ventes</li>
            <li>Support prioritaire et assistance dédiée</li>
            <li>Accès à des outils d'analyse de marché avancés</li>
          </ul>
          
          <div className="bg-muted p-4 rounded-lg mt-4">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              <span>Processus de certification</span>
            </h4>
            <p className="text-sm">
              Le processus comprend une vérification d'identité, l'examen de la qualité de vos produits, 
              et la confirmation de votre engagement à fournir un service client exceptionnel.
              La certification est généralement accordée sous 7 jours ouvrables après soumission de votre demande.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Pas maintenant
          </Button>
          <Button onClick={handleStartProcess}>
            Lancer ma certification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
