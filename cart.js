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
    const deliveryFeeEl = document.getElementById('cart-delivery-fee');
    const emergencyFeeEl = document.getElementById('cart-emergency-fee');
    const depositEl = document.getElementById('cart-deposit');
    const balanceEl = document.getElementById('cart-balance');

    const rowDelivery = document.getElementById('row-delivery');
    const rowEmergency = document.getElementById('row-emergency');

    if (!subtotalEl || !totalEl) return;

    // 1. Items Subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotalEl.textContent = formatPrice(subtotal);

    let total = subtotal;

    // 2. Delivery Fee (Unspecified)
    const isDelivery = document.querySelector('input[name="service_type"]:checked')?.value === 'delivery';
    if (isDelivery) {
        if (deliveryFeeEl) deliveryFeeEl.textContent = 'TBD';
        if (rowDelivery) rowDelivery.style.display = 'flex';
    } else {
        if (rowDelivery) rowDelivery.style.display = 'none';
    }

    // 3. Emergency Fee ($10 if date < 48 hours)
    const dateInput = document.getElementById('date');
    if (dateInput && dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        const now = new Date();
        const diffMs = selectedDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 48) {
            const emergencyFee = 10.00;
            total += emergencyFee;
            if (emergencyFeeEl) emergencyFeeEl.textContent = formatPrice(emergencyFee);
            if (rowEmergency) rowEmergency.style.display = 'flex';
        } else {
            if (rowEmergency) rowEmergency.style.display = 'none';
        }
    } else {
        if (rowEmergency) rowEmergency.style.display = 'none';
    }

    // 4. Final Totals
    totalEl.textContent = formatPrice(total);

    // 5. Deposit & Balance
    const deposit = total * 0.5;
    const balance = total * 0.5;

    if (depositEl) depositEl.textContent = formatPrice(deposit);
    if (balanceEl) balanceEl.textContent = formatPrice(balance);
}

// Toggle Service Type
window.toggleServiceType = function() {
    const isDelivery = document.querySelector('input[name="service_type"]:checked')?.value === 'delivery';
    const addressGroup = document.getElementById('address-group');
    if (addressGroup) {
        addressGroup.style.display = isDelivery ? 'block' : 'none';
        const addressInput = document.getElementById('address');
        if (addressInput) addressInput.required = isDelivery;
    }
    updateTotals();
};

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
    const serviceType = document.querySelector('input[name="service_type"]:checked')?.value || "pickup";
    const address = document.getElementById('address')?.value || "N/A";

    if (!name || !email || !date) return;

    // Re-calculate fees for summary
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let fees = 0;
    let feeBreakdown = "";

    if (serviceType === 'delivery') {
        feeBreakdown += "\n🚚 *Delivery Fee:* TBD (To be confirmed)";
    }

    const selectedDate = new Date(date);
    const now = new Date();
    const diffHours = (selectedDate - now) / (1000 * 60 * 60);
    if (diffHours < 48) {
        fees += 10;
        feeBreakdown += "\n🚨 *Emergency Fee:* $10.00 (Order < 48h)";
    }

    const totalValue = subtotal + fees;
    const depositValue = totalValue * 0.5;

    const itemsList = cart.map(i => `${i.name} (x${i.quantity}) - ${formatPrice(i.price * i.quantity)}`).join("\n• ");

    lastOrderSummary = `✨ *NEW ORDER: ${name}* ✨\n\n📅 *Date:* ${date}\n🔘 *Service:* ${serviceType.toUpperCase()}\n📍 *Address:* ${address}\n📧 *Customer:* ${email}\n📝 *Notes:* ${notes}\n\n🛒 *Items:* \n• ${itemsList}\n${feeBreakdown}\n\n💰 *Total:* ${formatPrice(totalValue)}\n💳 *DEPOSIT REQUIRED:* ${formatPrice(depositValue)}\n⚖️ *Balance Due:* ${formatPrice(depositValue)}\n\n_Sent via Cafe Mello Wello Online_`;

    // Populate hidden fields for Formspree
    document.getElementById('form-summary').value = itemsList;
    document.getElementById('form-total').value = formatPrice(totalValue);

    // Generate Success Screen HTML
    const successDetails = document.getElementById('success-order-details');
    if (successDetails) {
        let itemsHtml = cart.map(i => `
            <div class="success-order-item">
                <span>${i.name} x${i.quantity}</span>
                <span>${formatPrice(i.price * i.quantity)}</span>
            </div>
        `).join('');

        successDetails.innerHTML = `
            <div class="success-summary-box">
                <p class="summary-label">Your Order Summary:</p>
                ${itemsHtml}
                ${serviceType === 'delivery' ? `<div class="success-order-item"><span>Delivery Fee</span><span>Confirmed via WhatsApp</span></div>` : ''}
                ${diffHours < 48 ? `<div class="success-order-item"><span>Emergency Fee</span><span>$10.00</span></div>` : ''}
                <div class="success-total">
                    <strong>Total:</strong>
                    <strong>${formatPrice(totalValue)}</strong>
                </div>
                <div class="success-order-item" style="color: var(--color-primary); font-weight: 700; border-top: 1px solid var(--border-color); margin-top: 0.5rem; border-bottom: none;">
                    <span>50% Deposit Due:</span>
                    <span>${formatPrice(depositValue)}</span>
                </div>
            </div>
        `;
    }

    // Submit to Formspree
    const formData = new FormData(document.getElementById('order-form'));
    // Replace YOUR_FORMSPREE_ID with your actual Formspree ID
    const FORMSPREE_URL = "https://formspree.io/f/mqakvjnd"; // Using a placeholder for now, user should update

    fetch(FORMSPREE_URL, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).catch(err => console.error("Formspree error:", err));

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

    // Automatic WhatsApp Redirect after 2 seconds
    setTimeout(() => {
        sendOrderWhatsApp();
    }, 2000);
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
