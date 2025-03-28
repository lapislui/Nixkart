/**
 * NeoStore Advanced Animation System
 * This script handles sophisticated animations, 3D effects, and transitions
 * throughout the UI to create a cutting-edge user experience.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all animation systems
    initializeCursorEffects();
    initializeParallaxEffects();
    initializeScrollAnimations();
    initializeParticleEffects();
    initializePageTransitions();
    initializeProductCardEffects();
    initialize3DElements();
    initializeAnimatedButtons();
    initializeTextEffects();
    initializeFormAnimations();
});

/**
 * Custom cursor follower effect
 */
function initializeCursorEffects() {
    // Create cursor follower element if it doesn't exist
    if (!document.querySelector('.cursor-follower')) {
        const follower = document.createElement('div');
        follower.className = 'cursor-follower';
        document.body.appendChild(follower);
    }

    const cursor = document.querySelector('.cursor-follower');
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    // Add click effect
    document.addEventListener('mousedown', () => {
        cursor.classList.add('clicked');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('clicked');
    });

    // Scale effect when hovering over links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .btn, .nav-link, .product-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '50px';
            cursor.style.height = '50px';
            cursor.style.backgroundColor = 'rgba(108, 99, 255, 0.2)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '30px';
            cursor.style.height = '30px';
            cursor.style.backgroundColor = 'rgba(108, 99, 255, 0.1)';
        });
    });
}

/**
 * Parallax scrolling effects
 */
function initializeParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-effect');
    
    if (parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const offset = scrollTop * speed;
            element.style.transform = `translateY(${offset}px)`;
        });
    });
}

/**
 * Scroll-based animations
 */
function initializeScrollAnimations() {
    // Elements that animate when scrolled into view
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length === 0) return;
    
    // Check if element is in viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    };
    
    // Function to add animation classes when elements are in viewport
    const handleScroll = () => {
        animatedElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('animated')) {
                const animation = element.dataset.animation || 'fadeIn';
                element.classList.add('animated', animation);
            }
        });
    };
    
    // Initial check and scroll event listener
    handleScroll();
    window.addEventListener('scroll', handleScroll);
}

/**
 * Particle background effects
 */
function initializeParticleEffects() {
    // If a particle container exists, initialize the effect
    const particleContainers = document.querySelectorAll('.particles-container');
    
    if (particleContainers.length === 0) return;
    
    particleContainers.forEach(container => {
        // Number of particles to create
        const particleCount = container.dataset.particleCount || 30;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Random size
            const size = Math.random() * 5 + 2;
            
            // Random opacity
            const opacity = Math.random() * 0.5 + 0.1;
            
            // Random movement parameters
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            // Apply styles
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = opacity;
            particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
            
            container.appendChild(particle);
        }
    });
}

/**
 * Page transition effects
 */
