document.addEventListener("DOMContentLoaded", function() {
  initNavigation();
  loadOverviewMetrics();
  loadSalesTrends();
  loadSalesByCategory();
  // loadTopProducts();
  loadCustomerAcquisition();
   loadMonthlyTopProducts();
  //  loadDemandPredictions();
  //  createCategoryLegend();
  //  createTopProductsChart();
});

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      navLinks.forEach(item => {
        item.parentElement.classList.remove('active');
      });
      
      this.parentElement.classList.add('active');
      
      const sectionId = this.getAttribute('data-section');
      
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      
      document.getElementById(sectionId).classList.add('active');
    });
  });
}

function loadOverviewMetrics() {
  fetch('/api/overview')
    .then(res => res.json())
    .then(data => {
      document.getElementById("totalRevenue").textContent = `$${data.totalRevenue.toFixed(2)}`;
      document.getElementById("totalOrders").textContent = data.totalOrders;
      document.getElementById("newCustomers").textContent = data.newCustomers;
      document.getElementById("avgOrderValue").textContent = `$${data.avgOrderValue.toFixed(2)}`;
    })
    .catch(err => console.error("Error loading overview data", err));
}

function loadCustomerAcquisition() {
  fetch('/api/customer-acquisition')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      // Sort and format data
      const sortedData = data
        .map(d => ({
          date: new Date(d.month + '-01'),
          month: d.month,
          customers: d.new_customers
        }))
        .sort((a, b) => a.date - b.date);

      // Create chart
      new Chart(document.getElementById('customerAcquisitionChart'), {
        type: 'line',
        data: {
          labels: sortedData.map(d => {
            const [year, month] = d.month.split('-');
            return `${new Date(year, month-1).toLocaleString('default', { month: 'short' })} ${year}`;
          }),
          datasets: [{
            label: 'New Customers',
            data: sortedData.map(d => d.customers),
            borderColor: '#4CAF50',
            tension: 0.3,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index' }
          },
          scales: {
            y: { beginAtZero: true },
            x: { 
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });
    })
    .catch(err => {
      console.error('Customer acquisition error:', err);
      document.getElementById('customerAcquisitionChart').innerHTML = 
        `<div class="chart-error">${err.message}</div>`;
    });
}

function loadSalesTrends() {
  fetch('/api/sales-trends')
    .then(res => res.json())
    .then(data => {
      // 1. Create sorted array with Date objects
      const sortedData = data.map(d => ({
        date: new Date(d.month + "-01"),
        month: d.month,
        sales: d.total_sales
      })).sort((a, b) => a.date - b.date);

      // 2. Create labels with month abbreviations
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const labels = sortedData.map(d => {
        const [year, month] = d.month.split('-');
        return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`;
      });

      // 3. Extract values in sorted order
      const values = sortedData.map(d => d.sales);

      // 4. Create chart
      new Chart(document.getElementById('salesTrendsChart'), {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Sales Revenue ($)',
            data: values,
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => `$${ctx.raw.toLocaleString()}`
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: v => '$' + v.toLocaleString()
              }
            },
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
                padding: 10
              }
            }
          }
        }
      });
    })
    .catch(err => console.error('Error loading sales trends data:', err));
}

// function loadTopProducts() {
//   fetch('/api/top-products')
//     .then(res => res.json())
//     .then(data => {
//       const labels = data.map(d => d.category);
//       const values = data.map(d => d.total_sales);

//       new Chart(document.getElementById('topProductsChart'), {
//         type: 'bar',
//         data: {
//           labels: labels,
//           datasets: [{
//             label: 'Sales Revenue ($)',
//             data: values,
//             backgroundColor: 'rgba(54, 162, 235, 0.6)',
//             borderColor: 'rgba(54, 162, 235, 1)',
//             borderWidth: 1
//           }]
//         },
//         options: {
//           indexAxis: 'y',
//           responsive: true,
//           plugins: {
//             legend: { display: false },
//             tooltip: {
//               callbacks: {
//                 label: ctx => `$${ctx.raw.toLocaleString()}`
//               }
//             }
//           },
//           scales: {
//             x: {
//               ticks: {
//                 callback: v => '$' + v.toLocaleString()
//               }
//             },
//             y: {
//               ticks: {
//                 autoSkip: false
//               }
//             }
//           }
//         }
//       });
//     })
//     .catch(err => console.error('Error loading top products:', err));
// }

function loadSalesByCategory() {
  fetch('/api/sales-by-category')
    .then(res => res.json())
    .then(data => {
      const labels = data.map(d => d.category);
      const values = data.map(d => d.total_sales);

      new Chart(document.getElementById('salesByCategoryChart'), {
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
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    })
    .catch(err => console.error('Error loading sales by category:', err));
}


let topProductsChart = null;

async function loadMonthlyTopProducts() {
  try {
    console.log("Initiating top products request...");
    const response = await fetch('/api/monthly-top-products');
    
    // 1. Get raw text response first
    const rawData = await response.text();
    console.log("Raw response:", rawData.slice(0, 300));
    
    // 2. Parse JSON manually
    const data = JSON.parse(rawData);
    
    // 3. Validate response
    if (data.error) throw new Error(`Backend error: ${data.error}`);
    if (!Array.isArray(data)) throw new Error('Invalid data format');
    
    console.log("Parsed data:", data);
    createTopProductsChart(data);
    
  } catch (error) {
    console.error('Error loading top products:', error);
    const ctx = document.getElementById('seasonalityChart');
    ctx.innerHTML = `<div class="chart-error">${error.message}</div>`;
  }
}

function getRandomColor(alpha = 1) {
  return `hsla(${Math.random() * 360}, 70%, 50%, ${alpha})`;
}

// Add this at the top of your script
let seasonalityChart = null;

function createTopProductsChart(data) {
  const ctx = document.getElementById('seasonalityChart');
  if (!ctx) {
    console.error('Chart canvas element not found!');
    return;
  }

  if (seasonalityChart) {
    seasonalityChart.destroy();
  }

  const labels = data.map(d => {
    const [year, month] = d.month.split('-');
    return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  });

  const values = data.map(d => d.total_sales);

  // ✅ Dynamically generate legend info
  const categories = [...new Set(data.map(d => d.top_category))];
  const categoryColors = {};
  categories.forEach(cat => {
    categoryColors[cat] = getRandomColor(0.6);
  });

  seasonalityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Top Category Sales ($)',
        data: values,
        backgroundColor: data.map(d => categoryColors[d.top_category]),
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${data[ctx.dataIndex].top_category}: $${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `$${value.toLocaleString()}`
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: false
          }
        }
      }
    }
  });

  // ✅ Now call legend function with valid variables
  createCategoryLegend(categories, categoryColors);
}


function createCategoryLegend(categories, colors) {
  const legendContainer = document.getElementById('seasonalityLegend');
  legendContainer.innerHTML = categories.map(cat => `
    <div class="legend-item">
    <span class="legend-color" style="background-color: ${colors[cat]}"></span>
    ${cat}
    </div>
    `).join('');
  }

  let predictionChart = null;


async function loadDemandPredictions() {
  try {
    const response = await fetch('/api/demand-prediction');
    if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
    
    const data = await response.json();
    renderDemandChart(data);
  } catch (error) {
    console.error('Error loading predictions:', error);
    document.getElementById('demandPredictionChart').innerHTML = 
      `<div class="chart-error">${error.message}</div>`;
  }
}

function renderDemandChart(data) {
  const ctx = document.getElementById('demandPredictionChart');
  if (!ctx) {
    console.error('Canvas element not found!');
    return;
  }
  if (predictionChart) predictionChart.destroy();

  const validData = data.filter(d => d.actual_sales !== null && d.predicted_sales !== null);

  // ✅ Extract unique categories
  const categories = [...new Set(validData.map(d => d.category))];
  const selectedCategory = document.getElementById("predictionCategory").value;

  const filteredData = selectedCategory === "all"
    ? validData
    : validData.filter(d => d.category === selectedCategory);

  // ✅ Group by month
  const monthlyData = {};
  filteredData.forEach(d => {
    if (!monthlyData[d.month]) {
      monthlyData[d.month] = { actual: 0, predicted: 0 };
    }
    monthlyData[d.month].actual += d.actual_sales;
    monthlyData[d.month].predicted += d.predicted_sales;
  });

  const months = Object.keys(monthlyData).sort();
  const actualSales = months.map(m => monthlyData[m].actual);
  const predictedSales = months.map(m => monthlyData[m].predicted);

  const datasets = [
    {
      label: 'Actual Sales',
      data: actualSales,
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderWidth: 2,
      fill: true
    },
    {
      label: 'Predicted Sales',
      data: predictedSales,
      borderColor: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: true
    }
  ];

  predictionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => {
        const [year, month] = m.split('-');
        return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
      }),
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Sales ($)' },
          ticks: { callback: v => `$${v.toLocaleString()}` }
        },
        x: {
          title: { display: true, text: 'Month' },
          ticks: { maxRotation: 45, minRotation: 45 }
        }
      }
    }
  });

  // Populate dropdown if "all" is selected
  const dropdown = document.getElementById("predictionCategory");
  if (dropdown && dropdown.value === "all") {
    dropdown.innerHTML = `<option value="all">All Categories</option>` +
      categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }
}
  
  document.addEventListener("DOMContentLoaded", function() {
    loadDemandPredictions();

    document.getElementById('refreshPredictions').addEventListener('click', () => {
      loadDemandPredictions();
    });
  });

function loadPaymentMethodAnalysis() {
  fetch('/api/payment-method-analysis')
    .then(res => res.json())
    .then(data => {
      const grouped = {};

      data.forEach(row => {
        if (!grouped[row.payment_method]) grouped[row.payment_method] = { Yes: 0, No: 0 };
        if (row.churn === "Yes") grouped[row.payment_method].Yes += row.count;
        else grouped[row.payment_method].No += row.count;
      });

      const paymentMethods = Object.keys(grouped);
      const churnYes = paymentMethods.map(pm => grouped[pm].Yes);
      const churnNo = paymentMethods.map(pm => grouped[pm].No);

      const ctx = document.getElementById('paymentMethodChart');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: paymentMethods,
          datasets: [
            {
              label: 'Active Customers',
              data: churnNo,
              backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Payment Method Preferences by Customer'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: { position: 'top' }
          },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
          }
        }
      });
    })
    .catch(err => {
      console.error('Error loading payment method data:', err);
      document.getElementById('paymentMethodChart').innerHTML =
        `<div class="chart-error">${err.message}</div>`;
    });
}

// Call it on DOM load
document.addEventListener("DOMContentLoaded", function () {
  loadPaymentMethodAnalysis();
});

function loadReturnAnalysis() {
  fetch('/api/return-analysis')
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }

      const ctx = document.getElementById('returnAnalysisChart');
      if (!ctx) return;

      const labels = data.map(d => d.category);
      const returnRates = data.map(d => d.return_rate);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Return Rate (%)',
            data: returnRates,
            backgroundColor: labels.map((_, i) => `hsl(${i * 36}, 70%, 60%)`)
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.raw.toFixed(2)}%`
              }
            },
            title: {
              display: true,
              text: 'Return Rate by Product Category'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Return Rate (%)'
              },
              ticks: {
                callback: val => `${val}%`
              }
            },
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });
    })
    .catch(err => {
      console.error('Error loading return analysis:', err);
      const container = document.getElementById('returnAnalysisChart');
      if (container) container.innerHTML = `<div class="chart-error">${err.message}</div>`;
    });
}


