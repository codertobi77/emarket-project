"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";

type RoleProtectedProps = {
  allowedRoles: string[];
  children: ReactNode;
};

export default function RoleProtected({ allowedRoles, children }: RoleProtectedProps) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Attendre que le chargement de l'utilisateur soit terminé avant de décider de rediriger
    if (!loading) {
      if (pathname !== '/auth/login' && !user) {
        // Non connecté, rediriger vers login
        router.push("/auth/login");
        return;
      }
      if (pathname !== '/auth/login' && user && !allowedRoles.includes(user.role)) {
        // Connecté mais rôle non autorisé, rediriger vers page non autorisée ou accueil
        router.push("/");
      }
    }
  }, [user, loading, allowedRoles, router, pathname]);

  // Afficher un indicateur de chargement pendant le chargement de l'utilisateur
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  // Si non connecté ou rôle non autorisé, ne rien afficher
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
