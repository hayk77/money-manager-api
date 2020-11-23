const express = require('express');
// const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const categoryRoutes = require('./routes/categories');
const recordRoutes = require('./routes/records');

const app = express();

connectDB();
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));

// CORS
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT,  DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
//   res.setHeader("Content-Type", "application/json");
//   next();
// });

// app.use(morgan('dev'));

// security
app.use(mongoSanitize());
app.use(helmet());
// Enable CORS
app.use(cors());
app.use(xssClean());
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1min
  max: 100,
});
app.use(limiter);
app.use(hpp());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/accounts', accountRoutes);
app.use('/categories', categoryRoutes);
app.use('/records', recordRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
