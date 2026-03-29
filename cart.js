// Mello Wello - Cart Logic

// ─── Bakery origin (Cafe Mello Wello) ──────────────────────────────────────
// To find your exact coords: open Google Maps → right-click your bakery → copy the lat/lng
const BAKERY_COORDS = [-17.8292, 31.0522]; // [lat, lng] ← update to your exact location
const DELIVERY_RATE_PER_KM = 0.30; // $0.30 per km

// ─── Delivery Map State (Leaflet) ───────────────────────────────────────────
let leafletMap = null;
let customerMarker = null;
let bakeryMarker = null;
let routeLayer = null;
let currentDeliveryFee = 0;
let currentDeliveryKm = 0;
let geocodeTimer = null;  // debounce for address search

// ─── Init Leaflet Map ─────────────────────────────────────────────────────
function initDeliveryMap() {
    if (leafletMap) return; // already initialised
    if (typeof L === 'undefined') { console.warn('Leaflet not loaded'); return; }

    const mapEl = document.getElementById('delivery-map');
    if (!mapEl) return;

    // Create map
    leafletMap = L.map('delivery-map', { zoomControl: true }).setView(BAKERY_COORDS, 13);

    // OpenStreetMap tiles (free, no key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(leafletMap);

    // Bakery marker (red)
    const bakeryIcon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;background:#e66767;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
    bakeryMarker = L.marker(BAKERY_COORDS, { icon: bakeryIcon, title: 'Cafe Mello Wello (Bakery)' })
        .addTo(leafletMap)
        .bindPopup('🍰 <strong>Cafe Mello Wello</strong><br>Your bakery')
        .openPopup();

    // Customer marker (blue, draggable) - starts at bakery
    const customerIcon = L.divIcon({
        className: '',
        html: `<div style="width:20px;height:20px;background:#5c8fd6;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20]
    });
    customerMarker = L.marker(BAKERY_COORDS, { icon: customerIcon, draggable: true, title: 'Your delivery location' })
        .addTo(leafletMap)
        .bindPopup('📍 <strong>Delivery here</strong><br>Drag to adjust');

    // Drag end → recalculate
    customerMarker.on('dragend', () => {
        const { lat, lng } = customerMarker.getLatLng();
        const addressInput = document.getElementById('address');
        if (addressInput) addressInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        fetchDistance([lat, lng]);
        fetchRoute([lat, lng]);
    });

    // Click on map → move customer marker
    leafletMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        customerMarker.setLatLng([lat, lng]);
        const addressInput = document.getElementById('address');
        if (addressInput) addressInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        fetchDistance([lat, lng]);
        fetchRoute([lat, lng]);
    });

    // Address search → geocode with Nominatim (debounced)
    const addressInput = document.getElementById('address');
    if (addressInput) {
        addressInput.addEventListener('input', () => {
            clearTimeout(geocodeTimer);
            geocodeTimer = setTimeout(() => geocodeAddress(addressInput.value), 700);
        });
    }

    // Force map to render correctly after container becomes visible
    setTimeout(() => leafletMap.invalidateSize(), 100);
}

// ─── Geocode address with Nominatim ───────────────────────────────────────
function geocodeAddress(query) {
    if (!query || query.length < 4) return;
    const chip = document.getElementById('delivery-distance-chip');
    const chipText = document.getElementById('delivery-chip-text');
    if (chip) chip.style.display = 'flex';
    if (chipText) chipText.textContent = 'Searching address…';

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
    })
    .then(r => r.json())
    .then(results => {
        if (!results.length) {
            if (chipText) chipText.textContent = 'Address not found — try clicking the map';
            return;
        }
        const { lat, lon } = results[0];
        const latlng = [parseFloat(lat), parseFloat(lon)];
        customerMarker.setLatLng(latlng);
        leafletMap.flyTo(latlng, 15, { duration: 1 });
        fetchDistance(latlng);
        fetchRoute(latlng);
    })
    .catch(() => { if (chipText) chipText.textContent = 'Search failed — click the map instead'; });
}

// ─── Fetch road distance with OSRM (free, no key) ─────────────────────────
function fetchDistance(destinationLatLng) {
    const [bakeryLat, bakeryLng] = BAKERY_COORDS;
    const [destLat, destLng] = destinationLatLng;
    const url = `https://router.project-osrm.org/route/v1/driving/${bakeryLng},${bakeryLat};${destLng},${destLat}?overview=false`;

    const chip = document.getElementById('delivery-distance-chip');
    const chipText = document.getElementById('delivery-chip-text');
    if (chip) chip.style.display = 'flex';
    if (chipText) chipText.textContent = 'Calculating distance…';

    fetch(url)
        .then(r => r.json())
        .then(data => {
            if (data.code !== 'Ok' || !data.routes.length) {
                if (chipText) chipText.textContent = 'Could not calculate distance';
                return;
            }
            const distanceMeters = data.routes[0].distance;
            const distanceKm = distanceMeters / 1000;
            const fee = Math.ceil(distanceKm) * DELIVERY_RATE_PER_KM;

            currentDeliveryKm = distanceKm;
            currentDeliveryFee = fee;

            const hiddenKm = document.getElementById('delivery-distance-km');
            const hiddenFee = document.getElementById('delivery-fee-value');
            if (hiddenKm) hiddenKm.value = distanceKm.toFixed(1);
            if (hiddenFee) hiddenFee.value = fee.toFixed(2);

            if (chipText) chipText.textContent = `${distanceKm.toFixed(1)} km · ${formatPrice(fee)} delivery fee`;
            updateTotals();
        })
        .catch(() => { if (chipText) chipText.textContent = 'Network error — try again'; });
}

// ─── Draw route line with OSRM geometry ──────────────────────────────────
function fetchRoute(destinationLatLng) {
    if (!leafletMap) return;
    const [bakeryLat, bakeryLng] = BAKERY_COORDS;
    const [destLat, destLng] = destinationLatLng;
    const url = `https://router.project-osrm.org/route/v1/driving/${bakeryLng},${bakeryLat};${destLng},${destLat}?geometries=geojson&overview=full`;

    fetch(url)
        .then(r => r.json())
        .then(data => {
            if (data.code !== 'Ok' || !data.routes.length) return;
            // Remove previous route
            if (routeLayer) leafletMap.removeLayer(routeLayer);
            // Add new polyline
            routeLayer = L.geoJSON(data.routes[0].geometry, {
                style: { color: '#e66767', weight: 5, opacity: 0.8, dashArray: null }
            }).addTo(leafletMap);
            // Fit map to show both markers and route
            const group = L.featureGroup([bakeryMarker, customerMarker, routeLayer]);
            leafletMap.fitBounds(group.getBounds().pad(0.15));
        })
        .catch(() => {});
}


// ─── Render Cart Items ──────────────────────────────────────────────────────
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const submitBtn = document.getElementById('submit-btn');
    if (!container) return;

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-msg">Your order list is empty.</div>`;
        updateTotals();
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

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

    if (window.lucide) lucide.createIcons();
    updateTotals();
    if (submitBtn) submitBtn.disabled = false;
}

// ─── Update Totals ──────────────────────────────────────────────────────────
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

    // 1. Items subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotalEl.textContent = formatPrice(subtotal);
    let total = subtotal;

    // 2. Delivery fee (real $ from map, or TBD if map not used yet)
    const isDelivery = document.querySelector('input[name="service_type"]:checked')?.value === 'delivery';
    if (isDelivery) {
        if (rowDelivery) rowDelivery.style.display = 'flex';
        if (currentDeliveryFee > 0) {
            if (deliveryFeeEl) deliveryFeeEl.textContent = formatPrice(currentDeliveryFee);
            total += currentDeliveryFee;
        } else {
            if (deliveryFeeEl) deliveryFeeEl.textContent = 'Select location on map';
        }
    } else {
        if (rowDelivery) rowDelivery.style.display = 'none';
    }

    // 3. Emergency fee ($10 if < 48 hours)
    const dateInput = document.getElementById('date');
    if (dateInput && dateInput.value) {
        const diffHours = (new Date(dateInput.value) - new Date()) / (1000 * 60 * 60);
        if (diffHours < 48) {
            total += 10;
            if (emergencyFeeEl) emergencyFeeEl.textContent = formatPrice(10);
            if (rowEmergency) rowEmergency.style.display = 'flex';
        } else {
            if (rowEmergency) rowEmergency.style.display = 'none';
        }
    } else {
        if (rowEmergency) rowEmergency.style.display = 'none';
    }

    // 4. Final totals
    totalEl.textContent = formatPrice(total);
    const half = total * 0.5;
    if (depositEl) depositEl.textContent = formatPrice(half);
    if (balanceEl) balanceEl.textContent = formatPrice(half);
}

