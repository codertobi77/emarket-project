'use client'

import { verifyToken } from '@/lib/auth';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  session?: string;
  isCertified?: boolean;
  location?: string | null;
  createdAt?: string;
  updatedAt?: string;
} | null;

export type UserContextType = {
  user: User;
  loading: boolean;
  setUser: (user: User) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Utiliser des hooks standards pour l'état local
  const [user, setUserState] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Utiliser notre hook personnalisé pour la persistance
  const [storedUser, setStoredUser] = useLocalStorage<User>('user', null);

  // Effet pour initialiser l'utilisateur à partir du localStorage
  useEffect(() => {
    if (storedUser) {
      try {
        // Côté client, on fait confiance au token stocké dans localStorage
        // La vérification se fera par les API routes lors des requêtes authentifiées
        console.log('Utilisateur chargé depuis localStorage:', storedUser);
        setUserState(storedUser);
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        setStoredUser(null);
      }
    }
    // Indiquer que le chargement est terminé
    setLoading(false);
  }, [storedUser, setStoredUser]);

  // Fonction de mise à jour de l'utilisateur
  const setUser = (newUser: User | null) => {
    if (newUser) {
      // Nous faisons confiance aux données utilisateur fournies
      // La validation du token se fait au niveau des API routes
      console.log('Mise à jour utilisateur:', newUser);
      setUserState(newUser);
      setStoredUser(newUser);
    } else {
      // Déconnexion
      console.log('Déconnexion utilisateur');
      setUserState(null);
      setStoredUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
