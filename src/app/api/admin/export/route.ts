import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { Attendance, User, syncDatabase } from '@/lib/models';
import { Op } from 'sequelize';
import * as XLSX from 'xlsx';

interface AttendanceRecord {
  date: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  user?: {
    username: string;
    email: string;
  };
}

function calculateDuration(checkIn: Date, checkOut: Date | null): string {
  if (!checkOut) return '-';
  const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function getStatus(recordDate: string, checkOut: Date | null): string {
  const today = new Date().toISOString().split('T')[0];
  if (checkOut) {
    return 'Complete';
  } else if (recordDate === today) {
    return 'In Progress';
  } else {
    return 'Incomplete';
  }
}

function formatTime(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: Record<string, unknown> = {};

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const records = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email'],
        },
      ],
      order: [['date', 'DESC'], ['checkInTime', 'DESC']],
    });

    // Transform data for Excel
    const excelData = records.map((record) => {
      const r = record.toJSON() as AttendanceRecord;
      return {
        'Username': r.user?.username || '-',
        'Email': r.user?.email || '-',
        'Date': formatDate(r.date),
        'Check-in Time': formatTime(r.checkInTime),
        'Check-out Time': formatTime(r.checkOutTime),
        'Duration': calculateDuration(r.checkInTime, r.checkOutTime),
        'Status': getStatus(r.date, r.checkOutTime),
      };
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Username
      { wch: 30 }, // Email
      { wch: 15 }, // Date
      { wch: 15 }, // Check-in
      { wch: 15 }, // Check-out
      { wch: 12 }, // Duration
      { wch: 12 }, // Status
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="attendance_${startDate}_to_${endDate}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
