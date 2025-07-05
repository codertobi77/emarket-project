import axios from 'axios';

// Configuration FedaPay
const FEDAPAY_CONFIG = {
  baseURL: process.env.FEDAPAY_BASE_URL || 'https://api.fedapay.com/v1',
  publicKey: process.env.FEDAPAY_PUBLIC_KEY || '',
  secretKey: process.env.FEDAPAY_SECRET_KEY || '',
  environment: process.env.FEDAPAY_ENVIRONMENT || 'sandbox', // 'sandbox' ou 'live'
};

// Types pour FedaPay
export interface FedaPayTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'failed' | 'cancelled';
  description: string;
  customer: {
    email: string;
    firstname: string;
    lastname: string;
    phone_number?: string;
  };
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    firstname: string;
    lastname: string;
    phone_number?: string;
  };
  metadata?: Record<string, any>;
  callback_url?: string;
  return_url?: string;
}

export interface FedaPayResponse<T> {
  data: T;
  message?: string;
  errors?: any[];
}

// Service FedaPay
class FedaPayService {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: FEDAPAY_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${FEDAPAY_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('FedaPay API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Erreur lors du paiement');
      }
    );
  }

  // Créer une nouvelle transaction
  async createTransaction(data: CreateTransactionRequest): Promise<FedaPayTransaction> {
    try {
      const response = await this.client.post<FedaPayResponse<FedaPayTransaction>>('/transactions', {
        ...data,
        currency: data.currency || 'XOF',
      });

      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création de la transaction FedaPay:', error);
      throw error;
    }
  }

  // Récupérer une transaction par ID
  async getTransaction(transactionId: string): Promise<FedaPayTransaction> {
    try {
      const response = await this.client.get<FedaPayResponse<FedaPayTransaction>>(`/transactions/${transactionId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la transaction FedaPay:', error);
      throw error;
    }
  }

  // Vérifier le statut d'une transaction
  async verifyTransaction(transactionId: string): Promise<FedaPayTransaction> {
    return this.getTransaction(transactionId);
  }

  // Annuler une transaction
  async cancelTransaction(transactionId: string): Promise<FedaPayTransaction> {
    try {
      const response = await this.client.post<FedaPayResponse<FedaPayTransaction>>(`/transactions/${transactionId}/cancel`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la transaction FedaPay:', error);
      throw error;
    }
  }

  // Récupérer l'URL de paiement pour une transaction
  getPaymentUrl(transactionId: string): string {
    const baseUrl = FEDAPAY_CONFIG.environment === 'live' 
      ? 'https://pay.fedapay.com' 
      : 'https://pay-sandbox.fedapay.com';
    
    return `${baseUrl}/pay/${transactionId}`;
  }

  // Vérifier la signature webhook (pour la sécurité)
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implémentation de la vérification de signature selon la documentation FedaPay
    // Cette méthode doit être implémentée selon les spécifications de FedaPay
    return true; // Placeholder
  }
}

// Instance singleton
export const fedaPayService = new FedaPayService();

// Utilitaires pour les paiements
export const createPaymentForOrder = async (
  orderId: string,
  amount: number,
  customer: {
    email: string;
    name: string;
    phone?: string;
  },
  callbackUrl?: string,
  returnUrl?: string
) => {
  const [firstName, ...lastNameParts] = customer.name.split(' ');
  const lastName = lastNameParts.join(' ') || firstName;

  const transactionData: CreateTransactionRequest = {
    amount: Math.round(amount * 100), // FedaPay utilise les centimes
    currency: 'XOF',
    description: `Commande #${orderId.slice(0, 8)} - e-Axi`,
    customer: {
      email: customer.email,
      firstname: firstName,
      lastname: lastName,
      phone_number: customer.phone,
    },
    metadata: {
      orderId,
      platform: 'e-axi',
    },
    callback_url: callbackUrl,
    return_url: returnUrl,
  };

  return await fedaPayService.createTransaction(transactionData);
};

export default fedaPayService; 