/**
 * Cart Animations for E-Commerce Store
 * This script handles animations for cart interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Cart animations initialized');
    
    // Initialize all cart animations
    initAddToCartAnimations();
    initCartPageAnimations();
    initQuantityChangeAnimations();
    initCartRemovalAnimations();
});

/**
 * Initialize add to cart button animations
 */
function initAddToCartAnimations() {
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productSlug = this.getAttribute('data-product-slug');
            const productCard = this.closest('.product-card');
            
            if (productSlug && productCard) {
                const productImage = productCard.querySelector('.product-image');
                const cartIcon = document.querySelector('.cart-icon-wrapper');
                
                if (productImage && cartIcon) {
                    // Create a copy of the image to animate
                    flyToCart(productImage, cartIcon);
                }
                
                // Send AJAX request to add product to cart
                fetch(`/add-to-cart/${productSlug}/`, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCsrfToken(),
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Animate cart icon
                        animateCartIcon();
                        
                        // Update cart count
                        updateCartCount(data.cart_count);
                        
                        // Show success message
                        const toast = document.createElement('div');
                        toast.classList.add('toast', 'show', 'toast-success');
                        toast.innerHTML = `
                            <div class="toast-header">
                                <strong class="me-auto">Success</strong>
                                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                            </div>
                            <div class="toast-body">
                                Product added to your cart!
                            </div>
                        `;
                        
                        const toastContainer = document.getElementById('toastContainer');
                        if (toastContainer) {
                            toastContainer.appendChild(toast);
                            
                            // Remove toast after 3 seconds
                            setTimeout(() => {
                                toast.classList.add('hiding');
                                setTimeout(() => {
                                    toastContainer.removeChild(toast);
                                }, 300);
                            }, 3000);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                });
            }
        });
    });
}

/**
 * Initialize animations on the cart page
 */
function initCartPageAnimations() {
    const cartItems = document.querySelectorAll('.cart-item');
    
    // Add staggered fade-in animation to cart items
    cartItems.forEach((item, index) => {
        item.style.opacity = '0';
        setTimeout(() => {
            item.style.animation = 'fadeInUp 0.5s ease-out forwards';
            item.style.opacity = '1';
        }, 100 * index);
    });
    
    // Animate cart summary
    const cartSummary = document.querySelector('.cart-summary');
    if (cartSummary) {
        cartSummary.style.opacity = '0';
        setTimeout(() => {
            cartSummary.style.animation = 'fadeInRight 0.5s ease-out forwards';
            cartSummary.style.opacity = '1';
        }, 100 * cartItems.length);
    }
}

/**
 * Initialize quantity change animations
 */
function initQuantityChangeAnimations() {
    const quantityControls = document.querySelectorAll('.quantity-control');
    
    quantityControls.forEach(control => {
        const decreaseBtn = control.querySelector('.quantity-decrease');
        const increaseBtn = control.querySelector('.quantity-increase');
        const input = control.querySelector('.quantity-input');
        
        if (decreaseBtn && increaseBtn && input) {
            const cartItemId = control.getAttribute('data-cart-item-id');
            
            if (cartItemId) {
                // Quantity decrease button
                decreaseBtn.addEventListener('click', () => {
                    const currentValue = parseInt(input.value);
                    if (currentValue > 1) {
                        input.value = currentValue - 1;
                        updateCartItemQuantity(cartItemId, currentValue - 1)
                            .then(data => {
                                if (data.success) {
                                    // Update subtotal with animation
                                    const subtotalElement = document.querySelector(`.cart-item[data-cart-item-id="${cartItemId}"] .cart-item-subtotal`);
                                    if (subtotalElement) {
                                        animatePriceUpdate(subtotalElement, `$${data.item_subtotal.toFixed(2)}`);
                                    }
                                    
                                    // Update cart totals
                                    updateCartTotals(`$${data.cart_total.toFixed(2)}`, `$${data.cart_total.toFixed(2)}`);
                                    
                                    // Update cart count
                                    updateCartCount(data.cart_count);
                                }
                            });
                    }
                });
                
                // Quantity increase button
                increaseBtn.addEventListener('click', () => {
                    const currentValue = parseInt(input.value);
                    input.value = currentValue + 1;
                    updateCartItemQuantity(cartItemId, currentValue + 1)
                        .then(data => {
                            if (data.success) {
                                // Update subtotal with animation
                                const subtotalElement = document.querySelector(`.cart-item[data-cart-item-id="${cartItemId}"] .cart-item-subtotal`);
                                if (subtotalElement) {
                                    animatePriceUpdate(subtotalElement, `$${data.item_subtotal.toFixed(2)}`);
                                }
                                
                                // Update cart totals
                                updateCartTotals(`$${data.cart_total.toFixed(2)}`, `$${data.cart_total.toFixed(2)}`);
                                
                                // Update cart count
                                updateCartCount(data.cart_count);
                            }
                        });
                });
                
                // Quantity input change
                input.addEventListener('change', () => {
                    const newValue = parseInt(input.value);
                    if (newValue < 1) {
                        input.value = 1;
                    }
                    
                    updateCartItemQuantity(cartItemId, newValue > 0 ? newValue : 1)
                        .then(data => {
                            if (data.success) {
                                // Update subtotal with animation
                                const subtotalElement = document.querySelector(`.cart-item[data-cart-item-id="${cartItemId}"] .cart-item-subtotal`);
                                if (subtotalElement) {
                                    animatePriceUpdate(subtotalElement, `$${data.item_subtotal.toFixed(2)}`);
                                }
                                
                                // Update cart totals
                                updateCartTotals(`$${data.cart_total.toFixed(2)}`, `$${data.cart_total.toFixed(2)}`);
                                
                                // Update cart count
                                updateCartCount(data.cart_count);
                            }
                        });
                });
            }
        }
    });
}

