document.addEventListener('DOMContentLoaded', function() {
  // Initialize all charts
  initSalesTrendsChart();
  initSalesByCountryChart();
  initBestSellingProductsChart();
  initSalesPerformanceChart();    
  initSalesByCategoryChart();
  initNavigation();
});

function updateOverviewMetrics() {
  fetch('http://localhost:3000/api/metrics') 
    .then(res => res.json())
    .then(data => {
      document.getElementById('totalRevenue').textContent = `$${Number(data.totalRevenue).toLocaleString()}`;
      document.getElementById('totalOrders').textContent = data.totalOrders.toLocaleString();
      document.getElementById('newCustomers').textContent = data.newCustomers.toLocaleString();
      document.getElementById('avgOrderValue').textContent = `$${data.avgOrderValue.toFixed(2)}`;
    })
    .catch(err => console.error('Error loading metrics:', err));
}

document.addEventListener("DOMContentLoaded", function () {
  updateOverviewMetrics();
});




// 1. Sales Trend by Month Chart
function initSalesTrendsChart() {
  const ctx = document.getElementById('salesTrendsChart');
  if (!ctx) return;

  fetch('/api/sales-trends')
    .then(res => res.json())
    .then(data => {
      const labels = data.map(d => d.month);
      const values = data.map(d => d.total_sales);

      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Monthly Sales',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
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


// ========== NAVIGATION FUNCTIONS ==========
function initNavigation() {
  // Get all navigation links
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Add click event listeners to each navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(item => {
        item.parentElement.classList.remove('active');
      });
      
      // Add active class to clicked link
      this.parentElement.classList.add('active');
      
      // Get the section to show
      const sectionId = this.getAttribute('data-section');
      
      // Hide all content sections
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Show the selected section
      document.getElementById(sectionId).classList.add('active');
    });
  });
}

// ========== UI CONTROLS FUNCTIONS ==========
function initUIControls() {
  // Time range filter handling
  const timeRangeFilter = document.getElementById('timeRangeFilter');
  const customDateRange = document.getElementById('customDateRange');
  
  if (timeRangeFilter) {
    timeRangeFilter.addEventListener('change', function() {
      if (this.value === 'custom') {
        customDateRange.classList.remove('hidden');
      } else {
        customDateRange.classList.add('hidden');
        // Update charts based on selected time range
        updateChartsTimeRange(this.value);
      }
    });
  }
  
  // Product time filter handling
  const productTimeFilter = document.getElementById('productTimeFilter');
  const customMonthSelector = document.getElementById('customMonthSelector');
  
  if (productTimeFilter) {
    productTimeFilter.addEventListener('change', function() {
      if (this.value === 'custom') {
        customMonthSelector.classList.remove('hidden');
      } else {
        customMonthSelector.classList.add('hidden');
        // Update product charts based on selected time filter
        updateProductTimeFilter(this.value);
      }
    });
  }
  
  // Custom month selector
  if (customMonthSelector) {
    customMonthSelector.addEventListener('change', function() {
      updateProductTimeFilter('custom', this.value);
    });
  }
  
  // Chart view controls
  const chartControls = document.querySelectorAll('.btn-chart-control');
  
  chartControls.forEach(control => {
    control.addEventListener('click', function() {
      // Remove active class from all controls in the same group
      const controlGroup = this.parentElement.querySelectorAll('.btn-chart-control');
      controlGroup.forEach(ctrl => ctrl.classList.remove('active'));
      
      // Add active class to clicked control
      this.classList.add('active');
      
      // Get the view value and update corresponding chart
      const viewValue = this.getAttribute('data-view');
      const chartContainer = this.closest('.chart-card');
      const chartCanvas = chartContainer.querySelector('canvas');
      
      if (chartCanvas) {
        updateChartView(chartCanvas.id, viewValue);
      }
    });
  });
  
  // Export buttons
  const exportButtons = document.querySelectorAll('.export-btn');
  
  exportButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get the section id to determine which data to export
      const sectionId = this.closest('.content-section').id;
      exportData(sectionId);
    });
  });
  
  // Pagination controls
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  
  if (prevPageBtn && nextPageBtn) {
    prevPageBtn.addEventListener('click', function() {
      changePage('prev');
    });
    
    nextPageBtn.addEventListener('click', function() {
      changePage('next');
    });
  }
  
  // Apply custom date range
  const applyDateRangeBtn = document.getElementById('applyDateRange');
  
  if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener('click', function() {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      
      if (startDate && endDate) {
        updateChartsTimeRange('custom', { start: startDate, end: endDate });
      } else {
        alert('Please select both start and end dates');
      }
    });
  }
}

