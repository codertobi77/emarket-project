import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";
import { JwtPayload } from "jsonwebtoken";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = new URLSearchParams(req.nextUrl.search);

  const marketId = searchParams.get("marketId");
  const sellerId = searchParams.get("sellerId");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        location: true,
        market: true,
        marketSellers: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        ...(marketId && { marketSellers: { some: { marketId: marketId as string } } }),
        ...(sellerId && { marketSellers: { some: { sellerId: sellerId as string } } }),
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
        { message: "Erreur lors de la récupération des utilisateurs: "+error },
        { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSession(req) as JwtPayload;
  if (!session) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
  }

  try {
    const { id, name, email, role, image, password } = await req.json();
    
    // Déterminer l'ID de l'utilisateur à mettre à jour
    // Si un admin fournit un userId, utiliser celui-là, sinon utiliser l'ID de session
    const targetUserId = session.role === 'ADMIN' && id ? id : session.id;
    
    // Si un utilisateur non-admin tente de modifier un autre utilisateur
    if (targetUserId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ message: "Non autorisé à modifier cet utilisateur" }, { status: 403 });
    }

    // Préparer les données à mettre à jour (uniquement les champs fournis)
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      // Seul un admin peut changer les rôles
      if (session.role !== 'ADMIN') {
        return NextResponse.json({ message: "Seul un administrateur peut modifier les rôles" }, { status: 403 });
      }
      
      if (!['BUYER', 'SELLER', 'MANAGER', 'ADMIN'].includes(role)) {
        return NextResponse.json({ message: "Rôle invalide" }, { status: 400 });
      }
      updateData.role = role;
    }
    
    // Vérifier si le champ image est supporté dans le modèle User
    try {
      // Tentative de validation du modèle User
      const existingUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true }
      });
      
      if (existingUser && image !== undefined) {
        console.log("Mise à jour de l'image de profil - Chemin original:", image);
        
        // S'assurer que le chemin de l'image est au format standard attendu par l'application
        // Ce format est 'public/assets/users-img/filename.ext' pour être cohérent avec l'API d'upload
        let normalizedImagePath = image;
        
        // Si le chemin ne contient pas 'public/assets/' et n'est pas une URL externe, le normaliser
        if (!image.includes('public/assets/') && !image.startsWith('http')) {
          // Si c'est juste un nom de fichier ou un chemin relatif, le convertir au format standard
          const filename = image.split('/').pop() || image;
          normalizedImagePath = `public/assets/users-img/${filename}`;
          console.log("Chemin d'image normalisé:", normalizedImagePath);
        }
        
        updateData.image = normalizedImagePath;
      }
    } catch (error) {
      console.warn("Le champ 'image' n'est peut-être pas disponible dans le modèle User:", error);
    }
    
    if (password !== undefined && password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Vérifier si des données à mettre à jour ont été fournies
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Aucune donnée à mettre à jour fournie" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    // Ne pas retourner le mot de passe et la session dans la réponse
    const { password: _, session: __, ...userWithoutSensitiveInfo } = user;

    return NextResponse.json(userWithoutSensitiveInfo);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({
      message: "Erreur lors de la mise à jour de l'utilisateur: " + error,
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const searchParams = new URLSearchParams(req.nextUrl.search);
  const userId = searchParams.get("id");

  // Vérifier si l'ID de l'utilisateur est fourni
  if (!userId) {
    return NextResponse.json(
      { message: "ID de l'utilisateur non fourni" },
      { status: 400 }
    );
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    try {
      // Supprimer toutes les relations associées à l'utilisateur selon son rôle
      if (user.role === "SELLER") {
        // 1. D'abord, trouver les produits associés au vendeur via MarketSellers
        const sellerMarkets = await prisma.marketSellers.findMany({
          where: { sellerId: userId },
        });
        
        // 2. Pour chaque relation vendeur-marché, supprimer les produits associés
        for (const sellerMarket of sellerMarkets) {
          await prisma.product.deleteMany({
            where: { 
              sellerId: userId,
              marketId: sellerMarket.marketId 
            },
          });
        }
        
        // 3. Supprimer les OrderItems du vendeur
        await prisma.orderItem.deleteMany({
          where: { sellerId: userId },
        });
        
        // 4. Supprimer les relations MarketSellers
        await prisma.marketSellers.deleteMany({
          where: { sellerId: userId },
        });
      } else if (user.role === "MANAGER") {
        // Vérifier si un autre manager est disponible pour prendre la relève
        const anotherManager = await prisma.user.findFirst({
          where: { 
            role: "MANAGER",
            id: { not: userId }
          },
        });
        
        if (anotherManager) {
          // Réassigner les marchés à un autre manager
          await prisma.market.updateMany({
            where: { managerId: userId },
            data: { managerId: anotherManager.id },
          });
        } else {
          // Si aucun autre manager n'est disponible, nous devons informer l'admin
          // En attendant, on peut empêcher la suppression
          return NextResponse.json(
            { message: "Impossible de supprimer ce gestionnaire car il gère des marchés et aucun autre gestionnaire n'est disponible pour prendre la relève." },
            { status: 400 }
          );
        }
      }
      
      // Supprimer les commandes créées par cet utilisateur (acheteur)
      if (user.role === "BUYER" || user.role === "SELLER") { // Les vendeurs peuvent aussi être acheteurs
        await prisma.orderItem.deleteMany({
          where: { 
            order: { buyerId: userId }
          },
        });
        
        await prisma.order.deleteMany({
          where: { buyerId: userId },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des relations:", error);
      return NextResponse.json(
        { message: "Erreur lors de la suppression des relations: " + error },
        { status: 500 }
      );
    }

    // Supprimer l'utilisateur lui-même
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "Utilisateur supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'utilisateur: " + error },
      { status: 500 }
    );
  }
}

