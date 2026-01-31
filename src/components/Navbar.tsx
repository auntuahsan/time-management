'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              TimeTrack
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/scan"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Scan QR
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/qr-display"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    QR Display
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="md:hidden border-t">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/scan"
            className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
          >
            Scan QR
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link
                href="/admin"
                className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
              >
                Admin
              </Link>
              <Link
                href="/admin/qr-display"
                className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
              >
                QR Display
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
