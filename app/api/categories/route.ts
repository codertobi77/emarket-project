import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {

  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { name, description } = await req.json();
  if (!name || !description) {
    return NextResponse.json(
      { message: 'Les champs nom et description sont obligatoires' },
      { status: 400 }
    );
  }
  if (typeof name !== 'string' || typeof description !== 'string') {
    return NextResponse.json(
      { message: 'Les champs nom et description doivent être des chaînes de caractères' },
      { status: 400 }
    );
  }
  try {
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'ajout de la catégorie' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const { name, description } = await req.json();

  if (!id) {
    return NextResponse.json(
      { message: "L'identifiant de la catégorie est obligatoire" },
      { status: 400 }
    );
  }

  if (!name || !description) {
    return NextResponse.json(
      { message: 'Les champs nom et description sont obligatoires' },
      { status: 400 }
    );
  }

  if (typeof name !== 'string' || typeof description !== 'string') {
    return NextResponse.json(
      { message: 'Les champs nom et description doivent être des chaînes de caractères' },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, description },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  console.log('id parameter:', req.nextUrl.searchParams.get('id'));
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { message: 'L\'identifiant de la catégorie est obligatoire' },
      { status: 400 }
    );
  }
  try {
    const category = await prisma.category.delete({
      where: {
        id
      }
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}
