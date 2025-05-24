import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";
import { JwtPayload } from "jsonwebtoken";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        location: true,
        market: true,
        createdAt: true,
        updatedAt: true,
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
    const { name, email, role } = await req.json();

    // Validate input
    if (name === undefined || email === undefined || role === undefined) {
      return NextResponse.json({ message: "Tous les champs sont requis" }, { status: 400 });
    }

    if (!["BUYER", "SELLER", "MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ message: "Rôle invalide" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        name,
        email,
        role,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({
      message: "Erreur lors de la mise à jour de l'utilisateur: " + error,
    }, { status: 500 });
  }
}


