/**
 * Dashboard Charts and Analytics
 * Advanced animated charts and statistics for the admin dashboard
 */

// Chart color scheme for dark theme
const chartColors = {
    primary: '#6c63ff',
    primaryTransparent: 'rgba(108, 99, 255, 0.2)',
    secondary: '#ff6b6b',
    secondaryTransparent: 'rgba(255, 107, 107, 0.2)',
    success: '#36e2a8',
    successTransparent: 'rgba(54, 226, 168, 0.2)',
    info: '#4dc9ff',
    infoTransparent: 'rgba(77, 201, 255, 0.2)',
    warning: '#ffcf5c',
    warningTransparent: 'rgba(255, 207, 92, 0.2)',
    purple: '#b266ff',
    purpleTransparent: 'rgba(178, 102, 255, 0.2)',
    teal: '#05dfd7',
    tealTransparent: 'rgba(5, 223, 215, 0.2)',
    light: '#e2e3fa',
    lightTransparent: 'rgba(226, 227, 250, 0.1)',
    dark: '#1a1b3c',
    darkTransparent: 'rgba(26, 27, 60, 0.8)',
    gridLines: 'rgba(255, 255, 255, 0.1)'
};

// Common chart options for dark theme
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                    family: "'Inter', sans-serif",
                    size: 12
                },
                padding: 20
            }
        },
        tooltip: {
            enabled: true,
            backgroundColor: chartColors.darkTransparent,
            titleColor: '#fff',
            titleFont: {
                family: "'Inter', sans-serif",
                size: 14,
                weight: 'bold'
            },
            bodyColor: 'rgba(255, 255, 255, 0.7)',
            bodyFont: {
                family: "'Inter', sans-serif",
                size: 13
            },
            borderColor: chartColors.primaryTransparent,
            borderWidth: 1,
            padding: 12,
            boxPadding: 5,
            usePointStyle: true,
            callbacks: {
                // Add $ for financial values
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        // Check if this is sales data
                        if (label.toLowerCase().includes('sale') || 
                            label.toLowerCase().includes('revenue') || 
                            label.toLowerCase().includes('earning')) {
                            label += '$' + context.parsed.y;
                        } else {
                            label += context.parsed.y;
                        }
                    }
                    return label;
                }
            }
        },
        datalabels: {
            display: false
        }
    },
    hover: {
        mode: 'nearest',
        intersect: false
    },
    scales: {
        x: {
            ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                    family: "'Inter', sans-serif",
                    size: 12
                }
            },
            grid: {
                color: chartColors.gridLines,
                borderColor: chartColors.gridLines,
                tickColor: chartColors.gridLines
            }
        },
        y: {
            ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                    family: "'Inter', sans-serif",
                    size: 12
                },
                padding: 8
            },
            grid: {
                color: chartColors.gridLines,
                borderColor: chartColors.gridLines,
                tickColor: chartColors.gridLines
            }
        }
    },
    animation: {
        duration: 2000,
        easing: 'easeOutQuart'
    }
};

/**
 * Initialize the sales trend chart
 * @param {HTMLCanvasElement} canvas - The canvas element for the chart
 * @param {Array} salesData - The sales data for the chart
 */
function initSalesTrendChart(canvas, salesData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Default data if none provided
    const defaultData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Sales',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryTransparent,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
                pointHoverBackgroundColor: chartColors.primary,
                pointHoverBorderColor: '#fff',
                fill: true,
                tension: 0.4
            }
        ]
    };
    
    // Use provided data or default
    const data = salesData || defaultData;
    
    // Create chart
    const salesTrendChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            ...chartOptions,
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: 'Sales Trend',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            }
        }
    });
    
    return salesTrendChart;
}

/**
 * Initialize the category distribution chart
 * @param {HTMLCanvasElement} canvas - The canvas element for the chart
 * @param {Array} categoryData - The category data for the chart
 */
function initCategoryChart(canvas, categoryData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Default data if none provided
    const defaultData = {
        labels: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'],
        datasets: [{
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
                chartColors.primary,
                chartColors.secondary,
                chartColors.success,
                chartColors.warning,
                chartColors.info
            ],
            borderColor: '#1a1b3c',
            borderWidth: 2,
            hoverOffset: 15,
        }]
    };
    
    // Use provided data or default
    const data = categoryData || defaultData;
    
    // Create chart
    const categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            ...chartOptions,
            cutout: '60%',
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: 'Sales by Category',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                datalabels: {
                    display: true,
                    color: '#fff',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: 'bold'
                    },
                    formatter: (value, ctx) => {
                        const dataset = ctx.chart.data.datasets[0];
                        const total = dataset.data.reduce((acc, data) => acc + data, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) + '%' : '0%';
                        return percentage;
                    }
                }
            }
        }
    });
    
    return categoryChart;
}

/**
 * Initialize the order status chart
 * @param {HTMLCanvasElement} canvas - The canvas element for the chart
 * @param {Array} orderData - The order data for the chart
 */
