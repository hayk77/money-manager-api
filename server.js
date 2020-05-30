const express = require('express');
const app = express();

const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => console.log(`start server: ${PORT}`));
