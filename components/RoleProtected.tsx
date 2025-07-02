"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/use-session";

type RoleProtectedProps = {
  allowedRoles: string[];
  children: ReactNode;
};

export default function RoleProtected({ allowedRoles, children }: RoleProtectedProps) {
  const { session, isLoading } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Attendre que le chargement de la session soit terminé avant de décider de rediriger
    if (!isLoading) {
      if (pathname !== '/auth/login' && !session) {
        // Non connecté, rediriger vers login
        router.push("/auth/login");
        return;
      }
      if (pathname !== '/auth/login' && session && !allowedRoles.includes(session.user.role)) {
        // Connecté mais rôle non autorisé, rediriger vers page non autorisée ou accueil
        router.push("/");
      }
    }
  }, [session, isLoading, allowedRoles, router, pathname]);

  // Afficher un indicateur de chargement pendant le chargement de la session
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
      <span className="sr-only">Chargement...</span>
    </div>;
  }

  // Si non connecté ou rôle non autorisé, ne rien afficher
  if (!session || !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return <>{children}</>;
}
