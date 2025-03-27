from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView
from django.db.models import Sum, Count, Q
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.utils import timezone
from .models import Category, Product, Cart, CartItem, Order, OrderItem, UserProfile
import json
import random
from decimal import Decimal

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
        
        context.update({
            'total_orders': total_orders,
            'recent_orders': recent_orders,
            'total_users': total_users,
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
    
    context = {
        'product': product,
        'related_products': related_products,
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
        is_featured = 'is_featured' in request.POST
        
        category = get_object_or_404(Category, id=category_id)
        
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
        product.is_featured = 'is_featured' in request.POST
        
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
    product = get_object_or_404(Product, slug=product_slug)
    
    if request.method == 'POST':
        product.delete()
        return redirect('product_list')
    
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
    
    # Check if the product is already in the cart
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': 1}
    )
    
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'cart_count': cart.item_count,
        })
    
    return redirect('cart')

def cart_view(request):
    cart = get_or_create_cart(request)
    cart_items = cart.items.all()
    
    context = {
        'cart': cart,
        'cart_items': cart_items,
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
            'cart_count': cart.item_count,
            'cart_total': float(cart.total),
            'item_subtotal': float(cart_item.subtotal) if quantity > 0 else 0,
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
            'cart_count': cart.item_count,
            'cart_total': float(cart.total),
        })
    
    return redirect('cart')

# Checkout views
@login_required
def checkout(request):
    cart = get_or_create_cart(request)
    
    if cart.items.count() == 0:
        return redirect('cart')
    
    if request.method == 'POST':
        # Process the checkout form
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        city = request.POST.get('city')
        state = request.POST.get('state')
        zip_code = request.POST.get('zip_code')
        country = request.POST.get('country')
        
        # Create order
        order = Order(
            user=request.user,
            full_name=full_name,
            email=email,
            phone=phone,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            country=country,
            total=cart.total,
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
                subtotal=cart_item.subtotal
            )
        
        # Clear the cart
        cart.items.all().delete()
        
        # Redirect to success page
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
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            
            # Create user profile
            UserProfile.objects.create(user=user)
            
            return redirect('index')
    else:
        form = UserCreationForm()
    
    return render(request, 'store/signup.html', {'form': form})

@login_required
def profile_view(request):
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    
    # Get user's orders
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    
    context = {
        'profile': profile,
        'orders': orders,
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

# Search
def search_results(request):
    query = request.GET.get('q', '')
    
    if query:
        products = Product.objects.filter(
            Q(name__icontains=query) | 
            Q(description__icontains=query) |
            Q(category__name__icontains=query)
        )
    else:
        products = Product.objects.none()
    
    context = {
        'query': query,
        'products': products,
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
        return {'cart_count': cart.item_count}
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