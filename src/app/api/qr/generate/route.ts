import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, generateQRToken } from '@/lib/auth';
import { syncDatabase } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await syncDatabase();

    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const token = generateQRToken();

    return NextResponse.json({ token });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
