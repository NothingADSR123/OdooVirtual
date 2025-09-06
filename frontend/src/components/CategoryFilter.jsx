import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '../config/categories';

const CategoryFilter = ({ 
  onCategoryChange, 
  productCounts = {}, 
  className = '',
  layout = 'horizontal' // 'horizontal' or 'vertical'
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update selected category from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam || '');
    }
  }, [location.search]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsDropdownOpen(false);

    // Update URL with category parameter
    const urlParams = new URLSearchParams(location.search);
    if (categoryId) {
      urlParams.set('category', categoryId);
    } else {
      urlParams.delete('category');
    }

    const newUrl = `${location.pathname}?${urlParams.toString()}`;
    navigate(newUrl, { replace: true });

    // Call the callback
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    handleCategorySelect('');
  };

  // Get category by ID
  const getCategoryById = (id) => {
    return PRODUCT_CATEGORIES.find(cat => cat.id === id);
  };

  // Get total product count
  const getTotalCount = () => {
    return Object.values(productCounts).reduce((sum, count) => sum + count, 0);
  };

  // Horizontal layout (for desktop)
  if (layout === 'horizontal') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {/* All Categories Button */}
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedCategory === ''
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-primary hover:text-primary'
          }`}
        >
          All Categories
          {getTotalCount() > 0 && (
            <span className="ml-2 text-xs opacity-75">
              ({getTotalCount()})
            </span>
          )}
        </button>

        {/* Category Buttons */}
        {PRODUCT_CATEGORIES.map((category) => {
          const count = productCounts[category.id] || 0;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary hover:text-primary'
              }`}
              style={{
                backgroundColor: isSelected ? category.color : undefined
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              {count > 0 && (
                <span className="text-xs opacity-75">
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Vertical layout (for sidebar)
  if (layout === 'vertical') {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
          {selectedCategory && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-secondary transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* All Categories */}
        <button
          onClick={() => handleCategorySelect('')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-between ${
            selectedCategory === ''
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="font-medium">All Categories</span>
          {getTotalCount() > 0 && (
            <span className="text-sm opacity-75">
              {getTotalCount()}
            </span>
          )}
        </button>

        {/* Category List */}
        <div className="space-y-1">
          {PRODUCT_CATEGORIES.map((category) => {
            const count = productCounts[category.id] || 0;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-between ${
                  isSelected
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: isSelected ? category.color : undefined
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
                {count > 0 && (
                  <span className="text-sm opacity-75">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Dropdown layout (for mobile)
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-primary transition-colors"
      >
        <div className="flex items-center space-x-3">
          {selectedCategory ? (
            <>
              <span className="text-lg">{getCategoryById(selectedCategory)?.icon}</span>
              <span className="font-medium">{getCategoryById(selectedCategory)?.name}</span>
            </>
          ) : (
            <span className="font-medium text-gray-700">All Categories</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* All Categories Option */}
          <button
            onClick={() => handleCategorySelect('')}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
              selectedCategory === '' ? 'bg-primary text-white' : ''
            }`}
          >
            <span className="font-medium">All Categories</span>
            {getTotalCount() > 0 && (
              <span className="text-sm opacity-75">
                {getTotalCount()}
              </span>
            )}
          </button>

          {/* Category Options */}
          {PRODUCT_CATEGORIES.map((category) => {
            const count = productCounts[category.id] || 0;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'text-white'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: isSelected ? category.color : undefined
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
                {count > 0 && (
                  <span className="text-sm opacity-75">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Backdrop for mobile */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default CategoryFilter;