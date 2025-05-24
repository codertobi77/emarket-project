import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { JwtPayload } from "jsonwebtoken";

export const dynamic = 'error';
export const getStaticProps = async () => {
  return {
    props: {},
    revalidate: 1, // ou une autre valeur qui convient à votre application
  };
};

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req) as JwtPayload;
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    const where = {
      OR: [
        { buyerId: session.id },
        {
          items: {
            some: {
              sellerId: session.id,
            },
          },
        },
      ],
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
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

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des commandes: "+error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req) as JwtPayload;
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    const { items } = await req.json();

    const order = await prisma.order.create({
      data: {
        buyerId: session.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            sellerId: item.sellerId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}