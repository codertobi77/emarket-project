'use client';

import { useState, useEffect } from 'react';

// Hook personnalisé pour gérer le localStorage de manière sécurisée dans Next.js
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // État pour stocker la valeur
  // Passe la fonction d'initialisation à useState pour que la logique ne s'exécute qu'une fois
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Récupérer la valeur depuis localStorage lors du montage du composant
  useEffect(() => {
    try {
      // S'assurer que le code s'exécute uniquement côté client
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        // Analyser le JSON stocké ou utiliser la valeur initiale
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Fonction pour mettre à jour la valeur dans localStorage
  const setValue = (value: T) => {
    try {
      // Permettre à la valeur d'être une fonction pour la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Sauvegarder dans l'état
      setStoredValue(valueToStore);
      
      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        if (valueToStore === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
