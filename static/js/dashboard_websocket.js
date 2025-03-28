/**
 * Dashboard WebSocket Client
 * Handles real-time updates for dashboard charts and metrics
 */

// Store chart instances so we can update them
const chartInstances = {};

/**
 * Initialize WebSocket connection for real-time dashboard updates
 */
function initializeWebSocket() {
    // Check if we're on the dashboard page and if the user is staff
    if (!document.getElementById('salesTrendChart')) {
        return; // Not on dashboard page or not staff
    }

    // Determine WebSocket protocol based on page protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/dashboard/`;
    
    // Create WebSocket connection
    const socket = new WebSocket(wsUrl);
    
    // Connection opened
    socket.addEventListener('open', (event) => {
        console.log('Dashboard WebSocket connection established');
        
        // Request initial data
        socket.send(JSON.stringify({
            'message': 'get_data'
        }));
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        updateDashboardCharts(data);
    });
    
    // Connection closed
    socket.addEventListener('close', (event) => {
        console.log('Dashboard WebSocket connection closed');
        // Attempt to reconnect after a delay
        setTimeout(initializeWebSocket, 5000);
    });
    
    // Connection error
    socket.addEventListener('error', (event) => {
        console.error('Dashboard WebSocket error:', event);
    });
    
    // Store socket reference
    window.dashboardSocket = socket;
}

/**
 * Update dashboard charts with new data from WebSocket
 */
function updateDashboardCharts(data) {
    // Update sales trend chart
    if (data.sales_data && chartInstances.salesTrendChart) {
        const chart = chartInstances.salesTrendChart;
        const newData = {
            labels: data.sales_data.labels,
            datasets: [{
                label: 'Sales',
                data: data.sales_data.values,
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
            }]
        };
        
        chart.data = newData;
        chart.update('none'); // Update without animation for smooth real-time updates
    }
    
    // Update category chart
    if (data.category_data && chartInstances.categoryChart) {
        const chart = chartInstances.categoryChart;
        const newData = {
            labels: data.category_data.labels,
            datasets: [{
                data: data.category_data.values,
                backgroundColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.success,
                    chartColors.warning,
                    chartColors.info,
                    chartColors.purple,
                    chartColors.teal
                ].slice(0, data.category_data.labels.length),
                borderColor: '#1a1b3c',
                borderWidth: 2,
                hoverOffset: 15,
            }]
        };
        
        chart.data = newData;
        chart.update('none');
    }
    
    // Update order status chart
    if (data.order_status_data && chartInstances.orderStatusChart) {
        const chart = chartInstances.orderStatusChart;
        const newData = {
            labels: data.order_status_data.labels,
            datasets: [{
                data: data.order_status_data.values,
                backgroundColor: [
                    chartColors.warning,
                    chartColors.primary,
                    chartColors.info,
                    chartColors.success,
                    chartColors.secondary
                ].slice(0, data.order_status_data.labels.length),
                borderWidth: 0,
                borderRadius: 4,
                barThickness: 16
            }]
        };
        
        chart.data = newData;
        chart.update('none');
    }
    
    // Update top products chart
    if (data.product_data && chartInstances.topProductsChart) {
        const chart = chartInstances.topProductsChart;
        const newData = {
            labels: data.product_data.labels,
            datasets: [{
                axis: 'y',
                label: 'Sales',
                data: data.product_data.values,
                fill: false,
                backgroundColor: [
                    chartColors.primary,
                    chartColors.success,
                    chartColors.info,
                    chartColors.purple,
                    chartColors.warning
                ].slice(0, data.product_data.labels.length),
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }]
        };
        
        chart.data = newData;
        chart.update('none');
    }
    
    // Update comparison chart
    if (data.customer_data && chartInstances.comparisonChart) {
        const chart = chartInstances.comparisonChart;
        const newData = {
            labels: data.customer_data.labels,
            datasets: [
                {
                    label: data.customer_data.datasets[0].label,
                    data: data.customer_data.datasets[0].values,
                    backgroundColor: chartColors.primaryTransparent,
                    borderColor: chartColors.primary,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: chartColors.primary
                },
                {
                    label: data.customer_data.datasets[1].label,
                    data: data.customer_data.datasets[1].values,
                    backgroundColor: chartColors.secondaryTransparent,
                    borderColor: chartColors.secondary,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: chartColors.secondary
                }
            ]
        };
        
        chart.data = newData;
        chart.update('none');
    }
    
    // Update user registration chart
    if (data.revenue_data && chartInstances.userRegistrationChart) {
        const chart = chartInstances.userRegistrationChart;
        const newData = {
            labels: data.revenue_data.labels,
            datasets: [{
                label: 'Revenue',
                data: data.revenue_data.values,
                borderColor: chartColors.success,
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        return null;
                    }
                    
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(54, 226, 168, 0.0)');
                    gradient.addColorStop(0.5, 'rgba(54, 226, 168, 0.2)');
                    gradient.addColorStop(1, 'rgba(54, 226, 168, 0.5)');
                    return gradient;
                },
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4
            }]
        };
        
        chart.data = newData;
        chart.update('none');
    }
}

// Initialize WebSocket when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Start WebSocket connection
    initializeWebSocket();
});

// Reconnect WebSocket when the page becomes visible again
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.dashboardSocket && window.dashboardSocket.readyState !== WebSocket.OPEN) {
        // Reconnect if socket is closed when page becomes visible
        initializeWebSocket();
    }
});

// Cleanup WebSocket on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboardSocket && window.dashboardSocket.readyState === WebSocket.OPEN) {
        window.dashboardSocket.close();
    }
});