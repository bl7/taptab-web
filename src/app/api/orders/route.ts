import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/pg';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user has permission to view orders
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'KITCHEN'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Build query based on user role
    let sql = `
      SELECT 
        o.id,
        o.order_number as "orderNumber",
        o.table_number as "tableNumber",
        o.total_amount as "totalAmount",
        o.final_amount as "finalAmount",
        o.status,
        o.customer_name as "customerName",
        o.customer_phone as "customerPhone",
        o.created_at as "createdAt",
        o.updated_at as "updatedAt",
        json_agg(
          json_build_object(
            'id', oi.id,
            'menuItemId', oi.menu_item_id,
            'menuItemName', mi.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'total', oi.total,
            'notes', oi.notes
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    `;

    const params: string[] = [];

    // Filter by tenant for non-super admins
    if (decoded.role !== 'SUPER_ADMIN') {
      sql += ' WHERE o.tenant_id = $1';
      params.push(decoded.tenantId);
    }

    sql += `
      GROUP BY o.id, o.order_number, o.table_number, o.total_amount, o.final_amount, o.status, o.customer_name, o.customer_phone, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
      LIMIT 100
    `;

    const result = await pool.query(sql, params);
    
    // Transform the result to match the expected format
    const orders = result.rows.map((row: {
      id: string;
      orderNumber: string;
      tableNumber: string;
      totalAmount: string;
      finalAmount: string;
      status: string;
      customerName: string;
      customerPhone: string;
      items: unknown[];
      createdAt: string;
      updatedAt: string;
    }) => ({
      id: row.id,
      orderNumber: row.orderNumber,
      tableNumber: row.tableNumber,
      totalAmount: parseFloat(row.totalAmount),
      finalAmount: parseFloat(row.finalAmount),
      status: row.status,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      items: row.items || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));

    return NextResponse.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user has permission to create orders
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'CASHIER'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tableNumber, items, customerName, customerPhone } = body;

    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Calculate totals
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
    }

    // Insert order
    const orderSql = `
      INSERT INTO orders (
        order_number, table_number, total_amount, final_amount, status,
        customer_name, customer_phone, tenant_id, created_at, updated_at
      ) VALUES (
        'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0'),
        $1, $2, $2, 'PENDING', $3, $4, $5, now(), now()
      ) RETURNING id, order_number
    `;

    const orderParams = [
      tableNumber,
      totalAmount,
      customerName || 'Walk-in Customer',
      customerPhone || '',
      decoded.role === 'SUPER_ADMIN' ? 'default' : decoded.tenantId
    ];

    const orderResult = await pool.query(orderSql, orderParams);
    const orderId = orderResult.rows[0].id;
    const orderNumber = orderResult.rows[0].order_number;

    // Insert order items
    for (const item of items) {
      const itemSql = `
        INSERT INTO order_items (
          order_id, menu_item_id, quantity, price, total, notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const itemTotal = item.price * item.quantity;
      const itemParams = [
        orderId,
        item.menuItemId,
        item.quantity,
        item.price,
        itemTotal,
        item.notes || ''
      ];

      await pool.query(itemSql, itemParams);
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 