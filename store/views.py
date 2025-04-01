from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView
from django.db.models import Sum, Count, Q
from django.db import IntegrityError
from .models import Category, Product, Cart, CartItem, Order, OrderItem, UserProfile, Wishlist, Address
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.utils.text import slugify
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from .payments import create_payment_intent as create_stripe_payment_intent
import json
import random
from decimal import Decimal
from .forms import CustomUserCreationForm, ProductForm, CategoryForm, UserProfileForm

# Custom login view
class CustomLoginView(LoginView):
    template_name = 'store/login.html'
    redirect_authenticated_user = True

# Dashboard view
@login_required
def dashboard(request):
    # Get some stats for the dashboard
    total_products = Product.objects.count()
    categories = Category.objects.annotate(product_count=Count('products'))
    recent_products = Product.objects.order_by('-created_at')[:5]
    
    context = {
        'total_products': total_products,
        'categories': categories,
        'recent_products': recent_products,
    }
    
    if request.user.is_staff:
        # Add admin stats
        total_orders = Order.objects.count()
        recent_orders = Order.objects.order_by('-created_at')[:5]
        total_users = User.objects.count()
        
        # Get real data for charts if available
        # Sales by month (for the sales trend chart)
        sales_by_month = {}
        
        # All orders from the last 12 months
        twelve_months_ago = timezone.now() - timezone.timedelta(days=365)
        orders = Order.objects.filter(created_at__gte=twelve_months_ago)
        
        # Group by month and calculate total sales
        for order in orders:
            month = order.created_at.strftime('%b')  # Abbreviated month name
            if month in sales_by_month:
                sales_by_month[month] += float(order.total)
            else:
                sales_by_month[month] = float(order.total)
        
        # Order by month using month numbers
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        ordered_sales = [sales_by_month.get(month, 0) for month in months]
        
        # Get category distribution data
        category_data = []
        category_labels = []
        for category in categories:
            category_labels.append(category.name)
            # Count total sales in this category
            category_sales = sum(
                float(order_item.subtotal)
                for order in orders
                for order_item in order.items.all()
                if order_item.product_name in [p.name for p in category.products.all()]
            )
            category_data.append(category_sales if category_sales > 0 else 0)
        
        # Order status data
        status_counts = {}
        for status, _ in Order.STATUS_CHOICES:
            status_counts[status] = Order.objects.filter(status=status).count()
        
        status_labels = [status.capitalize() for status, _ in Order.STATUS_CHOICES]
        status_data = [status_counts.get(status.lower(), 0) for status, _ in Order.STATUS_CHOICES]
        
        # Top products data
        top_products = []
        product_sales = {}
        
        # Calculate sales for each product
        for order in orders:
            for item in order.items.all():
                if item.product_name in product_sales:
                    product_sales[item.product_name] += float(item.subtotal)
                else:
                    product_sales[item.product_name] = float(item.subtotal)
        
        # Sort by sales amount and get top 5
        sorted_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
        top_product_labels = [p[0] for p in sorted_products]
        top_product_data = [p[1] for p in sorted_products]
        
        # New users registration trend
        user_registration = {}
        
        # All users from the last 6 months
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        users = User.objects.filter(date_joined__gte=six_months_ago)
        
        # Group by month and count
        for user in users:
            month = user.date_joined.strftime('%b')  # Abbreviated month name
            if month in user_registration:
                user_registration[month] += 1
            else:
                user_registration[month] = 1
        
        # Get last 6 months in order
        current_month = timezone.now().month
        last_6_months = []
        for i in range(6):
            month_number = ((current_month - i - 1) % 12) + 1
            last_6_months.insert(0, months[month_number - 1])
        
        user_reg_data = [user_registration.get(month, 0) for month in last_6_months]
        
        # Sales comparison data (current month vs previous month)
        current_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        prev_month_start = (current_month_start - timezone.timedelta(days=1)).replace(day=1)
        
        current_month_orders = Order.objects.filter(created_at__gte=current_month_start)
        prev_month_orders = Order.objects.filter(created_at__gte=prev_month_start, created_at__lt=current_month_start)
        
        # Group into weeks
        current_month_weeks = [0.0, 0.0, 0.0, 0.0]
        prev_month_weeks = [0.0, 0.0, 0.0, 0.0]
        
        for order in current_month_orders:
            # Determine which week of the month (0-3)
            week = min(3, (order.created_at.day - 1) // 7)
            current_month_weeks[week] += float(order.total)
        
        for order in prev_month_orders:
            # Determine which week of the month (0-3)
            week = min(3, (order.created_at.day - 1) // 7)
            prev_month_weeks[week] += float(order.total)
        
        # Prepare chart data in JSON format for the template
        chart_data = {
            'salesTrendData': {
                'labels': months,
                'datasets': [{
                    'label': 'Sales',
                    'data': ordered_sales,
                    'borderColor': '#6c63ff',
                    'backgroundColor': 'rgba(108, 99, 255, 0.2)',
                    'borderWidth': 3,
                    'pointRadius': 4,
                    'fill': True,
                    'tension': 0.4
                }]
            },
            'categoryData': {
                'labels': category_labels,
                'datasets': [{
                    'data': category_data,
                    'backgroundColor': [
                        '#6c63ff', '#ff6b6b', '#36e2a8', '#ffcf5c', '#4dc9ff',
                        '#b266ff', '#05dfd7', '#fb8c34', '#ff66c4'
                    ],
                    'borderColor': '#1a1b3c',
                    'borderWidth': 2,
                    'hoverOffset': 15
                }]
            },
            'orderStatusData': {
                'labels': status_labels,
                'datasets': [{
                    'data': status_data,
                    'backgroundColor': [
                        '#ffcf5c', '#6c63ff', '#4dc9ff', '#36e2a8', '#ff6b6b'
                    ],
                    'borderWidth': 0,
                    'borderRadius': 4,
                    'barThickness': 16
                }]
            },
            'topProductsData': {
                'labels': top_product_labels,
                'datasets': [{
                    'axis': 'y',
                    'label': 'Sales',
                    'data': top_product_data,
                    'backgroundColor': [
                        '#6c63ff', '#36e2a8', '#4dc9ff', '#b266ff', '#ffcf5c'
                    ],
                    'borderWidth': 1,
                    'borderRadius': 4
                }]
            },
            'userRegistrationData': {
                'labels': last_6_months,
                'datasets': [{
                    'label': 'New Users',
                    'data': user_reg_data,
                    'backgroundColor': 'rgba(77, 201, 255, 0.2)',
                    'borderColor': '#4dc9ff',
                    'borderWidth': 2,
                    'fill': True,
                    'tension': 0.4
                }]
            },
            'comparisonData': {
                'labels': ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                'datasets': [
                    {
                        'label': 'Current Month',
                        'data': current_month_weeks,
                        'backgroundColor': 'rgba(108, 99, 255, 0.2)',
                        'borderColor': '#6c63ff',
                        'borderWidth': 2,
                        'pointRadius': 4
                    },
                    {
                        'label': 'Previous Month',
                        'data': prev_month_weeks,
                        'backgroundColor': 'rgba(255, 107, 107, 0.2)',
                        'borderColor': '#ff6b6b',
                        'borderWidth': 2,
                        'pointRadius': 4
                    }
                ]
            }
        }
        
        context.update({
            'total_orders': total_orders,
            'recent_orders': recent_orders,
            'total_users': total_users,
            'chart_data': chart_data
        })
    
    return render(request, 'store/dashboard.html', context)

# Product views
def product_list(request):
    products = Product.objects.all()
    featured_products = Product.objects.filter(is_featured=True)
    categories = Category.objects.all()
    
    context = {
        'products': products,
        'featured_products': featured_products,
        'categories': categories,
    }
    
    return render(request, 'store/product_list.html', context)

def product_detail(request, product_slug):
    product = get_object_or_404(Product, slug=product_slug)
    related_products = Product.objects.filter(category=product.category).exclude(id=product.id)[:4]
    
    # Check if this product is in the user's wishlist
    is_in_wishlist = False
    if request.user.is_authenticated:
        is_in_wishlist = Wishlist.objects.filter(user=request.user, product=product).exists()
    
    context = {
        'product': product,
        'related_products': related_products,
        'is_in_wishlist': is_in_wishlist
    }
    
    return render(request, 'store/product_detail.html', context)

@staff_member_required
def add_product(request):
    if request.method == 'POST':
        # Process the form data
        name = request.POST.get('name')
        category_id = request.POST.get('category')
        price = request.POST.get('price')
        stock = request.POST.get('stock')
        description = request.POST.get('description')
        
        # Get product attributes from checkboxes
        is_featured = 'is_featured' in request.POST
        is_new_arrival = 'is_new_arrival' in request.POST
        is_best_seller = 'is_best_seller' in request.POST
        is_on_sale = 'is_on_sale' in request.POST
        
        # Get discount percentage if product is on sale
        discount_percentage = 0
        if is_on_sale:
            discount_percentage_str = request.POST.get('discount_percentage')
            if discount_percentage_str and discount_percentage_str.isdigit():
                discount_percentage = int(discount_percentage_str)
        
        category = get_object_or_404(Category, id=category_id)
        
        # Create product instance without saving
        product = Product(
            name=name,
            category=category,
            price=price,
            stock=stock,
            description=description,
            is_featured=is_featured,
            is_new_arrival=is_new_arrival,
            is_best_seller=is_best_seller,
            is_on_sale=is_on_sale,
            discount_percentage=discount_percentage,
        )
        
        if 'image' in request.FILES:
            product.image = request.FILES['image']
        
        if 'model_3d' in request.FILES:
            product.model_3d = request.FILES['model_3d']
            
        # Use Django's built-in form validation
        try:
            # The save method in the Product model will handle slug generation
            product.save()
        except IntegrityError:
            # Handle the case where there's a slug collision by adding a timestamp
            import time
            product.slug = f"{slugify(product.name)}-{int(time.time())}"
            product.save()
        
        return redirect('product_detail', product_slug=product.slug)
    
    categories = Category.objects.all()
    return render(request, 'store/add_product.html', {'categories': categories})

@staff_member_required
def edit_product(request, product_slug):
    product = get_object_or_404(Product, slug=product_slug)
    
    if request.method == 'POST':
        # Process the form data
        product.name = request.POST.get('name')
        product.category_id = request.POST.get('category')
        product.price = request.POST.get('price')
        product.stock = request.POST.get('stock')
        product.description = request.POST.get('description')
        
        # Set product attributes based on checkboxes
        product.is_featured = 'is_featured' in request.POST
        product.is_new_arrival = 'is_new_arrival' in request.POST
        product.is_best_seller = 'is_best_seller' in request.POST
        product.is_on_sale = 'is_on_sale' in request.POST
        
        # Handle discount percentage if product is on sale
        if product.is_on_sale:
            discount_percentage = request.POST.get('discount_percentage')
            if discount_percentage and discount_percentage.isdigit():
                product.discount_percentage = int(discount_percentage)
            else:
                product.discount_percentage = 0
        else:
            product.discount_percentage = 0
            product.sale_price = None
        
        if 'image' in request.FILES:
            product.image = request.FILES['image']
        
        if 'model_3d' in request.FILES:
            product.model_3d = request.FILES['model_3d']
        
        product.save()
        
        return redirect('product_detail', product_slug=product.slug)
    
    categories = Category.objects.all()
    return render(request, 'store/edit_product.html', {'product': product, 'categories': categories})

@staff_member_required
def delete_product(request, product_slug):
    """Delete a product (staff only)"""
    product = get_object_or_404(Product, slug=product_slug)
    
    if request.method == 'POST':
        # Store category for redirect after deletion
        category = product.category
        # Delete the product
        product_name = product.name
        product.delete()
        
        # Show success message
        messages.success(request, f"Product '{product_name}' has been deleted successfully.")
        
        # Redirect to the product list or category page
        return redirect('category_detail', category_slug=category.slug)
    
    return render(request, 'store/delete_product.html', {'product': product})

# Category views
def category_list(request):
    categories = Category.objects.all()
    return render(request, 'store/category_list.html', {'categories': categories})

def category_detail(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    products = Product.objects.filter(category=category)
    
    context = {
        'category': category,
        'products': products,
    }
    
    return render(request, 'store/category_detail.html', context)

@staff_member_required
def add_category(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description')
        
        category = Category(
            name=name,
            description=description,
        )
        
        if 'image' in request.FILES:
            category.image = request.FILES['image']
        
        category.save()
        
        return redirect('category_detail', category_slug=category.slug)
    
    return render(request, 'store/add_category.html')

@staff_member_required
def edit_category(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    
    if request.method == 'POST':
        category.name = request.POST.get('name')
        category.description = request.POST.get('description')
        
        if 'image' in request.FILES:
            category.image = request.FILES['image']
        
        category.save()
        
        return redirect('category_detail', category_slug=category.slug)
    
    return render(request, 'store/edit_category.html', {'category': category})

@staff_member_required
def delete_category(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    
    if request.method == 'POST':
        category.delete()
        return redirect('categories')
    
    return render(request, 'store/delete_category.html', {'category': category})

# Cart views
def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
        
        cart, created = Cart.objects.get_or_create(session_id=session_id)
    
    return cart

@require_POST
def add_to_cart(request, product_slug):
    product = get_object_or_404(Product, slug=product_slug)
    cart = get_or_create_cart(request)
    
    # Get quantity from form data or JSON body
    quantity = 1
    
    # Handle JSON request body
    if request.headers.get('Content-Type') == 'application/json':
        try:
            data = json.loads(request.body)
            quantity = int(data.get('quantity', 1))
        except (ValueError, json.JSONDecodeError):
            quantity = 1
    else:
        # Handle regular form submission
        quantity = int(request.POST.get('quantity', 1))
    
    # Check if the product is already in the cart
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    
    # If it already exists, update the quantity instead
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'cart_count': cart.item_count(),
        })
    
    return redirect('cart')

def cart_view(request):
    
    cart = get_or_create_cart(request)
    cart_items = cart.items.all()
    
    # Calculate cart summary
    cart_subtotal = sum(item.get_subtotal() for item in cart_items)
    shipping_cost = 5.99 if cart_subtotal < 50 else 0  # Free shipping over $50
    
    # Calculate tax (assuming 8% tax rate)
    tax_rate = 8
    tax_amount = (cart_subtotal * tax_rate) / 100
    
    # Get applied coupon if any
    applied_coupon = getattr(cart, 'coupon', None)
    discount_amount = 0
    if applied_coupon:
        discount_amount = (cart_subtotal * applied_coupon.discount_percent) / 100
    
    # Calculate final total
    cart_total = cart_subtotal + shipping_cost + tax_amount - discount_amount
    
    context = {
        'cart': cart,
        'cart_items': cart_items,
        'cart_subtotal': cart_subtotal,
        'shipping_cost': shipping_cost,
        'tax_amount': tax_amount,
        'discount_amount': discount_amount,
        'cart_total': cart_total,
        'applied_coupon': applied_coupon,
    }
    
    return render(request, 'store/cart.html', context)

@require_POST
def update_cart(request, cart_item_id):
    cart_item = get_object_or_404(CartItem, id=cart_item_id)
    quantity = int(request.POST.get('quantity', 1))
    
    if quantity > 0:
        cart_item.quantity = quantity
        cart_item.save()
    else:
        cart_item.delete()
    
    cart = cart_item.cart
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'cart_count': cart.item_count(),
            'cart_total': float(cart.total()),
            'item_subtotal': float(cart_item.subtotal()) if quantity > 0 else 0,
        })
    
    return redirect('cart')

@require_POST
def remove_from_cart(request, cart_item_id):
    cart_item = get_object_or_404(CartItem, id=cart_item_id)
    cart = cart_item.cart
    cart_item.delete()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'cart_count': cart.item_count(),
            'cart_total': float(cart.total()),
        })
    
    return redirect('cart')