/**
 * Initialize cart item removal animations
 */
function initCartRemovalAnimations() {
    const removeButtons = document.querySelectorAll('.cart-remove-btn');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const cartItemId = this.getAttribute('data-cart-item-id');
            if (cartItemId) {
                // Remove with animation
                const cartItem = this.closest('.cart-item');
                if (cartItem) {
                    cartItem.style.animation = 'fadeOutRight 0.5s ease-out forwards';
                    
                    // Send AJAX request to remove item
                    removeCartItem(cartItemId)
                        .then(data => {
                            if (data.success) {
                                // After animation is complete, remove from DOM
                                setTimeout(() => {
                                    cartItem.remove();
                                    
                                    // Update cart totals
                                    updateCartTotals(`$${data.cart_total.toFixed(2)}`, `$${data.cart_total.toFixed(2)}`);
                                    
                                    // Update cart count
                                    updateCartCount(data.cart_count);
                                    
                                    // Check if cart is empty
                                    checkEmptyCart();
                                }, 500);
                            }
                        });
                }
            }
        });
    });
}

/**
 * Animate flying an element to the cart
 * @param {HTMLElement} sourceElement - The source element (product image)
 * @param {HTMLElement} targetElement - The target element (cart icon)
 */
function flyToCart(sourceElement, targetElement) {
    // Get positions
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Create flying element
    const flyingElement = document.createElement('div');
    flyingElement.classList.add('fly-to-cart');
    
    // Set initial style
    flyingElement.style.width = '50px';
    flyingElement.style.height = '50px';
    flyingElement.style.backgroundImage = `url(${sourceElement.src})`;
    flyingElement.style.backgroundSize = 'cover';
    flyingElement.style.position = 'fixed';
    flyingElement.style.zIndex = '9999';
    flyingElement.style.borderRadius = '50%';
    flyingElement.style.top = `${sourceRect.top + window.scrollY}px`;
    flyingElement.style.left = `${sourceRect.left}px`;
    flyingElement.style.opacity = '1';
    
    // Add to document
    document.body.appendChild(flyingElement);
    
    // Define animation
    const keyframes = [
        {
            top: `${sourceRect.top + window.scrollY}px`,
            left: `${sourceRect.left}px`,
            width: '50px',
            height: '50px',
            opacity: 1
        },
        {
            top: `${sourceRect.top + window.scrollY - 50}px`,
            left: `${sourceRect.left + sourceRect.width / 3}px`,
            width: '30px',
            height: '30px',
            opacity: 0.8
        },
        {
            top: `${targetRect.top + window.scrollY}px`,
            left: `${targetRect.left}px`,
            width: '10px',
            height: '10px',
            opacity: 0.5
        }
    ];
    
    // Apply animation
    const animation = flyingElement.animate(keyframes, {
        duration: 800,
        easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)'
    });
    
    // Clean up after animation
    animation.onfinish = () => {
        document.body.removeChild(flyingElement);
        
        // Animate the cart icon
        animateCartIcon();
    };
}

