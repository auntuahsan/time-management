'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">TimeTrack</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 mb-6">
              <span className="text-sm font-medium text-indigo-600">Simple Time Tracking</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight">
              Track Attendance
              <br />
              <span className="text-indigo-600">Effortlessly</span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
              A modern QR-based attendance system. Employees scan, admins manage,
              everyone saves time.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-600/40"
              >
                Start Free
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-32 grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">QR Code Scanning</h3>
              <p className="mt-2 text-slate-600">
                Employees simply scan a QR code displayed in the office to check in or out. No apps needed.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Real-time Tracking</h3>
              <p className="mt-2 text-slate-600">
                See who&apos;s in the office right now. Track work hours automatically with precise timestamps.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Excel Reports</h3>
              <p className="mt-2 text-slate-600">
                Export attendance data to Excel with one click. Perfect for payroll and compliance.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-32">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
              <p className="mt-4 text-lg text-slate-600">Three simple steps to modernize your attendance</p>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                  1
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">Display QR Code</h3>
                <p className="mt-2 text-slate-600">
                  Admin displays the QR code on a screen or tablet at the office entrance
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                  2
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">Employees Scan</h3>
                <p className="mt-2 text-slate-600">
                  Employees scan the QR code with their phone&apos;s camera to check in or out
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">Track & Export</h3>
                <p className="mt-2 text-slate-600">
                  View attendance in real-time and export reports whenever you need
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900">TimeTrack</span>
              </div>
              <p className="text-sm text-slate-500">
                Powered by{' '}
                <a href="https://auntu.com" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-700">
                  auntu.com
                </a>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