# Payment Intent creation
@csrf_exempt
def create_payment_intent(request):
    """Create a PaymentIntent with the order amount and currency"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        amount = data.get('amount', 0)
        
        if not amount:
            return JsonResponse({'error': 'Amount is required'}, status=400)
        
        # Create a PaymentIntent with the order amount and currency
        result = create_stripe_payment_intent(amount)
        
        if result['success']:
            return JsonResponse({
                'clientSecret': result['client_secret'],
                'intentId': result['intent_id']
            })
        else:
            return JsonResponse({'error': result['error']}, status=400)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# Checkout views
@login_required
def checkout(request):
    cart = get_or_create_cart(request)
    
    if cart.items.count() == 0:
        return redirect('cart')
    
    if request.method == 'POST':
        # Process the checkout form
        # Get shipping information
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        full_name = f"{first_name} {last_name}"
        email = request.POST.get('email', '')
        phone = request.POST.get('phone', '')
        address = request.POST.get('address', '')
        city = request.POST.get('city', '')
        state = request.POST.get('state', '')
        zip_code = request.POST.get('zip', '')  # Form field name is 'zip'
        country = request.POST.get('country', '')
        
        # Get payment information
        payment_method = request.POST.get('payment_method', 'credit_card')
        
        # Process different payment methods
        payment_status = 'pending'  # Default payment status
        if payment_method == 'credit_card':
            # Simple card validation would go here in a real system
            card_name = request.POST.get('card_name', '')
            card_number = request.POST.get('card_number', '')
            card_expiry = request.POST.get('expiry', '')
            card_cvv = request.POST.get('cvv', '')
            
            # Basic validation
            if not (card_name and card_number and card_expiry and card_cvv):
                messages.error(request, 'Please fill in all payment fields.')
                return redirect('checkout')
            
            # In a real system, we would process the payment with a payment gateway
            # For demo purposes, we'll always consider the payment successful
            payment_status = 'processed'
            
        elif payment_method == 'paypal':
            # In a real app, you would redirect to PayPal here
            payment_status = 'processed'
            
        elif payment_method == 'apple_pay':
            # In a real app, you would process Apple Pay here
            payment_status = 'processed'
        
        # Create order
        order = Order(
            user=request.user if request.user.is_authenticated else None,
            full_name=full_name,
            email=email,
            phone=phone,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            country=country,
            total=cart.total(),
            status='pending'
        )
        order.save()
        
        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product_name=cart_item.product.name,
                product_price=cart_item.product.price,
                quantity=cart_item.quantity,
                subtotal=cart_item.subtotal()
            )
        
        # Clear the cart
        cart.items.all().delete()
        
        # Show success message
        messages.success(request, 'Your order has been placed successfully!')
        
        # Check if this is an AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'redirect_url': reverse('order_success')
            })
        
        # For non-AJAX requests, redirect directly
        return redirect('order_success')
    
    # Get user profile for pre-filling checkout form
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    
    context = {
        'cart': cart,
        'cart_items': cart.items.all(),
        'profile': profile,
    }
    
    return render(request, 'store/checkout.html', context)

def order_success(request):
    return render(request, 'store/order_success.html')

# User views
def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            
            # UserProfile is automatically created by the post_save signal
            
            return redirect('index')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'store/signup.html', {'form': form})

@login_required
def profile_view(request):
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    
    # Get user's orders
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    
    # Get user's wishlist items
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
    
    # Get user's addresses
    addresses = Address.objects.filter(user=request.user)
    
    context = {
        'profile': profile,
        'orders': orders,
        'wishlist_items': wishlist_items,
        'addresses': addresses,
    }
    
    return render(request, 'store/profile.html', context)

@login_required
def edit_profile(request):
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    
    if request.method == 'POST':
        # Process form data
        profile.bio = request.POST.get('bio', '')
        profile.phone = request.POST.get('phone', '')
        profile.address = request.POST.get('address', '')
        profile.city = request.POST.get('city', '')
        profile.state = request.POST.get('state', '')
        profile.zip_code = request.POST.get('zip_code', '')
        profile.country = request.POST.get('country', '')
        
        if 'profile_image' in request.FILES:
            profile.profile_image = request.FILES['profile_image']
        
        profile.save()
        
        # Update user info
        user = request.user
        user.first_name = request.POST.get('first_name', '')
        user.last_name = request.POST.get('last_name', '')
        user.save()
        
        return redirect('profile')
    
    return render(request, 'store/edit_profile.html', {'profile': profile})

@login_required
def change_email(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        if email:
            request.user.email = email
            request.user.save()
            return redirect('profile')
    
    return render(request, 'store/change_email.html')

# Address Management
@login_required
def address_list(request):
    addresses = Address.objects.filter(user=request.user)
    return render(request, 'store/address_list.html', {'addresses': addresses})

@login_required
def add_address(request):
    if request.method == 'POST':
        # Get form data
        title = request.POST.get('title')
        name = request.POST.get('name')
        address_line1 = request.POST.get('address_line1')
        address_line2 = request.POST.get('address_line2', '')
        city = request.POST.get('city')
        state = request.POST.get('state')
        zip_code = request.POST.get('zip_code')
        country = request.POST.get('country')
        phone = request.POST.get('phone')
        is_default = request.POST.get('is_default') == 'on'
        
        # Create address
        address = Address(
            user=request.user,
            title=title,
            name=name,
            address_line1=address_line1,
            address_line2=address_line2,
            city=city,
            state=state,
            zip_code=zip_code,
            country=country,
            phone=phone,
            is_default=is_default
        )
        address.save()
        
        messages.success(request, 'Address added successfully.')
        return redirect('profile')
    
    return render(request, 'store/add_address.html')

@login_required
def edit_address(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    
    if request.method == 'POST':
        # Update address
        address.title = request.POST.get('title')
        address.name = request.POST.get('name')
        address.address_line1 = request.POST.get('address_line1')
        address.address_line2 = request.POST.get('address_line2', '')
        address.city = request.POST.get('city')
        address.state = request.POST.get('state')
        address.zip_code = request.POST.get('zip_code')
        address.country = request.POST.get('country')
        address.phone = request.POST.get('phone')
        address.is_default = request.POST.get('is_default') == 'on'
        
        address.save()
        
        messages.success(request, 'Address updated successfully.')
        return redirect('profile')
    
    return render(request, 'store/edit_address.html', {'address': address})

@login_required
def delete_address(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    
    # Check if this is the only address
    if Address.objects.filter(user=request.user).count() == 1:
        messages.error(request, 'You cannot delete your only address.')
        return redirect('profile')
    
    address.delete()
    messages.success(request, 'Address deleted successfully.')
    
    return redirect('profile')

@login_required
def set_default_address(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    
    # Set all addresses to non-default
    Address.objects.filter(user=request.user).update(is_default=False)
    
    # Set this one as default
    address.is_default = True
    address.save()
    
    messages.success(request, f'"{address.title}" is now your default address.')
    
    return redirect('profile')

# Search
def search_results(request):
    query = request.GET.get('q', '')
    selected_category = request.GET.get('category', '')
    min_price = request.GET.get('min_price', '')
    max_price = request.GET.get('max_price', '')
    in_stock = request.GET.get('in_stock', '')
    featured = request.GET.get('featured', '')
    sort_by = request.GET.get('sort', 'relevance')
    
    # Start with base queryset
    if query:
        products = Product.objects.filter(
            Q(name__icontains=query) | 
            Q(description__icontains=query) |
            Q(category__name__icontains=query)
        )
    else:
        products = Product.objects.all()
    
    # Apply filters
    if selected_category:
        products = products.filter(category__slug=selected_category)
    
    if min_price:
        try:
            products = products.filter(price__gte=float(min_price))
        except ValueError:
            pass
    
    if max_price:
        try:
            products = products.filter(price__lte=float(max_price))
        except ValueError:
            pass
    
    if in_stock == 'true':
        products = products.filter(stock__gt=0)
    
    if featured == 'true':
        products = products.filter(is_featured=True)
    
    # Apply sorting
    if sort_by == 'price_asc':
        products = products.order_by('price')
    elif sort_by == 'price_desc':
        products = products.order_by('-price')
    elif sort_by == 'newest':
        products = products.order_by('-created_at')
    elif sort_by == 'popularity':
        # This is a placeholder for popularity - in a real app you might use
        # order count or views as a measure of popularity
        products = products.order_by('-is_featured', '-created_at')
    
    # Get all categories for filter sidebar
    categories = Category.objects.all()
    
    context = {
        'query': query,
        'products': products,
        'categories': categories,
        'selected_category': selected_category,
        'min_price': min_price,
        'max_price': max_price,
        'in_stock': in_stock,
        'featured': featured,
        'sort_by': sort_by,
    }
    
    return render(request, 'store/search_results.html', context)

# Admin views
@staff_member_required
def toggle_staff(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user != request.user:  # Don't allow toggling your own staff status
        user.is_staff = not user.is_staff
        user.save()
    
    return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))

@staff_member_required
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user != request.user:  # Don't allow deleting yourself
        user.delete()
    
    return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))

@staff_member_required
def report_page(request):
    # Generate some reports
    total_products = Product.objects.count()
    total_categories = Category.objects.count()
    total_orders = Order.objects.count()
    total_users = User.objects.count()
    
    # Sales by category
    categories = Category.objects.annotate(product_count=Count('products'))
    
    context = {
        'total_products': total_products,
        'total_categories': total_categories,
        'total_orders': total_orders,
        'total_users': total_users,
        'categories': categories,
    }
    
    return render(request, 'store/report.html', context)

@staff_member_required
def clear_report(request):
    # This would clear any cached report data
    return redirect('report_page')

@staff_member_required
def reset_order_sequence(request):
    # This would reset the order sequence in the database
    return redirect('report_page')

# Helper for context processor
def cart_count(request):
    if request.user.is_authenticated:
        cart = get_or_create_cart(request)
        return {'cart_count': cart.item_count()}
    return {'cart_count': 0}

# Fake products for testing
def get_fake_products(request):
    fake_products = []
    categories = ["Electronics", "Clothing", "Home", "Sports", "Books"]
    
    for i in range(10):
        product = {
            "id": i + 1,
            "name": f"Product {i + 1}",
            "price": random.uniform(9.99, 99.99),
            "category": random.choice(categories),
            "description": f"This is a description for Product {i + 1}",
        }
        fake_products.append(product)
    
    return JsonResponse({"products": fake_products})

def fake_products_page(request):
    return render(request, "store/fake_products.html")

# Additional Views for the expanded site

def home(request):
    """Home page view with featured products and promotions."""
    featured_products = Product.objects.filter(is_featured=True)[:8]
    new_products = Product.objects.filter(is_new_arrival=True)[:8]
    best_sellers = Product.objects.filter(is_best_seller=True)[:8]
    on_sale = Product.objects.filter(is_on_sale=True)[:8]
    categories = Category.objects.all()[:6]
    
    context = {
        'featured_products': featured_products,
        'new_products': new_products,
        'best_sellers': best_sellers,
        'on_sale_products': on_sale,
        'categories': categories,
        'page_title': 'Home'
    }
    
    return render(request, 'store/home.html', context)

def add_product_to_category(request, category_slug):
    """Add a product directly to a specific category."""
    category = get_object_or_404(Category, slug=category_slug)
    
    if request.method == 'POST':
        # Process the form data
        name = request.POST.get('name')
        price = request.POST.get('price')
        stock = request.POST.get('stock')
        description = request.POST.get('description')
        is_featured = 'is_featured' in request.POST
        
        # Create product instance without saving
        product = Product(
            name=name,
            category=category,
            price=price,
            stock=stock,
            description=description,
            is_featured=is_featured,
        )
        
        if 'image' in request.FILES:
            product.image = request.FILES['image']
        
        if 'model_3d' in request.FILES:
            product.model_3d = request.FILES['model_3d']
        
        # Use Django's built-in form validation
        try:
            # The save method in the Product model will handle slug generation
            product.save()
        except IntegrityError:
            # Handle the case where there's a slug collision by adding a timestamp
            import time
            product.slug = f"{slugify(product.name)}-{int(time.time())}"
            product.save()
        
        return redirect('category_detail', category_slug=category.slug)
    
    return render(request, 'store/add_product_to_category.html', {'category': category})

def category_products(request, category_slug):
    """View all products in a specific category."""
    category = get_object_or_404(Category, slug=category_slug)
    products = Product.objects.filter(category=category)
    
    context = {
        'category': category,
        'products': products,
        'page_title': f'{category.name} Products'
    }
    
    return render(request, 'store/category_products.html', context)

def user_orders(request):
    """View all orders for the current user."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    
    context = {
        'orders': orders,
        'page_title': 'My Orders'
    }
    
    return render(request, 'store/user_orders.html', context)

