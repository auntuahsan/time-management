import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User } from './models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const QR_SECRET = process.env.QR_SECRET || 'your-qr-secret';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateQRToken(): string {
  const payload = {
    action: 'attendance',
    secret: QR_SECRET,
    timestamp: Date.now(),
  };
  return jwt.sign(payload, QR_SECRET, { expiresIn: '24h' });
}

export function verifyQRToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, QR_SECRET) as { action: string; secret: string };
    return decoded.action === 'attendance' && decoded.secret === QR_SECRET;
  } catch {
    return false;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<typeof User.prototype | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const user = await User.findByPk(payload.userId);
  return user;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}
