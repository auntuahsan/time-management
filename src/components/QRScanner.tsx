'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Camera is not supported on this browser. Please use Safari or Chrome.');
        return false;
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());

      return true;
    } catch (err) {
      console.error('Camera permission error:', err);

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('Camera permission denied. Please allow camera access in your browser settings and refresh the page.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setErrorMessage('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setErrorMessage('Camera is being used by another application. Please close other apps using the camera.');
        } else if (err.name === 'OverconstrainedError') {
          setErrorMessage('Camera constraints not satisfied. Trying with different settings...');
          // Try with basic constraints
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
          } catch {
            setErrorMessage('Unable to access camera with any settings.');
          }
        } else {
          setErrorMessage(`Camera error: ${err.message}`);
        }
      }

      return false;
    }
  };

  const startScanner = async () => {
    if (!containerRef.current) return;

    setErrorMessage('');

    // First check/request camera permission
    const hasAccess = await checkCameraPermission();
    if (!hasAccess) {
      setHasPermission(false);
      if (onError) {
        onError(errorMessage || 'Failed to access camera.');
      }
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {} // Ignore QR not found errors
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      console.error('Scanner error:', err);
      setHasPermission(false);

      let message = 'Failed to start camera.';
      if (err instanceof Error) {
        if (err.message.includes('Permission')) {
          message = 'Camera permission denied. Please allow camera access and try again.';
        } else if (err.message.includes('NotFound')) {
          message = 'No camera found. Please ensure your device has a camera.';
        } else {
          message = `Camera error: ${err.message}`;
        }
      }

      setErrorMessage(message);
      if (onError) {
        onError(message);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Scanner Container */}
      <div className="relative w-full">
        {/* Scanner View */}
        <div
          id="qr-reader"
          ref={containerRef}
          className={`w-full rounded-2xl overflow-hidden bg-slate-900 qr-scanner-container ${isScanning ? 'block' : 'hidden'}`}
          style={{ minHeight: isScanning ? '350px' : '0' }}
        />

        {/* Scanning Overlay - Corner Frame Animation */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Animated corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg animate-pulse" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg animate-pulse" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg animate-pulse" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-lg animate-pulse" />

              {/* Scanning line animation */}
              <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan" />
            </div>
          </div>
        )}

        {/* Placeholder when not scanning */}
        {!isScanning && hasPermission !== false && (
          <div className="w-full aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-2xl border-4 border-dashed border-slate-600 flex items-center justify-center">
                <svg className="w-16 h-16 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-indigo-500/30" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-indigo-500/20" />
            </div>
            <p className="text-slate-400 text-center text-sm">
              Tap the button below to activate your camera
            </p>
          </div>
        )}
      </div>

      {/* Permission Error */}
      {hasPermission === false && (
        <div className="w-full mt-6 p-5 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-red-800">Camera Access Required</h4>
              <p className="mt-1 text-sm text-red-600">
                {errorMessage || 'Please allow camera access in your browser settings to scan QR codes.'}
              </p>
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <p className="text-xs text-red-700 font-medium mb-2">On iPhone/iPad:</p>
                <ol className="text-xs text-red-600 space-y-1 list-decimal list-inside">
                  <li>Go to Settings → Safari → Camera</li>
                  <li>Select &quot;Allow&quot;</li>
                  <li>Refresh this page and try again</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 w-full">
        {!isScanning ? (
          <button
            onClick={startScanner}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 active:scale-[0.98]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            Open Camera
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all active:scale-[0.98]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Camera
          </button>
        )}
      </div>

      {/* Scanning Instructions */}
      {isScanning && (
        <div className="mt-4 flex items-center gap-2 text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm">Camera active - Position QR code within the frame</p>
        </div>
      )}

      {/* Custom CSS for scan animation and QR scanner */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }

        /* html5-qrcode library styles */
        #qr-reader {
          width: 100% !important;
          border: none !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: auto !important;
          border-radius: 1rem;
          object-fit: cover;
        }
        #qr-reader__scan_region {
          min-height: 300px;
        }
        #qr-reader__scan_region video {
          border-radius: 1rem;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
        #qr-reader__dashboard_section {
          display: none !important;
        }
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
        #qr-reader__camera_selection {
          display: none !important;
        }
        #qr-reader img {
          display: none !important;
        }
        #qr-reader__scan_region > br {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