def order_detail(request, order_id):
    """View details for a specific order."""
    order = get_object_or_404(Order, id=order_id)
    
    # Check if the order belongs to the current user or if the user is staff
    if order.user != request.user and not request.user.is_staff:
        return redirect('index')
    
    order_items = order.items.all()
    
    context = {
        'order': order,
        'order_items': order_items,
        'page_title': f'Order #{order.id}'
    }
    
    return render(request, 'store/order_detail.html', context)

def wishlist_view(request):
    """View the current user's wishlist."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Debugging information
    print(f"USER: {request.user.username}")
    
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
    
    # More debugging information
    print(f"WISHLIST ITEMS: {wishlist_items}")
    
    context = {
        'page_title': 'My Wishlist',
        'wishlist_items': wishlist_items
    }
    
    return render(request, 'store/wishlist.html', context)

def add_to_wishlist(request, product_id):
    """Add a product to the user's wishlist."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    product = get_object_or_404(Product, id=product_id)
    
    # Check if item exists in wishlist
    try:
        wishlist_item = Wishlist.objects.get(user=request.user, product=product)
        # If it exists, remove it (toggle behavior)
        wishlist_item.delete()
        created = False
        messages.info(request, 'Product removed from your wishlist.')
    except Wishlist.DoesNotExist:
        # If it doesn't exist, create it
        wishlist_item = Wishlist.objects.create(user=request.user, product=product)
        created = True
        messages.success(request, 'Product added to your wishlist!')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'created': created,
            'message': 'Added to wishlist' if created else 'Removed from wishlist'
        })
    
    return redirect('product_detail', product_slug=product.slug)

