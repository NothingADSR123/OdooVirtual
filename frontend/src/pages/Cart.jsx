import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cartService } from '../services/cartService';
import { purchaseService } from '../services/purchaseService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Navbar from '../components/Navbar';

const Cart = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const cart = await cartService.getCart(user.uid);
      setCartItems(cart.items);
    } catch (err) {
      console.error('Error loading cart items:', err);
      showError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeFromCart(user.uid, productId);
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      showSuccess('Item removed from cart');
    } catch (err) {
      console.error('Error removing item:', err);
      showError('Failed to remove item from cart');
    }
  };

  // Removed quantity functionality since marketplace items are unique

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product?.price || 0), 0);
  };

  const handleCheckout = async () => {
    showError('Checkout feature to be added soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-main">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-main">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-white mb-4 text-shadow">
              Shopping Cart
            </h1>
            <p className="text-xl text-white text-opacity-90">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {error && (
            <div className="mb-6 animate-fadeInUp">
              <ErrorMessage message={error} onClose={() => setError(null)} />
            </div>
          )}

          {/* Cart Content */}
          {cartItems.length === 0 ? (
            // Empty Cart State
            <div className="text-center py-20 animate-fadeInUp">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 text-shadow">
                Your cart is empty
              </h3>
              <p className="text-xl text-white text-opacity-90 mb-8 max-w-md mx-auto">
                Discover amazing items from our community marketplace
              </p>
              <Link 
                to="/" 
                className="btn-primary text-lg px-8 py-4 hover-lift"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start Shopping
              </Link>
            </div>
          ) : (
            // Cart Items
            <div className="space-y-6 animate-fadeInUp">
              {cartItems.map((item, index) => (
                <div 
                  key={item.productId} 
                  className="card p-6 hover-lift"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product?.title || 'Product'}
                        className="w-32 h-32 object-cover rounded-xl shadow-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link 
                            to={`/product/${item.productId}`}
                            className="block hover:text-primary transition-colors"
                          >
                            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:underline">
                              {item.product?.title || 'Unknown Product'}
                            </h3>
                          </Link>
                          <p className="text-gray-600 mb-2">
                            Sold by {item.product?.sellerName || 'Unknown Seller'}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.product?.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from cart"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Added on {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ${item.product?.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Cart Summary */}
              <div className="card p-8 bg-gradient-to-r from-primary to-primary-dark text-white">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Order Summary</h3>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Total ({cartItems.length} items)</p>
                    <p className="text-3xl font-bold">
                      ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/"
                    className="btn-glass text-white hover:bg-white hover:bg-opacity-20 flex-1"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={handleCheckout}
                    disabled={processingCheckout || cartItems.length === 0}
                    className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingCheckout ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Proceed to Checkout
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;