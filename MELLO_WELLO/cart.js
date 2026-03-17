// Mello Wello - Cart Logic

// Render Cart Items
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const submitBtn = document.getElementById('submit-btn');
    if (!container) return;

    // Clear current
    container.innerHTML = '';

    // Check if empty
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-msg">Your order list is empty.</div>`;
        updateTotals();
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    // Render items
    cart.forEach((item, index) => {
        const itemHtml = `
            <div class="cart-item fade-in-up" style="animation-delay: ${index * 0.1}s">
                <button class="btn-remove" onclick="removeItem('${item.id}')" aria-label="Remove item">
                    <i data-lucide="x"></i>
                </button>
                <img src="${item.image}" alt="${item.name}" class="item-img">
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="item-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)"><i data-lucide="minus" style="width:16px;"></i></button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)"><i data-lucide="plus" style="width:16px;"></i></button>
                </div>
                <div class="item-total">
                    ${formatPrice(item.price * item.quantity)}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });

    if (window.lucide) {
        lucide.createIcons();
    }

    updateTotals();

    if (submitBtn) submitBtn.disabled = false;
}

// Update Totals
function updateTotals() {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    if (!subtotalEl || !totalEl) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    subtotalEl.textContent = formatPrice(subtotal);
    totalEl.textContent = formatPrice(subtotal); // Total same as subtotal for now
}

// Update Quantity
window.updateQuantity = function (productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        const newQty = cart[itemIndex].quantity + change;

        if (newQty > 0) {
            cart[itemIndex].quantity = newQty;
        } else {
            // Remove if 0
            cart.splice(itemIndex, 1);
        }

        saveAndRender();
    }
};

// Remove Item
window.removeItem = function (productId) {
    cart = cart.filter(item => item.id !== productId);
    saveAndRender();
};

// Save to localStorage and re-render
function saveAndRender() {
    localStorage.setItem('melloWelloCart', JSON.stringify(cart));
    updateCartCount(); // from app.js
    renderCartItems();
}

// Global order data to persist for the success screen
let lastOrderSummary = '';
const SHOP_PHONE = "263775246462";
const SHOP_EMAIL = "cafemello100@gmail.com";

// Submit Order
window.submitOrder = function (e) {
    e.preventDefault();

    if (cart.length === 0) return;

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const date = document.getElementById('date').value;
    const notes = document.getElementById('notes').value || "None";

    if (!name || !email || !date) return;

    const itemsList = cart.map(i => `${i.name} (x${i.quantity}) - ${formatPrice(i.price * i.quantity)}`).join("\n• ");
    const totalAmount = formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));

    lastOrderSummary = `✨ *NEW ORDER: ${name}* ✨\n\n📅 *Pickup Date:* ${date}\n📧 *Customer:* ${email}\n📝 *Notes:* ${notes}\n\n🛒 *Items:* \n• ${itemsList}\n\n💰 *Total Estimate:* ${totalAmount}\n\n_Sent via Cafe Mello Wello Online_`;

    // Show success message
    document.getElementById('order-form').style.display = 'none';
    const successMsg = document.getElementById('success-msg');
    successMsg.style.display = 'block';

    // animation
    successMsg.style.opacity = '0';
    successMsg.style.transform = 'translateY(20px)';
    setTimeout(() => {
        successMsg.style.transition = 'all 0.5s ease';
        successMsg.style.opacity = '1';
        successMsg.style.transform = 'translateY(0)';
        if (window.lucide) lucide.createIcons();
    }, 100);

    // Clear cart locally
    cart = [];
    localStorage.setItem('melloWelloCart', JSON.stringify(cart));
    updateCartCount();

    document.querySelector('.summary-card').scrollIntoView({ behavior: 'smooth' });
};

window.sendOrderWhatsApp = function () {
    if (!lastOrderSummary) return;
    window.open(`https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(lastOrderSummary)}`, '_blank');
};

window.sendOrderEmail = function () {
    if (!lastOrderSummary) return;
    const name = document.getElementById('name').value || "Customer";
    const mailSubject = `New Order Request: ${name} - Mello Wello 🥂`;
    window.location.href = `mailto:${SHOP_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(lastOrderSummary.replace(/\*/g, ''))}`;
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-items-container')) {
        renderCartItems();
    }
});