def remove_from_wishlist(request, product_id):
    """Remove a product from the user's wishlist."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    product = get_object_or_404(Product, id=product_id)
    
    try:
        wishlist_item = Wishlist.objects.get(user=request.user, product=product)
        wishlist_item.delete()
        messages.success(request, 'Product removed from your wishlist!')
    except Wishlist.DoesNotExist:
        messages.info(request, 'This product is not in your wishlist.')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True})
    
    return redirect('product_detail', product_slug=product.slug)

def newsletter_signup(request):
    """Handle newsletter signup."""
    if request.method == 'POST':
        email = request.POST.get('email')
        if email:
            # Process the newsletter signup (placeholder for now)
            messages.success(request, 'Thank you for subscribing to our newsletter!')
        
    return redirect('index')

def new_arrivals(request):
    """View new arrival products."""
    products = Product.objects.filter(is_new_arrival=True).order_by('-created_at')
    
    context = {
        'products': products,
        'page_title': 'New Arrivals'
    }
    
    return render(request, 'store/new_arrivals.html', context)

def featured_products(request):
    """View featured products."""
    products = Product.objects.filter(is_featured=True)
    
    context = {
        'products': products,
        'page_title': 'Featured Products'
    }
    
    return render(request, 'store/featured_products.html', context)

def best_sellers(request):
    """View best-selling products."""
    products = Product.objects.filter(is_best_seller=True)
    
    context = {
        'products': products,
        'page_title': 'Best Sellers'
    }
    
    return render(request, 'store/best_sellers.html', context)

def on_sale_products(request):
    """View products on sale."""
    products = Product.objects.filter(is_on_sale=True).order_by('-discount_percentage')
    
    context = {
        'products': products,
        'page_title': 'Products on Sale'
    }
    
    return render(request, 'store/on_sale_products.html', context)

def product_reviews(request, product_id):
    """View reviews for a specific product."""
    product = get_object_or_404(Product, id=product_id)
    
    # Since we don't have a Review model yet, use placeholder data
    context = {
        'product': product,
        'page_title': f'Reviews for {product.name}'
    }
    
    return render(request, 'store/product_reviews.html', context)

def add_review(request, product_id):
    """Add a review for a product."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    product = get_object_or_404(Product, id=product_id)
    
    # Placeholder message
    messages.info(request, 'Review functionality will be implemented soon.')
    
    return redirect('product_detail', product_slug=product.slug)

