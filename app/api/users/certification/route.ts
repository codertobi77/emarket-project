import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/db';
import { JwtPayload } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté
    const session = await getSession(req) as JwtPayload;
    
    if (!session?.email) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Mettre à jour l'utilisateur pour marquer la demande de certification
    const updatedUser = await prisma.user.update({
      where: { email: session.email },
      data: {
        isCertified: false, // L'administrateur devra valider manuellement
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isCertified: true,
      },
    });

    // Ici, vous pourriez ajouter une notification à l'administrateur
    // ou envoyer un email de confirmation

    return NextResponse.json({
      message: 'Demande de certification enregistrée avec succès',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Erreur lors de la demande de certification:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la demande de certification' },
      { status: 500 }
    );
  }
}
