'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function LogoutPage() {
    const router = useRouter();
    const { setUser } = useUser();
    useEffect(() => {
        logout();
      }, [router]);
    const logout = async () => {

      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
            setUser(null);
          router.push("/auth/login");
        } else {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        // Handle error, e.g., display a notification to the user
        const { toast } = useToast();
        toast({
            title: "Logout error",
            description: error as ReactNode,
            variant: "destructive",
        });
      }
    };

    return null;
//   (
//     <Dialog open={true}>
//       <DialogContent className="space-y-6 px-6 py-4 sm:px-8 sm:py-6">
//         <DialogTitle className="text-2xl font-bold">
//           Confirm logout
//         </DialogTitle>
//         <DialogDescription>
//           Are you sure you want to logout?
//         </DialogDescription>
//         <DialogFooter className="flex justify-end space-x-2">
//           <Button
//             variant="destructive"
//             onClick={logout}
//           >
//             Logout
//           </Button>
//           {/* <Button variant="outline" onClick={}>
//             Cancel
//           </Button> */}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
}