def edit_review(request, review_id):
    """Edit an existing review."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Placeholder redirect
    return redirect('index')

def delete_review(request, review_id):
    """Delete a review."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Placeholder redirect
    return redirect('index')

def orders(request):
    """Admin view for all orders."""
    if not request.user.is_staff:
        return redirect('index')
    
    orders = Order.objects.all().order_by('-created_at')
    
    context = {
        'orders': orders,
        'page_title': 'All Orders'
    }
    
    return render(request, 'store/orders.html', context)

def track_order(request):
    """Track an order by ID."""
    order_id = request.GET.get('order_id')
    order = None
    
    if order_id:
        try:
            order = Order.objects.get(id=order_id)
            # Check if the order belongs to the current user or if the user is staff
            if order.user != request.user and not request.user.is_staff:
                order = None
                messages.error(request, 'Order not found.')
        except Order.DoesNotExist:
            messages.error(request, 'Order not found.')
    
    context = {
        'order': order,
        'page_title': 'Track Order'
    }
    
    return render(request, 'store/track_order.html', context)

def shipping_view(request):
    """View shipping information."""
    return render(request, 'store/shipping.html', {'page_title': 'Shipping Information'})

def returns_view(request):
    """View returns information."""
    return render(request, 'store/returns.html', {'page_title': 'Returns & Refunds'})

