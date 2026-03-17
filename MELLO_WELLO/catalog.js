// Mello Wello - Catalog Logic

// Product Database (Prices from Mello Bakes Price List)
const products = [
    // === BENTO CAKES ===
    {
        id: 'bento-01',
        name: 'Mini Bento Surprise Box',
        category: 'bento-cakes',
        price: 20.00,
        description: 'A charming mini cake in a clear bento box with pastel frosting and hand-piped floral details. Starting at 6".',
        image: 'assets/IMG-20260311-WA0013.jpg'
    },
    {
        id: 'bento-02',
        name: 'Space Explorer Bento',
        category: 'bento-cakes',
        price: 35.00,
        description: 'A custom space-themed bento cake with matching frosted cupcakes. Perfect for little astronauts.',
        image: 'assets/bento_space.jpg'
    },
    {
        id: 'bento-03',
        name: 'Heart Bento Cake',
        category: 'bento-cakes',
        price: 30.00,
        description: 'A heart-shaped bento cake with smooth pastel icing and a personalized message on top. 8" size.',
        image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },

    // === EVENT CAKES (Sponge Cake Flavors: Vanilla, Blackforest, Red Velvet, Lemon Poppyseed) ===
    {
        id: 'event-01',
        name: 'Vanilla / Classic Sponge Cake',
        category: 'event-cakes',
        price: 20.00,
        description: 'Classic vanilla sponge cake, perfect for any event. Available in multiple sizes.',
        image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'event-02',
        name: 'Pink Rosette Birthday Cake',
        category: 'event-cakes',
        price: 45.00,
        description: 'A beautiful pink frosted cake surrounded by matching cupcakes, with a customizable mirror topper.',
        image: 'assets/IMG-20260311-WA0012.jpg'
    },
    {
        id: 'event-03',
        name: 'Blue & Gold Milestone Cake',
        category: 'event-cakes',
        price: 45.00,
        description: 'Sophisticated deep blue and cream ombre cake with metallic gold accents and minimalist lettering.',
        image: 'assets/IMG-20260311-WA0002.jpg'
    },
    {
        id: 'event-04',
        name: 'Pink Blossom Celebration Cake',
        category: 'event-cakes',
        price: 45.00,
        description: 'Elegant pink velvet cake topped with artisanal buttercream roses and delicate pearl sprinkles.',
        image: 'assets/IMG-20260311-WA0005.jpg'
    },
    {
        id: 'event-05',
        name: 'White & Blue Crown Cake',
        category: 'event-cakes',
        price: 55.00,
        description: 'Elegant white and blue cake topped with a golden crown and personalized mirror nameplate.',
        image: 'assets/crown_cake.jpg'
    },
    {
        id: 'event-06',
        name: 'Purple Pearl Birthday',
        category: 'event-cakes',
        price: 50.00,
        description: 'Stunning purple birthday cake decorated with elegant edible pearls and golden lettering.',
        image: 'assets/purple_pearl.jpg'
    },

    // === CUPCAKES ===
    {
        id: 'cupcake-01',
        name: 'Cupcakes – Full Dozen',
        category: 'cupcakes',
        price: 15.00,
        description: '12 signature cupcakes with buttercream swirls. Choose your flavors.',
        image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'cupcake-02',
        name: 'Butterfly Garden Cupcakes',
        category: 'cupcakes',
        price: 18.00,
        description: 'Floral-inspired cupcakes with soft pink rosettes and edible butterfly toppers. (Price per dozen)',
        image: 'assets/IMG-20260311-WA0004.jpg'
    },

    // === WEDDING CAKES ===
    {
        id: 'wedding-01',
        name: 'Pink & White Floral Tier',
        category: 'wedding-cakes',
        price: 250.00,
        description: 'A stunning multi-tier pink and white cake decorated with delicate fresh-looking blooms and a gold hoop.',
        image: 'assets/wedding_cake_floral.jpg'
    },
    {
        id: 'wedding-02',
        name: 'Tall Pink Ruffle Wedding',
        category: 'wedding-cakes',
        price: 350.00,
        description: 'A majestic tower featuring pink fondant ruffles and an elegant gold hoop separator.',
        image: 'assets/wedding_cake_tall.jpg'
    },
    {
        id: 'wedding-03',
        name: 'Ivory Elegance Tier',
        category: 'wedding-cakes',
        price: 150.00,
        description: 'A stunning 3-tier ivory fondant cake with hand-piped lace details and pearl accents. Price varies by size.',
        image: 'https://images.unsplash.com/photo-1525203135335-74d272fc8d9c?w=500'
    },
    {
        id: 'wedding-04',
        name: 'Minimalist White Wedding',
        category: 'wedding-cakes',
        price: 120.00,
        description: 'Clean, modern 2-tier wedding cake with smooth white buttercream and a single statement bloom.',
        image: 'https://images.unsplash.com/photo-1515411216463-7301017c3874?w=500'
    },

    // === MEAT DELUXE (per dozen) ===
    {
        id: 'meat-01',
        name: 'Gourmet Meatballs',
        category: 'meat-deluxe',
        price: 10.00,
        description: 'Flavorful, hand-rolled meatballs seasoned with signature herbs. (Price per dozen)',
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500'
    },
    {
        id: 'meat-02',
        name: 'Golden Chicken Tenders',
        category: 'meat-deluxe',
        price: 12.00,
        description: 'Crispy, breaded chicken breast strips fried to golden perfection. (Price per dozen)',
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500'
    },

    // === PASTRIES (per dozen) ===
    {
        id: 'pastry-01',
        name: 'Golden Samoosas',
        category: 'pastries',
        price: 7.00,
        description: 'Crispy triangular pastries with savory meat or vegetable filling. Box of dozen.',
        image: 'assets/IMG-20260311-WA0008.jpg'
    },
    {
        id: 'pastry-02',
        name: 'Golden Samoosas (Close-up)',
        category: 'pastries',
        price: 7.00,
        description: 'Perfectly fried crispy samoosas fresh out of the pan.',
        image: 'assets/samoosas_close.jpg'
    },
    {
        id: 'pastry-03',
        name: 'Savory Half Moons / Empanadas',
        category: 'pastries',
        price: 15.00,
        description: 'Crescent-shaped flaky pastries with a spiced gourmet filling, topped with seeds.',
        image: 'assets/IMG-20260311-WA0003.jpg'
    },
    {
        id: 'pastry-04',
        name: 'Ultimate Pastry Platter (Samoosas & Springs)',
        category: 'pastries',
        price: 45.00,
        description: 'A grand selection of crispy spring rolls and savory samoosas, served on a platter.',
        image: 'assets/IMG-20260311-WA0006.jpg'
    },
    {
        id: 'pastry-05',
        name: 'Deluxe Mixed Pastry Platter',
        category: 'pastries',
        price: 55.00,
        description: 'A massive assortment featuring half moons, spring rolls, and samoosas for events.',
        image: 'assets/IMG-20260311-WA0011.jpg'
    },
    {
        id: 'pastry-06',
        name: 'Classic Sausage Rolls',
        category: 'pastries',
        price: 12.00,
        description: 'Savory sausage meat wrapped in light, buttery puff pastry. (Price per dozen)',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500'
    },

    // === WRAPS & TACOS (per dozen) ===
    {
        id: 'wrap-01',
        name: 'Chicken Wraps',
        category: 'wraps-tacos',
        price: 24.00,
        description: 'Fresh tortillas filled with seasoned chicken, greens, and dressing. (Price per dozen)',
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500'
    },
    {
        id: 'wrap-02',
        name: 'Mini Gourmet Burgers',
        category: 'wraps-tacos',
        price: 15.00,
        description: 'Bite-sized sliders with premium beef patties and artisanal buns. (Price per dozen)',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500'
    }
];

