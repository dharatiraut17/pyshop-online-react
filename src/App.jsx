import React, { useState } from 'react';
import { ShoppingCart, CreditCard, Trash2, CheckCircle, Package, ArrowLeft, Store, Star, Zap } from 'lucide-react';

// --- Mock Data ---
const INITIAL_PRODUCTS = [
  { id: 1, name: "Gaming Laptop", price: 1200.00, stock: 5, category: "Electronics", image: "💻", rating: 4.8 },
  { id: 2, name: "Wireless Headset", price: 150.00, stock: 15, category: "Audio", image: "🎧", rating: 4.5 },
  { id: 3, name: "Mechanical Keyboard", price: 80.00, stock: 20, category: "Accessories", image: "⌨️", rating: 4.7 },
  { id: 4, name: "Smart Watch", price: 200.00, stock: 10, category: "Wearables", image: "⌚", rating: 4.2 },
  { id: 5, name: "4K Monitor", price: 350.00, stock: 8, category: "Electronics", image: "🖥️", rating: 4.6 },
  { id: 6, name: "Ergonomic Chair", price: 250.00, stock: 0, category: "Furniture", image: "🪑", rating: 4.9 },
  { id: 7, name: "Smartphone", price: 899.00, stock: 12, category: "Electronics", image: "📱", rating: 4.8 },
  { id: 8, name: "Gaming Mouse", price: 49.99, stock: 25, category: "Accessories", image: "🖱️", rating: 4.4 },
  { id: 9, name: "Desk Lamp", price: 45.00, stock: 18, category: "Furniture", image: "💡", rating: 4.3 },
  { id: 10, name: "Bluetooth Speaker", price: 59.99, stock: 14, category: "Audio", image: "🔊", rating: 4.5 },
];