function initOrderStatusChart(canvas, orderData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Default data if none provided
    const defaultData = {
        labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        datasets: [{
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
                chartColors.warning,
                chartColors.primary,
                chartColors.info,
                chartColors.success,
                chartColors.secondary
            ],
            borderWidth: 0,
            borderRadius: 4,
            barThickness: 16,
            hoverBackgroundColor: [
                chartColors.warning,
                chartColors.primary,
                chartColors.info,
                chartColors.success,
                chartColors.secondary
            ]
        }]
    };
    
    // Use provided data or default
    const data = orderData || defaultData;
    
    // Create chart
    const orderStatusChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            ...chartOptions,
            indexAxis: 'y',
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: 'Orders by Status',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'right',
                    color: '#fff',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: 'bold'
                    },
                    formatter: (value) => {
                        return value > 0 ? value : '';
                    },
                    offset: 4
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
    
    return orderStatusChart;
}

/**
 * Initialize a recent sales comparison chart
 * @param {HTMLCanvasElement} canvas - The canvas element for the chart
 * @param {Array} comparisonData - The comparison data for the chart
 */
function initComparisonChart(canvas, comparisonData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Default data if none provided
    const defaultData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Current Month',
                data: [0, 0, 0, 0],
                backgroundColor: chartColors.primaryTransparent,
                borderColor: chartColors.primary,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: chartColors.primary
            },
            {
                label: 'Previous Month',
                data: [0, 0, 0, 0],
                backgroundColor: chartColors.secondaryTransparent,
                borderColor: chartColors.secondary,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: chartColors.secondary
            }
        ]
    };
    
    // Use provided data or default
    const data = comparisonData || defaultData;
    
    // Create chart
    const comparisonChart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
            ...chartOptions,
            elements: {
                line: {
                    tension: 0.1
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: chartColors.gridLines
                    },
                    grid: {
                        color: chartColors.gridLines
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 10
                        }
                    }
                }
            },
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: 'Sales Comparison',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            }
        }
    });
    
    return comparisonChart;
}

/**
 * Initialize the top products chart
 * @param {HTMLCanvasElement} canvas - The canvas element for the chart
 * @param {Array} productData - The product data for the chart
 */
function initTopProductsChart(canvas, productData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Default data if none provided
    const defaultData = {
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
        datasets: [{
            axis: 'y',
            label: 'Sales',
            data: [0, 0, 0, 0, 0],
            fill: false,
            backgroundColor: [
                chartColors.primary,
                chartColors.success,
                chartColors.info,
                chartColors.purple,
                chartColors.warning
            ],
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
        }]
    };
    
    // Use provided data or default
    const data = productData || defaultData;
    
    // Create chart
    const topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            ...chartOptions,
            indexAxis: 'y',
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: 'Top Products',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                datalabels: {
                    display: true,
                    align: 'end',
                    anchor: 'end',
                    color: '#fff',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: 'bold'
                    },
                    formatter: (value) => {
                        return value > 0 ? '$' + value : '';
                    },
                    offset: 4
                }
            }
        }
    });
    
    return topProductsChart;
}

/**
 * Initialize the user registration chart
 * @param {HTMLCanvasElement} canvas - The canvas element for the chart
 * @param {Array} userData - The user data for the chart
 */
function initUserRegistrationChart(canvas, userData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Default data if none provided
    const defaultData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'New Users',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: chartColors.infoTransparent,
            borderColor: chartColors.info,
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };
    
    // Use provided data or default
    const data = userData || defaultData;
    
    // Create chart
    const userChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            ...chartOptions,
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: 'User Registration Trend',
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            }
        }
    });
    
    return userChart;
}

/**
 * Initialize all dashboard stats and animations
 */
function initDashboardAnalytics() {
    // Register the chart.js datalabels plugin
    Chart.register(ChartDataLabels);
    
    // Get all chart canvases
    const salesTrendCanvas = document.getElementById('salesTrendChart');
    const categoryChartCanvas = document.getElementById('categoryChart');
    const orderStatusCanvas = document.getElementById('orderStatusChart');
    const comparisonChartCanvas = document.getElementById('comparisonChart');
    const topProductsCanvas = document.getElementById('topProductsChart');
    const userRegistrationCanvas = document.getElementById('userRegistrationChart');
    
    // Initialize charts with any server-provided data
    // These will initialize with default data if none is provided in the page
    if (salesTrendCanvas) {
        initSalesTrendChart(salesTrendCanvas, window.salesTrendData || null);
    }
    
    if (categoryChartCanvas) {
        initCategoryChart(categoryChartCanvas, window.categoryData || null);
    }
    
    if (orderStatusCanvas) {
        initOrderStatusChart(orderStatusCanvas, window.orderStatusData || null);
    }
    
    if (comparisonChartCanvas) {
        initComparisonChart(comparisonChartCanvas, window.comparisonData || null);
    }
    
    if (topProductsCanvas) {
        initTopProductsChart(topProductsCanvas, window.topProductsData || null);
    }
    
    if (userRegistrationCanvas) {
        initUserRegistrationChart(userRegistrationCanvas, window.userRegistrationData || null);
    }
    
    // Initialize animated stat counters
    animateStatCounters();
}

/**
 * Animate the stat counters with counting effect
 */
function animateStatCounters() {
    const statElements = document.querySelectorAll('.stats-number');
    
    statElements.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const duration = 2000; // 2 seconds
        let startTime = null;
        let current = 0;
        
        function updateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Use easeOutExpo for smooth counting that slows down near the end
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            current = Math.floor(easeOutExpo * target);
            
            el.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target.toLocaleString();
            }
        }
        
        requestAnimationFrame(updateCounter);
    });
}

/**
 * Initialize dashboard analytics when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initDashboardAnalytics();
});