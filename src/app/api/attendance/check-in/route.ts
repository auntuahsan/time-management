import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyQRToken } from '@/lib/auth';
import { Attendance, syncDatabase } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await syncDatabase();

    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { qrToken } = body;

    if (!qrToken) {
      return NextResponse.json(
        { error: 'QR token is required' },
        { status: 400 }
      );
    }

    // Verify QR token
    const isValidQR = verifyQRToken(qrToken);
    if (!isValidQR) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code' },
        { status: 400 }
      );
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = await Attendance.findOne({
      where: {
        userId: user.id,
        date: today,
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendance = await Attendance.create({
      userId: user.id,
      checkInTime: new Date(),
      date: today,
    });

    return NextResponse.json({
      message: 'Check-in successful',
      attendance,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
