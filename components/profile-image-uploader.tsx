'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileImageUploaderProps {
  currentImage?: string | null;
  name: string;
  onImageUploaded: (imagePath: string) => void;
}

export function ProfileImageUploader({ currentImage, name, onImageUploaded }: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Préparer l'URL de l'image actuelle en respectant le format de chemins standardisé
  const getImageUrl = (image?: string | null): string => {
    if (!image) return '';
    
    // Appliquer la même logique de conversion des chemins d'images que dans le reste de l'application
    if (image.startsWith('/users-img/')) return `/assets${image}`;
    if (image.includes('public/assets/')) return `/${image.split('public/')[1]}`;
    if (image.includes('assets/')) return `/${image}`;
    return `/assets/users-img/${image.split('/').pop()}`;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Prévisualisation de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload de l'image
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'users-img');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const data = await response.json();
      
      // Utiliser le chemin standardisé pour l'image
      const imagePath = `public/assets/users-img/${data.filename}`;
      onImageUploaded(imagePath);
      
      toast({
        title: 'Image téléchargée avec succès',
        description: 'Votre image de profil a été mise à jour.',
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger l\'image. Veuillez réessayer.',
        variant: 'destructive',
      });
      // Réinitialiser la prévisualisation en cas d'erreur
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <Avatar className="h-28 w-28 border-4 border-primary/10 group-hover:opacity-80 transition-opacity cursor-pointer">
        <AvatarImage 
          src={imagePreview || getImageUrl(currentImage) || `https://ui-avatars.com/api/?name=${name}&background=random`} 
          alt={name}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
          {name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <Button 
        size="icon"
        variant="secondary" 
        className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={triggerFileInput}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
