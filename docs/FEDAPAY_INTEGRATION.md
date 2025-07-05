# Intégration FedaPay - e-Axi

Ce document décrit l'intégration du système de paiement FedaPay dans le projet e-Axi.

## 🚀 Vue d'ensemble

FedaPay est un système de paiement mobile money populaire au Bénin qui permet aux utilisateurs de payer en ligne via leur téléphone mobile. Cette intégration permet aux clients d'e-Axi de payer leurs commandes de manière sécurisée.

## 📋 Fonctionnalités

- ✅ Création de transactions FedaPay
- ✅ Redirection vers la page de paiement FedaPay
- ✅ Gestion des webhooks pour les notifications de paiement
- ✅ Suivi du statut des paiements en temps réel
- ✅ Mise à jour automatique du statut des commandes
- ✅ Gestion des erreurs de paiement
- ✅ Interface utilisateur intuitive

## 🛠️ Configuration

### Variables d'environnement

Ajoutez les variables suivantes à votre fichier `.env` :

```env
# FedaPay Configuration
FEDAPAY_BASE_URL=https://api.fedapay.com/v1
FEDAPAY_PUBLIC_KEY=your_fedapay_public_key_here
FEDAPAY_SECRET_KEY=your_fedapay_secret_key_here
FEDAPAY_ENVIRONMENT=sandbox  # ou 'live' pour la production

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Obtenir les clés FedaPay

1. Créez un compte sur [FedaPay](https://fedapay.com)
2. Accédez à votre tableau de bord
3. Récupérez vos clés API (publique et secrète)
4. Configurez l'URL de webhook : `https://votre-domaine.com/api/payments/webhook`

## 📁 Structure des fichiers

```
├── lib/
│   └── fedapay.ts                 # Service FedaPay principal
├── app/api/payments/
│   ├── route.ts                   # API pour créer des paiements
│   └── webhook/
│       └── route.ts               # Webhook FedaPay
├── components/
│   ├── fedapay-button.tsx         # Bouton de paiement FedaPay
│   └── payment-status.tsx         # Composant de statut de paiement
├── prisma/
│   └── schema.prisma              # Schéma de base de données mis à jour
└── docs/
    └── FEDAPAY_INTEGRATION.md     # Cette documentation
```

## 🔄 Flux de paiement

### 1. Création de commande
- L'utilisateur remplit son panier
- Il saisit son adresse de livraison
- La commande est créée avec le statut `PENDING`

### 2. Initiation du paiement
- L'utilisateur clique sur "Payer avec FedaPay"
- Une transaction FedaPay est créée
- L'utilisateur est redirigé vers la page de paiement FedaPay

### 3. Paiement
- L'utilisateur effectue le paiement sur FedaPay
- FedaPay envoie une notification webhook
- Le statut de la commande est mis à jour

### 4. Confirmation
- L'utilisateur est redirigé vers la page des commandes
- Le statut de paiement est affiché en temps réel

## 🗄️ Modifications de la base de données

### Nouveau modèle `Payment`

```prisma
model Payment {
  id                    String   @id @default(uuid())
  orderId               String
  fedapayTransactionId  String   @unique
  amount                Decimal
  currency              String   @default("XOF")
  status                PaymentStatus @default(PENDING)
  paymentMethod         String?
  metadata              Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  order                 Order    @relation(fields: [orderId], references: [id])

  @@map("payments")
}
```

### Modifications du modèle `Order`

```prisma
model Order {
  // ... champs existants
  address               String?     // Adresse de livraison
  fedapayTransactionId  String?     // ID de transaction FedaPay
  paymentStatus         PaymentStatus @default(PENDING)
  payments              Payment[]   // Relation avec les paiements
}
```

### Nouvel enum `PaymentStatus`

```prisma
enum PaymentStatus {
  PENDING
  APPROVED
  FAILED
  CANCELLED
  REFUNDED
}
```

## 🔌 API Endpoints

### POST `/api/payments`
Crée une nouvelle transaction FedaPay pour une commande.

**Request :**
```json
{
  "orderId": "uuid",
  "returnUrl": "https://example.com/return"
}
```

**Response :**
```json
{
  "success": true,
  "transactionId": "fedapay_transaction_id",
  "paymentUrl": "https://pay.fedapay.com/pay/transaction_id",
  "transaction": { ... }
}
```

### POST `/api/payments/webhook`
Endpoint webhook pour recevoir les notifications de FedaPay.

### GET `/api/payments/webhook?transactionId=xxx`
Vérifie le statut d'une transaction.

## 🎨 Composants React

### FedaPayButton
Bouton de paiement qui initie une transaction FedaPay.

```tsx
<FedaPayButton
  orderId="order-uuid"
  amount={5000}
  className="w-full"
  returnUrl="https://example.com/return"
>
  Payer avec FedaPay
</FedaPayButton>
```

### PaymentStatusComponent
Affiche et vérifie le statut d'un paiement en temps réel.

```tsx
<PaymentStatusComponent
  transactionId="fedapay-transaction-id"
  initialStatus="PENDING"
  onStatusChange={(status) => console.log(status)}
/>
```

## 🔒 Sécurité

### Vérification des webhooks
- Les webhooks FedaPay doivent être vérifiés avec la signature
- Implémentez la méthode `verifyWebhookSignature` dans `lib/fedapay.ts`

### Validation des données
- Toutes les données de paiement sont validées côté serveur
- Les montants sont vérifiés pour éviter les manipulations

### Gestion des erreurs
- Gestion robuste des erreurs de paiement
- Messages d'erreur clairs pour l'utilisateur
- Logs détaillés pour le débogage

## 🧪 Tests

### Test en mode sandbox
1. Utilisez les clés de test FedaPay
2. Effectuez des paiements de test
3. Vérifiez les webhooks en local avec ngrok

### Test en production
1. Configurez les clés de production
2. Testez avec de petits montants
3. Vérifiez la sécurité des webhooks

## 🚨 Dépannage

### Problèmes courants

1. **Webhook non reçu**
   - Vérifiez l'URL du webhook dans FedaPay
   - Assurez-vous que l'endpoint est accessible publiquement

2. **Erreur de signature**
   - Vérifiez la clé secrète FedaPay
   - Implémentez correctement la vérification de signature

3. **Transaction non trouvée**
   - Vérifiez que l'ID de transaction est correct
   - Assurez-vous que la transaction existe dans FedaPay

### Logs utiles

```bash
# Vérifier les logs de l'application
npm run dev

# Vérifier les migrations de base de données
npx prisma migrate status

# Régénérer le client Prisma
npx prisma generate
```

## 📞 Support

Pour toute question concernant l'intégration FedaPay :

1. Consultez la [documentation FedaPay](https://docs.fedapay.com)
2. Contactez le support FedaPay
3. Vérifiez les logs de l'application

## 🔄 Mises à jour

### Version 1.0.0
- Intégration initiale de FedaPay
- Support des paiements en ligne
- Gestion des webhooks
- Interface utilisateur complète

### Prochaines fonctionnalités
- Support des remboursements
- Historique détaillé des paiements
- Notifications par email/SMS
- Support de plusieurs devises 