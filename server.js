const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
const overviewRoute = require('./routes/overview');
const salesTrendsRoute = require('./routes/salesTrends');
const salesByCategoryRoute = require('./routes/salesByCategory');

app.use('/api/overview', overviewRoute);
app.use('/api/sales-trends', salesTrendsRoute);
app.use('/api/sales-by-category', salesByCategoryRoute);


app.get('/api/top-products', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5001/api/top-products');
    
    // Check content type first
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      throw new Error('Invalid response format');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(502).json({ 
      error: 'Failed to fetch top products',
      details: error.message
    });
  }
});

app.get('/api/customer-acquisition', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5001/api/customer-acquisition');
    
    // Check if response is OK first
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flask error: ${response.status} - ${errorText}`);
    }
    
    // Then check content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid content-type: ${contentType}. Response: ${text.slice(0, 100)}`);
    }

    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Customer acquisition proxy error:', error.message);
    res.status(502).json({ 
      error: 'Failed to fetch customer data',
      details: error.message
    });
  }
});

// Modify the proxy route to handle HTML errors
app.get('/api/monthly-top-products', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5001/api/monthly-top-products');
    
    // First check if response is HTML
    const contentType = response.headers.get('content-type');
    if (contentType.includes('text/html')) {
      const html = await response.text();
      throw new Error(`Received HTML: ${html.slice(0, 100)}`);
    }
    
    // Then process as JSON
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(502).json({ 
      error: 'Failed to fetch top products',
      details: error.message
    });
  }
});

// Add this route
app.get('/api/demand-prediction', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5001/api/demand-prediction');
    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Demand prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});



app.get('/api/payment-method-analysis', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5001/api/payment-method-analysis');
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const html = await response.text();
      throw new Error(`Invalid response format: ${html.slice(0, 100)}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Payment method analysis error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/return-analysis', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5001/api/return-analysis');
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Flask Error ${response.status}: ${text}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const html = await response.text();
      throw new Error(`Unexpected response format: ${html.slice(0, 100)}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Return analysis proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/first-purchase-analysis', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5001/api/first-purchase-analysis');
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Flask Error ${response.status}: ${text}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('First purchase analysis proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});