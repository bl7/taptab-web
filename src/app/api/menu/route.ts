import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { verifyToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    
    // Get categories and menu items for this tenant
    const categoriesResult = await pool.query(
      'SELECT * FROM categories WHERE "tenantId" = $1 AND "isActive" = true ORDER BY "sortOrder"',
      [decoded.tenantId]
    );
    
    const menuItemsResult = await pool.query(
      'SELECT * FROM "menuItems" WHERE "tenantId" = $1 AND "isActive" = true ORDER BY "sortOrder"',
      [decoded.tenantId]
    );

    const categories = categoriesResult.rows;
    const menuItems = menuItemsResult.rows;

    // Group menu items by category
    const menuWithCategories = categories.map(category => ({
      ...category,
      menuItems: menuItems.filter(item => item.categoryId === category.id)
    }));

    return NextResponse.json(menuWithCategories);
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const body = await request.json();
    const { name, description, price, categoryId } = body;

    const menuItemId = randomUUID();
    
    const result = await pool.query(
      `INSERT INTO "menuItems" (id, name, description, price, "categoryId", "tenantId", "isActive", "sortOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [menuItemId, name, description, price, categoryId, decoded.tenantId, true, 0]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Menu creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 