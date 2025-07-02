'use client';

import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getNormalizedImagePath } from '@/lib/utils';
import { processImage, validateImage } from '@/lib/image-utils';


interface ProfileImageUploaderProps {
  currentImage?: string | null;
  name: string;
  onImageUploaded: (imagePath: string) => void;
}

export function ProfileImageUploader({
  currentImage,
  name,
  onImageUploaded,
}: ProfileImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imageData = event.target?.result as string;
          
          // Valider le format de l'image
          if (!validateImage(imageData)) {
            throw new Error('Format d\'image invalide');
          }

          // Traiter l'image
          const processedImage = await processImage(imageData);

          // Créer un FormData pour l'envoi
          const formData = new FormData();
          // Utilise processedImage si c'est un Blob, sinon file
          formData.append('file', processedImage as any instanceof Blob ? processedImage : file);
          formData.append('folder', 'users-img');

          // Envoyer l'image au serveur
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Erreur lors du téléchargement de l\'image');
          }

          const data = await response.json();
          onImageUploaded(data.url);
          
          toast({
            title: "Succès",
            description: "Image de profil mise à jour avec succès",
          });
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Erreur lors du traitement de l\'image');
          toast({
            title: "Erreur",
            description: error instanceof Error ? error.message : 'Erreur lors du traitement de l\'image',
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier');
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du traitement de l\'image');
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative group">
      {/* <div className="relative w-32 h-32 rounded-full overflow-hidden">
        {currentImage ? (
          <img
            src={currentImage}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setError('Erreur de chargement de l\'image')}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
            {getInitials(name)}
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-red-100 bg-opacity-50 flex items-center justify-center">
            <p className="text-red-500 text-sm text-center p-2">{error}</p>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div> */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
        {/* Check if currentImage exists before displaying */}
        {currentImage ? (
          <Image
            src={getNormalizedImagePath(currentImage)}
            alt={name ? `Photo de profil de ${name}` : 'Photo de profil utilisateur'}
            width={112}
            height={112}
            className="h-28 w-28 rounded-full object-cover border-4 border-primary/10 group-hover:opacity-80 transition-opacity cursor-pointer"
            onError={(e) => {
              console.error('Erreur de chargement de l\'image:', e.currentTarget.src, 'Image originale:', currentImage);
              // Afficher une lettre à la place de l'image en cas d'erreur
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="h-28 w-28 rounded-full flex items-center justify-center bg-primary/10 text-primary text-2xl border-4 border-primary/10 group-hover:opacity-80 transition-opacity cursor-pointer">
            {name?.charAt(0) || 'U'}
          </div>
        )}      
      <Button 
        size="icon"
        variant="secondary" 
        className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        disabled={isLoading}
        aria-label="Changer la photo de profil"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
