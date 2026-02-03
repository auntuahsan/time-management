'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import QRScanner from '@/components/QRScanner';
import { Attendance } from '@/types';

export default function ScanPage() {
  const { token, user } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (token) {
      fetchTodayStatus();
    }
  }, [token]);

  const fetchTodayStatus = async () => {
    try {
      const response = await fetch('/api/attendance/history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const today = new Date().toISOString().split('T')[0];
        // Find the latest open record (no checkout) for today
        const openRecord = data.records.find((r: Attendance) => r.date === today && !r.checkOutTime);
        // If no open record, check if there's any record today (for display purposes)
        const latestTodayRecord = data.records.find((r: Attendance) => r.date === today);
        setTodayRecord(openRecord || latestTodayRecord || null);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (qrData: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      // Check if there's an open check-in (no checkout yet)
      const hasOpenCheckin = todayRecord && !todayRecord.checkOutTime;
      const endpoint = hasOpenCheckin ? '/api/attendance/check-out' : '/api/attendance/check-in';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrToken: qrData }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Attendance recorded successfully!' });
        await fetchTodayStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to record attendance' });
      }
    } catch (error) {
      console.error('Scan error:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: string) => {
    setMessage({ type: 'error', text: error });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const calculateDuration = (checkIn: Date | string, checkOut?: Date | string | null) => {
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // User is currently checked in if there's an open record (no checkout)
  const isCheckedIn = todayRecord && !todayRecord.checkOutTime;
  // No longer have "completed" state - user can always check in again after checkout

  return (
    <div className="min-h-full">
      {/* Hero Section with Time */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 mb-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back,</p>
              <h1 className="text-3xl font-bold text-white mb-2">{user?.username}</h1>
              <p className="text-indigo-200">{formatDate(currentTime)}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-indigo-200 text-sm mb-1">Current Time</p>
              <p className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tight">
                {formatTime(currentTime)}
              </p>
            </div>
          </div>

          {/* Status Pills */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              isCheckedIn
                ? 'bg-blue-500/20 text-blue-100'
                : 'bg-white/20 text-white'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isCheckedIn ? 'bg-blue-400 animate-pulse' : 'bg-white/60'
              }`} />
              {isCheckedIn ? 'Currently Working' : 'Ready to Check In'}
            </div>
            {isCheckedIn && todayRecord && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {calculateDuration(todayRecord.checkInTime, todayRecord.checkOutTime)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Scanner */}
        <div className="lg:col-span-2">
          {/* Message Alert */}
          {message && (
            <div className={`mb-6 rounded-2xl p-5 ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className={`font-semibold ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                    {message.type === 'success' ? 'Success!' : 'Error'}
                  </h4>
                  <p className={`mt-1 text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scanner Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCheckedIn ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <svg className={`w-5 h-5 ${isCheckedIn ? 'text-red-600' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {isCheckedIn ? 'Check Out' : 'Check In'}
                </h2>
                <p className="text-sm text-slate-500">Scan the office QR code</p>
              </div>
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
                <p className="mt-6 text-slate-600 font-medium">Processing your attendance...</p>
                <p className="mt-1 text-sm text-slate-400">Please wait a moment</p>
              </div>
            ) : (
              <QRScanner onScan={handleScan} onError={handleError} />
            )}
          </div>
        </div>

        {/* Right Column - Today's Info */}
        <div className="space-y-6">
          {/* Today's Attendance Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Today&apos;s Attendance
            </h3>

            {todayRecord ? (
              <div className="space-y-4">
                {/* Check In */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Check In</p>
                    <p className="text-xl font-bold text-slate-900">
                      {new Date(todayRecord.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-slate-200" />

                {/* Check Out */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    todayRecord.checkOutTime ? 'bg-red-100' : 'bg-slate-100'
                  }`}>
                    <svg className={`w-6 h-6 ${todayRecord.checkOutTime ? 'text-red-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Check Out</p>
                    <p className={`text-xl font-bold ${todayRecord.checkOutTime ? 'text-slate-900' : 'text-slate-300'}`}>
                      {todayRecord.checkOutTime
                        ? new Date(todayRecord.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                {todayRecord.checkOutTime && (
                  <>
                    <div className="border-t border-dashed border-slate-200" />
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Total Duration</p>
                        <p className="text-xl font-bold text-indigo-600">
                          {calculateDuration(todayRecord.checkInTime, todayRecord.checkOutTime)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">No attendance yet</p>
                <p className="text-sm text-slate-400 mt-1">Scan QR code to check in</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              How to Scan
            </h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-sm text-slate-600">Click &quot;Open Camera&quot; button</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-sm text-slate-600">Allow camera permission if prompted</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">3</span>
                <span className="text-sm text-slate-600">Point camera at the office QR code</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">4</span>
                <span className="text-sm text-slate-600">Wait for automatic detection</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
