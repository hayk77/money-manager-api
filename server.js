const express = require('express');
const app = express();

const connectDB = require('./config/db');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

const PORT = process.env.PORT || 5000;
connectDB();
app.use(express.json({ extended: false }));

app.use('/users', userRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => console.log(`start server: ${PORT}`));
