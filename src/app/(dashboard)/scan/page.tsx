'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import QRScanner from '@/components/QRScanner';
import { Attendance } from '@/types';

export default function ScanPage() {
  const { token } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchTodayStatus();
    }
  }, [token]);

  const fetchTodayStatus = async () => {
    try {
      const response = await fetch('/api/attendance/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const today = new Date().toISOString().split('T')[0];
        const todayRec = data.records.find((r: Attendance) => r.date === today);
        setTodayRecord(todayRec || null);
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
      const endpoint = !todayRecord
        ? '/api/attendance/check-in'
        : '/api/attendance/check-out';

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
        setMessage({
          type: 'success',
          text: data.message || 'Attendance recorded successfully!',
        });
        await fetchTodayStatus();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to record attendance',
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: string) => {
    setMessage({
      type: 'error',
      text: error,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const isCompleted = todayRecord?.checkOutTime;
  const actionType = !todayRecord ? 'Check In' : 'Check Out';

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
          <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isCompleted ? 'Day Complete' : `Scan to ${actionType}`}
        </h1>
        <p className="mt-2 text-slate-500">
          {isCompleted
            ? "You've completed your attendance for today"
            : 'Point your camera at the QR code displayed in the office'}
        </p>
      </div>

      {/* Status Card */}
      {todayRecord && (
        <div className={`mb-6 rounded-xl p-4 ${
          todayRecord.checkOutTime ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              todayRecord.checkOutTime ? 'bg-emerald-100' : 'bg-blue-100'
            }`}>
              {todayRecord.checkOutTime ? (
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${todayRecord.checkOutTime ? 'text-emerald-700' : 'text-blue-700'}`}>
                {todayRecord.checkOutTime
                  ? 'Attendance Complete'
                  : `Checked in at ${new Date(todayRecord.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
              <p className={`text-xs ${todayRecord.checkOutTime ? 'text-emerald-600' : 'text-blue-600'}`}>
                {todayRecord.checkOutTime
                  ? `${new Date(todayRecord.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(todayRecord.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Scan QR code to check out'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 rounded-xl p-4 ${
          message.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Scanner Card */}
      {!isCompleted && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          {isProcessing ? (
            <div className="flex flex-col items-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 text-sm text-slate-500">Processing your attendance...</p>
            </div>
          ) : (
            <QRScanner onScan={handleScan} onError={handleError} />
          )}
        </div>
      )}

      {/* Completed State */}
      {isCompleted && (
        <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">All Done!</h2>
          <p className="mt-2 text-slate-500">
            You&apos;ve already checked in and out for today.<br />See you tomorrow!
          </p>
        </div>
      )}
    </div>
  );
}
