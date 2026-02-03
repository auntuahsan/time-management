import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyQRToken } from '@/lib/auth';
import { Attendance, syncDatabase } from '@/lib/models';

// Get today's date in local timezone (Asia/Dhaka)
function getLocalDate(): string {
  const now = new Date();
  // Use Asia/Dhaka timezone (UTC+6)
  const localDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  return localDate.toISOString().split('T')[0];
}

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

    const today = getLocalDate();

    // Check if there's an open check-in (no check-out) for today
    const openRecord = await Attendance.findOne({
      where: {
        userId: user.id,
        date: today,
        checkOutTime: null,
      },
    });

    if (openRecord) {
      return NextResponse.json(
        { error: 'You have an open check-in. Please check out first.' },
        { status: 400 }
      );
    }

    // Create new attendance record (allows multiple per day)
    const attendance = await Attendance.create({
      userId: user.id,
      checkInTime: new Date(),
      date: today,
    });

    return NextResponse.json({
      message: 'Check-in successful',
      attendance,
    });
  } catch (error: unknown) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
