import { NextRequest, NextResponse } from 'next/server';
import { fedaPayService } from '@/lib/fedapay';
import prisma from '@/lib/db';
import { PaymentStatus, OrderStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-fedapay-signature');

    // Vérifier la signature du webhook (à implémenter selon la documentation FedaPay)
    // if (!fedaPayService.verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    // }

    const data = JSON.parse(body);
    console.log('Webhook FedaPay reçu:', data);

    // Extraire les informations de la transaction
    const transactionId = data.id || data.transaction_id;
    const status = data.status;
    const metadata = data.metadata || {};

    if (!transactionId) {
      return NextResponse.json({ error: 'ID de transaction manquant' }, { status: 400 });
    }

    // Récupérer le paiement correspondant
    const payment = await prisma.payment.findUnique({
      where: {
        fedapayTransactionId: transactionId,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      console.error('Paiement non trouvé pour la transaction:', transactionId);
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
    }

    // Mettre à jour le statut du paiement
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    let orderStatus: OrderStatus = OrderStatus.PENDING;

    switch (status) {
      case 'approved':
        paymentStatus = PaymentStatus.APPROVED;
        orderStatus = OrderStatus.CONFIRMED;
        break;
      case 'failed':
        paymentStatus = PaymentStatus.FAILED;
        orderStatus = OrderStatus.CANCELLED;
        break;
      case 'cancelled':
        paymentStatus = PaymentStatus.CANCELLED;
        orderStatus = OrderStatus.CANCELLED;
        break;
      default:
        paymentStatus = PaymentStatus.PENDING;
        orderStatus = OrderStatus.PENDING;
    }

    // Mettre à jour le paiement
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: paymentStatus,
        metadata: data,
        updatedAt: new Date(),
      },
    });

    // Mettre à jour la commande
    await prisma.order.update({
      where: {
        id: payment.orderId,
      },
      data: {
        paymentStatus,
        status: orderStatus,
        updatedAt: new Date(),
      },
    });

    // Si le paiement est approuvé, mettre à jour le stock des produits
    if (status === 'approved') {
      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: payment.orderId,
        },
      });

      for (const item of orderItems) {
        await prisma.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    console.log(`Paiement ${transactionId} mis à jour avec le statut: ${paymentStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

// Endpoint pour vérifier le statut d'un paiement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transaction requis' },
        { status: 400 }
      );
    }

    // Vérifier le statut auprès de FedaPay
    const transaction = await fedaPayService.verifyTransaction(transactionId);

    // Mettre à jour le statut local si nécessaire
    const payment = await prisma.payment.findUnique({
      where: {
        fedapayTransactionId: transactionId,
      },
      include: {
        order: true,
      },
    });

    if (payment) {
      let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
      let orderStatus: OrderStatus = OrderStatus.PENDING;

      switch (transaction.status) {
        case 'approved':
          paymentStatus = PaymentStatus.APPROVED;
          orderStatus = OrderStatus.CONFIRMED;
          break;
        case 'failed':
          paymentStatus = PaymentStatus.FAILED;
          orderStatus = OrderStatus.CANCELLED;
          break;
        case 'cancelled':
          paymentStatus = PaymentStatus.CANCELLED;
          orderStatus = OrderStatus.CANCELLED;
          break;
        default:
          paymentStatus = PaymentStatus.PENDING;
          orderStatus = PaymentStatus.PENDING;
      }

      // Mettre à jour les statuts
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: paymentStatus },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { 
          paymentStatus,
          status: orderStatus,
        },
      });
    }

    return NextResponse.json({
      transaction,
      payment,
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du paiement' },
      { status: 500 }
    );
  }
} 