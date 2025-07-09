# Documentation Technique - eMarket

## Architecture du Projet

### Stack Technologique

#### Frontend
- **Next.js 13** avec App Router
- **TypeScript** pour le typage statique
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants UI
- **NextAuth.js** pour l'authentification

#### Backend
- **Next.js API Routes** (API REST)
- **Prisma** comme ORM
- **PostgreSQL** comme base de données
- **bcryptjs** pour le hachage des mots de passe

#### Paiements
- **FedaPay** comme passerelle de paiement
- **Webhooks** pour les notifications

### Structure des Dossiers

```
emarket-project/
├── app/                          # App Router Next.js 13
│   ├── api/                     # API Routes
│   │   ├── auth/                # Authentification
│   │   ├── markets/             # Gestion des marchés
│   │   ├── products/            # Gestion des produits
│   │   ├── users/               # Gestion des utilisateurs
│   │   ├── orders/              # Gestion des commandes
│   │   ├── payments/            # Gestion des paiements
│   │   ├── categories/          # Gestion des catégories
│   │   └── upload/              # Upload d'images
│   ├── auth/                    # Pages d'authentification
│   ├── admin/                   # Dashboard administrateur
│   ├── seller/                  # Dashboard vendeur
│   ├── manager/                 # Dashboard gestionnaire
│   ├── markets/                 # Pages des marchés
│   ├── account/                 # Pages de compte utilisateur
│   ├── checkout/                # Page de commande
│   └── marketplace/             # Page principale du marché
├── components/                  # Composants React
│   ├── ui/                     # Composants UI (shadcn/ui)
│   └── *.tsx                   # Composants métier
├── lib/                        # Utilitaires et configurations
├── prisma/                     # Schéma et migrations DB
├── public/                     # Assets statiques
├── types/                      # Types TypeScript
└── hooks/                      # Hooks personnalisés
```

## Modèles de Données

### Schéma Prisma

```prisma
model User {
  id            String         @id @default(uuid())
  name          String
  email         String         @unique
  password      String
  role          Role           @default(BUYER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  image         String?
  isCertified   Boolean        @default(false)
  location      Location?
  session       String?
  phone         String?
  marketSellers MarketSellers?
  market        Market[]
  soldItems     OrderItem[]    @relation("SellerItems")
  orders        Order[]        @relation("BuyerOrders")
}

model Market {
  id            String         @id @default(uuid())
  name          String
  description   String?
  managerId     String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  image         String?
  location      Location       @default(COTONOU)
  marketSellers MarketSellers?
  manager       User?          @relation(fields: [managerId], references: [id])
}

model MarketSellers {
  marketId String    @unique
  sellerId String    @unique
  market   Market    @relation(fields: [marketId], references: [id])
  seller   User      @relation(fields: [sellerId], references: [id])
  products Product[]
}

model Product {
  id          String         @id @default(uuid())
  name        String
  description String?
  price       Decimal
  stock       Int            @default(0)
  image       String?
  sellerId    String?
  marketId    String?
  categoryId  String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  orderItems  OrderItem[]
  category    Category?      @relation(fields: [categoryId], references: [id])
  seller      MarketSellers? @relation(fields: [sellerId, marketId], references: [sellerId, marketId])
}

model Order {
  id                   String        @id @default(uuid())
  buyerId              String
  status               OrderStatus   @default(PENDING)
  totalAmount          Decimal       @default(0)
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
  address              String?
  fedapayTransactionId String?
  paymentStatus        PaymentStatus @default(PENDING)
  items                OrderItem[]
  buyer                User          @relation("BuyerOrders", fields: [buyerId], references: [id])
  payments             Payment[]
}

model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  productId String
  sellerId  String
  quantity  Int
  unitPrice Decimal
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  order     Order    @relation(fields: [orderId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
  seller    User     @relation("SellerItems", fields: [sellerId], references: [id])
}

model Payment {
  id                   String        @id @default(uuid())
  orderId              String
  fedapayTransactionId String        @unique
  amount               Decimal
  currency             String        @default("XOF")
  status               PaymentStatus @default(PENDING)
  paymentMethod        String?
  metadata             Json?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
  order                Order         @relation(fields: [orderId], references: [id])
}
```

## API Endpoints

### Authentification

#### POST /api/auth/login
```typescript
// Request
{
  email: string;
  password: string;
}

// Response
{
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    session: string;
  };
}
```

#### POST /api/auth/register
```typescript
// Request
{
  name: string;
  email: string;
  password: string;
  role: Role;
  marketId?: string; // Pour les vendeurs
  location: Location;
  image?: string;
  phone?: string;
}

// Response
{
  message: string;
  user: User;
}
```

### Marchés

#### GET /api/markets
```typescript
// Query Parameters
marketId?: string;
where?: string; // JSON string

// Response
Market[] | Market
```

#### POST /api/markets
```typescript
// Request (ADMIN/MANAGER only)
{
  name: string;
  location: Location;
  description: string;
  managerId?: string;
  image?: string;
}

// Response
Market
```

#### PUT /api/markets
```typescript
// Query Parameters
id: string;

// Request (ADMIN/MANAGER only)
{
  name: string;
  location: Location;
  description: string;
  managerId?: string;
  image?: string;
}

// Response
Market
```

#### DELETE /api/markets
```typescript
// Query Parameters
id: string;

// Response (ADMIN/MANAGER only)
{
  message: string;
  market: Market;
}
```

### Produits

#### GET /api/products
```typescript
// Query Parameters
marketId?: string;
category?: string;
sellerId?: string;

// Response
Product[]
```

