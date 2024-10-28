const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'producto_db',
    password: '12345',
    port: 5433,
});

module.exports = pool;