function loadFirstPurchaseAnalysis() {
  fetch('/api/first-purchase-analysis')
    .then(res => res.json())
    .then(data => {
      const ctx = document.getElementById('firstPurchaseChart');
      if (!ctx) return;

      // Group counts by category and churn
      const grouped = {};
      data.forEach(row => {
        if (!grouped[row.category]) grouped[row.category] = { loyal: 0, churned: 0 };
        if (row.churn === 0) grouped[row.category].loyal += row.count;
        else grouped[row.category].churned += row.count;
      });

      const categories = Object.keys(grouped);
      const loyalCounts = categories.map(c => grouped[c].loyal);
      const churnedCounts = categories.map(c => grouped[c].churned);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: categories,
          datasets: [
            {
              label: 'Loyal Customers (Churn=0)',
              data: loyalCounts,
              backgroundColor: 'rgba(54, 162, 235, 0.6)'
            },
            {
              label: 'Churned Customers (Churn=1)',
              data: churnedCounts,
              backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'First Purchase Category vs Loyalty'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: { position: 'top' }
          },
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: { display: true, text: 'Number of Customers' }
            }
          }
        }
      });
    })
    .catch(err => {
      console.error('Error loading first purchase analysis:', err);
      const container = document.getElementById('firstPurchaseChart');
      if (container) container.innerHTML = `<div class="chart-error">${err.message}</div>`;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  loadFirstPurchaseAnalysis();
});


