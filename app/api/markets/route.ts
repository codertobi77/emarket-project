import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
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
    const session = getSession(req) as JwtPayload;
    if (!session || !["MANAGER", "ADMIN"].includes(session.role)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    const { name, location, description, managerId } = await req.json();

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

    const market = await prisma.market.create({
      data: {
        name,
        location,
        description,
        managerId,
      },
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
    const session = getSession(req) as JwtPayload;
    if (!session || !["MANAGER", "ADMIN"].includes(session.role)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    const { name, location, description, managerId } = await req.json();

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

    const market = await prisma.market.update({
      where: { id },
      data: {
        name,
        location,
        description,
        managerId,
      },
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
    const session = getSession(req) as JwtPayload;
    if (!session || !["MANAGER", "ADMIN"].includes(session.role)) {
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

    const market = await prisma.market.delete({
      where: { id },
    });

    return NextResponse.json(market);
  } catch (error) {
    console.error("Error deleting market:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du marché" },
      { status: 500 }
    );
  }
}
