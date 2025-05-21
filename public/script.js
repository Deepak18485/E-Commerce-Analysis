document.addEventListener('DOMContentLoaded', function() {
  // Initialize all charts
  updateOverviewMetrics();

  initSalesTrendsChart();
  initSalesByCountryChart();
  initBestSellingProductsChart();
  initSalesPerformanceChart();    
  initSalesByCategoryChart();
  initNavigation();
});

function updateOverviewMetrics() {
  fetch('/api/metrics') 
    .then(res => res.json())
    .then(data => {
      console.log('Overview metrics data:', data);
      document.getElementById('totalRevenue').textContent = `$${Number(data.totalRevenue).toLocaleString()}`;
      document.getElementById('totalOrders').textContent = data.totalOrders.toLocaleString();
      document.getElementById('newCustomers').textContent = data.newCustomers.toLocaleString();
      const avgOrder = Number(data.avgOrderValue ?? 0).toFixed(2);
      document.getElementById('avgOrderValue').textContent = `₹${avgOrder}`;
    })
    .catch(err => console.error('Error loading metrics:', err));
}


// 1. Sales Trend by Month Chart
function initSalesTrendsChart() {
  const ctx = document.getElementById('salesTrendsChart');
  if (!ctx) return;

  fetch('/api/sales-trends')
    .then(res => res.json())
    .then(data => {
      // Convert '2025-01' into 'Jan', 'Feb', etc.
      const labels = data.map(d => {
        const [year, month] = d.month.split('-');
        return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
      });

      const values = data.map(d => d.total_sales);

      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Sales Revenue ($)',
            data: values,
            fill: true, // Fill under the line
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.4 // Smooth curves
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `$${context.raw.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              },
              grid: {
                color: '#e5e5e5'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    })
    .catch(err => console.error('Error loading sales trends:', err));
}


// 2. Sales by Country Chart
function initSalesByCountryChart() {
  const ctx = document.getElementById('salesByCountryChart');
  if (!ctx) return;

  fetch('/api/sales-by-country')
    .then(res => res.json())
    .then(data => {
      const labels = data.map(d => d.country);
      const values = data.map(d => d.total_sales);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Sales by Country',
            data: values,
            backgroundColor: labels.map((_, i) => 
              `hsl(${i * 36}, 70%, 70%)`
            ),
            borderColor: labels.map((_, i) => 
              `hsl(${i * 36}, 70%, 50%)`
            ),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `$${context.raw.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    })
    .catch(err => console.error('Error loading sales by country:', err));
}

// 3. Best Selling Products Chart
function initBestSellingProductsChart() {
  const ctx = document.getElementById('bestSellingProductsChart');
  if (!ctx) return;

  fetch('/api/best-selling-products')
    .then(res => res.json())
    .then(data => {
      const labels = data.map(d => d.product_name);
      const values = data.map(d => d.total_quantity);
      const total = values.reduce((sum, val) => sum + val, 0);

      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            label: 'Units Sold',
            data: values,
            backgroundColor: labels.map((_, i) => 
              `hsl(${i * 36}, 70%, 70%)`
            )
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} units (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    })
    .catch(err => console.error('Error loading best selling products:', err));
}

// Sales Performance Over Time Chart
function initSalesPerformanceChart() {
  const ctx = document.getElementById('salesPerformanceChart');
  if (!ctx) return;

  fetch('/api/sales-performance')
    .then(res => res.json())
    .then(data => {
      const labels = data.map(d => d.month);
      const revenue = data.map(d => d.total_revenue);
      const quantity = data.map(d => d.total_quantity);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Total Revenue',
              data: revenue,
              backgroundColor: '#4CAF50'
            },
            {
              label: 'Units Sold',
              data: quantity,
              backgroundColor: '#2196F3'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
    .catch(err => console.error('Error loading sales performance:', err));
}

// Sales by Category Chart
function initSalesByCategoryChart() {
  const ctx = document.getElementById('salesByCategoryChart');
  if (!ctx) return;

  fetch('/api/sales-by-category')
    .then(res => res.json())
    .then(data => {
      
      const labels = data.map(d => d.category);
      const values = data.map(d => d.total_sales);

      new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: labels.map((_, i) => `hsl(${i * 45}, 70%, 60%)`)
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    })
    .catch(err => console.error('Error loading sales by category:', err));
}


// NAVIGATION FUNCTIONS 
function initNavigation() {
  //To get all navigation links
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Adding click event listeners to each navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Removing active class from all links
      navLinks.forEach(item => {
        item.parentElement.classList.remove('active');
      });
      
      // Adding active class to clicked link
      this.parentElement.classList.add('active');
      
      // Get the section to show
      const sectionId = this.getAttribute('data-section');
      
      // Hiding all content sections
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Showing the selected section
      document.getElementById(sectionId).classList.add('active');
    });
  });
}



 

