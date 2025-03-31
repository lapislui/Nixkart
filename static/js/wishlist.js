
// Function to get CSRF token
function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return null;
}

// Handle wishlist button clicks
document.addEventListener('DOMContentLoaded', function() {
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productId = this.getAttribute('data-product-id');
            if (productId) {
                fetch(`/add-to-wishlist/${productId}/`, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCsrfToken(),
                    },
                    credentials: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Update wishlist icon state
                        const icon = this.querySelector('i');
                        if (icon) {
                            icon.classList.toggle('fas');
                            icon.classList.toggle('far');
                        }
                        
                        if (data.created) {
                            showToast('Product added to wishlist!', 'success');
                        } else {
                            showToast('Product removed from wishlist!', 'info');
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('Error updating wishlist', 'error');
                });
            }
        });
    });
});

// Toast notification function
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', 'show');
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
