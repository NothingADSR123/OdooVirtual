import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Navbar from '../components/Navbar';

const MyListings = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'sold'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'price-high', 'price-low'
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Load user's products
  useEffect(() => {
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const userProducts = await productService.getProductsBySeller(user.uid);
      setProducts(userProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load your listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Apply filter
    if (filter === 'available') {
      filtered = filtered.filter(product => product.status === 'available');
    } else if (filter === 'sold') {
      filtered = filtered.filter(product => product.status === 'sold');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'newest':
        default:
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });

    return filtered;
  };

  // Handle product edit
  const handleEdit = (product) => {
    navigate(`/edit-product/${product.id}`);
  };

  // Handle product delete
  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await productService.deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      setSuccessMessage('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    }
  };

  // Get stats
  const getStats = () => {
    const available = products.filter(p => p.status === 'available').length;
    const sold = products.filter(p => p.status === 'sold').length;
    const totalValue = products
      .filter(p => p.status === 'available')
      .reduce((sum, p) => sum + (p.price || 0), 0);

    return { available, sold, totalValue, total: products.length };
  };

  const stats = getStats();
  const filteredProducts = getFilteredAndSortedProducts();

  if (loading) {
    return (
      <div className="min-h-screen gradient-main flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-main">
      <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">My Listings</h1>
              <p className="text-gray-600 mt-1">Manage your product listings</p>
            </div>
            <Link
              to="/add-product"
              className="btn-primary mt-4 md:mt-0 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Product
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-accent bg-opacity-10 border border-accent border-opacity-30 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-primary font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={loadProducts} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.total}</div>
            <div className="text-gray-600">Total Listings</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">{stats.available}</div>
            <div className="text-gray-600">Available</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">{stats.sold}</div>
            <div className="text-gray-600">Sold</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              ${stats.totalValue.toLocaleString()}
            </div>
            <div className="text-gray-600">Total Value</div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'available', label: 'Available', count: stats.available },
                { key: 'sold', label: 'Sold', count: stats.sold }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showActions={true}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product)}
                currentUserId={user?.uid}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="card p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            
            {products.length === 0 ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No listings yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start selling by creating your first product listing
                </p>
                <Link
                  to="/add-product"
                  className="btn-primary inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Listing
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {filter} listings
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'available' && 'All your items have been sold!'}
                  {filter === 'sold' && 'No items sold yet. Keep promoting your listings!'}
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="btn-outline"
                >
                  View All Listings
                </button>
              </>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {products.length > 0 && (
          <div className="mt-12 card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/add-product"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Add New Product</h4>
                  <p className="text-sm text-gray-600">List another item for sale</p>
                </div>
              </Link>

              <Link
                to="/sales-analytics"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
              >
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">View Analytics</h4>
                  <p className="text-sm text-gray-600">Track your sales performance</p>
                </div>
              </Link>

              <Link
                to="/seller-tips"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
              >
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Selling Tips</h4>
                  <p className="text-sm text-gray-600">Learn how to sell faster</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;