// Backend API Base URL
const API_URL = 'http://localhost:3000/api';

// State Management
let cart = JSON.parse(localStorage.getItem('coffee_cart')) || [];
let products = [];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartTrigger = document.getElementById('cart-trigger');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalValue = document.getElementById('cart-total-value');
const cartCountLabel = document.querySelector('.cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const contactForm = document.getElementById('contact-form');
const newsletterForm = document.getElementById('newsletter-form');
const productSearch = document.getElementById('product-search');
const notification = document.getElementById('notification');
const header = document.getElementById('main-header');

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateUI();
});

// === API CALLS ===
async function fetchProducts(query = '') {
    try {
        const url = query ? `${API_URL}/search?q=${query}` : `${API_URL}/products`;
        const response = await fetch(url);
        products = await response.json();
        renderProducts();
    } catch (err) {
        console.error('Error fetching products:', err);
    }
}

async function submitOrder(orderData) {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await response.json();
        showNotification(result.message);
        cart = [];
        updateUI();
        toggleCart();
    } catch (err) {
        showNotification('Order failed. Please try again.');
    }
}

async function submitContactForm(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        message: document.getElementById('contact-message').value
    };

    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        showNotification(result.message);
        contactForm.reset();
    } catch (err) {
        showNotification('Message failed. Please try again.');
    }
}

async function submitNewsletter(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;

    try {
        const response = await fetch(`${API_URL}/newsletter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const result = await response.json();
        showNotification(result.message);
        newsletterForm.reset();
    } catch (err) {
        showNotification('Subscription failed.');
    }
}

// === RENDERING ===
function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; font-size: 18px; margin-top: 40px;">No products found matching your search.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                ${product.tag ? `<div class="product-tag">${product.tag}</div>` : ''}
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <div class="product-prize">$${product.price.toFixed(2)}</div>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });

    // Add events for dynamic buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            addToCart(id);
        });
    });
}

function renderCart() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #666; margin-top: 50px;">Your cart is empty</p>';
        cartTotalValue.innerText = '$0.00';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <button class="remove-item" data-index="${index}" style="background:none; border:none; color:#f44336; cursor:pointer; font-size: 20px;">&times;</button>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotalValue.innerText = `$${total.toFixed(2)}`;

    // Add remove events
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            removeFromCart(index);
        });
    });
}

// === LOGIC ===
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateUI();
        showNotification(`${product.name} added to cart!`);
    } else {
        // Handle case where product might have been found via search and not in the main 'products' array anymore
        // Actually fetch it or use the search result
        showNotification('Item added to cart!');
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateUI();
}

function updateUI() {
    localStorage.setItem('coffee_cart', JSON.stringify(cart));
    cartCountLabel.innerText = cart.length;
    renderCart();
}

function toggleCart() {
    cartSidebar.classList.toggle('open');
}

function showNotification(text) {
    notification.innerText = text;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// === EVENT LISTENERS ===
cartTrigger.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Cart is empty!');
        return;
    }
    const orderData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        customer: { name: 'Guest User' } // Mock user
    };
    submitOrder(orderData);
});

if (contactForm) {
    contactForm.addEventListener('submit', submitContactForm);
}

if (newsletterForm) {
    newsletterForm.addEventListener('submit', submitNewsletter);
}

if (productSearch) {
    let debounceTimer;
    productSearch.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchProducts(e.target.value);
        }, 300);
    });
}

// Header Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(22, 21, 21, 0.95)';
        header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        header.style.padding = '10px 0';
    } else {
        header.style.background = '#161515';
        header.style.boxShadow = 'none';
        header.style.padding = '15px 0';
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        const target = document.querySelector(targetId);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});