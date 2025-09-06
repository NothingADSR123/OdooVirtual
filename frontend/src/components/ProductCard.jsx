import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryById, getConditionById } from '../config/categories';
import LoadingSpinner from './LoadingSpinner';

const ProductCard = ({ 
  product, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onAddToCart,
  onClick,
  isInCart = false,
  currentUserId = null,
  className = ''
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  if (!product) {
    return null;
  }

  const category = getCategoryById(product.category);
  const condition = getConditionById(product.condition);
  const isOwner = currentUserId === product.sellerId;
  const isAvailable = product.status === 'available';

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Handle action with loading state
  const handleAction = async (action, actionName) => {
    if (!action) return;
    
    setActionLoading(actionName);
    try {
      await action();
    } catch (error) {
      console.error(`Error in ${actionName}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  // Get primary image
  const primaryImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : null;

  return (
    <div 
      className={`product-card ${className}`}
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="product-image relative">
        {primaryImage && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="medium" />
              </div>
            )}
            <img
              src={primaryImage}
              alt={product.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {!isAvailable && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Sold
            </span>
          </div>
        )}

        {/* Condition Badge */}
        {condition && isAvailable && (
          <div className="absolute top-3 right-3">
            <span 
              className="text-white px-3 py-1 rounded-full text-sm font-semibold"
              style={{ backgroundColor: condition.color }}
            >
              {condition.name}
            </span>
          </div>
        )}

        {/* Category Icon */}
        {category && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-white bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-lg">{category.icon}</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <Link 
            to={`/product/${product.id}`}
            className="block hover:text-primary transition-colors"
          >
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Seller Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>By {product.sellerName}</span>
          <span>{formatDate(product.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {showActions && isOwner ? (
            // Owner actions (Edit/Delete)
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onEdit, 'edit');
                }}
                disabled={actionLoading === 'edit'}
                className="flex-1 btn-outline text-sm py-2 disabled:opacity-50"
              >
                {actionLoading === 'edit' ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onDelete, 'delete');
                }}
                disabled={actionLoading === 'delete'}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                {actionLoading === 'delete' ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </>
          ) : (
            // Buyer actions
            <>
              <Link
                to={`/product/${product.id}`}
                className="flex-1 btn-outline text-sm py-2 text-center"
              >
                View Details
              </Link>
              {isAvailable && !isOwner && onAddToCart && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(onAddToCart, 'addToCart');
                  }}
                  disabled={actionLoading === 'addToCart' || isInCart}
                  className={`flex-1 text-sm py-2 font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    isInCart 
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'btn-accent'
                  }`}
                >
                  {actionLoading === 'addToCart' ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : isInCart ? (
                    'In Cart'
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;