// ─── Toggle Service Type (Pickup / Delivery) ────────────────────────────────
window.toggleServiceType = function () {
    const isDelivery = document.querySelector('input[name="service_type"]:checked')?.value === 'delivery';
    const addressGroup = document.getElementById('address-group');
    if (addressGroup) {
        addressGroup.style.display = isDelivery ? 'block' : 'none';
        const addressInput = document.getElementById('address');
        if (addressInput) addressInput.required = isDelivery;
    }

    if (isDelivery) {
        if (!leafletMap) {
            currentDeliveryFee = 0;
            currentDeliveryKm = 0;
        }
        // Init Leaflet map (no API key needed)
        setTimeout(initDeliveryMap, 50);
    } else {
        currentDeliveryFee = 0;
        currentDeliveryKm = 0;
    }

    updateTotals();
};

// ─── Update Quantity ────────────────────────────────────────────────────────
window.updateQuantity = function (productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const newQty = cart[itemIndex].quantity + change;
        if (newQty > 0) {
            cart[itemIndex].quantity = newQty;
        } else {
            cart.splice(itemIndex, 1);
        }
        saveAndRender();
    }
};

// ─── Remove Item ────────────────────────────────────────────────────────────
window.removeItem = function (productId) {
    cart = cart.filter(item => item.id !== productId);
    saveAndRender();
};