document.addEventListener("DOMContentLoaded", function () {
  loadReturnAnalysis();
});

























// document.addEventListener('DOMContentLoaded', function() {
//   // Initialize all charts
//   updateOverviewMetrics();

//   initSalesTrendsChart();
//   initSalesByCountryChart();
//   initBestSellingProductsChart();
//   initSalesPerformanceChart();    
//   initSalesByCategoryChart();
//   initNavigation();
// });

// function updateOverviewMetrics() {
//   fetch('/api/metrics') 
//     .then(res => res.json())
//     .then(data => {
//       console.log('Overview metrics data:', data);
//       document.getElementById('totalRevenue').textContent = `$${Number(data.totalRevenue).toLocaleString()}`;
//       document.getElementById('totalOrders').textContent = data.totalOrders.toLocaleString();
//       document.getElementById('newCustomers').textContent = data.newCustomers.toLocaleString();
//       const avgOrder = Number(data.avgOrderValue ?? 0).toFixed(2);
//       document.getElementById('avgOrderValue').textContent = `₹${avgOrder}`;
//     })
//     .catch(err => console.error('Error loading metrics:', err));
// }


// // 1. Sales Trend by Month Chart
// function initSalesTrendsChart() {
//   const ctx = document.getElementById('salesTrendsChart');
//   if (!ctx) return;

