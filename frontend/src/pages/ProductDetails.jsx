import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { getCategoryOptions, getConditionOptions } from '../config/categories';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const categoryOptions = getCategoryOptions();
  const conditionOptions = getConditionOptions();

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');

        const productData = await productService.getProductById(id);
        if (!productData) {
          setError('Product not found');
          return;
        }

        setProduct(productData);

        // Load similar products (same category, different product)
        if (productData.category) {
          const similar = await productService.getProducts({
            category: productData.category,
            limit: 4
          });
          
          // Filter out current product and limit to 4
          const filteredSimilar = similar
            .filter(p => p.id !== id)
            .slice(0, 4);
          
          setSimilarProducts(filteredSimilar);
        }

      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (product.sellerId === user.uid) {
      setCartMessage('You cannot add your own product to cart');
      setTimeout(() => setCartMessage(''), 3000);
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(user.uid, product.id, 1);
      setCartMessage('Added to cart successfully!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage('Failed to add to cart');
      setTimeout(() => setCartMessage(''), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle contact seller
  const handleContactSeller = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Create mailto link
    const subject = encodeURIComponent(`Interested in: ${product.title}`);
    const body = encodeURIComponent(
      `Hi ${product.sellerName},\n\nI'm interested in your listing "${product.title}" on EcoFinds.\n\nCould you please provide more details?\n\nThanks!`
    );
    
    window.location.href = `mailto:${product.sellerEmail}?subject=${subject}&body=${body}`;
  };

  // Get category and condition labels
  const getCategoryLabel = (value) => {
    const category = categoryOptions.find(c => c.value === value);
    return category ? `${category.icon} ${category.label}` : value;
  };

  const getConditionLabel = (value) => {
    const condition = conditionOptions.find(c => c.value === value);
    return condition ? condition.label : value;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-main flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen gradient-main">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <ErrorMessage message={error || 'Product not found'} />
            <button
              onClick={() => navigate('/')}
              className="btn-primary mt-4"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-main">
      <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {product.images && product.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={product.images[currentImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnail Images */}
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex
                              ? 'border-primary'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-4xl font-bold text-primary">${product.price}</p>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p className="text-gray-900">{getCategoryLabel(product.category)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Condition</span>
                  <p className="text-gray-900">{getConditionLabel(product.condition)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Location</span>
                  <p className="text-gray-900">{product.location}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Listed</span>
                  <p className="text-gray-900">
                    {product.createdAt?.toDate ? 
                      product.createdAt.toDate().toLocaleDateString() : 
                      'Recently'
                    }
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {product.sellerName ? product.sellerName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.sellerName}</p>
                    <p className="text-sm text-gray-600">Member since {
                      product.createdAt?.toDate ? 
                        product.createdAt.toDate().getFullYear() : 
                        'recently'
                    }</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {cartMessage && (
                  <div className={`p-3 rounded-lg text-center ${
                    cartMessage.includes('successfully') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cartMessage}
                  </div>
                )}

                {user && product.sellerId === user.uid ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-800 font-medium">This is your listing</p>
                    <button
                      onClick={() => navigate('/my-listings')}
                      className="btn-outline mt-2"
                    >
                      Manage Listings
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.status !== 'available'}
                      className="btn-primary w-full"
                    >
                      {addingToCart ? (
                        <>
                          <LoadingSpinner size="small" color="white" />
                          <span className="ml-2">Adding to Cart...</span>
                        </>
                      ) : product.status !== 'available' ? (
                        'Not Available'
                      ) : (
                        'Add to Cart'
                      )}
                    </button>

                    <button
                      onClick={handleContactSeller}
                      className="btn-outline w-full"
                    >
                      Contact Seller
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showActions={false}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;