// Function to update charts based on time range
function updateChartsTimeRange(range, customDates) {
  console.log(`Updating charts for time range: ${range}`);
  
  // In a real application, this would fetch new data from the backend
  // For demo purposes, we'll just simulate the update
  
  // Example: Updating sales trends chart
  if (salesTrendsChart) {
    // In real application: fetch new data based on the time range
    const newData = generateMockSalesData(range, customDates);
    
    salesTrendsChart.data.labels = newData.labels;
    salesTrendsChart.data.datasets[0].data = newData.values;
    salesTrendsChart.update();
  }
  
  // Update other charts similarly...
  
  // Show a notification to the user
  showNotification(`Dashboard updated to show data for: ${range === 'custom' ? 'Custom date range' : range}`);
}

// Function to update product charts based on time filter
function updateProductTimeFilter(filter, customMonth) {
  console.log(`Updating product charts for filter: ${filter}${customMonth ? ', month: ' + customMonth : ''}`);
  
  // Update best selling products chart with new data
  if (bestSellingProductsChart) {
    const newData = generateMockProductData(filter, customMonth);
    
    bestSellingProductsChart.data.labels = newData.labels;
    bestSellingProductsChart.data.datasets[0].data = newData.values;
    bestSellingProductsChart.update();
  }
  
  // Show a notification to the user
  showNotification(`Product data updated to show: ${filter === 'custom' ? 'Custom month' : filter}`);
}

// Function to update chart view (e.g., monthly, weekly, daily)
function updateChartView(chartId, view) {
  console.log(`Updating chart ${chartId} to view: ${view}`);
  
  // Find the chart instance
  const chart = Chart.getChart(chartId);
  
  if (chart) {
    // In a real application, fetch new data based on the view
    const newData = generateMockViewData(chartId, view);
    
    chart.data.labels = newData.labels;
    chart.data.datasets.forEach((dataset, index) => {
      dataset.data = newData.datasets[index]?.data || [];
    });
    
    chart.update();
  }
  
  // Show a notification to the user
  showNotification(`Chart view changed to: ${view}`);
}

// Function to export data
function exportData(sectionId) {
  console.log(`Exporting data for section: ${sectionId}`);
  
  // In a real application, this would generate a CSV or Excel file
  // For demo purposes, we'll just show a notification
  
  showNotification(`Data export initiated for ${sectionId}. Download will start shortly.`);
  
  // Simulate download delay
  setTimeout(() => {
    showNotification(`${sectionId} data exported successfully!`);
  }, 1500);
}

// Function to change page in the data tables
function changePage(direction) {
  // Get current page from the indicator
  const pageIndicator = document.getElementById('pageIndicator');
  
  if (!pageIndicator) return;
  
  const currentPageText = pageIndicator.textContent;
  const matches = currentPageText.match(/Page (\d+) of (\d+)/);
  
  if (matches && matches.length === 3) {
    let currentPage = parseInt(matches[1]);
    const totalPages = parseInt(matches[2]);
    
    if (direction === 'next' && currentPage < totalPages) {
      currentPage++;
    } else if (direction === 'prev' && currentPage > 1) {
      currentPage--;
    }
    
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Update prev/next button states
    document.getElementById('prevPage').disabled = (currentPage === 1);
    document.getElementById('nextPage').disabled = (currentPage === totalPages);
    
    // In a real application, fetch and display data for the new page
    loadTablePage(currentPage);
  }
}

// Function to load table data for a specific page
function loadTablePage(page) {
  console.log(`Loading table data for page: ${page}`);
  
  // In a real application, this would fetch data from the backend
  // For demo purposes, we'll just generate mock data
  
  const salesTable = document.getElementById('salesTable');
  
  if (salesTable) {
    const tbody = salesTable.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows
    
    // Generate mock data for the current page
    const mockData = generateMockSalesTableData(page);
    
    // Add rows to the table
    mockData.forEach(sale => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sale.date}</td>
        <td>${sale.orderId}</td>
        <td>${sale.customer}</td>
        <td>${sale.items}</td>
        <td>${sale.total}</td>
        <td><span class="status-badge ${sale.status.toLowerCase()}">${sale.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// Function to show notification
function showNotification(message) {
  // Check if notification container exists, create if not
  let notifContainer = document.querySelector('.notification-container');
  
  if (!notifContainer) {
    notifContainer = document.createElement('div');
    notifContainer.className = 'notification-container';
    document.body.appendChild(notifContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  // Add to container
  notifContainer.appendChild(notification);
  
  // Show with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

