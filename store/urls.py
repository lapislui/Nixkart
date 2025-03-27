from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

from .views import CustomLoginView
from django.contrib.auth.views import (
    LogoutView, 
    PasswordChangeView, 
    PasswordChangeDoneView,
    PasswordResetView,
    PasswordResetDoneView,
    PasswordResetConfirmView,
    PasswordResetCompleteView
)

urlpatterns = [
    # Home/Dashboard
    path('', views.dashboard, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    
    # Products
    path('products/', views.product_list, name='product_list'),
    path('product/<slug:product_slug>/', views.product_detail, name='product_detail'),
    path('product/add/', views.add_product, name='add_product'),
    path('product/edit/<slug:product_slug>/', views.edit_product, name='edit_product'),
    path('product/delete/<slug:product_slug>/', views.delete_product, name='delete_product'),
    
    # Categories
    path('categories/', views.category_list, name='categories'),
    path('category/<slug:category_slug>/', views.category_detail, name='category_detail'),
    path('category/add/', views.add_category, name='add_category'),
    path('category/edit/<slug:category_slug>/', views.edit_category, name='edit_category'),
    path('category/delete/<slug:category_slug>/', views.delete_category, name='delete_category'),
    
    # Cart
    path('cart/', views.cart_view, name='cart'),
    path('add-to-cart/<slug:product_slug>/', views.add_to_cart, name='add_to_cart'),
    path('update-cart/<int:cart_item_id>/', views.update_cart, name='update_cart'),
    path('remove-from-cart/<int:cart_item_id>/', views.remove_from_cart, name='remove_from_cart'),
    
    # Checkout
    path('checkout/', views.checkout, name='checkout'),
    path('order-success/', views.order_success, name='order_success'),
    
    # Authentication
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='index'), name='logout'),
    path('signup/', views.signup, name='signup'),
    
    # Password Management
    path('password-change/', PasswordChangeView.as_view(template_name='store/password_change.html'), name='password_change'),
    path('password-change/done/', PasswordChangeDoneView.as_view(template_name='store/password_change_done.html'), name='password_change_done'),
    path('password-reset/', PasswordResetView.as_view(template_name='store/password_reset.html'), name='password_reset'),
    path('password-reset/done/', PasswordResetDoneView.as_view(template_name='store/password_reset_done.html'), name='password_reset_done'),
    path('password-reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(template_name='store/password_reset_confirm.html'), name='password_reset_confirm'),
    path('password-reset/complete/', PasswordResetCompleteView.as_view(template_name='store/password_reset_complete.html'), name='password_reset_complete'),
    
    # User Profile
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/email/change/', views.change_email, name='change_email'),
    
    # Search
    path('search/', views.search_results, name='search_results'),
    
    # Admin Actions
    path('admin/toggle-staff/<int:user_id>/', views.toggle_staff, name='toggle_staff'),
    path('admin/delete-user/<int:user_id>/', views.delete_user, name='delete_user'),
    
    # Reports (Admin)
    path('admin/reports/', views.report_page, name='report_page'),
    path('admin/reports/clear/', views.clear_report, name='clear_report'),
    path('admin/reports/reset-order-sequence/', views.reset_order_sequence, name='reset_order_sequence'),
    
    # Testing API
    path('api/fake-products/', views.get_fake_products, name='get_fake_products'),
    path('fake-products/', views.fake_products_page, name='fake_products_page'),
]

# Add media URLs in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)