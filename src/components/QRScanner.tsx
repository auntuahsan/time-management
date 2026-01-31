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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {
          // QR code scanning in progress
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      console.error('Scanner error:', err);
      setHasPermission(false);
      if (onError) {
        onError('Failed to start camera. Please ensure camera permissions are granted.');
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
    <div className="flex flex-col items-center">
      <div
        id="qr-reader"
        ref={containerRef}
        className="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden"
        style={{ minHeight: isScanning ? '300px' : '0' }}
      />

      {hasPermission === false && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
          <p className="font-medium">Camera access denied</p>
          <p className="text-sm mt-1">
            Please allow camera access in your browser settings to scan QR codes.
          </p>
        </div>
      )}

      <div className="mt-4">
        {!isScanning ? (
          <button
            onClick={startScanner}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Start Scanner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {isScanning && (
        <p className="mt-4 text-gray-600 text-center">
          Point your camera at the QR code to scan
        </p>
      )}
    </div>
  );
}
