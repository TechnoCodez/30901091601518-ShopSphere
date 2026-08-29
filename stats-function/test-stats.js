require('dotenv').config();
const handler = require('./api/stats.js');

const mockRes = {
  status: (code) => ({
    json: (data) => console.log(`Status ${code}:`, JSON.stringify(data, null, 2))
  })
};

handler({}, mockRes);