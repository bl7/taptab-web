import QRCode from 'qrcode';

export interface TableQRData {
  tableId: string;
  tableNumber: string;
  tenantId: string;
  tenantSlug: string;
}

export const generateTableQRCode = async (data: TableQRData): Promise<string> => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderUrl = `${baseUrl}/order/${data.tenantSlug}/${data.tableNumber}`;
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(orderUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateTableQRCodeSVG = async (data: TableQRData): Promise<string> => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderUrl = `${baseUrl}/order/${data.tenantSlug}/${data.tableNumber}`;
  
  try {
    const qrCodeSVG = await QRCode.toString(orderUrl, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
};

export const generateTableQRCodeBuffer = async (data: TableQRData): Promise<Buffer> => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderUrl = `${baseUrl}/order/${data.tenantSlug}/${data.tableNumber}`;
  
  try {
    const qrCodeBuffer = await QRCode.toBuffer(orderUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeBuffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}; 