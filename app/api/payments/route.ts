import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fedaPayService, createPaymentForOrder } from '@/lib/fedapay';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// Créer un paiement pour une commande
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, returnUrl } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande requis' },
        { status: 400 }
      );
    }

    // Récupérer la commande
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: session.user.id,
      },
      include: {
        buyer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que la commande n'a pas déjà un paiement en cours
    if (order.paymentStatus === 'APPROVED') {
      return NextResponse.json(
        { error: 'Cette commande a déjà été payée' },
        { status: 400 }
      );
    }

    // Créer la transaction FedaPay
    const callbackUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/webhook`;
    const finalReturnUrl = returnUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/account/orders`;

    const transaction = await createPaymentForOrder(
      order.id,
      Number(order.totalAmount),
      {
        email: order.buyer.email,
        name: order.buyer.name,
      },
      callbackUrl,
      finalReturnUrl
    );

    // Mettre à jour la commande avec l'ID de transaction
    await prisma.order.update({
      where: { id: orderId },
      data: {
        fedapayTransactionId: transaction.id,
        paymentStatus: 'PENDING',
      },
    });

    // Créer l'enregistrement de paiement
    await prisma.payment.create({
      data: {
        orderId: order.id,
        fedapayTransactionId: transaction.id,
        amount: order.totalAmount,
        currency: 'XOF',
        status: 'PENDING',
        metadata: transaction,
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      paymentUrl: fedaPayService.getPaymentUrl(transaction.id),
      transaction,
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}

// Récupérer les paiements d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      // Récupérer les paiements d'une commande spécifique
      const payments = await prisma.payment.findMany({
        where: {
          order: {
            id: orderId,
            buyerId: session.user.id,
          },
        },
        include: {
          order: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(payments);
    } else {
      // Récupérer tous les paiements de l'utilisateur
      const payments = await prisma.payment.findMany({
        where: {
          order: {
            buyerId: session.user.id,
          },
        },
        include: {
          order: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(payments);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paiements' },
      { status: 500 }
    );
  }
} 