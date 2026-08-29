const express = require('express');
const cors = require('cors');
const connectMongo = require('./config/mongoClient');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

connectMongo();

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/reviews', require('./routes/reviewRoutes'));

module.exports = app;