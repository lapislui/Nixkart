/**
 * Main JavaScript for E-Commerce Store
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Initialize all features
    initPageAnimations();
    initMobileMenu();
    initProductCards();
    initQuantityControls();
    initFormAnimations();
    initCheckoutSteps();
    initDashboardStats();
});

/**
 * Initialize page transition animations
 */
function initPageAnimations() {
    console.log('Initializing page animations');
    
    // Add fade-in animation to the main content
    const main = document.querySelector('main');
    if (main) {
        main.style.opacity = '0';
        main.style.animation = 'fadeIn 0.5s ease-out forwards';
        main.style.opacity = '1';
    }

    // Animate section headings with a slight delay
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach((heading, index) => {
        heading.style.opacity = '0';
        setTimeout(() => {
            heading.style.animation = 'fadeInUp 0.5s ease-out forwards';
            heading.style.opacity = '1';
        }, 100 + (index * 100));
    });
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    console.log('Initializing mobile menu');
    
    const menuToggle = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (menuToggle && navbarCollapse) {
        menuToggle.addEventListener('click', () => {
            // Toggle the menu icon animation
            menuToggle.classList.toggle('active');
        });
        
        // Add animation to mobile menu items
        const navItems = navbarCollapse.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.05}s`;
        });
    }
}

/**
 * Initialize product card animations and interactions
 */
function initProductCards() {
    console.log('Initializing product cards');
    
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Handle add to cart buttons
        const addToCartBtn = card.querySelector('.btn-add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const productSlug = this.getAttribute('data-product-slug');
                if (productSlug) {
                    addToCart(productSlug)
                        .then(response => {
                            if (response.success) {
                                // Animate the button
                                this.classList.add('btn-shake');
                                setTimeout(() => {
                                    this.classList.remove('btn-shake');
                                }, 800);
                                
                                // Update cart count
                                updateCartCount();
                                
                                // Animate cart icon
                                animateCartIcon();
                                
                                // Show success message
                                showToast('Product added to cart', 'success');
                            }
                        })
                        .catch(error => {
                            console.error('Error adding to cart:', error);
                            showToast('Failed to add product to cart', 'error');
                        });
                }
            });
        }
        
        // Handle quick view buttons
        const quickViewBtn = card.querySelector('.btn-quick-view');
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const productSlug = this.getAttribute('data-product-slug');
                if (productSlug) {
                    openQuickView(productSlug);
                }
            });
        }
    });
}

/**
 * Initialize quantity control buttons
 */
function initQuantityControls() {
    console.log('Initializing quantity controls');
    
    const quantityControls = document.querySelectorAll('.quantity-control');
    
    quantityControls.forEach(control => {
        const decreaseBtn = control.querySelector('.quantity-decrease');
        const increaseBtn = control.querySelector('.quantity-increase');
        const input = control.querySelector('.quantity-input');
        
        if (decreaseBtn && increaseBtn && input) {
            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value);
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                    
                    // If in cart page, update cart item
                    const cartItemId = control.getAttribute('data-cart-item-id');
                    if (cartItemId) {
                        updateCartItem(cartItemId, currentValue - 1);
                    }
                }
            });
            
            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value);
                input.value = currentValue + 1;
                
                // If in cart page, update cart item
                const cartItemId = control.getAttribute('data-cart-item-id');
                if (cartItemId) {
                    updateCartItem(cartItemId, currentValue + 1);
                }
            });
            
            input.addEventListener('change', () => {
                // Ensure value is at least 1
                if (parseInt(input.value) < 1) {
                    input.value = 1;
                }
                
                // If in cart page, update cart item
                const cartItemId = control.getAttribute('data-cart-item-id');
                if (cartItemId) {
                    updateCartItem(cartItemId, parseInt(input.value));
                }
            });
        }
    });
}

/**
 * Initialize form field animations
 */
function initFormAnimations() {
    console.log('Initializing form animations');
    
    // Add animated class to all form inputs
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.classList.add('input-animated');
        
        // Add focus and blur events for animation effects
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // If input already has a value, add focused class
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });
    
    // Handle form submission with validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Add shake animation to invalid fields
                const invalidInputs = form.querySelectorAll(':invalid');
                invalidInputs.forEach(input => {
                    input.classList.add('error');
                    input.classList.add('btn-shake');
                    
                    setTimeout(() => {
                        input.classList.remove('btn-shake');
                    }, 800);
                });
                
                // Show error message
                showToast('Please check the form for errors', 'error');
            }
            
            form.classList.add('was-validated');
        });
    });
}

/**
 * Initialize checkout steps
 */
function initCheckoutSteps() {
    console.log('Initializing checkout steps');
    
    const checkoutSteps = document.querySelector('.checkout-steps');
    if (!checkoutSteps) return;
    
    const steps = checkoutSteps.querySelectorAll('.checkout-step');
    const nextButtons = document.querySelectorAll('.btn-next-step');
    const prevButtons = document.querySelectorAll('.btn-prev-step');
    const stepForms = document.querySelectorAll('.checkout-step-form');
    
    // Set initial active step
    if (steps.length > 0) {
        steps[0].classList.add('active');
        if (stepForms.length > 0) {
            stepForms[0].classList.add('active');
        }
    }
    
    // Handle next step buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepIndex = parseInt(this.getAttribute('data-current-step'));
            const nextStepIndex = currentStepIndex + 1;
            
            // Validate current step form
            if (stepForms[currentStepIndex]) {
                if (!validateFormSection(stepForms[currentStepIndex])) {
                    return;
                }
            }
            
            // Update steps
            if (steps[currentStepIndex]) {
                steps[currentStepIndex].classList.remove('active');
                steps[currentStepIndex].classList.add('completed');
            }
            
            if (steps[nextStepIndex]) {
                steps[nextStepIndex].classList.add('active');
            }
            
            // Update forms
            if (stepForms[currentStepIndex]) {
                stepForms[currentStepIndex].classList.remove('active');
            }
            
            if (stepForms[nextStepIndex]) {
                stepForms[nextStepIndex].classList.add('active');
                
                // Scroll to the form
                stepForms[nextStepIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Handle previous step buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepIndex = parseInt(this.getAttribute('data-current-step'));
            const prevStepIndex = currentStepIndex - 1;
            
            // Update steps
            if (steps[currentStepIndex]) {
                steps[currentStepIndex].classList.remove('active');
            }
            
            if (steps[prevStepIndex]) {
                steps[prevStepIndex].classList.remove('completed');
                steps[prevStepIndex].classList.add('active');
            }
            
            // Update forms
            if (stepForms[currentStepIndex]) {
                stepForms[currentStepIndex].classList.remove('active');
            }
            
            if (stepForms[prevStepIndex]) {
                stepForms[prevStepIndex].classList.add('active');
                
                // Scroll to the form
                stepForms[prevStepIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize dashboard statistics with animations
 */
function initDashboardStats() {
    console.log('Initializing dashboard stats');
    
    const statCounters = document.querySelectorAll('.stats-number');
    
    statCounters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (!isNaN(target)) {
            // Start from zero and count up to the target value
            let count = 0;
            const duration = 2000; // 2 seconds
            const frameRate = 60;
            const totalFrames = duration / (1000 / frameRate);
            const increment = target / totalFrames;
            
            const interval = setInterval(() => {
                count += increment;
                if (count >= target) {
                    counter.textContent = target;
                    clearInterval(interval);
                } else {
                    counter.textContent = Math.floor(count);
                }
            }, 1000 / frameRate);
        }
    });
}

/**
 * Add a product to the cart via AJAX
 * @param {string} productSlug - The product slug
 * @returns {Promise} - The fetch promise
 */
function addToCart(productSlug) {
    // Create a fly-to-cart element
    const productCard = document.querySelector(`.product-card[data-product-slug="${productSlug}"]`);
    const cartIcon = document.querySelector('.cart-icon-wrapper');
    
    if (productCard && cartIcon) {
        const productImage = productCard.querySelector('.product-image');
        
        if (productImage) {
            // Get positions
            const imageRect = productImage.getBoundingClientRect();
            const cartRect = cartIcon.getBoundingClientRect();
            
            // Create flying element
            const flyElement = document.createElement('div');
            flyElement.classList.add('fly-to-cart');
            flyElement.style.backgroundImage = `url(${productImage.src})`;
            flyElement.style.backgroundSize = 'cover';
            flyElement.style.top = `${imageRect.top}px`;
            flyElement.style.left = `${imageRect.left}px`;
            flyElement.style.width = `${imageRect.width}px`;
            flyElement.style.height = `${imageRect.height}px`;
            
            document.body.appendChild(flyElement);
            
            // Animate flying to cart
            setTimeout(() => {
                flyElement.style.top = `${cartRect.top}px`;
                flyElement.style.left = `${cartRect.left}px`;
                flyElement.style.width = '30px';
                flyElement.style.height = '30px';
                flyElement.style.opacity = '0.5';
                
                // Remove the element after animation
                setTimeout(() => {
                    document.body.removeChild(flyElement);
                }, 800);
            }, 10);
        }
    }
    
    // Send AJAX request to add product to cart
    return fetch(`/add-to-cart/${productSlug}/`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json());
}

/**
 * Update a cart item quantity
 * @param {number} cartItemId - The cart item ID
 * @param {number} quantity - The new quantity
 */
function updateCartItem(cartItemId, quantity) {
    fetch(`/update-cart/${cartItemId}/`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `quantity=${quantity}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update cart count
            updateCartCount();
            
            // Update cart item subtotal
            const subtotalElement = document.querySelector(`.cart-item[data-cart-item-id="${cartItemId}"] .cart-item-subtotal`);
            if (subtotalElement) {
                subtotalElement.textContent = `$${data.item_subtotal.toFixed(2)}`;
                subtotalElement.classList.add('animate-price');
                setTimeout(() => {
                    subtotalElement.classList.remove('animate-price');
                }, 500);
            }
            
            // Update cart total
            const totalElement = document.querySelector('.cart-total-amount');
            if (totalElement) {
                totalElement.textContent = `$${data.cart_total.toFixed(2)}`;
                totalElement.classList.add('animate-price');
                setTimeout(() => {
                    totalElement.classList.remove('animate-price');
                }, 500);
            }
        }
    })
    .catch(error => {
        console.error('Error updating cart item:', error);
        showToast('Failed to update cart item', 'error');
    });
}