/**
 * Animate the cart icon
 */
function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon-wrapper');
    if (cartIcon) {
        cartIcon.classList.add('cart-item-added');
        
        setTimeout(() => {
            cartIcon.classList.remove('cart-item-added');
        }, 700);
    }
}

/**
 * Update cart item quantity via AJAX
 * @param {string|number} cartItemId - The cart item ID
 * @param {number} quantity - The new quantity
 * @returns {Promise} - Promise resolving to the response data
 */
function updateCartItemQuantity(cartItemId, quantity) {
    return fetch(`/update-cart/${cartItemId}/`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `quantity=${quantity}`
    })
    .then(response => response.json());
}

/**
 * Remove cart item via AJAX
 * @param {string|number} cartItemId - The cart item ID
 * @returns {Promise} - Promise resolving to the response data
 */
function removeCartItem(cartItemId) {
    return fetch(`/remove-from-cart/${cartItemId}/`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json());
}

/**
 * Update cart count display
 * @param {number} count - The new cart count
 */
function updateCartCount(count) {
    const countBadge = document.querySelector('.cart-count-badge');
    if (countBadge) {
        countBadge.textContent = count;
        countBadge.classList.add('updated');
        
        setTimeout(() => {
            countBadge.classList.remove('updated');
        }, 500);
    }
}

/**
 * Animate price update with counting effect
 * @param {HTMLElement} element - The element to update
 * @param {string} newValue - The new price value
 * @param {Function} callback - Optional callback after animation
 */
function animatePriceUpdate(element, newValue, callback) {
    // Extract current and new price values
    const currentPrice = parseFloat(element.textContent.replace(/[^0-9.-]+/g, ''));
    const newPrice = parseFloat(newValue.replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(currentPrice) || isNaN(newPrice)) {
        element.textContent = newValue;
        if (callback) callback();
        return;
    }
    
    // Add animation class
    element.classList.add('animate-price');
    
    // Calculate price difference and steps
    const priceDifference = newPrice - currentPrice;
    const steps = 20;
    const increment = priceDifference / steps;
    let currentStep = 0;
    let currentAmount = currentPrice;
    
    // Start animation
    const updateInterval = setInterval(updateValue, 25);
    
    function updateValue() {
        currentStep++;
        currentAmount += increment;
        
        if (currentStep >= steps) {
            clearInterval(updateInterval);
            element.textContent = newValue;
            
            setTimeout(() => {
                element.classList.remove('animate-price');
                if (callback) callback();
            }, 200);
        } else {
            element.textContent = `$${currentAmount.toFixed(2)}`;
        }
    }
}

/**
 * Update cart totals with animation
 * @param {string} subtotal - The new subtotal
 * @param {string} total - The new total
 */
function updateCartTotals(subtotal, total) {
    const subtotalElement = document.querySelector('.cart-subtotal-amount');
    const totalElement = document.querySelector('.cart-total-amount');
    
    if (subtotalElement) {
        animatePriceUpdate(subtotalElement, subtotal);
    }
    
    if (totalElement) {
        animatePriceUpdate(totalElement, total);
    }
}

/**
 * Check if cart is empty and show empty state if needed
 */
function checkEmptyCart() {
    const cartItems = document.querySelectorAll('.cart-item');
    const cartContent = document.querySelector('.cart-content');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    
    if (cartItems.length === 0 && cartContent && emptyCartMessage) {
        // Show empty cart message
        cartContent.style.display = 'none';
        emptyCartMessage.style.display = 'block';
        emptyCartMessage.style.opacity = '0';
        
        setTimeout(() => {
            emptyCartMessage.style.animation = 'fadeIn 0.5s ease-out forwards';
            emptyCartMessage.style.opacity = '1';
        }, 300);
    }
}

/**
 * Get CSRF token from cookies
 * @returns {string} - The CSRF token
 */
function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    
    return cookieValue;
}