import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Jwt, JwtPayload } from "jsonwebtoken";
import { log } from "node:util";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const marketId = searchParams.get("marketId");
    const category = searchParams.get("category");
    const sellerId = searchParams.get("sellerId");

    const where: any = {};
    if (marketId) {
      where.seller = { market: { id: marketId } };
    }
    if (category) {
      where.category = { name: category };
    }
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            market: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des produits: " + error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { message: "Non authentifié" },
      { status: 401 }
    );
  }
  try {
    // if (!session || !["SELLER", "ADMIN"].includes(session.role)) {
    //   return NextResponse.json(
    //     { message: "Non autorisé" },
    //     { status: 403 }
    //   );
    // }

    const { name, description, price, stock, category, image } = await req.json();

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: category },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { message: "Category does not exist" },
        { status: 404 }
      );
    }

    const seller = await prisma.marketSellers.findUnique({
      where: { sellerId: session.user.id },
      select: { marketId: true },
    })
    console.log(seller);

    if (!seller) {
      return NextResponse.json(
        { message: "User is not a seller" },
        { status: 404 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        image,
        seller: {
          connect: { sellerId: session.user.id, marketId: seller.marketId },
        },
        category: {
          connect: { id: category },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["SELLER", "ADMIN"].includes(session.user?.role)) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 403 }
    );
  }
  try {
    const { id, name, description, price, stock, image, category, marketId } = await req.json();
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return NextResponse.json(
        { message: "Product does not exist" },
        { status: 404 }
      );
    }
    let updateData: any = {
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      stock: stock ?? product.stock,
      image: image || product.image,
    };
    if (category?.id) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: category.id },
      });
      if (!categoryExists) {
        return NextResponse.json(
          { message: "Category does not exist" },
          { status: 404 }
        );
      }
      updateData.category = {
        connect: { id: category.id },
      };
    }
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du produit" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["SELLER", "ADMIN"].includes(session.user?.role)) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 403 }
    );
  }
  try {
    const { id } = await req.json();
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return NextResponse.json(
        { message: "Product does not exist" },
        { status: 404 }
      );
    }
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}