//   fetch('/api/sales-trends')
//     .then(res => res.json())
//     .then(data => {
//       // Convert '2025-01' into 'Jan', 'Feb', etc.
//       const labels = data.map(d => {
//         const [year, month] = d.month.split('-');
//         return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
//       });

//       const values = data.map(d => d.total_sales);

//       new Chart(ctx, {
//         type: 'line',
//         data: {
//           labels,
//           datasets: [{
//             label: 'Sales Revenue ($)',
//             data: values,
//             fill: true, // Fill under the line
//             backgroundColor: 'rgba(54, 162, 235, 0.1)',
//             borderColor: 'rgba(54, 162, 235, 1)',
//             pointBackgroundColor: 'rgba(54, 162, 235, 1)',
//             borderWidth: 2,
//             tension: 0.4 // Smooth curves
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               display: true,
//               position: 'top',
//               labels: {
//                 usePointStyle: true
//               }
//             },
//             tooltip: {
//               callbacks: {
//                 label: function(context) {
//                   return `$${context.raw.toLocaleString()}`;
//                 }
//               }
//             }
//           },
//           scales: {
//             y: {
//               beginAtZero: false,
//               ticks: {
//                 callback: function(value) {
//                   return '$' + value.toLocaleString();
//                 }
//               },
//               grid: {
//                 color: '#e5e5e5'
//               }
//             },
//             x: {
//               grid: {
//                 display: false
//               }
//             }
//           }
//         }
//       });
//     })
//     .catch(err => console.error('Error loading sales trends:', err));
// }


// // 2. Sales by Country Chart
// function initSalesByCountryChart() {
//   const ctx = document.getElementById('salesByCountryChart');
//   if (!ctx) return;