def coupons_view(request):
    """View available coupons."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Placeholder for now
    context = {
        'page_title': 'Available Coupons'
    }
    
    return render(request, 'store/coupons.html', context)

def apply_coupon(request):
    """Apply a coupon to the current order."""
    if request.method == 'POST':
        coupon_code = request.POST.get('coupon_code')
        
        # Placeholder message
        messages.info(request, 'Coupon functionality will be implemented soon.')
    
    return redirect('cart')

def remove_coupon(request):
    """Remove the coupon from the current order."""
    # Placeholder message
    messages.info(request, 'Coupon functionality will be implemented soon.')
    
    return redirect('cart')

def notifications_view(request):
    """View user notifications."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Placeholder for now
    context = {
        'page_title': 'Notifications'
    }
    
    return render(request, 'store/notifications.html', context)

def mark_notification_read(request, notification_id):
    """Mark a notification as read."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Placeholder redirect
    return redirect('notifications')

def support_view(request):
    """View support page and existing tickets."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Placeholder for now
    context = {
        'page_title': 'Support'
    }
    
    return render(request, 'store/support.html', context)

def submit_ticket(request):
    """Submit a new support ticket."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    if request.method == 'POST':
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        if subject and message:
            # Placeholder message
            messages.success(request, 'Your support ticket has been submitted!')
            return redirect('support')
    
    return render(request, 'store/submit_ticket.html', {'page_title': 'Submit Support Ticket'})

def ticket_detail(request, ticket_id):
    """View details for a specific support ticket."""
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Placeholder redirect
    return redirect('support')

# Static Pages
def about(request):
    """About page."""
    return render(request, 'store/about.html', {'page_title': 'About Us'})

def contact(request):
    """Contact page."""
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')
        
        if name and email and message:
            # Placeholder message
            messages.success(request, 'Your message has been sent!')
            return redirect('contact')
    
    return render(request, 'store/contact.html', {'page_title': 'Contact Us'})

def faq(request):
    """FAQ page."""
    # Placeholder data
    faqs = [
        {'question': 'How do I place an order?', 'answer': 'Browse our products, add items to your cart, and proceed to checkout.'},
        {'question': 'What payment methods do you accept?', 'answer': 'We accept credit cards, PayPal, and bank transfers.'},
        {'question': 'How long does shipping take?', 'answer': 'Shipping typically takes 3-5 business days, depending on your location.'},
    ]
    
    return render(request, 'store/faq.html', {'faqs': faqs, 'page_title': 'FAQs'})

def privacy_policy(request):
    """Privacy policy page."""
    return render(request, 'store/privacy_policy.html', {'page_title': 'Privacy Policy'})

def terms_and_conditions(request):
    """Terms and conditions page."""
    return render(request, 'store/terms_and_conditions.html', {'page_title': 'Terms & Conditions'})

def privacy(request):
    """Alias for privacy policy."""
    return redirect('privacy_policy')

def terms(request):
    """Alias for terms and conditions."""
    return redirect('terms_and_conditions')

def logout_view(request):
    """Custom logout view that works with GET requests."""
    logout(request)
    return redirect('login')

def social_account_login(request, provider):
    """Redirect to the django-allauth provider's OAuth login URL."""
    # Simply redirect to the allauth URL for the provider
    from allauth.socialaccount.providers.oauth2.views import OAuth2Adapter
    from allauth.socialaccount.models import SocialApp
    
    try:
        # Check if the provider is configured
        SocialApp.objects.get(provider=provider)
        # Redirect to the proper django-allauth URL
        return redirect(f'/accounts/{provider}/login/?process=login')
    except SocialApp.DoesNotExist:
        # Provider not configured, show error message
        messages.error(request, f"{provider.title()} authentication is not configured. Please try another method.")
        # Redirect back to login page
        return redirect('login')
