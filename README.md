# eMarket - Plateforme de Marchés Locaux

## 📋 Description

eMarket est une plateforme web moderne de gestion de marchés locaux développée avec Next.js 13, TypeScript et Prisma. Elle permet aux vendeurs, acheteurs, gestionnaires et administrateurs de gérer efficacement les transactions commerciales dans un environnement sécurisé.

## ✨ Fonctionnalités Principales

### 👥 Gestion des Utilisateurs
- **Acheteurs** : Parcourir les produits, gérer le panier, passer des commandes
- **Vendeurs** : Gérer leurs produits, suivre les ventes, uploader des images
- **Administrateurs** : Gestion complète de la plateforme

### 🏪 Gestion des Marchés
- Création et gestion de marchés locaux
- Attribution de vendeurs aux marchés
- Gestion des images et descriptions

### 📦 Gestion des Produits
- Catalogue de produits avec images
- Système de catégories
- Gestion des stocks en temps réel
- Prix en FCFA

### 🛒 Système de Commande
- Panier d'achat persistant
- Processus de commande sécurisé
- Intégration FedaPay pour les paiements
- Suivi des commandes

### 💳 Paiements
- Intégration FedaPay
- Webhooks pour les notifications
- Gestion des statuts de paiement
- Historique des transactions

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 13** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **shadcn/ui** - Composants UI modernes
- **Lucide React** - Icônes

### Backend
- **Next.js API Routes** - API REST
- **Prisma** - ORM pour PostgreSQL
- **NextAuth.js** - Authentification
- **bcryptjs** - Hachage des mots de passe

### Base de Données
- **PostgreSQL** - Base de données principale
- **Migrations Prisma** - Gestion des schémas

### Paiements
- **FedaPay** - Passerelle de paiement
- **Webhooks** - Notifications en temps réel

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### Étapes d'Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/codertobi77/emarket-project.git
   cd emarket-project
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env.local
   ```
   
   Remplir les variables dans `.env.local` :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/emarket"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   FEDAPAY_SECRET_KEY="your-fedapay-secret"
   FEDAPAY_PUBLIC_KEY="your-fedapay-public"
   ```

4. **Configuration de la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir l'application**
   ```
   http://localhost:3000
   ```

## 📁 Structure du Projet

```
emarket-project/
├── app/                    # Pages et API routes (App Router)
│   ├── api/               # API endpoints
│   ├── auth/              # Pages d'authentification
│   ├── admin/             # Dashboard administrateur
│   ├── seller/            # Dashboard vendeur
│   └── markets/           # Pages des marchés
├── components/            # Composants React réutilisables
│   ├── ui/               # Composants UI (shadcn/ui)
│   └── ...               # Composants métier
├── lib/                  # Utilitaires et configurations
├── prisma/               # Schéma et migrations de base de données
├── public/               # Assets statiques
└── types/                # Définitions TypeScript
```

## 🔐 Authentification

Le système utilise NextAuth.js avec plusieurs stratégies :
- **Credentials** - Email/Mot de passe
- **Session** - Gestion des sessions sécurisées
- **Rôles** - BUYER, SELLER, MANAGER, ADMIN

## 🗄️ Modèles de Données

### Utilisateurs (User)
- Informations personnelles (nom, email, téléphone)
- Rôle et permissions
- Image de profil
- Certification vendeur

### Marchés (Market)
- Nom, description, localisation
- Gestionnaire assigné
- Image du marché
- Relations avec les vendeurs

### Produits (Product)
- Nom, description, prix
- Stock et catégorie
- Image du produit
- Vendeur et marché associés

### Commandes (Order)
- Statut et montant total
- Adresse de livraison
- Historique des paiements
- Articles commandés

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion

### Marchés
- `GET /api/markets` - Liste des marchés
- `POST /api/markets` - Créer un marché
- `PUT /api/markets` - Modifier un marché
- `DELETE /api/markets` - Supprimer un marché

### Produits
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit
- `PUT /api/products` - Modifier un produit
- `DELETE /api/products` - Supprimer un produit

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `PUT /api/users` - Modifier un utilisateur
- `DELETE /api/users` - Supprimer un utilisateur

### Paiements
- `POST /api/payments` - Créer un paiement
- `GET /api/payments/webhook` - Webhook FedaPay

## 🎨 Interface Utilisateur

### Design System
- **Thème** : Support mode clair/sombre
- **Responsive** : Mobile-first design
- **Accessibilité** : Conformité WCAG
- **Composants** : shadcn/ui pour la cohérence

### Pages Principales
- **Accueil** : Présentation et navigation
- **Marchés** : Catalogue des marchés
- **Produits** : Recherche et filtrage
- **Panier** : Gestion des achats
- **Compte** : Profil et commandes

## 🔧 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification du code
npm run type-check   # Vérification TypeScript
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Variables d'Environnement Requises
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
FEDAPAY_SECRET_KEY=
FEDAPAY_PUBLIC_KEY=
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Conventions de Code

### TypeScript
- Utiliser des types stricts
- Éviter `any` quand possible
- Documenter les interfaces complexes

### React
- Composants fonctionnels avec hooks
- Props typées avec TypeScript
- Gestion d'état avec useState/useEffect

### CSS
- Tailwind CSS pour le styling
- Classes utilitaires
- Composants CSS personnalisés si nécessaire

## 🐛 Débogage

### Logs
- Les logs de développement sont désactivés en production
- Utiliser les outils de développement du navigateur
- Vérifier les erreurs dans la console

### Base de Données
- Utiliser Prisma Studio : `npx prisma studio`
- Vérifier les migrations : `npx prisma migrate status`

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Développé avec ❤️ pour les marchés locaux du Bénin** 
