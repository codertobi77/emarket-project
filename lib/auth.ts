import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { User } from '@/types';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import prisma from "@/lib/db";
import { useSession } from '@/lib/use-session'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

// Étendre le type Session de Next-Auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const generateToken = (user: Omit<User, 'password'>) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const decodeToken = (token: string) => {
  try {
    return jwt.decode(token) as {
      id: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };
  } catch (error) {
    return null;
  }
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getSession = (req: NextRequest) => {
  const token = req.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }

  const session = verifyToken(token);
  return session; 
};

export const requireAuth = (handler: any) => {
  return async (req: NextRequest) => {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return handler(req, session);
  };
};

export const requireRole = (handler: any, allowedRoles: string[]) => {
  return requireAuth(async (req: NextRequest, session: any) => {
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req, session);
  });
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
          }
        });

        

        if (!user) {
          throw new Error("Aucun utilisateur trouvé avec cet email");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }



        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};