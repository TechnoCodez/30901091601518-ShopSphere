require('dotenv').config();
const jwt = require('jsonwebtoken');
const generateToken = require('../../src/utils/generateToken');

describe('generateToken utility', () => {
  it('should generate a valid JWT containing the correct user id', () => {
    const fakeUserId = 'abc-123';
    const token = generateToken(fakeUserId);

    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(fakeUserId);
  });
});