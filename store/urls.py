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
    path('', views.dashboard, name='index'),  # Landing page is now the dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/clear-report/', views.clear_report, name='clear_report'),
    path('home/', views.home, name='home'),
    
    # Products
    path('products/', views.product_list, name='product_list'),
    path('product/<slug:product_slug>/', views.product_detail, name='product_detail'),
    path('add-product/', views.add_product, name='add_product'),
    path('product/edit/<slug:product_slug>/', views.edit_product, name='edit_product'),
    path('product/delete/<slug:product_slug>/', views.delete_product, name='delete_product'),
    path('new-arrivals/', views.new_arrivals, name='new_arrivals'),
    path('featured/', views.featured_products, name='featured'),
    path('on-sale/', views.on_sale_products, name='on_sale_products'),
    
    # Categories
    path('categories/', views.category_list, name='categories'),
    path('category/<slug:category_slug>/', views.category_detail, name='category_detail'),
    path('add-category/', views.add_category, name='add_category'),
    path('edit-category/<slug:category_slug>/', views.edit_category, name='edit_category'),
    path('delete-category/<slug:category_slug>/', views.delete_category, name='delete_category'),
    path('category/<slug:category_slug>/add-product/', views.add_product_to_category, name='add_product_to_category'),
    path('category/<slug:category_slug>/products/', views.category_products, name='category_products'),
    
    # Cart
    path('cart/', views.cart_view, name='cart'),
    path('add-to-cart/<slug:product_slug>/', views.add_to_cart, name='add_to_cart'),
    path('update-cart/<int:cart_item_id>/', views.update_cart, name='update_cart'),
    path('remove-from-cart/<int:cart_item_id>/', views.remove_from_cart, name='remove_from_cart'),
    
    # Wishlist
    path('wishlist/', views.wishlist_view, name='wishlist'),
    path('add-to-wishlist/<int:product_id>/', views.add_to_wishlist, name='add_to_wishlist'),
    path('remove-from-wishlist/<int:product_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),
    
    # Checkout
    path('checkout/', views.checkout, name='checkout'),
    path('order-success/', views.order_success, name='order_success'),
    
    # Orders
    path('orders/', views.orders, name='orders'),
    path('user/orders/', views.user_orders, name='user_orders'),
    path('order/<int:order_id>/', views.order_detail, name='order_detail'),
    path('track-order/', views.track_order, name='track_order'),
    
    # Shipping & Returns
    path('shipping/', views.shipping_view, name='shipping'),
    path('returns/', views.returns_view, name='returns'),
    
    # Authentication
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    path('signup/', views.signup, name='signup'),
    
    # Password Management
    path('password-change/', PasswordChangeView.as_view(template_name='store/password_change.html'), name='password_change'),
    path('password-change/done/', PasswordChangeDoneView.as_view(template_name='store/password_change_done.html'), name='password_change_done'),
    path('password-reset/', PasswordResetView.as_view(template_name='store/password_reset.html'), name='password_reset'),
    path('password-reset/done/', PasswordResetDoneView.as_view(template_name='store/password_reset_done.html'), name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(template_name='store/password_reset_confirm.html'), name='password_reset_confirm'),
    path('password-reset-complete/', PasswordResetCompleteView.as_view(template_name='store/password_reset_complete.html'), name='password_reset_complete'),
    
    # User Profile
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('change-email/', views.change_email, name='change_email'),
    
    # Reviews
    path('reviews/<int:product_id>/', views.product_reviews, name='product_reviews'),
    path('add-review/<int:product_id>/', views.add_review, name='add_review'),
    path('edit-review/<int:review_id>/', views.edit_review, name='edit_review'),
    path('delete-review/<int:review_id>/', views.delete_review, name='delete_review'),
    
    # Coupons
    path('coupons/', views.coupons_view, name='coupons'),
    path('apply-coupon/', views.apply_coupon, name='apply_coupon'),
    path('remove-coupon/', views.remove_coupon, name='remove_coupon'),
    
    # Notifications
    path('notifications/', views.notifications_view, name='notifications'),
    path('mark-notification-read/<int:notification_id>/', views.mark_notification_read, name='mark_notification_read'),
    
    # Support
    path('support/', views.support_view, name='support'),
    path('submit-ticket/', views.submit_ticket, name='submit_ticket'),
    path('ticket/<int:ticket_id>/', views.ticket_detail, name='ticket_detail'),
    
    # Newsletter
    path('newsletter-signup/', views.newsletter_signup, name='newsletter_signup'),
    
    # Search
    path('search/', views.search_results, name='search_results'),
    
    # Static Pages
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('faq/', views.faq, name='faq'),
    path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
    path('terms-and-conditions/', views.terms_and_conditions, name='terms_and_conditions'),
    path('privacy/', views.privacy, name='privacy'),
    path('terms/', views.terms, name='terms'),
    
    # Admin Actions
    path('toggle-staff/<int:user_id>/', views.toggle_staff, name='toggle_staff'),
    path('delete-user/<int:user_id>/', views.delete_user, name='delete_user'),
    
    # Reports (Admin)
    path('report/', views.report_page, name='report_page'),
    path('clear_report/', views.clear_report, name='clear_report'),
    path('reset_order_sequence/', views.reset_order_sequence, name='reset_order_sequence'),
    
    # Testing API
    path('get_fake_products/', views.get_fake_products, name='get_fake_products'),
    path('fake-products-page/', views.fake_products_page, name='fake_products_page'),
]

# Add media URLs in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)