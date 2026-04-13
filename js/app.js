/**
 * js/app.js
 * Main application logic for the Online Shopping Management System.
 */

const App = {
  currentUser: null,
  authMode: 'login', // 'login' or 'register'
  editingProductId: null,
  
  init() {
    this.checkAuth();
    this.updateCartBadge();
    
    const path = window.location.pathname;
    
    // Page specific initializations
    if (document.getElementById('featured-products-grid')) this.renderFeaturedProducts();
    if (document.getElementById('all-products-grid')) this.renderAllProducts();
    if (document.getElementById('product-detail-container')) this.renderProductDetails();
    if (document.getElementById('cart-items-container')) this.renderCart();
    if (document.getElementById('orders-container')) this.renderOrders();
    if (document.getElementById('profile-container')) {
      if(!this.currentUser) {
          window.location.href = 'index.html';
      } else if(this.currentUser.role === 'admin' || this.currentUser.email === 'admin@shop.com') {
          window.location.href = 'admin.html';
      } else {
          this.renderProfile();
      }
    }
    if (document.getElementById('admin-stats-unified')) {
      if(!this.currentUser || (this.currentUser.role !== 'admin' && this.currentUser.email !== 'admin@shop.com')) {
         window.location.href = 'index.html';
      } else {
         this.renderAdminUnified();
         // Simulate clicking the dashboard tab to set valid UI state
         this.switchAdminTab('dashboard', { target: document.querySelector('.admin-nav-link') || document.body, preventDefault: () => {} });
      }
    }
  },

  checkAuth() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
      
      const loginBtn = document.getElementById('navbar-login-btn');
      if (loginBtn) {
        const isAdmin = this.currentUser.role === 'admin' || this.currentUser.email === 'admin@shop.com';
        const profileLink = isAdmin ? 'admin.html' : 'profile.html';
        const profileLabel = isAdmin ? 'Dashboard' : 'My Profile';
        
        loginBtn.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">person</span>
          </div>
          <span class="text-sm font-bold text-on-surface">${this.currentUser.name}</span>
          <span class="material-symbols-outlined text-slate-400 text-base ml-1">expand_more</span>
        `;
        loginBtn.style.position = 'relative';

        // Dropdown element
        const dropdown = document.createElement('div');
        dropdown.id = 'user-dropdown';
        dropdown.className = 'absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[99999] hidden';
        dropdown.innerHTML = `
          <a href="${profileLink}" class="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <span class="material-symbols-outlined text-primary text-base">${isAdmin ? 'dashboard' : 'person'}</span>
            ${profileLabel}
          </a>
          <div class="border-t border-slate-100"></div>
          <button onclick="App.logout()" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
            <span class="material-symbols-outlined text-red-500 text-base">logout</span>
            Logout
          </button>
        `;
        loginBtn.appendChild(dropdown);

        // Toggle dropdown on click
        loginBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => dropdown.classList.add('hidden'));
      }
      // Fade in after content is set (prevents Login→Username flash)
      if (loginBtn) {
        loginBtn.style.transition = 'opacity 0.2s ease';
        loginBtn.classList.remove('opacity-0');
      }
    } else {
      this.currentUser = { id: 'guest', name: 'Guest' }; 
      const loginBtn = document.getElementById('navbar-login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => { window.location.href = 'auth.html'; });
        // Fade in after content is set (prevents Login→Username flash)
        loginBtn.style.transition = 'opacity 0.2s ease';
        loginBtn.classList.remove('opacity-0');
      }
    }
  },

  logout() {
    if(confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    }
  },

  showToast(msg, type='info') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold text-sm shadow-2xl z-[9999] opacity-0 translate-y-10 scale-95 pointer-events-none transition-all duration-300';
      document.body.appendChild(toast);
    }
    
    toast.className = toast.className.replace(/bg-\w+-600/g, '');
    let bgClass = type === 'error' ? 'bg-red-600' : (type === 'success' ? 'bg-green-600' : 'bg-slate-800');
    toast.classList.add(bgClass);

    toast.innerText = msg;
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('opacity-0', 'translate-y-10', 'scale-95');
      toast.classList.add('opacity-100', 'translate-y-0', 'scale-100');
    }, 10);
    
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
      toast.classList.add('opacity-0', 'translate-y-10', 'scale-95');
    }, 3000);
  },

  handleSearch(e) {
     if(e.key === 'Enter') {
         const val = e.target.value.trim();
         if(val) window.location.href = 'products.html?q=' + encodeURIComponent(val);
     }
  },

  goToAdmin(e) {
      if(e) e.preventDefault();
      if(this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.email === 'admin@shop.com')) {
          window.location.href = 'admin.html';
      } else {
          this.showToast('Admin access required! Please login using "admin@shop.com" to access the dashboard.', 'error');
          window.location.href = 'auth.html';
      }
  },

  updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
      const cart = DB.getCart(this.currentUser.id);
      const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
      
      // Flash animation
      cartBadge.classList.add('scale-150');
      setTimeout(() => cartBadge.classList.remove('scale-150'), 200);
    }
  },

  // ----------------------------------------------------
  // PRODUCT RENDERING 
  // ----------------------------------------------------

  createProductCardHTML(product) {
    return `
      <div class="bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
        <div class="relative h-64 overflow-hidden bg-white flex items-center justify-center cursor-pointer border-b border-surface-variant" onclick="window.location.href='product-details.html?id=${product.id}'">
          <img class="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='https://placehold.co/400x400/f8fafc/94a3b8?text=Image+N/A'; this.classList.remove('mix-blend-multiply');" />
        </div>
        <div class="p-6 flex flex-col flex-1">
          <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1">${product.category}</p>
          <h3 class="font-headline font-bold text-lg text-on-surface mb-2 truncate">${product.name}</h3>
          <div class="flex items-center gap-2 mb-4">
            <div class="flex text-yellow-500">
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star_half</span>
            </div>
            <span class="text-xs text-on-surface-variant">(42)</span>
          </div>
          <div class="flex items-center justify-between mt-auto">
            <span class="text-2xl font-black text-on-surface">₹${parseFloat(product.price).toFixed(2)}</span>
            <button onclick="App.addToCart(${product.id})" class="bg-secondary-container text-on-secondary-container p-2.5 rounded-lg hover:bg-secondary-container/90 transition-colors flex items-center justify-center shadow">
              <span class="material-symbols-outlined">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    let products = DB.getProducts().filter(p => p.isFeatured).reverse();
    if (products.length === 0) {
      products = DB.getProducts().reverse().slice(0, 4);
    } else {
      products = products.slice(0, 4);
    }
    products.forEach(p => grid.innerHTML += this.createProductCardHTML(p));
  },

  renderAllProducts() {
    const grid = document.getElementById('all-products-grid');
    if (!grid) return;
    
    // URL Params Logic
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get('category');
    const urlDeals = params.get('deals');
    const searchQ = params.get('q');
    
    let products = DB.getProducts();
    
    // Filtering Elements
    const catFilter = document.getElementById('filter-category');
    const priceFilter = document.getElementById('filter-price');
    
    // Set UI to match URL first run
    if (catFilter && urlCat && !catFilter.dataset.loaded) {
       catFilter.value = urlCat;
       catFilter.dataset.loaded = 'true';
    }
    
    if (urlDeals) {
       products = products.filter(p => {
           const price = parseFloat(p.price) || 0;
           return price < 15000; // Anything under ₹15000 is a deal in this mock!
       }); 
    }
    
    if (searchQ) {
       products = products.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.category.toLowerCase().includes(searchQ.toLowerCase()));
    }
    
    if (catFilter && catFilter.value) {
      products = products.filter(p => p.category === catFilter.value);
    }
    if (priceFilter && priceFilter.value) {
      products = products.filter(p => parseFloat(p.price) <= parseFloat(priceFilter.value));
    }
    
    grid.innerHTML = '';
    if(products.length === 0) {
       grid.innerHTML = '<p class="text-on-surface-variant py-10">No products found matching filters.</p>';
       return;
    }
    products.forEach(p => grid.innerHTML += this.createProductCardHTML(p));
  },

  renderProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const product = DB.getProductById(id);
    const container = document.getElementById('product-detail-container');
    
    if (!product) {
      container.innerHTML = '<h1 class="text-2xl text-error font-bold">Product not found.</h1><a href="products.html" class="text-primary mt-4 block">Go back</a>';
      return;
    }
    
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
        <div class="h-[500px] border border-surface-variant rounded-xl flex items-center justify-center p-8 bg-white overflow-hidden group">
          <img src="${product.image}" class="w-full h-full object-contain group-hover:scale-125 transition-transform duration-700 mix-blend-multiply" alt="${product.name}" />
        </div>
        <div class="flex flex-col justify-center">
          <p class="text-sm font-bold text-primary tracking-widest uppercase mb-2">${product.category}</p>
          <h1 class="font-headline text-4xl font-extrabold text-on-surface mb-4">${product.name}</h1>
          <div class="flex items-center gap-3 mb-6 pb-6 border-b border-surface-variant">
            <span class="text-3xl font-black text-on-surface">₹${parseFloat(product.price).toFixed(2)}</span>
            <span class="bg-error-container text-on-error-container text-xs font-bold px-3 py-1 rounded-full">In Stock</span>
          </div>
          <h3 class="font-bold text-lg mb-2">Description</h3>
          <p class="text-on-surface-variant leading-relaxed mb-8">${product.description}</p>
          
          <div class="flex gap-4">
            <div class="flex items-center border border-surface-variant rounded-xl overflow-hidden bg-surface-container-high w-32">
              <button class="px-4 py-3 hover:bg-surface-variant transition-colors" onclick="document.getElementById('qty').value=Math.max(1, parseInt(document.getElementById('qty').value)-1)">-</button>
              <input type="text" id="qty" value="1" class="w-full text-center bg-transparent border-none font-bold outline-none" readonly />
              <button class="px-4 py-3 hover:bg-surface-variant transition-colors" onclick="document.getElementById('qty').value=parseInt(document.getElementById('qty').value)+1">+</button>
            </div>
            <button onclick="App.addMultipleToCart(${product.id})" class="flex-1 bg-secondary-container text-on-secondary-container font-bold text-lg rounded-xl hover:scale-105 transition-transform shadow-lg shadow-secondary-container/30 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">add_shopping_cart</span> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ----------------------------------------------------
  // CART & CHECKOUT
  // ----------------------------------------------------

  addToCart(productId) {
    const product = DB.getProductById(productId);
    if (product) {
      DB.addToCart(this.currentUser.id, product, 1);
      this.updateCartBadge();
      this.showToast(`Added ${product.name} to cart!`, 'success');
    }
  },

  addMultipleToCart(productId) {
    const qty = parseInt(document.getElementById('qty').value);
    const product = DB.getProductById(productId);
    if (product) {
      DB.addToCart(this.currentUser.id, product, qty);
      this.updateCartBadge();
      this.showToast(`Added ${qty}x ${product.name} to cart!`, 'success');
    }
  },

  updateCartQty(productId, qty) {
    DB.updateCartQuantity(this.currentUser.id, productId, qty);
    this.updateCartBadge();
    this.renderCart();
  },

  removeCartItem(productId) {
    DB.removeFromCart(this.currentUser.id, productId);
    this.updateCartBadge();
    this.renderCart();
    this.showToast('Item removed from cart.');
  },

  renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    const cart = DB.getCart(this.currentUser.id);
    container.innerHTML = '';
    
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <span class="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">remove_shopping_cart</span>
          <h2 class="font-headline text-xl font-bold mb-2">Your cart is empty</h2>
          <p class="text-on-surface-variant mb-6">Looks like you haven't added anything yet.</p>
          <button onclick="window.location.href='products.html'" class="bg-primary text-white px-6 py-3 rounded-lg font-bold">Start Shopping</button>
        </div>`;
      document.getElementById('cart-subtotal').innerText = '₹0.00';
      document.getElementById('cart-tax').innerText = '₹0.00';
      document.getElementById('cart-total').innerText = '₹0.00';
      return;
    }
    
    let subtotal = 0;
    
    cart.forEach(item => {
      const p = item.product;
      const itemTotal = p.price * item.quantity;
      subtotal += itemTotal;
      
      container.innerHTML += `
        <div class="flex items-center gap-6 py-4 border-b border-surface-variant">
          <div class="w-20 h-20 bg-white border border-surface-variant rounded-lg flex items-center justify-center p-2 hidden sm:flex">
             <img src="${p.image}" class="max-w-full max-h-full object-contain mix-blend-multiply" />
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-lg truncate pr-4 text-on-surface">${p.name}</h4>
            <div class="text-sm font-bold text-primary mb-2">₹${parseFloat(p.price).toFixed(2)}</div>
          </div>
          <div class="flex items-center border border-surface-variant rounded-lg bg-surface-container-high overflow-hidden shrink-0">
             <button class="px-3 py-1.5 hover:bg-surface-variant transition-colors" onclick="App.updateCartQty(${p.id}, ${item.quantity - 1})">-</button>
             <span class="px-3 py-1.5 font-bold text-sm min-w-[2rem] text-center">${item.quantity}</span>
             <button class="px-3 py-1.5 hover:bg-surface-variant transition-colors" onclick="App.updateCartQty(${p.id}, ${item.quantity + 1})">+</button>
          </div>
          <div class="font-black text-lg w-20 text-right shrink-0">
             ₹${itemTotal.toFixed(2)}
          </div>
          <button onclick="App.removeCartItem(${p.id})" class="text-on-surface-variant hover:text-error transition-colors p-2 shrink-0">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      `;
    });
    
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    document.getElementById('cart-subtotal').innerText = '₹' + subtotal.toFixed(2);
    document.getElementById('cart-tax').innerText = '₹' + tax.toFixed(2);
    document.getElementById('cart-total').innerText = '₹' + total.toFixed(2);
  },

  placeOrder(selectedAddress = null) {
    if (this.currentUser.id === 'guest') {
      this.showToast("Please login or create an account to place an order.", 'error');
      window.location.href = 'auth.html';
      return;
    }
    
    const cart = DB.getCart(this.currentUser.id);
    if(cart.length === 0) {
      this.showToast("Your cart is empty!", 'error');
      return;
    }
    
    // Calculate total
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const total = subtotal + (subtotal * 0.1); 
    
    this.openPaymentGateway(cart, total, selectedAddress);
  },

  openPaymentGateway(cart, total, address = null) {
      if(document.getElementById('payment-gateway-overlay')) return;
      
      const overlay = document.createElement('div');
      overlay.id = 'payment-gateway-overlay';
      overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4';
      
      const email = this.currentUser.email || 'user@example.com';
      const primaryAddr = address || (this.currentUser.addresses ? this.currentUser.addresses[0] : null);
      const phone = this.currentUser.phone || (primaryAddr && primaryAddr.phone) || '';
      const addrDisplay = primaryAddr 
          ? `${primaryAddr.addressLine1}, ${primaryAddr.city} - ${primaryAddr.zip}` 
          : null;
      
      overlay.innerHTML = `
        <div class="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all scale-95 animate-[scaleUp_0.3s_ease-out_forwards]" style="min-height: 500px;">
           <!-- Left Sidebar -->
           <div class="bg-slate-50 w-full md:w-1/3 border-r border-slate-200 flex-col hidden md:flex">
               <div class="p-6 border-b border-slate-200">
                   <div class="text-blue-700 font-extrabold text-xl tracking-tight mb-2">ShopWithMe</div>
                   <div class="text-slate-500 text-xs truncate">${email}</div>
                   <div class="text-slate-500 text-xs text-slate-400">${phone ? 'Ph: ' + phone : 'No phone saved'}</div>
                   ${addrDisplay ? `<div class="text-slate-400 text-[10px] mt-1 leading-tight">${addrDisplay}</div>` : ''}
               </div>
               <div class="flex-1 py-4">
                  <div class="px-6 py-3 cursor-pointer bg-white border-l-4 border-blue-600 text-blue-700 font-semibold text-sm flex items-center gap-3 shadow-sm">
                      <span class="material-symbols-outlined text-lg">credit_card</span> Card / EMI
                  </div>
                  <div class="px-6 py-3 cursor-pointer hover:bg-white border-l-4 border-transparent text-slate-600 font-semibold text-sm flex items-center gap-3 transition-colors">
                      <span class="material-symbols-outlined text-lg">qr_code_scanner</span> UPI / QR
                  </div>
                  <div class="px-6 py-3 cursor-pointer hover:bg-white border-l-4 border-transparent text-slate-600 font-semibold text-sm flex items-center gap-3 transition-colors">
                      <span class="material-symbols-outlined text-lg">account_balance</span> Netbanking
                  </div>
               </div>
               <div class="p-4 text-center border-t border-slate-200 flex flex-col items-center">
                   <div class="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-1"><span class="material-symbols-outlined text-[12px] text-green-600" style="font-variation-settings: 'FILL' 1;">lock</span> SECURED BY PAYGATE</div>
                   <div class="text-[9px] text-slate-400">100% SECURE PAYMENTS</div>
               </div>
           </div>
           
           <!-- Right Content -->
           <div class="w-full md:w-2/3 flex flex-col relative bg-white" id="payment-content-area">
               <!-- Header Mobile -->
               <div class="md:hidden p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                   <div class="font-extrabold text-blue-700">ShopWithMe</div>
                   <button onclick="document.getElementById('payment-gateway-overlay').remove()" class="text-slate-400 p-1"><span class="material-symbols-outlined">close</span></button>
               </div>
               
               <!-- Top Bar Details -->
               <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                   <div>
                       <div class="text-sm font-bold text-slate-800 mb-1">Amount to Pay</div>
                       <div class="text-[10px] font-mono text-slate-400">TXN-${Math.floor(Math.random()*100000000)}</div>
                   </div>
                   <div class="text-3xl font-black text-slate-900">₹${total.toFixed(2)}</div>
               </div>
               
               <!-- Delivery Address Box -->
               <div class="px-8 pt-6 pb-0">
                   <div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                       <span>Delivery Address</span>
                       <button onclick="App.closeAddressModal && document.getElementById('payment-gateway-overlay').remove(); window.location.href='profile.html'" class="text-blue-600 text-xs font-semibold hover:underline">Edit</button>
                   </div>
                   ${addrDisplay 
                       ? `<div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 flex items-start gap-2">
                              <span class="material-symbols-outlined text-blue-500 text-base mt-0.5">location_on</span>
                              <div><div class="font-semibold text-slate-800">${primaryAddr.type}</div><div class="text-xs text-slate-500">${addrDisplay}</div>${phone ? '<div class="text-xs text-slate-500 mt-0.5">📞 ' + phone + '</div>' : ''}</div>
                          </div>`
                       : `<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
                              <span class="material-symbols-outlined text-amber-500 text-base">warning</span>
                              <span>No address saved. <a href="profile.html" class="underline font-semibold">Add in Profile</a></span>
                          </div>`
                   }
               </div>
               
               <!-- Card Form -->
               <div class="p-8 pt-4 flex-1 bg-white relative">
                   <div class="mb-5 text-sm font-bold text-slate-800 flex items-center justify-between">
                       <span>Enter Card Details</span>
                   </div>
                   <div class="space-y-4">
                       <div class="border border-slate-300 rounded-md overflow-hidden flex items-center px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white">
                           <span class="material-symbols-outlined text-slate-400 mr-2 text-xl">credit_card</span>
                           <input type="text" class="w-full py-3 text-sm focus:outline-none placeholder-slate-400 font-mono" placeholder="Card Number (e.g. 4111...)"/>
                       </div>
                       <div class="flex gap-4">
                           <div class="border border-slate-300 rounded-md overflow-hidden flex-1 px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white relative">
                               <input type="text" class="w-full py-3 text-sm focus:outline-none placeholder-slate-400 font-mono" placeholder="MM/YY"/>
                           </div>
                           <div class="border border-slate-300 rounded-md overflow-hidden flex-1 px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white">
                               <input type="password" class="w-full py-3 text-sm focus:outline-none placeholder-slate-400 font-mono" placeholder="CVV"/>
                           </div>
                       </div>
                       <div class="border border-slate-300 rounded-md overflow-hidden px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white">
                           <input type="text" class="w-full py-3 text-sm focus:outline-none placeholder-slate-400" placeholder="Name on Card"/>
                       </div>
                       <div class="flex items-center gap-2 mt-4 text-xs text-slate-500">
                           <input type="checkbox" id="save-card" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked/>
                           <label for="save-card">Save card securely for future payments</label>
                       </div>
                   </div>
               </div>
               
               <!-- Footer -->
               <div class="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between mt-auto">
                   <button onclick="document.getElementById('payment-gateway-overlay').remove()" class="text-sm font-semibold text-slate-500 hover:text-slate-800 hidden md:block transition-colors">Cancel</button>
                   <button onclick="App.processMockPayment(${total})" class="w-full md:w-auto px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                       Pay Now
                   </button>
               </div>
               
               <!-- Loading / Success Screen (Initially Hidden) -->
               <div id="payment-status-overlay" class="absolute inset-0 bg-white/95 backdrop-blur-md z-10 flex flex-col items-center justify-center hidden opacity-0 transition-opacity duration-300">
                   <div id="payment-spinner" class="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-blue-600 mb-6 drop-shadow-md"></div>
                   <div id="payment-success-icon" class="hidden h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/40 transform scale-0 transition-transform duration-500">
                       <span class="material-symbols-outlined text-white text-3xl font-bold">check</span>
                   </div>
                   <h3 id="payment-status-text" class="text-xl font-bold text-slate-800">Processing Payment...</h3>
                   <p id="payment-status-subtext" class="text-sm text-slate-500 mt-2 font-medium">Please do not refresh the page or press back</p>
               </div>
               
           </div>
        </div>
      `;
      // Insert css animation for modal popup dynamically if not exists
      if(!document.getElementById('payment-anim-style')) {
          const style = document.createElement('style');
          style.id = 'payment-anim-style';
          style.innerHTML = `
            @keyframes scaleUp {
                0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
          `;
          document.head.appendChild(style);
      }
      
      document.body.appendChild(overlay);
  },
  
  processMockPayment(total) {
      const statusOverlay = document.getElementById('payment-status-overlay');
      statusOverlay.classList.remove('hidden');
      // trigger reflow
      void statusOverlay.offsetWidth;
      statusOverlay.classList.remove('opacity-0');
      statusOverlay.classList.add('opacity-100');
      
      const spinner = document.getElementById('payment-spinner');
      const icon = document.getElementById('payment-success-icon');
      const text = document.getElementById('payment-status-text');
      const subtext = document.getElementById('payment-status-subtext');
      
      // Simulate API Processing Time
      setTimeout(() => {
          spinner.classList.add('hidden');
          icon.classList.remove('hidden');
          // small delay for css animation pop
          setTimeout(() => icon.classList.remove('scale-0'), 50);
          
          text.innerText = 'Payment Successful!';
          text.className = 'text-2xl font-black text-green-600';
          subtext.innerText = 'Redirecting to your orders...';
          
          // Finalize order
          const cart = DB.getCart(this.currentUser.id);
          DB.createOrder(this.currentUser.id, cart, total);
          DB.clearCart(this.currentUser.id);
          
          // Clear payment gateway and redirect
          setTimeout(() => {
              document.getElementById('payment-gateway-overlay').remove();
              this.updateCartBadge();
              window.location.href = 'orders.html';
          }, 2000);
          
      }, 2500);
  },

  renderOrders() {
    if(this.currentUser.id === 'guest') {
      document.getElementById('orders-container').innerHTML = '<p class="py-12">Please login to view orders.</p>';
      return;
    }
    const container = document.getElementById('orders-container');
    const orders = DB.getOrdersByUser(this.currentUser.id).reverse();
    
    container.innerHTML = '';
    if(orders.length === 0) {
      container.innerHTML = '<p class="text-on-surface-variant py-12">You have no previous orders.</p>';
      return;
    }
    
    orders.forEach(o => {
      let itemsHtml = o.items.map(i => `<span class="bg-surface-container px-3 py-1 rounded-full text-sm">${i.quantity}x ${i.product.name}</span>`).join(' ');
      
      const statusMap = {
        'Pending':          { cls: 'bg-yellow-100 text-yellow-800', icon: 'schedule' },
        'Packed':           { cls: 'bg-blue-100 text-blue-800',     icon: 'inventory_2' },
        'Shipped':          { cls: 'bg-indigo-100 text-indigo-800', icon: 'local_shipping' },
        'Out for Delivery': { cls: 'bg-orange-100 text-orange-800', icon: 'delivery_dining' },
        'Delivered':        { cls: 'bg-green-100 text-green-800',   icon: 'check_circle' },
        'Cancelled':        { cls: 'bg-red-100 text-red-800',       icon: 'cancel' },
      };
      const st = statusMap[o.status] || { cls: 'bg-slate-100 text-slate-700', icon: 'info' };
      
      container.innerHTML += `
        <div class="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-surface-variant flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
               <h3 class="font-bold text-lg">Order #${o.id}</h3>
               <span class="${st.cls} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                 <span class="material-symbols-outlined text-sm" style="font-size:14px">${st.icon}</span>
                 ${o.status}
               </span>
            </div>
            <p class="text-sm text-on-surface-variant mb-4">${new Date(o.date).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})}</p>
            <div class="flex flex-wrap gap-2">
               ${itemsHtml}
            </div>
          </div>
          <div class="text-right shrink-0">
             <p class="text-sm text-on-surface-variant mb-1">Total Amount</p>
             <p class="font-black text-2xl text-primary">₹${o.total_price.toFixed(2)}</p>
          </div>
        </div>
      `;
    });
  },


  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------
  
  toggleAuthMode() {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
    document.getElementById('auth-title').innerText = this.authMode === 'login' ? 'Welcome Back' : 'Create Account';
    document.getElementById('auth-action-btn').innerText = this.authMode === 'login' ? 'Login' : 'Register';
    document.getElementById('auth-toggle-btn').innerText = this.authMode === 'login' ? 'Create a new account' : 'Already have an account? Login';
    document.getElementById('auth-name').classList.toggle('hidden');
  },

  handleAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-pass').value;
    
    if(!email || !pass) return this.showToast("Please fill details.", 'error');
    
    // Very dummy auth logic
    if(this.authMode === 'register') {
      const name = document.getElementById('auth-name').value;
      if(DB.getUserByEmail(email)) return this.showToast("Email already exists.", 'error');
      let user = DB.addUser({ name, email, pass, role: 'user' });
      localStorage.setItem('currentUser', JSON.stringify({id: user.id, name: user.name, role: user.role, email}));
      window.location.href = 'index.html';
    } 
    else {
      // Special admin hook
      if(email === 'admin' || email === 'admin@shop.com') {
          localStorage.setItem('currentUser', JSON.stringify({id: 'admin', name: 'Admin', role: 'admin', email: 'admin@shop.com'}));
          window.location.href = 'admin.html';
          return;
      }
      const user = DB.getUserByEmail(email);
      if(user && user.pass === pass) {
        localStorage.setItem('currentUser', JSON.stringify({id: user.id, name: user.name, role: user.role, email}));
        window.location.href = 'index.html';
      } else {
        this.showToast("Invalid email or password.", 'error');
      }
    }
  },

  // ----------------------------------------------------
  // ADMIN PANEL
  // ----------------------------------------------------
  
  switchAdminTab(tab, event) {
      if(event) event.preventDefault();
      
      const links = document.querySelectorAll('.admin-nav-link');
      links.forEach(l => {
          l.classList.remove('text-blue-700', 'font-bold', 'border-b-2', 'border-blue-700');
          l.classList.add('text-slate-600', 'font-medium');
      });
      if(event && event.target) {
          event.target.classList.remove('text-slate-600', 'font-medium');
          event.target.classList.add('text-blue-700', 'font-bold', 'border-b-2', 'border-blue-700');
      }

      const tabs = ['admin-tab-dashboard', 'admin-target-orders', 'admin-target-products', 'admin-target-sidebar'];
      tabs.forEach(id => {
          const el = document.getElementById(id);
          if(el) el.classList.add('hidden');
      });
      const usersElem = document.getElementById('admin-target-users');
      if(usersElem) usersElem.classList.add('hidden');

      if(tab === 'dashboard') {
          document.getElementById('admin-tab-dashboard').classList.remove('hidden');
          document.getElementById('admin-target-orders').classList.remove('hidden');
      }
      else if (tab === 'products') {
          document.getElementById('admin-target-products').classList.remove('hidden');
          document.getElementById('admin-target-sidebar').classList.remove('hidden');
      }
      else if (tab === 'orders') {
          document.getElementById('admin-target-orders').classList.remove('hidden');
      }
      else if (tab === 'users') {
          let uElem = document.getElementById('admin-target-users');
          if(!uElem) {
              uElem = document.createElement('section');
              uElem.id = 'admin-target-users';
              uElem.innerHTML = `
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Registered Users</h2>
                </div>
                <div class="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low border-b border-outline-variant/10">
                                <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">User ID</th>
                                <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Name</th>
                                <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</th>
                                <th class="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Role</th>
                            </tr>
                        </thead>
                        <tbody id="admin-users-tbody" class="divide-y divide-surface-container">
                        </tbody>
                    </table>
                </div>
              `;
              document.getElementById('admin-target-products').parentElement.appendChild(uElem);
          }
          uElem.classList.remove('hidden');
          this.renderAdminUsers();
      }
  },

  renderAdminUsers() {
      const tbody = document.getElementById('admin-users-tbody');
      if(!tbody) return;
      const users = DB.getUsers();
      tbody.innerHTML = users.map(u => `
          <tr class="hover:bg-surface-container-low/50 transition-colors">
              <td class="px-6 py-5 font-mono text-sm text-primary">USR-${u.id}</td>
              <td class="px-6 py-5 text-sm font-medium">${u.name}</td>
              <td class="px-6 py-5 text-sm">${u.email}</td>
              <td class="px-6 py-5 text-right font-bold text-xs uppercase tracking-widest ${u.role==='admin'?'text-error':'text-secondary'}">${u.role}</td>
          </tr>
      `).join('');
  },

  renderAdminUnified() {
    const users = DB.getUsers().length;
    const ordersArr = DB.getOrders();
    const rev = ordersArr.reduce((acc, o) => acc + o.total_price, 0);

    // Render Stats
    const statsContainer = document.getElementById('admin-stats-unified');
    if (statsContainer) {
        statsContainer.innerHTML = `