function initializePageTransitions() {
    // Add transition class to body on page load
    document.body.classList.add('page-transition-ready');
    
    // Add animation for initial page load
    window.addEventListener('load', () => {
        document.body.classList.add('page-transition-in');
    });
    
    // Add click event for internal links
    document.querySelectorAll('a[href^="/"]:not([href*="#"])').forEach(link => {
        link.addEventListener('click', (e) => {
            // Skip if modifier keys are pressed
            if (e.metaKey || e.ctrlKey) return;
            
            e.preventDefault();
            const href = link.getAttribute('href');
            
            // Start transition out
            document.body.classList.remove('page-transition-in');
            document.body.classList.add('page-transition-out');
            
            // Navigate after animation completes
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
}

/**
 * Product card tilt and 3D hover effects
 */
function initializeProductCardEffects() {
    const cards = document.querySelectorAll('.product-card');
    
    if (cards.length === 0) return;
    
    cards.forEach(card => {
        // Skip if device doesn't support hover
        if (window.matchMedia('(hover: none)').matches) return;
        
        // 3D tilt effect
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / 20;
            const angleY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        // Reset on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
        
        // Add shadow and glow on hover
        card.addEventListener('mouseenter', () => {
            card.classList.add('card-hover');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('card-hover');
        });
    });
}

/**
 * Initialize 3D rotating elements
 */
function initialize3DElements() {
    // Logo cube animation
    const logoCube = document.querySelector('.logo-cube');
    if (logoCube) {
        // Pause animation on hover
        logoCube.addEventListener('mouseenter', () => {
            logoCube.style.animationPlayState = 'paused';
        });
        
        logoCube.addEventListener('mouseleave', () => {
            logoCube.style.animationPlayState = 'running';
        });
    }
    
    // 3D product viewer controls
    const viewer = document.querySelector('.product-3d-viewer');
    if (viewer) {
        const model = viewer.querySelector('.model-3d');
        if (!model) return;
        
        let rotationX = 0;
        let rotationY = 0;
        let isMouseDown = false;
        let lastX, lastY;
        
        // Mouse controls for 3D rotation
        viewer.addEventListener('mousedown', e => {
            isMouseDown = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        document.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        document.addEventListener('mousemove', e => {
            if (!isMouseDown) return;
            
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            
            rotationY += deltaX * 0.5;
            rotationX -= deltaY * 0.5;
            
            model.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        // Reset button
        const resetBtn = viewer.querySelector('.reset-view-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                rotationX = 0;
                rotationY = 0;
                model.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            });
        }
    }
}

/**
 * Enhance buttons with various effects
 */
function initializeAnimatedButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    if (buttons.length === 0) return;
    
    buttons.forEach(button => {
        // Add ripple effect
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const circle = document.createElement('span');
            circle.classList.add('btn-ripple');
            circle.style.top = `${y}px`;
            circle.style.left = `${x}px`;
            
            this.appendChild(circle);
            
            setTimeout(() => {
                circle.remove();
            }, 600);
        });
        
        // Add hover effect for 3D buttons
        if (button.classList.contains('btn-3d')) {
            button.addEventListener('mousemove', e => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const angleX = (y - centerY) / 10;
                const angleY = (centerX - x) / 10;
                
                button.style.transform = `perspective(500px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'perspective(500px) rotateX(0) rotateY(0) translateZ(0)';
            });
        }
    });
}

/**
 * Text animation effects
 */
function initializeTextEffects() {
    // Split text into characters for letter animation
    const splitTextElements = document.querySelectorAll('.split-text');
    
    if (splitTextElements.length === 0) return;
    
    splitTextElements.forEach(element => {
        const text = element.textContent;
        const letters = text.split('');
        
        element.textContent = '';
        
        letters.forEach((letter, index) => {
            const span = document.createElement('span');
            span.textContent = letter === ' ' ? '\u00A0' : letter;
            span.style.animationDelay = `${index * 0.05}s`;
            element.appendChild(span);
        });
    });
    
    // Text scramble effect
    const scrambleElements = document.querySelectorAll('.text-scramble');
    
    if (scrambleElements.length > 0) {
        class TextScramble {
            constructor(el) {
                this.el = el;
                this.chars = '!<>-_\\/[]{}—=+*^?#________';
                this.update = this.update.bind(this);
            }
            
            setText(newText) {
                const oldText = this.el.innerText;
                const length = Math.max(oldText.length, newText.length);
                const promise = new Promise(resolve => this.resolve = resolve);
                this.queue = [];
                
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 40);
                    const end = start + Math.floor(Math.random() * 40);
                    this.queue.push({ from, to, start, end });
                }
                
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.update();
                return promise;
            }
            
            update() {
                let output = '';
                let complete = 0;
                
                for (let i = 0, n = this.queue.length; i < n; i++) {
                    let { from, to, start, end, char } = this.queue[i];
                    
                    if (this.frame >= end) {
                        complete++;
                        output += to;
                    } else if (this.frame >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = this.randomChar();
                            this.queue[i].char = char;
                        }
                        output += `<span class="scramble-char">${char}</span>`;
                    } else {
                        output += from;
                    }
                }
                
                this.el.innerHTML = output;
                
                if (complete === this.queue.length) {
                    this.resolve();
                } else {
                    this.frameRequest = requestAnimationFrame(this.update);
                    this.frame++;
                }
            }
            
            randomChar() {
                return this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }
        
        scrambleElements.forEach(el => {
            const phrases = JSON.parse(el.getAttribute('data-phrases'));
            if (!phrases || !phrases.length) return;
            
            const fx = new TextScramble(el);
            let counter = 0;
            
            const next = () => {
                fx.setText(phrases[counter]).then(() => {
                    setTimeout(next, 3000);
                });
                counter = (counter + 1) % phrases.length;
            };
            
            next();
        });
    }
}

/**
 * Form field animations
 */
function initializeFormAnimations() {
    const formGroups = document.querySelectorAll('.form-group');
    
    if (formGroups.length === 0) return;
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea, select');
        const label = group.querySelector('label');
        
        if (!input || !label) return;
        
        // Float label when input has value
        const checkValue = () => {
            if (input.value) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        };
        
        // Initial check
        checkValue();
        
        // Event listeners for animation
        input.addEventListener('focus', () => {
            label.classList.add('active', 'highlight');
        });
        
        input.addEventListener('blur', () => {
            label.classList.remove('highlight');
            checkValue();
        });
        
        input.addEventListener('input', checkValue);
    });
    
    // Add 3D effect to form controls
    const formControls = document.querySelectorAll('.form-control');
    
    formControls.forEach(control => {
        control.addEventListener('focus', () => {
            control.classList.add('form-control-focus');
        });
        
        control.addEventListener('blur', () => {
            control.classList.remove('form-control-focus');
        });
    });
}

/**
 * Fly to cart animation for product pages
 * @param {HTMLElement} sourceEl - The source element (product image)
 * @param {HTMLElement} targetEl - The target element (cart icon)
 */
function flyToCart(sourceEl, targetEl) {
    // Create flying element
    const flyingEl = document.createElement('div');
    flyingEl.className = 'fly-to-cart';
    document.body.appendChild(flyingEl);
    
    // Get positions
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    
    // Set initial position
    flyingEl.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
    flyingEl.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
    
    // Animate to cart
    setTimeout(() => {
        flyingEl.style.left = `${targetRect.left + targetRect.width / 2}px`;
        flyingEl.style.top = `${targetRect.top + targetRect.height / 2}px`;
        flyingEl.style.opacity = '0';
        flyingEl.style.transform = 'scale(0.3)';
    }, 10);
    
    // Remove flying element after animation completes
    setTimeout(() => {
        flyingEl.remove();
        targetEl.classList.add('cart-item-added');
        
        setTimeout(() => {
            targetEl.classList.remove('cart-item-added');
        }, 700);
    }, 800);
}

/**
 * Update dynamic elements with animation
 * @param {HTMLElement} element - Element to update
 * @param {string} newContent - New content
 * @param {string} animation - Animation class to add
 */
function updateWithAnimation(element, newContent, animation = 'flash') {
    // Save current content
    const currentContent = element.innerHTML;
    
    // Only animate if content actually changes
    if (currentContent !== newContent) {
        // Add animation class
        element.classList.add(animation);
        
        // Update content
        element.innerHTML = newContent;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove(animation);
        }, 500);
    }
}

/**
 * Animate number counting (e.g., for statistics)
 * @param {HTMLElement} element - Element containing the number
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration in milliseconds
 * @param {string} prefix - Prefix for the number (e.g., '$')
 * @param {string} suffix - Suffix for the number (e.g., '%')
 */
function animateNumber(element, start, end, duration = 1000, prefix = '', suffix = '') {
    const startTime = performance.now();
    const changeInValue = end - start;
    
    // Handle decimal places
    const decimalPlaces = (end.toString().split('.')[1] || '').length;
    
    const updateNumber = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = t => t * (2 - t);
        const currentValue = start + changeInValue * easeOutQuad(progress);
        
        // Format with correct decimal places
        const formattedValue = decimalPlaces 
            ? currentValue.toFixed(decimalPlaces) 
            : Math.floor(currentValue);
        
        element.textContent = `${prefix}${formattedValue}${suffix}`;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    };
    
    requestAnimationFrame(updateNumber);
}

// Export functions to make them available globally
window.NeoAnimations = {
    flyToCart,
    updateWithAnimation,
    animateNumber
};