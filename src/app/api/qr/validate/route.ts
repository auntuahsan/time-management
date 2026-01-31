import { NextRequest, NextResponse } from 'next/server';
import { verifyQRToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const isValid = verifyQRToken(token);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('QR validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