/**
 * Open quick view modal for a product
 * @param {string} productSlug - The product slug
 */
function openQuickView(productSlug) {
    // Show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.classList.add('loading-overlay');
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading product details...</p>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Fetch product details
    fetch(`/product/${productSlug}/`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.text())
    .then(html => {
        // Remove loading overlay
        document.body.removeChild(loadingOverlay);
        
        // Create modal element
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.id = 'quickViewModal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'quickViewModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="quickViewModalLabel">Quick View</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${html}
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the document
        document.body.appendChild(modal);
        
        // Initialize modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Remove modal from DOM when it's hidden
        modal.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modal);
        });
    })
    .catch(error => {
        console.error('Error loading product details:', error);
        
        // Remove loading overlay
        document.body.removeChild(loadingOverlay);
        
        // Show error message
        showToast('Failed to load product details', 'error');
    });
}

/**
 * Close quick view modal
 */
function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}

/**
 * Animate cart icon when a product is added
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
 * Update the cart count in the header
 */
function updateCartCount() {
    fetch('/cart/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const cartCountBadge = document.querySelector('.cart-count-badge');
        if (cartCountBadge) {
            cartCountBadge.textContent = data.cart_count;
            cartCountBadge.classList.add('updated');
            
            setTimeout(() => {
                cartCountBadge.classList.remove('updated');
            }, 500);
        }
    })
    .catch(error => {
        console.error('Error updating cart count:', error);
    });
}

/**
 * Validate a form section
 * @param {HTMLElement} formSection - The form section to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateFormSection(formSection) {
    const inputs = formSection.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value) {
            isValid = false;
            input.classList.add('error');
            input.classList.add('btn-shake');
            
            setTimeout(() => {
                input.classList.remove('btn-shake');
            }, 800);
        } else {
            input.classList.remove('error');
        }
    });
    
    if (!isValid) {
        showToast('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

/**
 * Get CSRF token from cookie
 * @returns {string} - CSRF token
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

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toastId = `toast-${Date.now()}`;
    
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.id = toastId;
    
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const toastInstance = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    
    toastInstance.show();
    
    // Remove toast from DOM when hidden
    toast.addEventListener('hidden.bs.toast', function() {
        if (toastContainer.contains(toast)) {
            toastContainer.removeChild(toast);
        }
    });
}

/**
 * Close toast notification
 * @param {HTMLElement} toast - The toast element
 */
function closeToast(toast) {
    const toastInstance = bootstrap.Toast.getInstance(toast);
    if (toastInstance) {
        toastInstance.hide();
    }
}