import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:5000/api/auth/login', async ({ request }) => {
    const body = await request.json();

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json(
        {
          id: 'fake-id-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'CUSTOMER',
          token: 'fake-jwt-token',
        },
        { status: 200 }
      );
    }

    return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }),
];