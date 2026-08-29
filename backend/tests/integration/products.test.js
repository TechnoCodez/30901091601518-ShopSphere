const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/prismaClient');

describe('GET /api/products', () => {
  it('should return a list of products with pagination info', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.products)).toBe(true);
  });
});

describe('POST /api/products', () => {
  it('should reject product creation without a token', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: 'Unauthorized Product',
        description: 'Should not be created',
        price: 10,
        category: 'Test',
        stock: 5,
      });

    expect(res.statusCode).toBe(401);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});