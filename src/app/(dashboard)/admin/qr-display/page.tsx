'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import QRCodeDisplay from '@/components/QRCodeDisplay';

export default function QRDisplayPage() {
  const { user, token } = useAuth();
  const [qrToken, setQrToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchQRToken = async () => {
    try {
      const response = await fetch('/api/qr/generate', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setQrToken(data.token);
        setLastRefresh(new Date());
        setError('');
      } else {
        setError('Failed to generate QR code');
      }
    } catch (err) {
      console.error('QR generation error:', err);
      setError('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchQRToken();
    }
  }, [token]);

  useEffect(() => {
    const interval = setInterval(fetchQRToken, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-xl bg-red-50 p-8 text-center">
          <p className="text-red-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">TimeTrack</span>
          </div>
          <p className="mb-8 text-lg text-slate-400">Scan to Check In / Check Out</p>

          {isLoading ? (
            <div className="flex h-96 w-96 items-center justify-center rounded-2xl bg-white">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="flex h-96 w-96 flex-col items-center justify-center rounded-2xl bg-white p-8">
              <p className="text-red-600">{error}</p>
              <button onClick={fetchQRToken} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white">
                Retry
              </button>
            </div>
          ) : (
            <QRCodeDisplay token={qrToken} size={350} />
          )}

          <p className="mt-6 text-sm text-slate-500">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
          <button
            onClick={toggleFullscreen}
            className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
          >
            Exit Fullscreen (ESC)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR Code Display</h1>
          <p className="mt-1 text-slate-500">Display this QR code for employees to scan</p>
        </div>
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          Enter Kiosk Mode
        </button>
      </div>

      {/* QR Code Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex h-80 w-80 items-center justify-center rounded-xl bg-slate-100">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="flex h-80 w-80 flex-col items-center justify-center rounded-xl bg-red-50 p-8 text-center">
              <svg className="mb-4 h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchQRToken}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <QRCodeDisplay token={qrToken} size={300} />
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </p>
            <button
              onClick={fetchQRToken}
              className="mt-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Refresh QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
        <h3 className="text-sm font-medium text-slate-900">Instructions</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">1</span>
            Click &quot;Enter Kiosk Mode&quot; to display the QR code in fullscreen
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">2</span>
            Display this screen on a monitor or tablet at the office entrance
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">3</span>
            Employees scan the QR code with their phones to check in/out
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">4</span>
            The QR code automatically refreshes every 12 hours
          </li>
        </ul>
      </div>
    </div>
  );
}
