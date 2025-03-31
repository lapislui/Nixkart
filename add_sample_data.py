import os
import django
import random
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

# Create categories
categories = [
    {
        'name': 'Electronics',
        'description': 'Latest electronic gadgets and devices for tech enthusiasts.'
    },
    {
        'name': 'Fashion',
        'description': 'Trendy clothing, footwear, and accessories for all ages.'
    },
    {
        'name': 'Home & Kitchen',
        'description': 'Everything you need to make your house a home.'
    },
    {
        'name': 'Books',
        'description': 'Bestsellers, new releases, and classics across all genres.'
    },
    {
        'name': 'Sports & Outdoors',
        'description': 'Gear up for adventure with our sports and outdoor equipment.'
    }
]

# Create products
products = [
    {
        'category': 'Electronics',
        'name': 'Smart Watch Pro',
        'description': 'Track your fitness, receive notifications, and more with this premium smartwatch.',
        'price': 199.99,
        'stock': 50,
        'is_featured': True
    },
    {
        'category': 'Electronics',
        'name': 'Wireless Earbuds',
        'description': 'Immersive sound quality with noise cancellation for an uninterrupted audio experience.',
        'price': 129.99,
        'stock': 75,
        'is_featured': True
    },
    {
        'category': 'Electronics',
        'name': 'Ultra HD 4K TV',
        'description': '65-inch smart TV with brilliant colors and seamless streaming capabilities.',
        'price': 899.99,
        'stock': 20,
        'is_featured': True
    },
    {
        'category': 'Fashion',
        'name': 'Premium Denim Jacket',
        'description': 'Classic denim jacket with modern styling, perfect for all seasons.',
        'price': 89.99,
        'stock': 40,
        'is_featured': False
    },
    {
        'category': 'Fashion',
        'name': 'Designer Sunglasses',
        'description': 'Protect your eyes in style with these premium UV-protected sunglasses.',
        'price': 149.99,
        'stock': 35,
        'is_featured': True
    },
    {
        'category': 'Home & Kitchen',
        'name': 'Smart Coffee Maker',
        'description': 'Brew the perfect cup of coffee with app-controlled precision.',
        'price': 159.99,
        'stock': 30,
        'is_featured': False
    },
    {
        'category': 'Home & Kitchen',
        'name': 'Non-stick Cookware Set',
        'description': 'Complete 10-piece cookware set for all your culinary adventures.',
        'price': 199.99,
        'stock': 25,
        'is_featured': False
    },
    {
        'category': 'Books',
        'name': 'Future Technology Trends',
        'description': 'Explore the cutting-edge technologies shaping our future.',
        'price': 24.99,
        'stock': 100,
        'is_featured': False
    },
    {
        'category': 'Books',
        'name': 'Healthy Cooking Guide',
        'description': 'Hundreds of nutritious recipes for a healthier lifestyle.',
        'price': 19.99,
        'stock': 90,
        'is_featured': False
    },
    {
        'category': 'Sports & Outdoors',
        'name': 'Ultra-light Hiking Backpack',
        'description': 'Durable yet lightweight backpack for all your hiking adventures.',
        'price': 79.99,
        'stock': 45,
        'is_featured': True
    }
]

def create_sample_data():
    print("Creating sample data...")
    
    # Create categories
    category_objects = {}
    for category_data in categories:
        category, created = Category.objects.get_or_create(
            name=category_data['name'],
            defaults={
                'description': category_data['description'],
                'slug': slugify(category_data['name'])
            }
        )
        
        if created:
            print(f"Created category: {category.name}")
        else:
            print(f"Category already exists: {category.name}")
            
        category_objects[category.name] = category
    
    # Create products
    for product_data in products:
        category = category_objects.get(product_data['category'])
        
        if not category:
            print(f"Category not found for product: {product_data['name']}")
            continue
        
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults={
                'category': category,
                'description': product_data['description'],
                'price': product_data['price'],
                'stock': product_data['stock'],
                'is_featured': product_data['is_featured'],
                'slug': slugify(product_data['name'])
            }
        )
        
        if created:
            print(f"Created product: {product.name}")
        else:
            print(f"Product already exists: {product.name}")
    
    print("Sample data creation completed!")

if __name__ == "__main__":
    create_sample_data()