import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

  // Fonction utilitaire pour normaliser les chemins d'images
  export const getNormalizedImagePath = (imagePath: string) => {
    if (!imagePath) return "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
    
    if (imagePath.startsWith('/products-img/')) return `/assets${imagePath}`;
    if (imagePath.includes('public/assets/')) return `/${imagePath.split('public/')[1]}`;
    if (imagePath.includes('assets/')) return `/${imagePath}`;
    return `/assets/products-img/${imagePath.split('/').pop()}`;
  };
