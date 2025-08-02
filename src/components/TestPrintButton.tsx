'use client';

import React from 'react';
import { usePrintBridgeContext } from '@/contexts/PrintBridgeContext';
import { ReceiptGenerator } from '@/lib/receipt-generator';

export const TestPrintButton: React.FC = () => {
  const { isConnected, sendPrintJob } = usePrintBridgeContext();

  const testPrint = async () => {
    if (!isConnected) {
      alert('PrintBridge not connected. Make sure the server is running on localhost:8080');
      return;
    }

    try {
      // Create test order data
      const testOrder = {
        id: 'test_order_123',
        orderNumber: 'TEST-001',
        tableNumber: '5',
        totalAmount: 25.50,
        finalAmount: 25.50,
        status: 'PENDING',
        customerName: 'Test Customer',
        customerPhone: '1234567890',
        items: [
          {
            id: 'test_item_1',
            menuItemId: 'item_1',
            menuItemName: 'Burger',
            quantity: 2,
            price: 12.75,
            total: 25.50,
            notes: 'No onions please'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Generate receipt PNG
      const receiptGenerator = new ReceiptGenerator();
      const receiptDataURL = await receiptGenerator.generateReceiptPNG(testOrder);
      
      // Send to PrintBridge
      const success = sendPrintJob(receiptDataURL);
      
      if (success) {
        console.log('✅ Test print job sent successfully');
        alert('Test print job sent! Check your printer.');
      } else {
        console.error('❌ Failed to send test print job');
        alert('Failed to send print job. Check console for details.');
      }
    } catch (error) {
      console.error('❌ Error testing print:', error);
      alert('Error testing print. Check console for details.');
    }
  };

  return (
    <button
      onClick={testPrint}
      disabled={!isConnected}
      className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
        isConnected 
          ? 'bg-blue-500 hover:bg-blue-600' 
          : 'bg-gray-400 cursor-not-allowed'
      }`}
    >
      {isConnected ? '🖨️ Test Print' : '❌ PrintBridge Offline'}
    </button>
  );
}; 