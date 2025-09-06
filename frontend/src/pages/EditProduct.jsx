import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { imageService } from '../services/imageService';
import { getCategoryOptions, getConditionOptions } from '../config/categories';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Navbar from '../components/Navbar';

const EditProduct = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    tags: ''
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [product, setProduct] = useState(null);

  const categoryOptions = getCategoryOptions();
  const conditionOptions = getConditionOptions();

  // Load existing product data
  useEffect(() => {
    loadProduct();
  }, [id, user]);

  const loadProduct = async () => {
    if (!id || !user) return;

    try {
      setIsLoading(true);
      const productData = await productService.getProductById(id);
      
      // Check if user owns this product
      if (productData.sellerId !== user.uid) {
        showError('You can only edit your own products');
        navigate('/my-listings');
        return;
      }

      setProduct(productData);
      
      // Populate form with existing data
      setFormData({
        title: productData.title || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        category: productData.category || '',
        condition: productData.condition || '',
        location: productData.location || '',
        tags: productData.tags?.join(', ') || ''
      });

      // Set existing images
      if (productData.images && productData.images.length > 0) {
        const existingImages = productData.images.map((url, index) => ({
          id: `existing-${index}`,
          url: url,
          preview: url,
          isExisting: true
        }));
        setImages(existingImages);
      }

    } catch (error) {
      console.error('Error loading product:', error);
      showError('Failed to load product details');
      navigate('/my-listings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.condition) {
      newErrors.condition = 'Please select item condition';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user || !product) {
      setSubmitError('Unable to update product');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Prepare updated product data
      const updatedData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim() || 'Not specified',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      console.log('Updating product with data:', updatedData);

      // Handle image updates
      const newImageFiles = images.filter(img => img.file && !img.isExisting);
      const existingImageUrls = images.filter(img => img.isExisting).map(img => img.url);

      let finalImageUrls = [...existingImageUrls];

      // Upload new images if any
      if (newImageFiles.length > 0) {
        try {
          console.log(`Uploading ${newImageFiles.length} new images...`);
          
          const uploadPromises = newImageFiles.map(async (img) => {
            try {
              return await imageService.uploadImage(img.file, product.id);
            } catch (error) {
              console.error('Failed to upload image:', error);
              return null;
            }
          });

          const uploadResults = await Promise.all(uploadPromises);
          const successfulUploads = uploadResults.filter(result => result !== null);
          const newImageUrls = successfulUploads.map(result => result.url);
          
          finalImageUrls = [...finalImageUrls, ...newImageUrls];
          
          const failedCount = uploadResults.length - successfulUploads.length;
          if (failedCount > 0) {
            showError(`${failedCount} image(s) failed to upload`);
          }
          
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          showError('Some images failed to upload');
        }
      }

      // Update product with new data and images
      updatedData.images = finalImageUrls;
      await productService.updateProduct(product.id, updatedData);

      showSuccess('Product updated successfully!');
      navigate('/my-listings');

    } catch (error) {
      console.error('Error updating product:', error);
      setSubmitError(error.message || 'Failed to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle images change
  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-main">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-white">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen gradient-main">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
            <button
              onClick={() => navigate('/my-listings')}
              className="btn-primary"
            >
              Back to My Listings
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update your listing details</p>
            </div>
            <button
              onClick={() => navigate('/my-listings')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="card-elevated p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="e.g., iPhone 12 Pro Max - Excellent Condition"
                  maxLength={100}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe your item's condition, features, and any important details..."
                  maxLength={1000}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                <p className="mt-1 text-xs text-gray-500">{formData.description.length}/1000 characters</p>
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`input-field pl-8 ${errors.price ? 'border-red-500' : ''}`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>
              </div>

              {/* Condition and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className={`input-field ${errors.condition ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select condition</option>
                    {conditionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                  {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., vintage, rare, collectible (separate with commas)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Add keywords to help buyers find your item
                </p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <ImageUpload
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                  existingImages={images}
                />
                <div className="mt-2 text-sm text-gray-500">
                  You can add, remove, or reorder images. The first image will be your main product photo.
                </div>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mt-6">
                <ErrorMessage message={submitError} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/my-listings')}
                className="btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-primary px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span className="ml-2">Updating...</span>
                  </>
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;