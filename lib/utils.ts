import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

  // Fonction utilitaire pour normaliser les chemins d'images
export const getNormalizedImagePath = (imagePath: string) => {
  if (!imagePath) return "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";

  // Debug log
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[normalize] Entrée:', imagePath);
  }

  let normalized = imagePath;

  // Si déjà une URL externe, retourne tel quel
  if (/^https?:\/\//.test(imagePath)) return imagePath;

  // Gestion profils utilisateurs
  if (imagePath.includes('users-img')) {
    if (imagePath.includes('public/assets/users-img/')) {
      normalized = '/assets/users-img/' + imagePath.split('public/assets/users-img/')[1];
    } else if (imagePath.startsWith('/assets/users-img/')) {
      normalized = imagePath;
    } else if (imagePath.startsWith('assets/users-img/')) {
      normalized = '/' + imagePath;
    } else if (imagePath.startsWith('/users-img/')) {
      normalized = '/assets' + imagePath;
    } else if (imagePath.startsWith('users-img/')) {
      normalized = '/assets/' + imagePath;
    }
    // fallback: si jamais rien n'a matché
    if (!normalized.startsWith('/assets/users-img/')) {
      normalized = '/assets/users-img/' + imagePath.split('/').pop();
    }
  }
  // Gestion produits
  else if (imagePath.includes('products-img')) {
    if (imagePath.includes('public/assets/products-img/')) {
      normalized = '/assets/products-img/' + imagePath.split('public/assets/products-img/')[1];
    } else if (imagePath.startsWith('/assets/products-img/')) {
      normalized = imagePath;
    } else if (imagePath.startsWith('assets/products-img/')) {
      normalized = '/' + imagePath;
    } else if (imagePath.startsWith('/products-img/')) {
      normalized = '/assets' + imagePath;
    } else if (imagePath.startsWith('products-img/')) {
      normalized = '/assets/' + imagePath;
    }
    if (!normalized.startsWith('/assets/products-img/')) {
      normalized = '/assets/products-img/' + imagePath.split('/').pop();
    }
  }
  // Gestion marchés
  else if (imagePath.includes('markets-img')) {
    if (imagePath.includes('public/assets/markets-img/')) {
      normalized = '/assets/markets-img/' + imagePath.split('public/assets/markets-img/')[1];
    } else if (imagePath.startsWith('/assets/markets-img/')) {
      normalized = imagePath;
    } else if (imagePath.startsWith('assets/markets-img/')) {
      normalized = '/' + imagePath;
    } else if (imagePath.startsWith('/markets-img/')) {
      normalized = '/assets' + imagePath;
    } else if (imagePath.startsWith('markets-img/')) {
      normalized = '/assets/' + imagePath;
    }
    if (!normalized.startsWith('/assets/markets-img/')) {
      normalized = '/assets/markets-img/' + imagePath.split('/').pop();
    }
  }
  // Fallback générique (autre dossier ou format inconnu)
  else if (imagePath.includes('public/assets/')) {
    normalized = '/' + imagePath.split('public/')[1];
  } else if (imagePath.includes('assets/')) {
    normalized = '/' + imagePath.split('assets/')[1];
    normalized = '/assets/' + normalized;
  } else if (imagePath.startsWith('/')) {
    normalized = '/assets' + imagePath;
  } else {
    normalized = '/assets/' + imagePath;
  }

  // Correction : jamais de double slash ni d'oubli du slash initial
  normalized = normalized.replace(/\/+/g, '/');
  if (!normalized.startsWith('/assets/')) {
    normalized = '/assets/' + normalized.replace(/^\/*/, '');
  }

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[normalize] Sortie:', normalized);
  }

  return normalized;
};

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (res.ok) {
    const data = await res.json();
    return data.path;
  }
  return null;
}
