require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  dbHost: process.env.DB_HOST || 'localhost',
  dbUser: process.env.DB_USER || 'root',
  dbPassword: 'Kv200660426',
  dbName: process.env.DB_NAME || 'hotel_booking'
};
