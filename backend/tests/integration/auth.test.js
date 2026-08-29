const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/auth/register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jest Test User',
        email: `jesttest${Date.now()}@example.com`,
        password: 'password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toBe('CUSTOMER');
  });
it('should return 400 if required fields are missing', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'incomplete@example.com' });

  expect(res.statusCode).toBe(400);
});

it('should return 400 if the email is already registered', async () => {
  const email = `duplicate${Date.now()}@example.com`;

  await request(app)
    .post('/api/auth/register')
    .send({ name: 'First', email, password: 'password123' });

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Second', email, password: 'password123' });

  expect(res.statusCode).toBe(400);
});
});

const prisma = require('../../src/config/prismaClient');

afterAll(async () => {
  await prisma.$disconnect();
});