#### POST /api/products
```typescript
// Request (SELLER only)
{
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string; // category ID
  image?: string;
}

// Response
Product
```

### Utilisateurs

#### GET /api/users
```typescript
// Query Parameters
marketId?: string;
sellerId?: string;

// Response
User[]
```

#### PUT /api/users
```typescript
// Request
{
  id?: string; // Pour les admins
  name?: string;
  email?: string;
  role?: Role;
  image?: string;
  password?: string;
}

// Response
User
```

### Paiements

#### POST /api/payments
```typescript
// Request
{
  orderId: string;
  returnUrl?: string;
}

// Response
{
  success: boolean;
  transactionId: string;
  paymentUrl: string;
  transaction: FedaPayTransaction;
}
```

## Authentification et Autorisation

### Rôles Utilisateurs

```typescript
enum Role {
  BUYER = "BUYER",     // Acheteur
  SELLER = "SELLER",   // Vendeur
  MANAGER = "MANAGER", // Gestionnaire
  ADMIN = "ADMIN"      // Administrateur
}
```

### Permissions par Rôle

| Action | BUYER | SELLER | MANAGER | ADMIN |
|--------|-------|--------|---------|-------|
| Voir les produits | ✅ | ✅ | ✅ | ✅ |
| Ajouter au panier | ✅ | ❌ | ❌ | ❌ |
| Passer commande | ✅ | ❌ | ❌ | ❌ |
| Gérer ses produits | ❌ | ✅ | ❌ | ❌ |
| Gérer les marchés | ❌ | ❌ | ✅ | ✅ |
| Gérer les utilisateurs | ❌ | ❌ | ❌ | ✅ |
| Gérer les catégories | ❌ | ❌ | ✅ | ✅ |

### Middleware d'Authentification

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Configuration des credentials
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      // Gestion du JWT
    },
    session: ({ session, token }) => {
      // Gestion de la session
    }
  }
};
```

## Gestion des Images

### Upload d'Images

```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string;
  
  // Validation et sauvegarde
  // Retourne le chemin de l'image
}
```

### Normalisation des Chemins

```typescript
// lib/utils.ts
export const getNormalizedImagePath = (imagePath: string) => {
  // Logique de normalisation des chemins d'images
  // Gestion des différents formats de stockage
};
```

## Intégration FedaPay

### Configuration

```typescript
// lib/fedapay.ts
const FEDAPAY_CONFIG = {
  baseURL: process.env.FEDAPAY_BASE_URL,
  secretKey: process.env.FEDAPAY_SECRET_KEY,
  publicKey: process.env.FEDAPAY_PUBLIC_KEY,
};
```

### Création de Transaction

```typescript
async createTransaction(
  orderId: string,
  amount: number,
  customer: { email: string; name: string },
  callbackUrl: string,
  returnUrl: string
): Promise<FedaPayTransaction>
```

### Webhooks

```typescript
// app/api/payments/webhook/route.ts
export async function POST(request: NextRequest) {
  // Traitement des notifications FedaPay
  // Mise à jour des statuts de paiement
}
```

## Gestion d'État

### Hooks Personnalisés

```typescript
// lib/use-session.ts
export const useSession = () => {
  // Hook personnalisé pour la gestion de session
  // Intégration avec NextAuth et SWR
};

// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Hook pour la gestion du localStorage
};
```

### Panier d'Achat

```typescript
// components/cart.tsx
export function Cart() {
  // Gestion du panier avec localStorage
  // Synchronisation entre composants
}
```

## Sécurité

### Validation des Données

- Validation côté client avec TypeScript
- Validation côté serveur avec Prisma
- Sanitisation des entrées utilisateur

### Protection des Routes

```typescript
// Middleware d'autorisation
const session = await getServerSession(authOptions);
if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
  return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
}
```

### Hachage des Mots de Passe

```typescript
// Hachage avec bcryptjs
const hashedPassword = await hash(password, 10);
```

## Performance

### Optimisations

- **Images** : Optimisation automatique avec Next.js
- **Code Splitting** : Chargement à la demande
- **Caching** : SWR pour la gestion du cache
- **Database** : Requêtes optimisées avec Prisma

### Monitoring

- Logs d'erreur structurés
- Métriques de performance
- Monitoring des paiements

## Tests

### Types de Tests

- **Tests Unitaires** : Composants et utilitaires
- **Tests d'Intégration** : API endpoints
- **Tests E2E** : Flux utilisateur complets

### Outils Recommandés

- **Jest** pour les tests unitaires
- **Testing Library** pour les tests React
- **Playwright** pour les tests E2E

## Déploiement

### Environnements

- **Development** : `npm run dev`
- **Staging** : Pré-production
- **Production** : Vercel

### Variables d'Environnement

```env
# Base de données
DATABASE_URL=

# Authentification
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# FedaPay
FEDAPAY_SECRET_KEY=
FEDAPAY_PUBLIC_KEY=
FEDAPAY_BASE_URL=
```

### CI/CD

- **GitHub Actions** pour l'automatisation
- **Vercel** pour le déploiement automatique
- **Prisma Migrations** pour la base de données

## Maintenance

### Base de Données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio
npx prisma studio
```

### Logs et Monitoring

- Logs structurés pour le debugging
- Monitoring des performances
- Alertes en cas d'erreur

### Sauvegarde

- Sauvegarde automatique de la base de données
- Versioning des migrations Prisma
- Backup des assets statiques

---

*Cette documentation est mise à jour régulièrement. Pour toute question, consulter les issues GitHub ou contacter l'équipe de développement.* 