import { OrderData } from './receipt-printer';

interface ReceiptOptions {
  width?: number; // 56mm in pixels (approximately 264px at 120 DPI)
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  margin?: number;
}

export class ReceiptGenerator {
  private options: ReceiptOptions;

  constructor(options: ReceiptOptions = {}) {
    this.options = {
      width: 264, // 56mm at 120 DPI
      fontSize: 12,
      fontFamily: 'monospace',
      lineHeight: 1.2,
      margin: 10,
      ...options
    };
  }

  async generateReceiptPNG(orderData: OrderData): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas dimensions
        canvas.width = this.options.width!;
        
        // Calculate content height
        const contentHeight = this.calculateContentHeight(orderData);
        canvas.height = contentHeight;

        // Set background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set text properties
        ctx.fillStyle = 'black';
        ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        ctx.textAlign = 'left';

        let y = this.options.margin!;

        // Header
        y = this.drawHeader(ctx, orderData, y);
        
        // Order details
        y = this.drawOrderDetails(ctx, orderData, y);
        
        // Items
        y = this.drawItems(ctx, orderData, y);
        
        // Footer
        this.drawFooter(ctx, orderData, y);

        // Convert to base64
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    });
  }

  private calculateContentHeight(orderData: OrderData): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;
    const margin = this.options.margin!;
    
    let height = margin * 2; // Top and bottom margins
    
    // Header (restaurant name, date, order number)
    height += lineHeight * 3;
    
    // Order details (table, customer)
    height += lineHeight * 2;
    
    // Items
    height += orderData.items.length * lineHeight * 2; // Each item takes 2 lines
    
    // Separator
    height += lineHeight;
    
    // Total
    height += lineHeight * 2;
    
    // Footer
    height += lineHeight * 2;
    
    return height;
  }

  private drawHeader(ctx: CanvasRenderingContext2D, orderData: OrderData, y: number): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;
    
    // Restaurant name
    ctx.font = `bold ${this.options.fontSize! + 2}px ${this.options.fontFamily}`;
    ctx.fillText('TapTab Restaurant', this.options.margin!, y);
    y += lineHeight;
    
    // Date and time
    ctx.font = `${this.options.fontSize!}px ${this.options.fontFamily}`;
    const date = new Date(orderData.createdAt).toLocaleString();
    ctx.fillText(date, this.options.margin!, y);
    y += lineHeight;
    
    // Order number
    ctx.fillText(`Order: ${orderData.orderNumber}`, this.options.margin!, y);
    y += lineHeight;
    
    return y;
  }

  private drawOrderDetails(ctx: CanvasRenderingContext2D, orderData: OrderData, y: number): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;
    
    // Table number
    ctx.fillText(`Table: ${orderData.tableNumber}`, this.options.margin!, y);
    y += lineHeight;
    
    // Customer info (if available)
    if (orderData.customerName) {
      ctx.fillText(`Customer: ${orderData.customerName}`, this.options.margin!, y);
      y += lineHeight;
    }
    
    return y;
  }

  private drawItems(ctx: CanvasRenderingContext2D, orderData: OrderData, y: number): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;
    
    // Items header
    ctx.fillText('Items:', this.options.margin!, y);
    y += lineHeight;
    
    // Draw each item
    orderData.items.forEach(item => {
      // Item name and quantity
      const itemText = `${item.menuItemName} x${item.quantity}`;
      ctx.fillText(itemText, this.options.margin!, y);
      y += lineHeight;
      
      // Item price and total
      const priceText = `$${item.price.toFixed(2)} each - $${item.total.toFixed(2)}`;
      ctx.fillText(priceText, this.options.margin! + 20, y);
      y += lineHeight;
      
      // Notes (if any)
      if (item.notes) {
        const notesText = `Note: ${item.notes}`;
        ctx.fillText(notesText, this.options.margin! + 20, y);
        y += lineHeight;
      }
    });
    
    return y;
  }

  private drawFooter(ctx: CanvasRenderingContext2D, orderData: OrderData, y: number): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;
    
    // Separator line
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.options.margin!, y);
    ctx.lineTo(this.options.width! - this.options.margin!, y);
    ctx.stroke();
    y += lineHeight;
    
    // Total
    ctx.font = `bold ${this.options.fontSize! + 2}px ${this.options.fontFamily}`;
    ctx.fillText(`Total: $${orderData.finalAmount.toFixed(2)}`, this.options.margin!, y);
    y += lineHeight;
    
    // Thank you message
    ctx.font = `${this.options.fontSize!}px ${this.options.fontFamily}`;
    ctx.fillText('Thank you for your order!', this.options.margin!, y);
    y += lineHeight;
    
    return y;
  }

  // Convert base64 data URL to just the base64 string (remove data:image/png;base64,)
  static getBase64FromDataURL(dataURL: string): string {
    return dataURL.replace('data:image/png;base64,', '');
  }
} 