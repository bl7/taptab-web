import { OrderData, OrderChanges } from './receipt-printer';

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

  async generateReceiptPNG(orderData: OrderData, changes?: OrderChanges): Promise<string> {
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
        const contentHeight = this.calculateContentHeight(orderData, changes);
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
        y = this.drawHeader(ctx, orderData, y, changes);
        
        // Order details
        y = this.drawOrderDetails(ctx, orderData, y);
        
        // Changes section (for modified orders)
        if (changes) {
          y = this.drawChanges(ctx, changes, y);
        }
        
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

  private calculateContentHeight(orderData: OrderData, changes?: OrderChanges): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;
    const margin = this.options.margin!;
    
    let height = margin * 2; // Top and bottom margins
    
    // Header (restaurant name, date, order number)
    height += lineHeight * 3;
    
    // Order details (table, waiter, customer)
    height += lineHeight * 2; // Base for table and customer
    if (orderData.waiterName || orderData.sourceDetails) {
      height += lineHeight; // Additional line for waiter
    }

    // Changes section (if changes exist)
    if (changes) {
      height += lineHeight * 2; // Title and separator
      const totalChanges = (changes.addedItems?.length || 0) + (changes.removedItems?.length || 0) + (changes.modifiedItems?.length || 0);
      height += totalChanges * lineHeight * 2; // Each change takes 2 lines
    }
    
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

  private drawHeader(ctx: CanvasRenderingContext2D, orderData: OrderData, y: number, changes?: OrderChanges): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;
    
    // Restaurant name (centered)
    ctx.font = `bold ${this.options.fontSize! + 4}px ${this.options.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('RESTAURANT NAME', this.options.width! / 2, y);
    y += lineHeight;
    
    // Date and time
    ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
    ctx.textAlign = 'left';
    const now = new Date();
    ctx.fillText(`Date: ${now.toLocaleDateString()}`, this.options.margin!, y);
    y += lineHeight;
    
    // Order number
    ctx.fillText(`Order: ${orderData.orderNumber}`, this.options.margin!, y);
    y += lineHeight;

    // Changes header (if changes exist)
    if (changes) {
      ctx.font = `bold ${this.options.fontSize! + 2}px ${this.options.fontFamily}`;
      ctx.fillText('MODIFIED ORDER', this.options.margin!, y);
      y += lineHeight;
    }
    
    return y;
  }

  private drawOrderDetails(ctx: CanvasRenderingContext2D, orderData: OrderData, y: number): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;
    
    // Table number
    ctx.fillText(`Table: ${orderData.tableNumber}`, this.options.margin!, y);
    y += lineHeight;
    
    // Waiter info (if available)
    if (orderData.waiterName || orderData.sourceDetails) {
      ctx.fillText(`Waiter: ${orderData.waiterName || orderData.sourceDetails}`, this.options.margin!, y);
      y += lineHeight;
    }
    
    // Customer info (if available)
    if (orderData.customerName) {
      ctx.fillText(`Customer: ${orderData.customerName}`, this.options.margin!, y);
      y += lineHeight;
    }
    
    return y;
  }

  private drawChanges(ctx: CanvasRenderingContext2D, changes: OrderChanges, y: number): number {
    const lineHeight = this.options.fontSize! * this.options.lineHeight!;

    // Separator line
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.options.margin!, y);
    ctx.lineTo(this.options.width! - this.options.margin!, y);
    ctx.stroke();
    y += lineHeight;

    // Changes header
    ctx.font = `bold ${this.options.fontSize! + 2}px ${this.options.fontFamily}`;
    ctx.fillText('Changes:', this.options.margin!, y);
    y += lineHeight;

    // Draw added items
    if (changes.addedItems && changes.addedItems.length > 0) {
      ctx.font = `bold ${this.options.fontSize!}px ${this.options.fontFamily}`;
      ctx.fillText('Added:', this.options.margin!, y);
      y += lineHeight;
      
      changes.addedItems.forEach(item => {
        const itemText = `+ ${item.name} x${item.quantity}`;
        ctx.font = `${this.options.fontSize!}px ${this.options.fontFamily}`;
        ctx.fillText(itemText, this.options.margin! + 10, y);
        y += lineHeight;
        
        const priceText = `$${(item.price || 0).toFixed(2)} each`;
        ctx.fillText(priceText, this.options.margin! + 20, y);
        y += lineHeight;
      });
    }

    // Draw removed items
    if (changes.removedItems && changes.removedItems.length > 0) {
      ctx.font = `bold ${this.options.fontSize!}px ${this.options.fontFamily}`;
      ctx.fillText('Removed:', this.options.margin!, y);
      y += lineHeight;
      
      changes.removedItems.forEach(item => {
        const itemText = `- ${item.name} x${item.quantity}`;
        ctx.font = `${this.options.fontSize!}px ${this.options.fontFamily}`;
        ctx.fillText(itemText, this.options.margin! + 10, y);
        y += lineHeight;
        
        const priceText = `$${(item.price || 0).toFixed(2)} each`;
        ctx.fillText(priceText, this.options.margin! + 20, y);
        y += lineHeight;
      });
    }

    // Draw modified items
    if (changes.modifiedItems && changes.modifiedItems.length > 0) {
      ctx.font = `bold ${this.options.fontSize!}px ${this.options.fontFamily}`;
      ctx.fillText('Modified:', this.options.margin!, y);
      y += lineHeight;
      
      changes.modifiedItems.forEach(item => {
        const itemText = `* ${item.name} ${item.oldQuantity}→${item.newQuantity}`;
        ctx.font = `${this.options.fontSize!}px ${this.options.fontFamily}`;
        ctx.fillText(itemText, this.options.margin! + 10, y);
        y += lineHeight;
        
        const priceText = `$${(item.price || 0).toFixed(2)} each`;
        ctx.fillText(priceText, this.options.margin! + 20, y);
        y += lineHeight;
      });
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
      const priceText = `$${(item.price || 0).toFixed(2)} each - $${(item.total || 0).toFixed(2)}`;
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
    const totalAmount = (orderData as OrderData & { total?: number }).total || orderData.finalAmount || 0;
    ctx.fillText(`Total: $${totalAmount.toFixed(2)}`, this.options.margin!, y);
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

  // Get receipt width
  getWidth(): number {
    return this.options.width!;
  }

  // Get receipt height for a specific order
  getHeight(orderData: OrderData, changes?: OrderChanges): number {
    return this.calculateContentHeight(orderData, changes);
  }
} 