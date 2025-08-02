'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Download, QrCode } from 'lucide-react';
import { generateTableQRCode, TableQRData } from '@/lib/qr-generator';

interface TableQRCodeProps {
  table: {
    id: string;
    number: string;
    tenantId?: string;
  };
  tenantSlug: string;
  showQR?: boolean;
  onToggle?: () => void;
}

export default function TableQRCode({ table, tenantSlug, showQR = false, onToggle }: TableQRCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateQRCode = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const data: TableQRData = {
        tableId: table.id,
        tableNumber: table.number,
        tenantId: table.tenantId || 'default',
        tenantSlug
      };
      
      const qrCode = await generateTableQRCode(data);
      setQrCodeDataUrl(qrCode);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR code generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [table.id, table.number, table.tenantId, tenantSlug]);

  useEffect(() => {
    if (showQR && !qrCodeDataUrl) {
      generateQRCode();
    }
  }, [showQR, qrCodeDataUrl, generateQRCode]);

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `table-${table.number}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQRCode = async () => {
    if (!qrCodeDataUrl) return;
    
    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">
          Table {table.number} QR Code
        </h3>
        <button
          onClick={onToggle}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <QrCode className="h-5 w-5" />
        </button>
      </div>

      {showQR && (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2 text-black">Generating QR code...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {qrCodeDataUrl && !loading && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Image
                  src={qrCodeDataUrl}
                  alt={`QR Code for Table ${table.number}`}
                  width={300}
                  height={300}
                  className="border border-gray-200 rounded-lg"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={copyQRCode}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              
              <div className="text-xs text-black text-center">
                <p>Scan this QR code to access the ordering page for Table {table.number}</p>
                <p className="mt-1">
                  URL: {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/{tenantSlug}/{table.number}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 