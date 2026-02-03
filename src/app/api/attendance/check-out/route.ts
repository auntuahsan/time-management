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

    // Find the latest open check-in for today (no check-out yet)
    const today = getLocalDate();
    const attendance = await Attendance.findOne({
      where: {
        userId: user.id,
        date: today,
        checkOutTime: null,
      },
      order: [['checkInTime', 'DESC']],
    });

    if (!attendance) {
      return NextResponse.json(
        { error: 'No open check-in found. Please check in first.' },
        { status: 400 }
      );
    }

    // Update with check-out time
    attendance.checkOutTime = new Date();
    await attendance.save();

    return NextResponse.json({
      message: 'Check-out successful',
      attendance,
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
