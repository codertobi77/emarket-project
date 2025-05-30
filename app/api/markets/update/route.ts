import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { JwtPayload } from "jsonwebtoken";

// Endpoint spécial pour la mise à jour qui utilise POST au lieu de PUT
// Cette approche contourne les problèmes potentiels avec les requêtes PUT
export async function POST(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { message: "L'identifiant du marché est obligatoire" },
      { status: 400 }
    );
  }

  try {
    const session = getSession(req) as JwtPayload;
    if (!session || !["MANAGER", "ADMIN"].includes(session.role)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer les données du formulaire
    const formData = await req.formData();
    const marketDataStr = formData.get('marketData') as string;
    
    if (!marketDataStr) {
      return NextResponse.json(
        { message: "Données du marché manquantes" },
        { status: 400 }
      );
    }

    // Parser les données JSON
    const marketData = JSON.parse(marketDataStr);
    const { name, location, description, managerId, image } = marketData;

    console.log("Données reçues pour mise à jour:", marketData);

    if (!name || !location || !description || !managerId) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (!["COTONOU", "BOHICON", "PORTO-NOVO"].includes(location)) {
      return NextResponse.json(
        { message: "Localisation invalide" },
        { status: 400 }
      );
    }

    // S'assurer que l'image est toujours définie
    const imageToUse = image || "public/assets/markets-img/default-market.jpg";
    console.log("Chemin d'image final utilisé pour la mise à jour:", imageToUse);
    
    const market = await prisma.market.update({
      where: { id },
      data: {
        name,
        location,
        description,
        managerId,
        image: imageToUse,
      },
    });

    console.log("Marché mis à jour avec succès:", market);

    // Rediriger vers la page admin après la mise à jour
    return NextResponse.redirect(new URL('/admin', req.url));
  } catch (error) {
    console.error("Error updating market:", error);
    
    // En cas d'erreur, rediriger vers la page admin avec un paramètre d'erreur
    return NextResponse.redirect(new URL('/admin?error=update_failed', req.url));
  }
}
