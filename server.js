const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express(); // Make sure this comes BEFORE using `app`

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ecommerce@1',
  database: 'ecommerce_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});






// Serve dashboard.html at root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Endpoints for Dashboard

// 1. Sales Trend by Month
app.get('/api/sales-trends', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(transaction_date, '%Y-%m') AS month,
      SUM(price * quantity) AS total_sales
    FROM transactions
    GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
    ORDER BY month;
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// 2. Sales by Country
app.get('/api/sales-by-country', (req, res) => {
  const query = `
    SELECT 
      country, 
      SUM(price * quantity) AS total_sales
    FROM transactions
    GROUP BY country
    ORDER BY total_sales DESC
    LIMIT 10;
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// 3. Best Selling Products
app.get('/api/best-selling-products', (req, res) => {
  const query = `
    SELECT 
      product_name, 
      SUM(quantity) AS total_quantity,
      SUM(price * quantity) AS total_revenue
    FROM transactions
    GROUP BY product_name
    ORDER BY total_quantity DESC
    LIMIT 10;
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Sales Performance Over Time
app.get('/api/sales-performance', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(transaction_date, '%Y-%m') AS month,
      SUM(price * quantity) AS total_revenue,
      SUM(quantity) AS total_quantity
    FROM transactions
    GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
    ORDER BY month;
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Sales by Product Name 
app.get('/api/sales-by-product', (req, res) => {
  const query = `
    SELECT 
      product_name, 
      SUM(price * quantity) AS total_sales
    FROM transactions
    GROUP BY product_name
    ORDER BY total_sales DESC;
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});


// Overview Metrics
app.get('/api/metrics', (req, res) => {
  const query = `
    SELECT 
      SUM(price * quantity) AS totalRevenue,
      COUNT(DISTINCT order_id) AS totalOrders,
      COUNT(DISTINCT customer_id) AS newCustomers,
      AVG(price * quantity) AS avgOrderValue
    FROM transactions;
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results[0]);
  });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});