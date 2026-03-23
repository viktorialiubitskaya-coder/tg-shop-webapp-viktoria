let tg = window.Telegram.WebApp;
tg.expand();

// Mock Products
const PRODUCTS = [
    { id: 1, name: "Burrata 250g", price: 8.50, img: "https://images.unsplash.com/photo-1588194208035-7cb051cc720d?auto=format&fit=crop&q=80&w=200" },
    { id: 2, name: "Parmigiano Regg.", price: 12.00, img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=200" },
    { id: 3, name: "Chianti Classico", price: 18.00, img: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&q=80&w=200" },
    { id: 4, name: "Prosciutto di Parma", price: 15.00, img: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=200" },
    { id: 5, name: "Olio Extra Vergine", price: 14.50, img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200" }
];

let cart = {}; // format: { id: quantity }

function renderProducts() {
    const grid = document.getElementById('catalog');
    grid.innerHTML = '';
    
    PRODUCTS.forEach(p => {
        const qty = cart[p.id] || 0;
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.img}" class="product-img" alt="${p.name}">
            <div class="product-info">
                <div class="product-title">${p.name}</div>
                <div class="product-price">${p.price.toFixed(2)} €</div>
                
                ${qty === 0 ? `
                    <button class="glow-btn" style="width:100%; justify-content:center; padding: 8px;" onclick="updateCart(${p.id}, 1)">Aggiungi</button>
                ` : `
                    <div class="btn-row">
                        <button class="circle-btn minus" onclick="updateCart(${p.id}, -1)">-</button>
                        <span class="qty-display">${qty}</span>
                        <button class="circle-btn" onclick="updateCart(${p.id}, 1)">+</button>
                    </div>
                `}
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateCart(id, change) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += change;
    
    if (cart[id] <= 0) {
        delete cart[id];
    }
    
    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    renderProducts();
    updateCartBar();
}

function updateCartBar() {
    const bar = document.getElementById('cart-summary');
    let totalItems = 0;
    let totalPrice = 0;
    
    for (let id in cart) {
        const product = PRODUCTS.find(p => p.id == id);
        totalItems += cart[id];
        totalPrice += product.price * cart[id];
    }
    
    document.getElementById('cart-total-items').innerText = `${totalItems} Articoli`;
    document.getElementById('cart-total-price').innerText = `${totalPrice.toFixed(2)} €`;
    
    if (totalItems > 0) {
        bar.classList.remove('hidden');
        // setTimeout to allow display block to apply before transform transition
        setTimeout(() => bar.classList.add('visible'), 10);
        tg.MainButton.text = "Visualizza Ordine";
        tg.MainButton.show();
    } else {
        bar.classList.remove('visible');
        setTimeout(() => bar.classList.add('hidden'), 400); // Wait for transition
        tg.MainButton.hide();
    }
}

function openOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('visible'), 10);
    
    const list = document.getElementById('modal-items-list');
    list.innerHTML = '';
    
    let totalPrice = 0;
    for (let id in cart) {
        const product = PRODUCTS.find(p => p.id == id);
        const qty = cart[id];
        const itemTotal = product.price * qty;
        totalPrice += itemTotal;
        
        list.innerHTML += `
            <div class="modal-item-row">
                <div>
                    <div class="modal-item-name">${product.name}</div>
                    <div class="modal-item-meta">${qty}pz. x ${product.price.toFixed(2)}€</div>
                </div>
                <div class="modal-item-price">${itemTotal.toFixed(2)}€</div>
            </div>
        `;
    }
    document.getElementById('modal-total-price').innerText = `${totalPrice.toFixed(2)} €`;
    
    tg.MainButton.text = `Ordina per ${totalPrice.toFixed(2)} €`;
}

function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 400);
    tg.MainButton.text = "Visualizza Ordine";
}

// Event Listeners
document.getElementById('checkout-btn').addEventListener('click', openOrderModal);
document.getElementById('close-modal-btn').addEventListener('click', closeOrderModal);

document.getElementById('send-order-btn').addEventListener('click', submitOrder);
Telegram.WebApp.onEvent('mainButtonClicked', function() {
    const modal = document.getElementById('order-modal');
    if (modal.classList.contains('visible')) {
        submitOrder();
    } else {
        openOrderModal();
    }
});

function submitOrder() {
    // Send data back to the bot
    let data_to_send = [];
    for (let id in cart) {
        data_to_send.push({
            id: id,
            quantity: cart[id]
        });
    }
    // Convert to JSON string
    tg.sendData(JSON.stringify(data_to_send));
}

// Initial render
renderProducts();
