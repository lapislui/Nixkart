"""
WebSocket consumers for store app.
"""

import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db.models import Count, Sum
from .models import Product, Category, Order, OrderItem, Cart, CartItem

class DashboardConsumer(AsyncWebsocketConsumer):
    """
    Consumer for dashboard WebSocket connections.
    Sends real-time updates to the dashboard charts.
    """
    
    async def connect(self):
        """
        Called when the WebSocket is handshaking as part of initial connection.
        """
        await self.accept()
        self.send_data_task = asyncio.create_task(self.send_dashboard_data())
    
    async def disconnect(self, close_code):
        """
        Called when the WebSocket closes for any reason.
        """
        # Cancel the background task
        self.send_data_task.cancel()
        try:
            await self.send_data_task
        except asyncio.CancelledError:
            pass
    
    async def receive(self, text_data):
        """
        Called when we get a text frame from the client.
        """
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')
        
        if message == 'get_data':
            # Send data immediately if requested
            await self.send_dashboard_data_once()
    
    async def send_dashboard_data_once(self):
        """
        Send dashboard data once.
        """
        await self.send(text_data=json.dumps({
            'sales_data': await self.get_sales_data(),
            'product_data': await self.get_product_data(),
            'customer_data': await self.get_customer_data(),
            'category_data': await self.get_category_data(),
            'order_status_data': await self.get_order_status_data(),
            'revenue_data': await self.get_revenue_data(),
        }))
    
    async def send_dashboard_data(self):
        """
        Background task that sends dashboard data every few seconds.
        """
        try:
            while True:
                await self.send_dashboard_data_once()
                await asyncio.sleep(5)  # Update every 5 seconds
        except asyncio.CancelledError:
            # Task was cancelled, clean up
            raise
    
    async def get_sales_data(self):
        """
        Get sales data for the bar chart.
        In a real app, you would query the database for actual values.
        """
        # Simulate some random data for demo purposes
        # In a production app, you would query the database
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Base data with small variations
        base_values = [5400, 5800, 6200, 6800, 7400, 8000, 8600, 9200, 9800, 10400, 10800, 11200]
        
        # Add a random variation
        sales_values = [base + random.randint(-200, 200) for base in base_values]
        
        return {
            'labels': months,
            'values': sales_values
        }
    
    async def get_product_data(self):
        """
        Get product data for the pie chart.
        """
        products = ['Electronics', 'Clothing', 'Home', 'Beauty', 'Books']
        
        # Base data with small variations
        base_values = [35, 25, 20, 15, 5]
        
        # Add a random variation
        values = [base + random.randint(-2, 2) for base in base_values]
        
        return {
            'labels': products,
            'values': values
        }
    
    async def get_customer_data(self):
        """
        Get customer acquisition data for the line chart.
        """
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Base data with small variations
        new_customer_base = [120, 150, 170, 190, 210, 250, 280, 300, 330, 350, 370, 390]
        returning_customer_base = [80, 100, 120, 140, 160, 190, 210, 230, 250, 270, 290, 310]
        
        # Add a random variation
        new_customer_values = [base + random.randint(-10, 10) for base in new_customer_base]
        returning_customer_values = [base + random.randint(-10, 10) for base in returning_customer_base]
        
        return {
            'labels': months,
            'datasets': [
                {
                    'label': 'New Customers',
                    'values': new_customer_values
                },
                {
                    'label': 'Returning Customers',
                    'values': returning_customer_values
                }
            ]
        }
    
    async def get_category_data(self):
        """
        Get category distribution data for the radar chart.
        """
        categories = ['Electronics', 'Clothing', 'Furniture', 'Beauty', 'Books', 'Sports']
        
        # Base metrics
        sales_base = [70, 60, 50, 40, 30, 20]
        views_base = [80, 70, 60, 50, 40, 30]
        inventory_base = [60, 50, 40, 30, 20, 10]
        
        # Add a random variation
        sales_values = [base + random.randint(-5, 5) for base in sales_base]
        views_values = [base + random.randint(-5, 5) for base in views_base]
        inventory_values = [base + random.randint(-3, 3) for base in inventory_base]
        
        return {
            'labels': categories,
            'datasets': [
                {
                    'label': 'Sales',
                    'values': sales_values
                },
                {
                    'label': 'Views',
                    'values': views_values
                },
                {
                    'label': 'Inventory',
                    'values': inventory_values
                }
            ]
        }
    
    async def get_order_status_data(self):
        """
        Get order status data for the doughnut chart.
        """
        statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
        
        # Base values with small variations
        base_values = [15, 25, 30, 25, 5]
        
        # Add a random variation
        values = [base + random.randint(-2, 2) for base in base_values]
        
        return {
            'labels': statuses,
            'values': values
        }
    
    async def get_revenue_data(self):
        """
        Get revenue data for the line chart with gradient.
        """
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        # Base values with small variations
        base_values = [1200, 1900, 1500, 1800, 2200, 2600, 2300]
        
        # Add a random variation
        values = [base + random.randint(-100, 100) for base in base_values]
        
        return {
            'labels': days,
            'values': values
        }