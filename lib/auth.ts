import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

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