// Format price with currency
function formatPrice(price) {
    return '$' + price.toFixed(2);
}

// Generate Product HTML
function createProductCard(product) {
    // Format category label for display
    const categoryLabel = product.category.replace('-', ' ');
    return `
        <div class="product-card fade-in-up" data-category="${product.category}">
            <div class="product-img-container">
                <div class="category-tag">${categoryLabel}</div>
                <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-header">
                    <h3 class="product-title">${product.name}</h3>
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
                <p class="product-desc">${product.description}</p>
                <button class="btn-add-cart" onclick='handleAddClick(${JSON.stringify(product).replace(/'/g, "&#39;")})'>
                    <i data-lucide="plus"></i> Add to Order
                </button>
            </div>
        </div>
    `;
}

// Global handler function required because it's attached via inline onclick
window.handleAddClick = function (product) {
    if (window.addToCart) {
        window.addToCart(product);
    } else {
        console.error('addToCart function not found. Ensure app.js is loaded.');
    }
};

// Loader messages for each category
const loaderMessages = {
    'bento-cakes': { text: 'Boxing Bento Cakes...', loader: 'loader-cake' },
    'event-cakes': { text: 'Preparing Event Cakes...', loader: 'loader-cake' },
    'cupcakes': { text: 'Frosting Cupcakes...', loader: 'loader-cupcake' },
    'wedding-cakes': { text: 'Arranging Wedding Cakes...', loader: 'loader-cake' },
    'meat-deluxe': { text: 'Preparing Meat Platters...', loader: 'loader-snack' },
    'pastries': { text: 'Baking Pastries...', loader: 'loader-snack' },
    'wraps-tacos': { text: 'Rolling Wraps & Tacos...', loader: 'loader-snack' }
};

