const { PrismaClient } = require('../src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      { name: 'Admin User', email: 'admin@example.com', password: hashedPassword, role: 'ADMIN' },
      { name: 'Customer User', email: 'customer@example.com', password: hashedPassword, role: 'CUSTOMER' },
    ],
  });

  const electronics = await prisma.category.create({ data: { name: 'Electronics' } });
  const clothing = await prisma.category.create({ data: { name: 'Clothing' } });

  await prisma.product.createMany({
    data: [
      {
        name: 'Wireless Headphones',
        description: 'Noise cancelling over-ear headphones',
        price: 99.99,
        stock: 50,
        imageUrl: 'https://via.placeholder.com/150',
        categoryId: electronics.id,
      },
      {
        name: 'Cotton T-Shirt',
        description: '100% organic cotton graphic tee',
        price: 19.99,
        stock: 100,
        imageUrl: 'https://via.placeholder.com/150',
        categoryId: clothing.id,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });