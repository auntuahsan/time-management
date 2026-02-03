'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/StatsCard';
import { Attendance } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [todayRecords, setTodayRecords] = useState<Attendance[]>([]);
  const [openRecord, setOpenRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    avgHours: '0h 0m',
    onTime: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    if (token) {
      fetchAttendance();
    }
  }, [token]);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/attendance/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.records);

        // Find all today's records
        const today = new Date().toISOString().split('T')[0];
        const todaysRecords = data.records.filter((r: Attendance) => r.date === today);
        setTodayRecords(todaysRecords);
        // Find open record (no checkout) for status logic
        const currentOpenRecord = todaysRecords.find((r: Attendance) => !r.checkOutTime);
        setOpenRecord(currentOpenRecord || null);

        // Calculate stats
        const thisMonth = data.records.filter((r: Attendance) => {
          const recordDate = new Date(r.date);
          const now = new Date();
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        });

        const completedRecords = data.records.filter((r: Attendance) => r.checkOutTime);
        let totalMinutes = 0;
        completedRecords.forEach((r: Attendance) => {
          const checkIn = new Date(r.checkInTime);
          const checkOut = new Date(r.checkOutTime!);
          totalMinutes += (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
        });
        const avgMinutes = completedRecords.length > 0 ? totalMinutes / completedRecords.length : 0;
        const avgHours = Math.floor(avgMinutes / 60);
        const avgMins = Math.round(avgMinutes % 60);

        // This week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const thisWeekRecords = data.records.filter((r: Attendance) => new Date(r.date) >= weekStart);

        setStats({
          totalDays: thisMonth.length,
          avgHours: `${avgHours}h ${avgMins}m`,
          onTime: Math.min(completedRecords.length, thisMonth.length),
          thisWeek: thisWeekRecords.length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (todayRecords.length === 0) {
      return {
        status: 'Not Checked In',
        color: 'bg-slate-100 text-slate-700',
        message: 'Start your day by scanning the QR code',
      };
    }
    if (openRecord) {
      return {
        status: 'Working',
        color: 'bg-blue-100 text-blue-700',
        message: 'Remember to check out when leaving',
      };
    }
    return {
      status: 'Day Complete',
      color: 'bg-emerald-100 text-emerald-700',
      message: `${todayRecords.length} session${todayRecords.length > 1 ? 's' : ''} completed today`,
    };
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (checkIn: Date | string, checkOut: Date | string | null): string => {
    if (!checkOut) return '-';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const statusInfo = getStatusInfo();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back, {user?.username}!</h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500">Here&apos;s your attendance overview</p>
        </div>
        <Link
          href="/scan"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
          </svg>
          Scan QR Code
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="This Month"
          value={stats.totalDays}
          subtitle="Days attended"
          color="indigo"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
        <StatsCard
          title="Avg. Work Hours"
          value={stats.avgHours}
          subtitle="Per day"
          color="green"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="This Week"
          value={stats.thisWeek}
          subtitle="Days present"
          color="amber"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
        />
        <StatsCard
          title="On Time"
          value={`${stats.onTime}`}
          subtitle="Complete days"
          color="blue"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Today's Status & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Status */}
        <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Today&apos;s Status</h2>
          <div className="mt-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.status}
            </span>
            <p className="mt-3 text-sm text-slate-500">{statusInfo.message}</p>

            {todayRecords.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 max-h-48 overflow-y-auto">
                {todayRecords.map((record, index) => (
                  <div key={record.id} className="space-y-2">
                    {index > 0 && <div className="border-t border-slate-100 pt-2" />}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Session {todayRecords.length - index}</span>
                      {!record.checkOutTime && <span className="text-emerald-600 font-medium">Active</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">In</span>
                      <span className="text-sm font-medium text-emerald-600">{formatTime(record.checkInTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Out</span>
                      <span className="text-sm font-medium text-red-600">
                        {record.checkOutTime ? formatTime(record.checkOutTime) : '--:--'}
                      </span>
                    </div>
                    {record.checkOutTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Duration</span>
                        <span className="text-sm font-medium text-indigo-600">
                          {calculateDuration(record.checkInTime, record.checkOutTime)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/scan"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {todayRecords.length === 0 ? 'Check In' : openRecord ? 'Check Out' : 'Check In Again'}
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Recent Activity</h2>
            <span className="text-xs sm:text-sm text-slate-500">Last 7 days</span>
          </div>
          <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Check In</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Check Out</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Duration</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 7).map((record) => (
                  <tr key={record.id}>
                    <td className="py-3 text-sm text-slate-900">{formatDate(record.date)}</td>
                    <td className="py-3 text-sm text-emerald-600">{formatTime(record.checkInTime)}</td>
                    <td className="py-3 text-sm text-red-600">
                      {record.checkOutTime ? formatTime(record.checkOutTime) : '-'}
                    </td>
                    <td className="py-3 text-sm text-slate-600">
                      {calculateDuration(record.checkInTime, record.checkOutTime)}
                    </td>
                    <td className="py-3">
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        const isToday = record.date === today;
                        if (record.checkOutTime) {
                          return (
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                              Complete
                            </span>
                          );
                        } else if (isToday) {
                          return (
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                              In Progress
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                              Incomplete
                            </span>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      No attendance records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
