'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        signOut({ 
            callbackUrl: "/auth/login",
            redirect: true 
        });
    }, [router]);

    return (
      <main aria-label="Déconnexion" className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </div>
          <p className="text-lg text-muted-foreground">Déconnexion en cours...</p>
        </div>
      </main>
    );
}
