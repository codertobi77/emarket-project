'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Info, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertifiedSellerDialogProps {
  onStartProcess?: () => void;
  isCertified?: boolean;
}

export function CertifiedSellerDialog({ onStartProcess, isCertified = false }: CertifiedSellerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStartProcess = async () => {
    try {
      setIsLoading(true);
      
      // Enregistrer la demande de certification côté serveur
      const response = await fetch('/api/users/certification', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la demande de certification');
      }
      
      // Rediriger vers le GUCE dans un nouvel onglet
      window.open('https://www.guce.bj/', '_blank');
      
      toast({
        title: 'Redirection vers le GUCE',
        description: 'Vous allez être redirigé vers le Guichet Unique de Création d\'Entreprise pour finaliser votre certification.',
      });
      
      if (onStartProcess) {
        onStartProcess();
      }
    } catch (error) {
      console.error('Erreur lors de la demande de certification:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de votre demande de certification. Veuillez réessayer plus tard.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-medium" disabled={isCertified}>
          {isCertified ? 'Certifié' : 'En savoir plus'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className={`h-6 w-6 ${isCertified ? 'text-green-500' : 'text-primary'}`} />
            <span>{isCertified ? 'Vendeur Certifié' : 'Devenez un Vendeur Certifié'}</span>
          </DialogTitle>
          <DialogDescription className="text-lg pt-2">
            {isCertified 
              ? 'Votre compte est certifié. Profitez de tous les avantages des vendeurs certifiés !'
              : 'Augmentez votre visibilité et inspirez confiance à vos clients.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-3 overflow-y-auto flex-1 pr-2">
          {!isCertified ? (
            <>
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
                <p className="text-sm mb-4">
                  Pour devenir un vendeur certifié, vous devez d'abord vous enregistrer sur le Guichet Unique de Création d'Entreprise (GUCE) du Bénin.
                  Cela vous permettra d'obtenir votre numéro d'identification fiscale et d'être conforme à la réglementation en vigueur.
                </p>
                <p className="text-sm">
                  Le processus comprend une vérification d'identité et la soumission des documents requis.
                  Une fois votre entreprise enregistrée, vous pourrez profiter de tous les avantages des vendeurs certifiés.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
                <p className="font-medium mb-2">✅ Votre compte est certifié</p>
                <p className="text-sm">
                  Félicitations ! Vous profitez désormais de tous les avantages des vendeurs certifiés.
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  <span>Vos avantages</span>
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Votre profil est marqué comme certifié</li>
                  <li>• Meilleure visibilité dans les résultats de recherche</li>
                  <li>• Taux de commission réduits</li>
                  <li>• Support prioritaire</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2 sm:gap-0">
          {!isCertified ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Pas maintenant
              </Button>
              <Button onClick={handleStartProcess} disabled={isLoading}>
                {isLoading ? 'Redirection...' : (
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Aller sur le GUCE
                  </span>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpen(false)}>
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