// Render Products
function renderProducts(filter = 'all') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    // Clear grid
    grid.innerHTML = '';

    // Filter products
    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    // Build loader HTML
    let loaderHtml = '';

    if (filter !== 'all' && loaderMessages[filter]) {
        const msg = loaderMessages[filter];
        const loaderShape = msg.loader === 'loader-cupcake' ? 'cupcake-shape'
            : msg.loader === 'loader-snack' ? 'snack-shape'
                : 'cake-shape';
        loaderHtml = `
            <div class="category-loader-container">
                <div class="multi-loader" style="margin-bottom: 1rem;">
                    <div class="loader-item ${msg.loader}" style="opacity: 1; animation: pulse-frosting 1s infinite alternate;">
                        <div class="${loaderShape}"></div>
                    </div>
                </div>
                <div class="loader-text" style="font-size: 1.2rem;">${msg.text}</div>
            </div>
        `;
    } else {
        // 'all' filter uses the standard cycling loader
        loaderHtml = `
            <div class="category-loader-container">
                <div class="multi-loader" style="margin-bottom: 1rem;">
                    <div class="loader-item loader-cake"><div class="cake-shape"></div></div>
                    <div class="loader-item loader-cupcake"><div class="cupcake-shape"></div></div>
                    <div class="loader-item loader-snack"><div class="snack-shape"></div></div>
                </div>
                <div class="loader-text" style="font-size: 1.2rem;">Gathering Everything...</div>
            </div>
        `;
    }

    // Inject Loader
    grid.style.display = 'flex';
    grid.style.justifyContent = 'center';
    grid.style.alignItems = 'center';
    grid.style.minHeight = '300px';
    grid.innerHTML = loaderHtml;

    // Artificial Delay for animation
    setTimeout(() => {
        // Reset grid display
        grid.style.display = 'grid';
        grid.style.minHeight = 'auto';
        grid.innerHTML = '';

        // Render
        filteredProducts.forEach((product, index) => {
            const cardHtml = createProductCard(product);
            grid.insertAdjacentHTML('beforeend', cardHtml);

            // Add staggered animation delay
            const card = grid.lastElementChild;
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Re-initialize icons for newly added elements
        if (window.lucide) {
            lucide.createIcons();
        }
    }, 1200); // 1.2 second fake load time
}

// Setup Filters
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            e.target.classList.add('active');

            // Re-render
            const filterValue = e.target.getAttribute('data-filter');
            renderProducts(filterValue);
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('product-grid')) {
        renderProducts('all');
        setupFilters();
    }
});
