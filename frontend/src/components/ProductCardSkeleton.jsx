import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="card">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-200 animate-shimmer"></div>
      
      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded mb-2 animate-shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-shimmer"></div>
        
        {/* Description */}
        <div className="h-3 bg-gray-200 rounded mb-1 animate-shimmer"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-3 animate-shimmer"></div>
        
        {/* Price and Location */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 bg-gray-200 rounded w-20 animate-shimmer"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-shimmer"></div>
        </div>
        
        {/* Seller and Category */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-gray-200 rounded w-24 animate-shimmer"></div>
          <div className="h-3 bg-gray-200 rounded w-16 animate-shimmer"></div>
        </div>
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded animate-shimmer"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;