//   fetch('/api/sales-by-country')
//     .then(res => res.json())
//     .then(data => {
//       const labels = data.map(d => d.country);
//       const values = data.map(d => d.total_sales);

//       new Chart(ctx, {
//         type: 'bar',
//         data: {
//           labels,
//           datasets: [{
//             label: 'Sales by Country',
//             data: values,
//             backgroundColor: labels.map((_, i) => 
//               `hsl(${i * 36}, 70%, 70%)`
//             ),
//             borderColor: labels.map((_, i) => 
//               `hsl(${i * 36}, 70%, 50%)`
//             ),
//             borderWidth: 1
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           indexAxis: 'y',
//           plugins: {
//             legend: { display: false },
//             tooltip: {
//               callbacks: {
//                 label: function(context) {
//                   return `$${context.raw.toLocaleString()}`;
//                 }
//               }
//             }
//           },
//           scales: {
//             x: {
//               beginAtZero: true,
//               ticks: {
//                 callback: function(value) {
//                   return '$' + value.toLocaleString();
//                 }
//               }
//             }
//           }
//         }
//       });
//     })
//     .catch(err => console.error('Error loading sales by country:', err));
// }

// // 3. Best Selling Products Chart
// function initBestSellingProductsChart() {
//   const ctx = document.getElementById('bestSellingProductsChart');
//   if (!ctx) return;

//   fetch('/api/best-selling-products')
//     .then(res => res.json())
//     .then(data => {
//       const labels = data.map(d => d.product_name);
//       const values = data.map(d => d.total_quantity);
//       const total = values.reduce((sum, val) => sum + val, 0);

//       new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//           labels,
//           datasets: [{
//             label: 'Units Sold',
//             data: values,
//             backgroundColor: labels.map((_, i) => 
//               `hsl(${i * 36}, 70%, 70%)`
//             )
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               position: 'right',
//             },
//             tooltip: {
//               callbacks: {
//                 label: function(context) {
//                   const label = context.label || '';
//                   const value = context.raw || 0;
//                   const percentage = ((value / total) * 100).toFixed(1);
//                   return `${label}: ${value} units (${percentage}%)`;
//                 }
//               }
//             }
//           }
//         }
//       });
//     })
//     .catch(err => console.error('Error loading best selling products:', err));
// }

// // Sales Performance Over Time Chart
// function initSalesPerformanceChart() {
//   const ctx = document.getElementById('salesPerformanceChart');
//   if (!ctx) return;

//   fetch('/api/sales-performance')
//     .then(res => res.json())
//     .then(data => {
//       const labels = data.map(d => d.month);
//       const revenue = data.map(d => d.total_revenue);
//       const quantity = data.map(d => d.total_quantity);

//       new Chart(ctx, {
//         type: 'bar',
//         data: {
//           labels,
//           datasets: [
//             {
//               label: 'Total Revenue',
//               data: revenue,
//               backgroundColor: '#4CAF50'
//             },
//             {
//               label: 'Units Sold',
//               data: quantity,
//               backgroundColor: '#2196F3'
//             }
//           ]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: { position: 'top' }
//           },
//           scales: {
//             y: {
//               beginAtZero: true
//             }
//           }
//         }
//       });
//     })
//     .catch(err => console.error('Error loading sales performance:', err));
// }

// // Sales by Category Chart
// function initSalesByCategoryChart() {
//   const ctx = document.getElementById('salesByCategoryChart');
//   if (!ctx) return;

//   fetch('/api/sales-by-category')
//     .then(res => res.json())
//     .then(data => {
      
//       const labels = data.map(d => d.category);
//       const values = data.map(d => d.total_sales);

//       new Chart(ctx, {
//         type: 'pie',
//         data: {
//           labels,
//           datasets: [{
//             data: values,
//             backgroundColor: labels.map((_, i) => `hsl(${i * 45}, 70%, 60%)`)
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: { position: 'bottom' }
//           }
//         }
//       });
//     })
//     .catch(err => console.error('Error loading sales by category:', err));
// }


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



 

