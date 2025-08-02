import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Taptab POS database...');

    // Create a default tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Demo Restaurant',
        slug: 'demo-restaurant',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
      },
    });

    console.log('✅ Created default tenant:', tenant.name);

    // Create a super admin user
    const hashedPassword = await hashPassword('admin123');
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@taptab.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        tenantId: tenant.id,
        isActive: true,
      },
    });

    console.log('✅ Created super admin user:', superAdmin.email);
    console.log('📧 Email: admin@taptab.com');
    console.log('🔑 Password: admin123');

    // Create some sample categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Appetizers',
          sortOrder: 1,
          tenantId: tenant.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Main Course',
          sortOrder: 2,
          tenantId: tenant.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Desserts',
          sortOrder: 3,
          tenantId: tenant.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Beverages',
          sortOrder: 4,
          tenantId: tenant.id,
        },
      }),
    ]);

    console.log('✅ Created sample categories:', categories.map(c => c.name).join(', '));

    // Create some sample menu items
    const menuItems = await Promise.all([
      prisma.menuItem.create({
        data: {
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with caesar dressing',
          price: 12.99,
          categoryId: categories[0].id, // Appetizers
          tenantId: tenant.id,
          sortOrder: 1,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: 'Grilled Chicken',
          description: 'Grilled chicken breast with herbs',
          price: 24.99,
          categoryId: categories[1].id, // Main Course
          tenantId: tenant.id,
          sortOrder: 1,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: 'Chocolate Cake',
          description: 'Rich chocolate cake with ganache',
          price: 8.99,
          categoryId: categories[2].id, // Desserts
          tenantId: tenant.id,
          sortOrder: 1,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: 'Iced Coffee',
          description: 'Cold brewed coffee with cream',
          price: 4.99,
          categoryId: categories[3].id, // Beverages
          tenantId: tenant.id,
          sortOrder: 1,
        },
      }),
    ]);

    console.log('✅ Created sample menu items:', menuItems.map(m => m.name).join(', '));

    console.log('\n🎉 Database setup complete!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@taptab.com');
    console.log('   Password: admin123');
    console.log('\n🔗 Start the development server: npm run dev');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase(); 