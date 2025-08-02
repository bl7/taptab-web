import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { sendWelcomeEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantName,
      restaurantSlug,
      restaurantAddress,
      restaurantPhone,
      firstName,
      lastName,
      email,
    } = body;

    // Validate required fields
    if (!restaurantName || !restaurantSlug || !firstName || !lastName || !email) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if tenant slug already exists
    const existingTenantResult = await pool.query('SELECT * FROM tenants WHERE slug = $1', [restaurantSlug]);
    const existingTenant = existingTenantResult.rows[0];

    if (existingTenant) {
      return NextResponse.json(
        { message: 'Restaurant slug already exists' },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUserResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const existingUser = existingUserResult.rows[0];

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate IDs for tenant and user
    const tenantId = randomUUID();
    const userId = randomUUID();

    // Create tenant (restaurant)
    const tenantResult = await pool.query(
      `INSERT INTO tenants (id, name, slug, logo, "primaryColor", "secondaryColor", address, phone, email, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [
        tenantId,               // id
        restaurantName,         // name
        restaurantSlug,         // slug
        '',                     // logo (empty for now)
        '#667eea',             // primaryColor
        '#764ba2',             // secondaryColor
        restaurantAddress || '', // address
        restaurantPhone || '',   // phone
        email,                  // email (admin email becomes restaurant contact)
        true,                   // isActive
      ]
    );
    const tenant = tenantResult.rows[0];

    // Create admin user for this restaurant
    const userResult = await pool.query(
      `INSERT INTO users (id, email, password, "firstName", "lastName", role, "tenantId", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        userId,                 // id
        email,                  // email
        null,                   // password (OTP-based auth)
        firstName,              // firstName
        lastName,               // lastName
        'TENANT_ADMIN',         // role
        tenantId,               // tenantId
        true,                   // isActive
      ]
    );
    const user = userResult.rows[0];

    // Send welcome email
    try {
      await sendWelcomeEmail(email, `${firstName} ${lastName}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the signup if email fails
    }

    return NextResponse.json(
      { 
        message: 'Restaurant account created successfully',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Failed to create restaurant account' },
      { status: 500 }
    );
  }
} 