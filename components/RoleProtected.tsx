"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";

type RoleProtectedProps = {
  allowedRoles: string[];
  children: ReactNode;
};

export default function RoleProtected({ allowedRoles, children }: RoleProtectedProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      setIsUserLoaded(true);
    }
    if (pathname !== '/auth/login' && !user) {
      // Not logged in, redirect to login
      router.push("/auth/login");
      return;
    }
    if (pathname !== '/auth/login' && !allowedRoles.includes(user.role)) {
      // Logged in but role not allowed, redirect to unauthorized page or home
      router.push("/");
    }
  }, [user, allowedRoles, router, pathname]);

  if (!isUserLoaded) {
    return null; // Or a loading spinner
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
