# eMarket - Local Markets Platform

## 📋 Description

eMarket is a modern web platform for managing local markets, developed with Next.js 13, TypeScript, and Prisma. It enables sellers, buyers, managers, and administrators to efficiently manage commercial transactions in a secure environment.

## ✨ Main Features

### 👥 User Management
- **Buyers** : Browse products, manage cart, place orders
- **Sellers** : Manage their products, track sales, upload images
- **Managers** : Supervise markets, manage categories
- **Administrators** : Complete platform management

### 🏪 Market Management
- Creation and management of local markets
- Seller assignment to markets
- Image and description management
- Geographic location (Cotonou, Bohicon, Porto-Novo)

### 📦 Product Management
- Product catalog with images
- Category system
- Real-time stock management
- Pricing in FCFA

### 🛒 Order System
- Persistent shopping cart
- Secure ordering process
- FedaPay integration for payments
- Order tracking

### 💳 Payments
- FedaPay integration
- Webhooks for notifications
- Payment status management
- Transaction history

## 🛠️ Technologies Used

### Frontend
- **Next.js 13** - React framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility styling
- **shadcn/ui** - Modern UI components
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - REST API
- **Prisma** - ORM for PostgreSQL
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing

### Database
- **PostgreSQL** - Main database
- **Prisma Migrations** - Schema management

### Payments
- **FedaPay** - Payment gateway
- **Webhooks** - Real-time notifications

## 🚀 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/codertobi77/emarket-project.git
   cd emarket-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the variables in `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/emarket"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   FEDAPAY_SECRET_KEY="your-fedapay-secret"
   FEDAPAY_PUBLIC_KEY="your-fedapay-public"
   ```

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
emarket-project/
├── app/                    # Pages and API routes (App Router)
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   ├── admin/             # Administrator dashboard
│   ├── seller/            # Seller dashboard
│   ├── manager/           # Manager dashboard
│   └── markets/           # Market pages
├── components/            # Reusable React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # Business components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🔐 Authentication

The system uses NextAuth.js with multiple strategies:
- **Credentials** - Email/Password
- **Session** - Secure session management
- **Roles** - BUYER, SELLER, MANAGER, ADMIN

## 🗄️ Data Models

### Users (User)
- Personal information (name, email, phone)
- Role and permissions
- Profile image
- Seller certification

### Markets (Market)
- Name, description, location
- Assigned manager
- Market image
- Seller relationships

### Products (Product)
- Name, description, price
- Stock and category
- Product image
- Associated seller and market

### Orders (Order)
- Status and total amount
- Delivery address
- Payment history
- Ordered items

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registration
- `POST /api/auth/logout` - Logout

### Markets
- `GET /api/markets` - List markets
- `POST /api/markets` - Create market
- `PUT /api/markets` - Update market
- `DELETE /api/markets` - Delete market

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products` - Update product
- `DELETE /api/products` - Delete product

### Users
- `GET /api/users` - List users
- `PUT /api/users` - Update user
- `DELETE /api/users` - Delete user

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments/webhook` - FedaPay webhook

## 🎨 User Interface

### Design System
- **Theme** : Light/dark mode support
- **Responsive** : Mobile-first design
- **Accessibility** : WCAG compliance
- **Components** : shadcn/ui for consistency

### Main Pages
- **Home** : Presentation and navigation
- **Markets** : Market catalog
- **Products** : Search and filtering
- **Cart** : Purchase management
- **Account** : Profile and orders

## 🔧 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
npm run type-check   # TypeScript checking
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically

### Required Environment Variables
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
FEDAPAY_SECRET_KEY=
FEDAPAY_PUBLIC_KEY=
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Conventions

### TypeScript
- Use strict types
- Avoid `any` when possible
- Document complex interfaces

### React
- Functional components with hooks
- Typed props with TypeScript
- State management with useState/useEffect

### CSS
- Tailwind CSS for styling
- Utility classes
- Custom CSS components if needed

## 🐛 Debugging

### Logs
- Development logs are disabled in production
- Use browser developer tools
- Check console for errors

### Database
- Use Prisma Studio: `npx prisma studio`
- Check migrations: `npx prisma migrate status`

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 📞 Support

For any questions or issues:
- Open an issue on GitHub
- Contact the development team

---

**Developed with ❤️ for local markets in Benin** 