<div class="bg-surface-container-lowest p-8 rounded-xl editorial-shadow group hover:-translate-y-1 transition-transform duration-300">
<div class="flex items-start justify-between mb-4">
<div class="p-3 bg-primary/10 text-primary rounded-lg"><span class="material-symbols-outlined text-3xl" data-icon="group">group</span></div>
<span class="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">+${users} active</span>
</div>
<p class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Total Users</p>
<h3 class="text-3xl font-extrabold mt-1">${users}</h3>
</div>
<div class="bg-surface-container-lowest p-8 rounded-xl editorial-shadow group hover:-translate-y-1 transition-transform duration-300 border-l-4 border-secondary-container">
<div class="flex items-start justify-between mb-4">
<div class="p-3 bg-secondary-container/10 text-secondary rounded-lg"><span class="material-symbols-outlined text-3xl" data-icon="shopping_cart">shopping_cart</span></div>
<span class="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">${ordersArr.length} orders</span>
</div>
<p class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Total Orders</p>
<h3 class="text-3xl font-extrabold mt-1">${ordersArr.length}</h3>
</div>
<div class="bg-primary p-8 rounded-xl editorial-shadow text-white group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
<div class="relative z-10">
<div class="flex items-start justify-between mb-4">
<div class="p-3 bg-white/20 rounded-lg backdrop-blur-md"><span class="material-symbols-outlined text-3xl text-white" data-icon="payments">payments</span></div>
<span class="text-xs font-bold px-2 py-1 bg-white/20 text-white rounded-md">Real-time</span>
</div>
<p class="text-sm font-semibold text-primary-fixed uppercase tracking-wider">Revenue</p>
<h3 class="text-3xl font-extrabold mt-1">₹${rev.toFixed(2)}</h3>
</div>
<div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
</div>
        `;
    }

    // Render Orders Table
    const ordersContainer = document.getElementById('admin-orders-tbody');
    if(ordersContainer) {
        ordersContainer.innerHTML = '';
        ordersArr.reverse().slice(0, 10).forEach(o => {
            const statusColors = {
              'Pending':          'bg-yellow-100 text-yellow-700',
              'Packed':           'bg-blue-100 text-blue-700',
              'Shipped':          'bg-indigo-100 text-indigo-700',
              'Out for Delivery': 'bg-orange-100 text-orange-700',
              'Delivered':        'bg-green-100 text-green-700',
              'Cancelled':        'bg-red-100 text-red-700',
            };
            const badgeClass = statusColors[o.status] || 'bg-slate-100 text-slate-700';
            let statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeClass}">${o.status}</span>`;

            const statuses = ['Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
            const options = statuses.map(s => `<option ${o.status===s?'selected':''}>${s}</option>`).join('');
                
            ordersContainer.innerHTML += `
            <tr class="hover:bg-surface-container-low/50 transition-colors">
            <td class="px-6 py-5 font-mono text-sm text-primary">#${o.id}</td>
            <td class="px-6 py-5 text-sm font-medium">USR-${o.user_id}</td>
            <td class="px-6 py-5 text-sm font-bold text-right">₹${o.total_price.toFixed(2)}</td>
            <td class="px-6 py-5 text-center">${statusBadge}</td>
            <td class="px-6 py-5 text-right">
            <select onchange="App.adminUpdateOrderStatusUnified(${o.id}, this.value)" class="text-xs bg-surface-container-high border-none rounded-lg p-1.5 font-bold text-primary cursor-pointer">
                ${options}
            </select>
            </td>
            </tr>`;
        });
    }

    // Render Products Table
    const prodsContainer = document.getElementById('admin-products-tbody');
    if(prodsContainer) {
        prodsContainer.innerHTML = '';
        DB.getProducts().forEach(p => {
            prodsContainer.innerHTML += `
            <tr class="group">
            <td class="px-6 py-4 font-mono text-xs text-on-surface-variant">PRD-${p.id}</td>
            <td class="px-6 py-4">
            <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded bg-surface-container flex-shrink-0 overflow-hidden relative">
            <img class="w-full h-full object-cover mix-blend-multiply" src="${p.image}" onerror="this.onerror=null; this.src='https://placehold.co/100x100/f8fafc/94a3b8?text=N/A'; this.classList.remove('mix-blend-multiply');"/>
            </div>
            <span class="font-semibold text-sm truncate max-w-[150px] inline-block">${p.name}</span>
            </div>
            </td>
            <td class="px-6 py-4 text-sm font-bold text-right">₹${parseFloat(p.price).toFixed(2)}</td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
            <button title="Edit Product" onclick="App.adminEditProductUnified(${p.id})" class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors mr-1">
            <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button title="Delete Product" onclick="App.adminDeleteProductUnified(${p.id})" class="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-lg" data-icon="delete">delete</span>
            </button>
            </td>
            </tr>`;
        });
    }
  },

  adminPreviewImage(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('admin-img-preview');
      const placeholder = document.getElementById('admin-img-placeholder');
      if (preview) {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
      }
      if (placeholder) placeholder.classList.add('hidden');
      // Clear URL field to avoid conflict
      const urlField = document.getElementById('admin-prod-img');
      if (urlField) urlField.value = '';
      // Store base64 in a data attribute on the drop zone
      document.getElementById('admin-img-drop').dataset.base64 = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  adminEditProductUnified(id) {
      const product = DB.getProductById(id);
      if (!product) return;
      
      this.editingProductId = id;
      
      document.getElementById('admin-prod-name').value = product.name;
      document.getElementById('admin-prod-price').value = parseFloat(product.price);
      document.getElementById('admin-prod-cat').value = product.category;
      document.getElementById('admin-prod-desc').value = product.description;
      
      const featuredCb = document.getElementById('admin-prod-featured');
      if(featuredCb) featuredCb.checked = !!product.isFeatured;
      
      document.getElementById('admin-prod-img').value = product.image;
      const preview = document.getElementById('admin-img-preview');
      const placeholder = document.getElementById('admin-img-placeholder');
      const dropZone = document.getElementById('admin-img-drop');
      if (preview && placeholder) {
          preview.src = product.image;
          preview.classList.remove('hidden');
          placeholder.classList.add('hidden');
          if (dropZone) dropZone.dataset.base64 = '';
      }

      const submitText = document.getElementById('admin-prod-submit-text');
      const submitIcon = document.getElementById('admin-prod-submit-icon');
      const cancelBtn = document.getElementById('admin-prod-cancel-btn');
      
      if(submitText) submitText.innerText = 'Update Product';
      if(submitIcon) { submitIcon.innerText = 'save'; submitIcon.setAttribute('data-icon', 'save'); }
      if(cancelBtn) { cancelBtn.classList.remove('hidden'); cancelBtn.classList.add('flex'); }
      
      // Force the sidebar to become visible if it was hidden
      const sidebar = document.getElementById('admin-target-sidebar');
      if (sidebar) sidebar.classList.remove('hidden');
      
      document.querySelector('aside').scrollIntoView({ behavior: 'smooth' });
  },

  adminCancelEdit() {
      this.editingProductId = null;
      
      document.getElementById('admin-prod-name').value = '';
      document.getElementById('admin-prod-price').value = '';
      document.getElementById('admin-prod-img').value = '';
      document.getElementById('admin-prod-desc').value = '';
      
      const featuredCb = document.getElementById('admin-prod-featured');
      if(featuredCb) featuredCb.checked = false;
      
      const dropZone = document.getElementById('admin-img-drop');
      if (dropZone) dropZone.dataset.base64 = '';
      
      const preview = document.getElementById('admin-img-preview');
      if (preview) { preview.src = ''; preview.classList.add('hidden'); }
      
      const placeholder = document.getElementById('admin-img-placeholder');
      if (placeholder) placeholder.classList.remove('hidden');
      
      const fileInput = document.getElementById('admin-prod-img-file');
      if (fileInput) fileInput.value = '';
      
      const submitText = document.getElementById('admin-prod-submit-text');
      const submitIcon = document.getElementById('admin-prod-submit-icon');
      const cancelBtn = document.getElementById('admin-prod-cancel-btn');
      
      if(submitText) submitText.innerText = 'Add Product';
      if(submitIcon) { submitIcon.innerText = 'add'; submitIcon.setAttribute('data-icon', 'add'); }
      if(cancelBtn) { cancelBtn.classList.add('hidden'); cancelBtn.classList.remove('flex');  }
  },

  adminAddProductUnified() {
      const name = document.getElementById('admin-prod-name')?.value.trim();
      const price = parseFloat(document.getElementById('admin-prod-price')?.value);
      const category = document.getElementById('admin-prod-cat')?.value;
      const description = document.getElementById('admin-prod-desc')?.value.trim();
      const isFeatured = document.getElementById('admin-prod-featured')?.checked || false;
      
      const dropZone = document.getElementById('admin-img-drop');
      const image = (dropZone?.dataset.base64) || document.getElementById('admin-prod-img')?.value.trim();
      
      if(!name || isNaN(price) || !category || !image) {
        this.showToast('Please fill all fields and add an image.', 'error');
        return;
      }
      
      if (this.editingProductId) {
         DB.updateProduct(this.editingProductId, {name, price, category, image, description, isFeatured});
         this.showToast('Product "' + name + '" updated successfully!', 'success');
      } else {
         DB.addProduct({name, price, category, image, description, isFeatured});
         this.showToast('Product "' + name + '" added successfully!', 'success');
      }
      
      this.adminCancelEdit();
      this.renderAdminUnified();
  },
  
  adminDeleteProductUnified(id) {
      if(confirm("Delete this product?")) {
          DB.deleteProduct(id);
          this.renderAdminUnified();
          this.showToast("Product deleted.");
      }
  },
  
  adminUpdateOrderStatusUnified(id, status) {
      DB.updateOrderStatus(id, status);
      this.renderAdminUnified();
      this.showToast("Order status updated!");
  },

  // ----------------------------------------------------
  // PROFILE METHODS (NEW)
  // ----------------------------------------------------
  
  renderProfile() {
    const container = document.getElementById('profile-container');
    if (!container) return;
    
    // Simulate user stats (could be fetched from DB later)
    const userRoleText = this.currentUser.role === 'admin' ? 'Admin' : 'Customer';
    const roleColor = this.currentUser.role === 'admin' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container';
    const initials = this.currentUser.name.substring(0, 2).toUpperCase();

    const orders = DB.getOrdersByUser(this.currentUser.id).reverse();
    const activeOrdersCount = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
    
    let ordersHtml = '';
    if (orders.length === 0) {
        ordersHtml = '<p class="text-on-surface-variant text-sm py-2">No recent orders found.</p>';
    } else {
        ordersHtml = orders.slice(0, 3).map(o => {
            const statusColors = {
              'Pending': 'bg-yellow-100 text-yellow-700',
              'Packed': 'bg-blue-100 text-blue-700',
              'Shipped': 'bg-indigo-100 text-indigo-700',
              'Out for Delivery': 'bg-orange-100 text-orange-700',
              'Delivered': 'bg-green-100 text-green-700',
              'Cancelled': 'bg-red-100 text-red-700',
            };
            const badgeClass = statusColors[o.status] || 'bg-slate-100 text-slate-700';
            return `
            <div class="flex items-start gap-4 p-4 border border-surface-container rounded-2xl hover:border-primary/30 transition-colors bg-surface-container-low cursor-pointer" onclick="window.location.href='orders.html'">
                <div class="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
                    <span class="material-symbols-outlined">shopping_bag</span>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <p class="font-bold text-on-surface">Order #${o.id}</p>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeClass}">${o.status}</span>
                    </div>
                    <p class="text-sm text-on-surface-variant mb-2">${new Date(o.date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</p>
                    <p class="font-bold text-primary">₹${o.total_price.toFixed(2)}</p>
                </div>
            </div>`;
        }).join('');
    }

    container.innerHTML = `
      <div class="space-y-10">
        <!-- Profile Header Section -->
        <section class="flex flex-col items-center text-center bg-surface-container-lowest p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          <div class="relative group">
            <div class="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary-container mb-6 shadow-lg">
              <div class="w-full h-full rounded-full bg-surface flex items-center justify-center border-4 border-surface text-4xl font-black text-primary">
                ${initials}
              </div>
            </div>
          </div>
          <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">${this.currentUser.name}</h2>
          <p class="text-on-surface-variant font-medium mb-4">${this.currentUser.email}</p>
          <span class="px-5 py-2 ${roleColor} text-xs font-bold rounded-full uppercase tracking-widest shadow-sm">
            ${userRoleText}
          </span>
        </section>

        <!-- Stats Bento-ish Grid -->
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-md shadow-slate-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <span class="text-primary font-headline text-3xl font-black mb-1">${activeOrdersCount}</span>
            <span class="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Active Orders</span>
          </div>
          <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-md shadow-slate-200/50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div class="flex text-secondary mb-1 gap-1">
               <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">star</span>
               <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">star</span>
               <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">star</span>
               <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">star</span>
               <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">star</span>
            </div>
            <span class="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Customer Rating</span>
          </div>
        </div>

        <!-- Saved Addresses Section -->
        <section class="bg-surface-container-lowest rounded-3xl p-8 shadow-md shadow-slate-200/50">
          <div class="flex items-center justify-between mb-8 border-b border-surface-container pb-4">
              <h3 class="font-headline text-xl font-extrabold text-on-surface">Saved Addresses</h3>
              <button onclick="App.openAddressModal()" class="flex items-center gap-1 text-primary text-sm font-bold hover:opacity-80 transition-opacity">
                  <span class="material-symbols-outlined text-sm">add_circle</span> Add New
              </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="profile-addresses-grid">
              <!-- Addresses injected here -->
          </div>
        </section>
        
        <!-- Order History Section -->
        <section class="bg-surface-container-lowest rounded-3xl p-8 shadow-md shadow-slate-200/50">
          <div class="flex items-center justify-between mb-8 border-b border-surface-container pb-4">
              <h3 class="font-headline text-xl font-extrabold text-on-surface">Recent Orders</h3>
              <button onclick="window.location.href='orders.html'" class="flex items-center gap-1 text-primary text-sm font-bold hover:opacity-80 transition-opacity">
                  View All <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
          </div>
          <div class="space-y-4">
              ${ordersHtml}
          </div>
        </section>

        <!-- Logout Button -->
        <section class="pt-6">
          <button id="profile-logout-btn" class="w-full py-5 bg-error-container text-error font-headline text-lg font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-error hover:text-white transition-all duration-300 active:scale-95 shadow-lg shadow-error-container/50">
            <span class="material-symbols-outlined" data-icon="logout">logout</span>
            Secure Log Out
          </button>
          <p class="text-center text-[11px] text-outline mt-8 uppercase tracking-widest font-bold">
            ShopWithMe Ecosystem — Security Tier 4
          </p>
        </section>
      </div>
    `;

    document.getElementById('profile-logout-btn').addEventListener('click', () => {
        this.logout();
    });

    this.renderAddresses();
  },

  renderAddresses() {
    const grid = document.getElementById('profile-addresses-grid');
    if (!grid) return;
    const addresses = this.currentUser.addresses || [];
    if (addresses.length === 0) {
      grid.innerHTML = `<p class="text-on-surface-variant text-sm col-span-1 md:col-span-2 text-center py-4">No addresses saved yet.</p>`;
      return;
    }
    grid.innerHTML = addresses.map((addr, index) => {
      let icon = 'location_on';
      if(addr.type === 'Home') icon = 'home';
      if(addr.type === 'Office') icon = 'work';
      return `
        <div class="bg-surface-container-low p-6 rounded-2xl border border-transparent hover:border-primary/20 transition-all group cursor-pointer">
            <div class="flex gap-4 items-start">
                <div class="w-12 h-12 bg-surface-container-lowest rounded-xl flex items-center justify-center shadow-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    <span class="material-symbols-outlined text-xl">${icon}</span>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-base font-bold text-on-surface group-hover:text-primary transition-colors">${addr.type}</p>
                        <button onclick="App.deleteAddress(${index})" class="material-symbols-outlined text-outline-variant hover:text-error transition-colors text-sm">delete</button>
                    </div>
                    <p class="text-sm text-on-surface-variant leading-relaxed">${addr.addressLine1}<br/>${addr.city}, ${addr.zip}</p>
                </div>
            </div>
        </div>
      `;
    }).join('');
  },

  openAddressModal() {
    let modal = document.getElementById('address-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'address-modal';
      modal.className = 'fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-[100] flex items-center justify-center hidden';
      modal.innerHTML = `
        <div class="bg-surface-container-lowest p-8 rounded-3xl w-full max-w-md m-4 shadow-2xl relative">
          <button onclick="App.closeAddressModal()" class="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors" type="button">
            <span class="material-symbols-outlined">close</span>
          </button>
          <h2 class="font-headline text-2xl font-extrabold text-on-surface mb-6">Add New Address</h2>
          <form id="add-address-form" class="space-y-4" onsubmit="App.saveAddress(event)">
            <div>
              <label class="block text-sm font-bold text-on-surface-variant mb-1">Address Type</label>
              <select id="addr-type" required class="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all">
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-on-surface-variant mb-1">Street Address</label>
              <input type="text" id="addr-line" required placeholder="123 Main St" class="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-on-surface-variant mb-1">City</label>
                <input type="text" id="addr-city" required placeholder="New York" class="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
              </div>
              <div>
                <label class="block text-sm font-bold text-on-surface-variant mb-1">ZIP/PIN Code</label>
                <input type="text" id="addr-zip" required placeholder="10001" class="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-on-surface-variant mb-1">Phone Number</label>
              <input type="tel" id="addr-phone" placeholder="+91 98765 43210" class="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
            </div>
            <button type="submit" class="w-full bg-primary-container text-on-primary-container font-headline font-bold py-4 rounded-xl mt-6 hover:opacity-90 transition-opacity">
              Save Address
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    document.getElementById('add-address-form').reset();
  },

  closeAddressModal() {
    const modal = document.getElementById('address-modal');
    if (modal) modal.classList.add('hidden');
  },

  saveAddress(e) {
    e.preventDefault();
    if (this.currentUser.id === 'guest') {
        this.showToast('Please login to save addresses.', 'error');
        return;
    }
    const type = document.getElementById('addr-type').value;
    const line = document.getElementById('addr-line').value;
    const city = document.getElementById('addr-city').value;
    const zip = document.getElementById('addr-zip').value;
    const phone = document.getElementById('addr-phone')?.value || '';

    if (!this.currentUser.addresses) this.currentUser.addresses = [];
    this.currentUser.addresses.push({
        type: type,
        addressLine1: line,
        city: city,
        zip: zip,
        phone: phone
    });

    // Also save phone to user profile if provided
    if (phone) {
        this.currentUser.phone = phone;
        DB.updateUser(this.currentUser.id, { addresses: this.currentUser.addresses, phone: phone });
    } else {
        DB.updateUser(this.currentUser.id, { addresses: this.currentUser.addresses });
    }
    // Update active cache
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    
    this.closeAddressModal();
    this.renderAddresses();
    this.showToast('Address saved successfully!');
  },

  deleteAddress(index) {
    if (confirm('Are you sure you want to delete this address?')) {
        this.currentUser.addresses.splice(index, 1);
        DB.updateUser(this.currentUser.id, { addresses: this.currentUser.addresses });
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.renderAddresses();
        this.showToast('Address deleted.');
    }
  },

  // ----------------------------------------------------
  // UTILITIES
  // ----------------------------------------------------
  
  showToast(message) {
    let toast = document.getElementById('toast-container');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-container';
      toast.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(toast);
    }
    
    const notif = document.createElement('div');
    notif.className = 'bg-primary text-white px-6 py-3 rounded-lg shadow-xl opacity-0 translate-y-2 transition-all duration-300 flex items-center gap-2';
    notif.innerHTML = `
      <span class="material-symbols-outlined">check_circle</span>
      <span class="font-medium">${message}</span>
    `;
    
    toast.appendChild(notif);
    
    setTimeout(() => notif.classList.remove('opacity-0', 'translate-y-2'), 10);
    setTimeout(() => {
      notif.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
