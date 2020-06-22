const express = require('express');
const app = express();

const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const categoryRoutes = require('./routes/categories');

const PORT = process.env.PORT || 5000;
connectDB();
app.use(express.json({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/accounts', accountRoutes);
app.use('/categories', categoryRoutes);

app.listen(PORT, () => console.log(`start server: ${PORT}`));
