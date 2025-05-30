import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Jwt, JwtPayload } from "jsonwebtoken";
import { log } from "node:util";

export const dynamic = 'force-dynamic';
export const getStaticProps = async () => {
  return {
    props: {},
    revalidate: 1, // ou une autre valeur qui convient à votre application
  };
};
export async function GET(req: NextRequest, searchParams: { [key: string]: string }) {
  try {
    const marketId = searchParams.marketId;
    const category = searchParams.category;

    const where = {
      ...(marketId && { seller: { market: { id: marketId } } }),
      ...(category && { category: { name: category } }),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            seller: {
              select: {
                name: true,
                email: true,
              },
            },
            market:{
              select: {
                name: true,
              }
            }
          },
        },
        // market: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des produits: "+error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req) as JwtPayload;
    if (!session || !["SELLER", "ADMIN"].includes(session.role)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

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

   // Check if market exists
    // const marketExists = await prisma.market.findUnique({
    //   where: { id: marketId },
    // });
    // if (!marketExists) {
    //   return NextResponse.json(
    //     { message: "Market does not exist" },
    //     { status: 404 }
    //   );
    // }    

    const seller = await prisma.marketSellers.findUnique({
      where: { sellerId: session.id },
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
          connect: { sellerId: session.id, marketId: seller.marketId },
        },
        // marketId: seller.marketId,
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
  try {
    const session = getSession(req) as JwtPayload;
    if (!session || !["SELLER", "ADMIN"].includes(session.role)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

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

    console.log(image);
    

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: category.id },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { message: "Category does not exist" },
        { status: 404 }
      );
    }

    // Check if market exists
    // const marketExists = await prisma.market.findUnique({
    //   where: { id: marketId },
    // });
    // if (!marketExists) {
    //   return NextResponse.json(
    //     { message: "Market does not exist" },
    //     { status: 404 }
    //   );
    // }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        stock: stock || product.stock,
        image: image,
        category: {
          connect: { id: category.id },
        },
        // marketId,
      },
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
  try {
    const session = getSession(req) as JwtPayload;
    if (!session || !["SELLER", "ADMIN"].includes(session.role)) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

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