// ─── Save & Re-render ───────────────────────────────────────────────────────
function saveAndRender() {
    localStorage.setItem('melloWelloCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// ─── Order Submission ───────────────────────────────────────────────────────
let lastOrderSummary = '';
const SHOP_PHONE = "263775246462";
const SHOP_EMAIL = "cafemello100@gmail.com";

window.submitOrder = function (e) {
    e.preventDefault();
    if (cart.length === 0) return;

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const date = document.getElementById('date').value;
    const notes = document.getElementById('notes').value || 'None';
    const serviceType = document.querySelector('input[name="service_type"]:checked')?.value || 'pickup';
    const address = document.getElementById('address')?.value || 'N/A';

    if (!name || !email || !date) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let fees = 0;
    let feeBreakdown = '';

    if (serviceType === 'delivery') {
        if (currentDeliveryFee > 0) {
            fees += currentDeliveryFee;
            feeBreakdown += `\n🚚 *Delivery Fee:* ${formatPrice(currentDeliveryFee)} (${currentDeliveryKm.toFixed(1)} km × $${DELIVERY_RATE_PER_KM}/km)`;
        } else {
            feeBreakdown += '\n🚚 *Delivery Fee:* TBD (location not selected)';
        }
    }

    const diffHours = (new Date(date) - new Date()) / (1000 * 60 * 60);
    if (diffHours < 48) {
        fees += 10;
        feeBreakdown += '\n🚨 *Emergency Fee:* $10.00 (Order < 48h)';
    }

    const totalValue = subtotal + fees;
    const depositValue = totalValue * 0.5;
    const itemsList = cart.map(i => `${i.name} (x${i.quantity}) - ${formatPrice(i.price * i.quantity)}`).join('\n• ');

    lastOrderSummary = `✨ *NEW ORDER: ${name}* ✨\n\n📅 *Date:* ${date}\n🔘 *Service:* ${serviceType.toUpperCase()}\n📍 *Address:* ${address}\n📧 *Customer:* ${email}\n📝 *Notes:* ${notes}\n\n🛒 *Items:* \n• ${itemsList}${feeBreakdown}\n\n💰 *Total:* ${formatPrice(totalValue)}\n💳 *DEPOSIT REQUIRED:* ${formatPrice(depositValue)}\n⚖️ *Balance Due:* ${formatPrice(depositValue)}\n\n_Sent via Cafe Mello Wello Online_`;

    document.getElementById('form-summary').value = itemsList;
    document.getElementById('form-total').value = formatPrice(totalValue);

    // Success screen
    const successDetails = document.getElementById('success-order-details');
    if (successDetails) {
        const itemsHtml = cart.map(i => `
            <div class="success-order-item">
                <span>${i.name} x${i.quantity}</span>
                <span>${formatPrice(i.price * i.quantity)}</span>
            </div>
        `).join('');

        successDetails.innerHTML = `
            <div class="success-summary-box">
                <p class="summary-label">Your Order Summary:</p>
                ${itemsHtml}
                ${serviceType === 'delivery' && currentDeliveryFee > 0
                    ? `<div class="success-order-item"><span>Delivery Fee (${currentDeliveryKm.toFixed(1)} km)</span><span>${formatPrice(currentDeliveryFee)}</span></div>`
                    : serviceType === 'delivery'
                    ? `<div class="success-order-item"><span>Delivery Fee</span><span>Confirm via WhatsApp</span></div>`
                    : ''}
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
    fetch('https://formspree.io/f/mqakvjnd', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    }).catch(err => console.error('Formspree error:', err));

    // Show success
    document.getElementById('order-form').style.display = 'none';
    const successMsg = document.getElementById('success-msg');
    successMsg.style.display = 'block';
    successMsg.style.opacity = '0';
    successMsg.style.transform = 'translateY(20px)';
    setTimeout(() => {
        successMsg.style.transition = 'all 0.5s ease';
        successMsg.style.opacity = '1';
        successMsg.style.transform = 'translateY(0)';
        if (window.lucide) lucide.createIcons();
    }, 100);

    cart = [];
    localStorage.setItem('melloWelloCart', JSON.stringify(cart));
    updateCartCount();
    document.querySelector('.summary-card').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => sendOrderWhatsApp(), 2000);
};

window.sendOrderWhatsApp = function () {
    if (!lastOrderSummary) return;
    window.open(`https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(lastOrderSummary)}`, '_blank');
};

window.sendOrderEmail = function () {
    if (!lastOrderSummary) return;
    const name = document.getElementById('name').value || 'Customer';
    const mailSubject = `New Order Request: ${name} - Mello Wello 🥂`;
    window.location.href = `mailto:${SHOP_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(lastOrderSummary.replace(/\*/g, ''))}`;
};

// ─── Initialize ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-items-container')) {
        renderCartItems();
    }
});
