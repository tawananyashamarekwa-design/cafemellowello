// Mello Wello - Core Application Logic

// Initialize cart from localStorage or create empty array
let cart = JSON.parse(localStorage.getItem('melloWelloCart')) || [];

// Update cart count badge
function updateCartCount() {
    const desktopCartCount = document.getElementById('cart-count');
    const mobileCartCount = document.getElementById('cart-count-mobile');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const updateBadge = (el) => {
        if (el) {
            el.textContent = totalItems;
            el.style.transform = 'scale(1.2)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 200);
        }
    };

    updateBadge(desktopCartCount);
    updateBadge(mobileCartCount);
}

// Add item to cart
function addToCart(productData) {
    const existingItem = cart.find(item => item.id === productData.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...productData,
            quantity: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('melloWelloCart', JSON.stringify(cart));

    // Update UI
    updateCartCount();
    showNotification(`Added ${productData.name} to your order.`);
}

// Global reference for the notification timer
let notificationTimer;

// Simple toast notification system with Checkout CTA
function showNotification(message) {
    // Check if container exists, if not create it
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 15px;
            max-width: 320px;
        `;
        document.body.appendChild(container);
    }

    // Check for existing notification to avoid stacking
    let notification = document.getElementById('active-notification');
    const isNew = !notification;

    if (isNew) {
        notification = document.createElement('div');
        notification.id = 'active-notification';
        notification.style.cssText = `
            background-color: var(--bg-secondary);
            color: var(--text-main);
            padding: 1.25rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg), 0 10px 40px var(--shadow-color);
            border-left: 5px solid var(--color-primary);
            transform: translateX(120%);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        container.appendChild(notification);
    }

    // Update content
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: var(--color-primary); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="shopping-bag" style="width: 18px; height: 18px;"></i>
            </div>
            <div style="flex: 1;">
                <p style="font-weight: 700; font-size: 0.95rem; margin-bottom: 2px;">Added to Cart!</p>
                <p id="notification-msg" style="font-size: 0.85rem; color: var(--color-text-muted);">${message}</p>
            </div>
        </div>
        <a href="cart.html" style="
            display: block; 
            text-align: center; 
            background: var(--color-primary); 
            color: white; 
            padding: 10px 0; 
            border-radius: var(--radius-sm);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 700;
            transition: transform 0.2s ease, filter 0.2s ease;
            text-decoration: none;
            margin-top: 5px;
        " onmouseover="this.style.filter='brightness(1.1)'; this.style.transform='scale(1.02)'" 
           onmouseout="this.style.filter='none'; this.style.transform='scale(1)'">
            Checkout Now
        </a>
    `;

    // Initialize icons in new element
    if (window.lucide) {
        lucide.createIcons();
    }

    // Clear existing timer if any
    if (notificationTimer) {
        clearTimeout(notificationTimer);
    }

    // Trigger animation (if new) or refresh appearance
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    });

    // Remove after 5 seconds
    notificationTimer = setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
            notificationTimer = null;
        }, 500);
    }, 5000);
}

// Format price utility
function formatPrice(price) {
    return '$' + price.toFixed(2);
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Mobile Menu Logic
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenu && mobileMenuClose) {
        const toggleMenu = () => mobileMenu.classList.toggle('active');

        mobileMenuBtn.addEventListener('click', toggleMenu);
        mobileMenuClose.addEventListener('click', toggleMenu);

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') &&
                !mobileMenu.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }
});
