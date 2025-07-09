import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {

    const marketId = req.nextUrl.searchParams.get('marketId');
    if (marketId) {
      const market = await prisma.market.findUnique({
        where: {
          id: marketId,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          marketSellers: {
            select: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
      return NextResponse.json(market);
    }
    
    const whereParam = req.nextUrl.searchParams.get('where');
    const where = whereParam ? JSON.parse(whereParam) : {};

    const markets = await prisma.market.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        marketSellers: {
          select: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(markets);
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des marchés" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session récupérée:", session);
    console.log("Rôle de la session:", session?.user?.role);
    
    if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      console.log("Accès refusé - Session:", !!session, "Rôle:", session?.user?.role);
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    const { name, location, description, managerId, image } = await req.json();

    if (!name || !location || !description) {
      return NextResponse.json(
        { message: "Le nom, la localisation et la description sont requis" },
        { status: 400 }
      );
    }

    if (!["COTONOU", "BOHICON", "PORTO-NOVO"].includes(location)) {
      return NextResponse.json(
        { message: "Localisation invalide" },
        { status: 400 }
      );
    }

    const data: any = { name, location, description, image };
    if (managerId) data.managerId = managerId;

    const market = await prisma.market.create({
      data,
    });

    return NextResponse.json(market);
  } catch (error) {
    console.error("Error creating market:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du marché" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { message: "L'identifiant du marché est obligatoire" },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    const { name, location, description, managerId , image } = await req.json();

    if (!name || !location || !description) {
      return NextResponse.json(
        { message: "Le nom, la localisation et la description sont requis" },
        { status: 400 }
      );
    }

    if (!["COTONOU", "BOHICON", "PORTO-NOVO"].includes(location)) {
      return NextResponse.json(
        { message: "Localisation invalide" },
        { status: 400 }
      );
    }

    const data: any = { name, location, description, image };
    if (managerId) data.managerId = managerId;

    const market = await prisma.market.update({
      where: { id },
      data,
    });

    return NextResponse.json(market);
  } catch (error) {
    console.error("Error updating market:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du marché" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { message: "L'identifiant du marché est obligatoire" },
        { status: 400 }
      );
    }

    // Utiliser une transaction Prisma pour s'assurer que toutes les opérations réussissent ou échouent ensemble
    const result = await prisma.$transaction(async (tx) => {
      // Vérifier si le marché existe et obtenir tous ses vendeurs
      const marketExists = await tx.market.findUnique({
        where: { id },
        include: {
          marketSellers: {
            include: {
              seller: true
            }
          }
        }
      });

      if (!marketExists) {
        throw new Error("Marché non trouvé");
      }

      // Récupérer les IDs des vendeurs associés à ce marché
      const sellerIds = Array.isArray(marketExists.marketSellers)
        ? marketExists.marketSellers.map((ms: { sellerId: string }) => ms.sellerId)
        : [];
      console.log(`Suppression du marché ${id} avec ${sellerIds.length} vendeurs associés: ${sellerIds.join(', ')}`);

      // 1. D'abord, supprimer tous les produits associés aux vendeurs du marché
      // Trouver les produits associés au marché ou à ses vendeurs
      const relatedProducts = await tx.product.findMany({
        where: {
          OR: [
            { marketId: id },
            { sellerId: { in: sellerIds } }
          ]
        }
      });
      
      console.log(`Suppression de ${relatedProducts.length} produits associés au marché ${id}`);
      
      // Supprimer les produits associés
      if (relatedProducts.length > 0) {
        const productIds = relatedProducts.map(p => p.id);
        
        // D'abord supprimer les éléments de commande liés à ces produits
        await tx.orderItem.deleteMany({
          where: {
            productId: { in: productIds }
          }
        });
        
        // Ensuite supprimer les produits eux-mêmes
        await tx.product.deleteMany({
          where: {
            id: { in: productIds }
          }
        });
      }
      
      // 2. Supprimer les relations marché-vendeurs
      await tx.$executeRaw`DELETE FROM "market_sellers" WHERE "marketId" = ${id}`;
      console.log(`Relations marché-vendeurs supprimées pour le marché ${id}`);
      
      // 3. Supprimer les vendeurs associés uniquement à ce marché
      // Vérifier d'abord quels vendeurs ne sont associés qu'à ce marché
      for (const sellerId of sellerIds) {
        const otherMarkets = await tx.marketSellers.count({
          where: {
            sellerId,
            marketId: { not: id }
          }
        });
        
        // Si le vendeur n'est associé à aucun autre marché, le supprimer
        if (otherMarkets === 0) {
          console.log(`Suppression du vendeur ${sellerId} qui n'est associé à aucun autre marché`);
          
          // Supprimer les commandes liées à ce vendeur
          await tx.orderItem.deleteMany({
            where: {
              sellerId
            }
          });
          
          // Supprimer le vendeur
          await tx.user.delete({
            where: {
              id: sellerId
            }
          });
        } else {
          console.log(`Le vendeur ${sellerId} est associé à ${otherMarkets} autres marchés, conservation du compte`);
        }
      }
      
      // 4. Finalement, supprimer le marché lui-même
      return await tx.market.delete({
        where: { id },
      });
    });

    console.log(`Marché ${id} et toutes ses dépendances (produits, vendeurs, relations) supprimés avec succès`);
    return NextResponse.json({
      ...result,
      message: "Marché et toutes ses dépendances supprimés avec succès"
    });
  } catch (error) {
    console.error("Error deleting market:", error);
    return NextResponse.json(
      { message: `Erreur lors de la suppression du marché: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}