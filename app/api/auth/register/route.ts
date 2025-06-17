import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role: roleInput, marketId, location, image } = await req.json();

    // Validate input
    const role = roleInput.toUpperCase() as "BUYER" | "SELLER" | "MANAGER" | "ADMIN";
    if (!name || !email || !password || !role || !location || 
        (role === "SELLER" && !marketId)) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        location,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        location: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If user is a seller, associate him to the selected market
    if (role === "SELLER" && marketId) {
      const seller = await prisma.marketSellers.create({
        data: {
          market: {
            connect: { id: marketId },
          },
          seller: {
            connect: { id: newUser.id },
          },
        },
      });

      

      return NextResponse.json({
        message: "Inscription réussie",
        user: {newUser, seller},
      });
    }

    return NextResponse.json({
      message: "Inscription réussie",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'inscription: "+error },
      { status: 500 }
    );
  }
}
