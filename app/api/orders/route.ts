import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'error';
export const getStaticProps = async () => {
  return {
    props: {},
    revalidate: 1, // ou une autre valeur qui convient à votre application
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        buyerId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
            seller: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await request.json();
    const { items, address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new NextResponse("Panier invalide", { status: 400 });
    }

    if (!address) {
      return new NextResponse("Adresse requise", { status: 400 });
    }

    // Calculer le montant total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        totalAmount,
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            productId: item.id,
            sellerId: item.sellerId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            seller: true,
          },
        },
      },
    });

    // Mettre à jour le stock des produits
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}