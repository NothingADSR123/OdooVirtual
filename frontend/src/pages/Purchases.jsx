import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { purchaseService } from '../services/purchaseService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Navbar from '../components/Navbar';

const Purchases = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  useEffect(() => {
    loadPurchases();
  }, [user]);

  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
      setSuccessMessage(null);
    }
  }, [successMessage, showSuccess]);

  const loadPurchases = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userPurchases = await purchaseService.getUserPurchases(user.uid);
      setPurchases(userPurchases);
    } catch (err) {
      console.error('Error loading purchases:', err);
      showError('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              Purchase History
            </h1>
            <p className="text-xl text-white text-opacity-90">
              {purchases.length} {purchases.length === 1 ? 'purchase' : 'purchases'} found
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 animate-fadeInUp">
              <div className="bg-green-500 bg-opacity-90 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{successMessage}</span>
                  {location.state?.total && (
                    <span className="ml-2">Total: ${location.state.total.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 animate-fadeInUp">
              <ErrorMessage message={error} onClose={() => setError(null)} />
            </div>
          )}

          {/* Purchases Content */}
          {purchases.length === 0 ? (
            // Empty State
            <div className="text-center py-20 animate-fadeInUp">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 text-shadow">
                No purchases yet
              </h3>
              <p className="text-xl text-white text-opacity-90 mb-8 max-w-md mx-auto">
                Start exploring our marketplace to find amazing items
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
            // Purchase List
            <div className="space-y-6 animate-fadeInUp">
              {purchases.map((purchase, index) => (
                <div 
                  key={purchase.id} 
                  className="card p-6 hover-lift"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Purchase Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {purchase.productTitle}
                          </h3>
                          <p className="text-gray-600 mb-1">
                            Purchase Date: {formatDate(purchase.createdAt)}
                          </p>
                          <p className="text-gray-600">
                            Order ID: {purchase.id}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.status)}`}>
                          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-semibold">{purchase.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Unit Price</p>
                          <p className="font-semibold">${purchase.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-xl font-bold text-primary">
                            ${purchase.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/product/${purchase.productId}`}
                          className="btn-outline text-primary border-primary hover:bg-primary hover:text-white px-4 py-2 text-sm"
                        >
                          View Product
                        </Link>
                        {purchase.status === 'completed' && (
                          <button 
                            onClick={() => showError('Review feature to be added soon!')}
                            className="btn-ghost text-gray-600 hover:text-primary px-4 py-2 text-sm"
                          >
                            Leave Review
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Purchase Summary */}
                    <div className="lg:w-64 bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Purchase Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>${(purchase.price * purchase.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span>$0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span>Free</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-primary">${purchase.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <div className="text-center pt-8">
                <Link 
                  to="/" 
                  className="btn-primary px-8 py-4 hover-lift"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchases;