'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  token: string;
  size?: number;
}

export default function QRCodeDisplay({ token, size = 400 }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(token, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR generation error:', err);
        setError('Failed to generate QR code');
      }
    };

    if (token) {
      generateQR();
    }
  }, [token, size]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-100 rounded-lg p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8" style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
      <img src={qrDataUrl} alt="QR Code for Attendance" width={size} height={size} />
    </div>
  );
}
