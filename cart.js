// Mello Wello - Cart Logic

// ─── Bakery origin (Cafe Mello Wello) ──────────────────────────────────────
// To find your exact coords: open Google Maps → right-click your bakery → copy the lat/lng
const BAKERY_COORDS = { lat: -17.8292, lng: 31.0522 }; // Harare, Zimbabwe
const DELIVERY_RATE_PER_KM = 0.30; // $0.30 per km

// ─── ⚙️  SET YOUR GOOGLE MAPS API KEY HERE ──────────────────────────────────
// Get a free key at: console.cloud.google.com
// Enable: Maps JavaScript API, Places API, Distance Matrix API
const GOOGLE_MAPS_API_KEY = 'AIzaSyCTZ-oysNc8dCduVbNcNKyyvRyFWi9uuyk'; // ← replace this

// ─── Delivery Map State ─────────────────────────────────────────────────────
let deliveryMap = null;
let bakeryMarker = null;
let customerMarker = null;
let directionsService = null;
let directionsRenderer = null;
let placesAutocomplete = null;
let distanceMatrixService = null;
let currentDeliveryFee = 0;
let currentDeliveryKm = 0;
let mapsApiReady = false;

// ─── Dynamically load the Google Maps SDK (only when needed) ────────────────
let mapsScriptInjected = false;
function loadMapsSDK() {
    if (mapsScriptInjected || !GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
        if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
            const mapEl = document.getElementById('delivery-map');
            if (mapEl) {
                mapEl.style.height = '60px';
                mapEl.innerHTML = '<p style="padding:1rem;color:var(--color-primary);font-size:0.85rem;text-align:center;">⚠️ Map unavailable — Google Maps API key not set in cart.js</p>';
            }
        }
        return;
    }
    mapsScriptInjected = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initGoogleMapsReady`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Called by the Google Maps SDK ?callback= parameter
window.initGoogleMapsReady = function () {
    mapsApiReady = true;
    // If delivery is already selected when the API loads, init the map now
    const isDelivery = document.querySelector('input[name="service_type"]:checked')?.value === 'delivery';
    if (isDelivery) initDeliveryMap();
};

// ─── Init / Build the Delivery Map ─────────────────────────────────────────
function initDeliveryMap() {
    // Already initialised
    if (deliveryMap) return;

    // API hasn't loaded yet — it will call initGoogleMapsReady() when ready
    if (!mapsApiReady || !window.google) return;

    const mapEl = document.getElementById('delivery-map');
    if (!mapEl) return;

    // Create map centred on bakery
    deliveryMap = new google.maps.Map(mapEl, {
        center: BAKERY_COORDS,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#e66767', strokeWeight: 5, strokeOpacity: 0.8 }
    });
    directionsRenderer.setMap(deliveryMap);
    distanceMatrixService = new google.maps.DistanceMatrixService();

    // Bakery marker (fixed, branded pin)
    bakeryMarker = new google.maps.Marker({
        position: BAKERY_COORDS,
        map: deliveryMap,
        title: 'Cafe Mello Wello (Bakery)',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#e66767',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2
        }
    });

    // Customer marker (draggable)
    customerMarker = new google.maps.Marker({
        position: BAKERY_COORDS,
        map: deliveryMap,
        title: 'Your delivery location',
        draggable: true,
        animation: google.maps.Animation.DROP,
        icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: '#5c8fd6',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2
        }
    });

    // Drag end → recalculate
    customerMarker.addListener('dragend', () => {
        const pos = customerMarker.getPosition();
        document.getElementById('address').value = `${pos.lat().toFixed(5)}, ${pos.lng().toFixed(5)}`;
        calculateDeliveryFee(pos);
        drawRoute(pos);
    });

    // Click on map → move customer marker + recalculate
    deliveryMap.addListener('click', (e) => {
        customerMarker.setPosition(e.latLng);
        document.getElementById('address').value = `${e.latLng.lat().toFixed(5)}, ${e.latLng.lng().toFixed(5)}`;
        calculateDeliveryFee(e.latLng);
        drawRoute(e.latLng);
    });

    // Attach Places Autocomplete to the address input
    const addressInput = document.getElementById('address');
    if (addressInput && google.maps.places) {
        // Define rough bounds for Harare
        const harareBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(-18.0500, 30.9000), // SW corner approx
            new google.maps.LatLng(-17.6500, 31.2000)  // NE corner approx
        );

        placesAutocomplete = new google.maps.places.Autocomplete(addressInput, {
            fields: ['geometry', 'formatted_address'],
            componentRestrictions: { country: 'zw' }, // RESTRICT TO ZIMBABWE ONLY
            bounds: harareBounds,
            strictBounds: true // Strongly prefer results within Harare bounds
        });
        
        placesAutocomplete.addListener('place_changed', () => {
            const place = placesAutocomplete.getPlace();
            if (!place.geometry) return;
            const loc = place.geometry.location;
            deliveryMap.panTo(loc);
            deliveryMap.setZoom(15);
            customerMarker.setPosition(loc);
            calculateDeliveryFee(loc);
            drawRoute(loc);
        });
    }
}

// ─── Draw route between bakery and customer ─────────────────────────────────
function drawRoute(destination) {
    if (!directionsService || !directionsRenderer) return;
    directionsService.route(
        {
            origin: BAKERY_COORDS,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
            }
        }
    );
}

// ─── Calculate Delivery Fee via Distance Matrix ─────────────────────────────
function calculateDeliveryFee(destination) {
    if (!distanceMatrixService) return;

    const chip = document.getElementById('delivery-distance-chip');
    const chipText = document.getElementById('delivery-chip-text');
    if (chip) chip.style.display = 'flex';
    if (chipText) chipText.textContent = 'Calculating…';

    distanceMatrixService.getDistanceMatrix(
        {
            origins: [BAKERY_COORDS],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        },
        (response, status) => {
            if (status !== 'OK') {
                if (chipText) chipText.textContent = 'Could not calculate distance';
                return;
            }
            const element = response.rows[0].elements[0];
            if (element.status !== 'OK') {
                if (chipText) chipText.textContent = 'Could not calculate distance';
                return;
            }

            const distanceMeters = element.distance.value;
            const distanceKm = distanceMeters / 1000;
            const fee = Math.ceil(distanceKm) * DELIVERY_RATE_PER_KM; // round up to next km

            currentDeliveryKm = distanceKm;
            currentDeliveryFee = fee;

            // Update hidden inputs
            const hiddenKm = document.getElementById('delivery-distance-km');
            const hiddenFee = document.getElementById('delivery-fee-value');
            if (hiddenKm) hiddenKm.value = distanceKm.toFixed(1);
            if (hiddenFee) hiddenFee.value = fee.toFixed(2);

            // Update chip
            if (chipText) {
                chipText.textContent = `${distanceKm.toFixed(1)} km · ${formatPrice(fee)} delivery fee`;
            }

            // Refresh order totals
            updateTotals();
        }
    );
}

// ─── Render Cart Items ──────────────────────────────────────────────────────

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
        // Reset fee if switching back from pickup
        if (!deliveryMap) {
            currentDeliveryFee = 0;
            currentDeliveryKm = 0;
        }
        // Load Maps SDK dynamically the first time, then init map
        loadMapsSDK();
        if (mapsApiReady) {
            setTimeout(initDeliveryMap, 50);
        }
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