export default function App() {
  const [view, setView] = useState('home'); // 'home', 'cart', 'invoice'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [order, setOrder] = useState(null); // Details for the invoice
  const [cardNumber, setCardNumber] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // --- Logic ---

  const addToCart = (product) => {
    if (product.stock > 0) {
      // Update Cart
      setCart(prev => ({
        ...prev,
        [product.id]: (prev[product.id] || 0) + 1
      }));

      // Decrease Stock
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      ));
    }
  };

  const removeFromCart = (productId) => {
    const qty = cart[productId];
    if (!qty) return;

    // Restore Stock
    setProducts(prev => prev.map(p => 
      p.id === parseInt(productId) ? { ...p, stock: p.stock + qty } : p
    ));

    // Remove from Cart
    const newCart = { ...cart };
    delete newCart[productId];
    setCart(newCart);
  };

  const clearCart = () => {
    // Restore all stock
    Object.entries(cart).forEach(([pid, qty]) => {
      setProducts(prev => prev.map(p => 
        p.id === parseInt(pid) ? { ...p, stock: p.stock + qty } : p
      ));
    });
    setCart({});
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [pid, qty]) => {
      const product = products.find(p => p.id === parseInt(pid));
      return total + (product ? product.price * qty : 0);
    }, 0);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    // Simulate Network Delay
    setTimeout(() => {
      // Validate Card (Simple 16 digit check)
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length !== 16 || isNaN(cleanNum)) {
        setError('❌ Transaction Failed: Invalid Card Number (Must be 16 digits)');
        setProcessing(false);
        return;
      }

      // Success
      const orderDetails = {
        id: Math.floor(Math.random() * 100000),
        date: new Date().toLocaleString(),
        items: Object.entries(cart).map(([pid, qty]) => {
          const p = products.find(i => i.id === parseInt(pid));
          return { ...p, qty, subtotal: p.price * qty };
        }),
        total: getCartTotal(),
        cardLast4: cleanNum.slice(-4)
      };

      setOrder(orderDetails);
      setCart({});
      setCardNumber('');
      setView('invoice');
      setProcessing(false);
    }, 1500);
  };

  // --- Views ---

  const Navbar = () => (
    <nav className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white p-4 sticky top-0 z-50 shadow-lg ring-1 ring-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 text-2xl font-bold cursor-pointer hover:opacity-90 transition group" 
          onClick={() => setView('home')}
        >
          <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="tracking-tight">PyShop<span className="text-yellow-300">Online</span></span>
        </div>
        
        <button 
          onClick={() => setView('cart')} 
          className="relative bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full flex items-center gap-3 transition border border-white/10 backdrop-blur-sm group"
        >
          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-bold bg-yellow-400 text-indigo-900 px-2 py-0.5 rounded-full text-sm min-w-[24px] text-center">
            {Object.values(cart).reduce((a, b) => a + b, 0)}
          </span>
        </button>
      </div>
    </nav>
  );

  const HomeView = () => {
    // Get unique categories
    const categories = ['All', ...new Set(INITIAL_PRODUCTS.map(p => p.category))];
    
    // Filter products based on selection
    const filteredProducts = selectedCategory === 'All' 
      ? products 
      : products.filter(p => p.category === selectedCategory);

    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-12 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-3xl rounded-full -z-10"></div>
          <h1 className="text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600">Premium Gear</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Upgrade your setup with our curated selection of high-performance electronics and accessories.</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg scale-105 ring-2 ring-indigo-600 ring-offset-2'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100 overflow-hidden hover:-translate-y-1">
              <div className="relative h-56 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8 group-hover:from-indigo-50 group-hover:to-purple-50 transition-colors duration-500">
                <span className="text-7xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{product.image}</span>
                {product.stock < 5 && product.stock > 0 && (
                   <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                     <Zap className="w-3 h-3" /> Low Stock
                   </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                      <Star className="w-4 h-4 fill-current" /> {product.rating}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-2xl font-bold text-slate-900">${product.price}</span>
                     <span className={`text-sm font-medium ${product.stock > 0 ? 'text-slate-400' : 'text-red-500'}`}>
                      {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                      product.stock > 0 
                        ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg hover:shadow-indigo-200 active:scale-95' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    {product.stock > 0 ? <><ShoppingCart className="w-5 h-5"/> Add to Cart</> : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CartView = () => {
    const total = getCartTotal();
    const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
      <div className="max-w-7xl mx-auto p-6">
        <button onClick={() => setView('home')} className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition font-medium">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200 group-hover:border-indigo-200 transition">
            <ArrowLeft className="w-4 h-4" /> 
          </div>
          Continue Shopping
        </button>

        <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><ShoppingCart className="w-6 h-6" /></span>
          Your Cart
        </h2>

        {itemCount === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h3>
            <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
            <button onClick={() => setView('home')} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 hover:-translate-y-1">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {Object.entries(cart).map(([pid, qty]) => {
                const product = products.find(p => p.id === parseInt(pid));
                return (
                  <div key={pid} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center text-4xl shadow-inner">
                        {product.image}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-slate-800 mb-1">{product.name}</h4>
                        <p className="text-slate-500 text-sm font-medium bg-slate-100 inline-block px-2 py-1 rounded-md">${product.price} x {qty}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold text-xl text-indigo-600">${(product.price * qty).toFixed(2)}</p>
                      <button 
                        onClick={() => removeFromCart(pid)}
                        className="text-red-400 hover:text-red-600 text-sm font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex justify-end pt-4">
                 <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition">
                   <Trash2 className="w-4 h-4" /> Clear All Items
                 </button>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100 sticky top-24">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-slate-800">
                  <CreditCard className="w-6 h-6 text-indigo-600" /> Payment Details
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Tax (5%)</span>
                    <span>${(total * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4"></div>
                  <div className="flex justify-between font-extrabold text-2xl text-slate-900">
                    <span>Total</span>
                    <span>${(total * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckout}>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="1234 5678 1234 5678"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:outline-none transition font-mono text-slate-700"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength="19"
                        required
                      />
                      <CreditCard className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Demo: Enter 16 random digits</p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                      <span className="mt-0.5 text-lg">⚠️</span> {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={processing}
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-indigo-200 transition-all duration-300 transform ${
                      processing 
                        ? 'bg-slate-400 cursor-wait' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl active:scale-95'
                    }`}
                  >
                    {processing ? 'Processing...' : `Pay $${(total * 1.05).toFixed(2)}`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const InvoiceView = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="bg-white max-w-lg w-full p-10 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden backdrop-blur-xl">
        {/* Success Banner */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 font-medium">Your order is confirmed and on the way.</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-500 font-medium">Order ID</span>
            <span className="font-mono font-bold text-slate-800">#{order?.id}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-500 font-medium">Date</span>
            <span className="text-slate-800 font-medium">{order?.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Payment Method</span>
            <span className="text-slate-800 font-medium">**** {order?.cardLast4}</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Items Purchased</h4>
          {order?.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-3">
                 <span className="text-lg">{item.image}</span>
                 <span className="text-slate-600 font-medium">{item.qty} x {item.name}</span>
              </div>
              <span className="font-bold text-slate-900">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center bg-indigo-900 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 mb-8">
          <span className="font-medium text-indigo-200">Total Paid</span>
          <span className="font-bold text-2xl">${(order?.total * 1.05).toFixed(2)}</span>
        </div>

        <button 
          onClick={() => setView('home')} 
          className="w-full bg-white text-slate-900 border-2 border-slate-200 py-3.5 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
        >
          Return to Shop
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {view !== 'invoice' && <Navbar />}
      
      {view === 'home' && <HomeView />}
      {view === 'cart' && <CartView />}
      {view === 'invoice' && <InvoiceView />}
    </div>
  );
}
