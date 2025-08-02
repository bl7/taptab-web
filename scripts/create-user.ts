import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('🔍 Finding existing tenant...');
    
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.error('❌ No tenant found. Please run setup first.');
      return;
    }
    
    console.log('✅ Found tenant:', tenant.name);

    // Check if super admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@taptab.com' }
    });

    if (existingUser) {
      console.log('✅ Super admin already exists:', existingUser.email);
      console.log('📧 Email: admin@taptab.com');
      console.log('🔑 Password: admin123');
      console.log('🔗 Boss Login: http://localhost:3000/boss/login');
      return;
    }

    // Create a super admin user with password
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
    console.log('🔗 Boss Login: http://localhost:3000/boss/login');
    console.log('🔗 Regular Login: http://localhost:3000/login');
    console.log('\n🚀 Start the development server: npm run dev');

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser(); 