import pool from '../src/lib/pg';
import { randomUUID } from 'crypto';

async function setupMenuData() {
  try {
    console.log('Setting up menu data...');

    // Get the first tenant
    const tenantResult = await pool.query('SELECT * FROM tenants LIMIT 1');
    const tenant = tenantResult.rows[0];

    if (!tenant) {
      console.log('No tenant found. Please create a restaurant account first.');
      return;
    }

    console.log(`Setting up menu for tenant: ${tenant.name}`);

    // Create categories
    const categories = [
      { name: 'Appetizers', sortOrder: 1 },
      { name: 'Main Courses', sortOrder: 2 },
      { name: 'Desserts', sortOrder: 3 },
      { name: 'Beverages', sortOrder: 4 },
    ];

    for (const category of categories) {
      const categoryId = randomUUID();
      await pool.query(
        `INSERT INTO categories (id, name, "sortOrder", "isActive", "tenantId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [categoryId, category.name, category.sortOrder, true, tenant.id]
      );
      console.log(`Created category: ${category.name}`);
    }

    // Get category IDs
    const categoriesResult = await pool.query(
      'SELECT * FROM categories WHERE "tenantId" = $1',
      [tenant.id]
    );

    // Create menu items
    const menuItems = [
      {
        name: 'Spring Rolls',
        description: 'Fresh vegetables wrapped in rice paper',
        price: 8.99,
        categoryId: categoriesResult.rows.find(c => c.name === 'Appetizers')?.id,
      },
      {
        name: 'Chicken Wings',
        description: 'Crispy wings with your choice of sauce',
        price: 12.99,
        categoryId: categoriesResult.rows.find(c => c.name === 'Appetizers')?.id,
      },
      {
        name: 'Grilled Salmon',
        description: 'Fresh salmon with seasonal vegetables',
        price: 24.99,
        categoryId: categoriesResult.rows.find(c => c.name === 'Main Courses')?.id,
      },
      {
        name: 'Beef Stir Fry',
        description: 'Tender beef with mixed vegetables',
        price: 18.99,
        categoryId: categoriesResult.rows.find(c => c.name === 'Main Courses')?.id,
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 9.99,
        categoryId: categoriesResult.rows.find(c => c.name === 'Desserts')?.id,
      },
      {
        name: 'Iced Coffee',
        description: 'Cold brew coffee with cream',
        price: 4.99,
        categoryId: categoriesResult.rows.find(c => c.name === 'Beverages')?.id,
      },
    ];

    for (const item of menuItems) {
      if (item.categoryId) {
        const menuItemId = randomUUID();
        await pool.query(
          `INSERT INTO "menuItems" (id, name, description, price, "categoryId", "tenantId", "isActive", "sortOrder", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [menuItemId, item.name, item.description, item.price, item.categoryId, tenant.id, true, 0]
        );
        console.log(`Created menu item: ${item.name}`);
      }
    }

    console.log('Menu data setup complete!');
  } catch (error) {
    console.error('Error setting up menu data:', error);
  } finally {
    await pool.end();
  }
}

setupMenuData(); 