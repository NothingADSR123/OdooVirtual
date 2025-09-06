import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { imageService } from '../services/imageService';
import { getCategoryOptions, getConditionOptions } from '../config/categories';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Navbar from '../components/Navbar';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const [submitError, setSubmitError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraft, setIsDraft] = useState(false);

  const totalSteps = 3;
  const categoryOptions = getCategoryOptions();
  const conditionOptions = getConditionOptions();

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('ecofinds_product_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData || {});
        setIsDraft(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      formData,
      timestamp: Date.now()
    };
    localStorage.setItem('ecofinds_product_draft', JSON.stringify(draft));
    setIsDraft(true);
  };

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem('ecofinds_product_draft');
    setIsDraft(false);
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

  // Validate form step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
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
    }

    if (step === 2) {
      // Images are now optional - no validation error
      // Users can skip images if they want
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    if (!user) {
      setSubmitError('You must be logged in to create a listing');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setSubmitError('Request timed out. Please try again.');
    }, 30000); // 30 second timeout

    try {
      // Prepare product data
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim() || 'Not specified',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        sellerId: user.uid,
        sellerName: user.displayName || user.email,
        sellerEmail: user.email,
        images: [] // Will be updated after image upload
      };

      console.log('Creating product with data:', productData);

      // Create product first to get ID
      const createdProduct = await productService.createProduct(productData);
      console.log('Product created successfully:', createdProduct);

      // Upload images if any
      let imageUrls = [];
      let uploadWarning = '';
      
      if (images.length > 0) {
        const imageFiles = images.map(img => img.file).filter(Boolean);
        if (imageFiles.length > 0) {
          try {
            console.log(`Uploading ${imageFiles.length} images...`);
            
            // Upload images with individual error handling
            const uploadPromises = imageFiles.map(async (file, index) => {
              try {
                return await imageService.uploadImage(file, createdProduct.id);
              } catch (error) {
                console.error(`Failed to upload image ${index + 1}:`, error);
                return null; // Return null for failed uploads
              }
            });

            const uploadResults = await Promise.all(uploadPromises);
            
            // Filter out failed uploads and get URLs
            const successfulUploads = uploadResults.filter(result => result !== null);
            imageUrls = successfulUploads.map(result => result.url);
            
            const failedCount = uploadResults.length - successfulUploads.length;
            if (failedCount > 0) {
              uploadWarning = `${failedCount} image(s) failed to upload. You can add them later.`;
            }
            
            console.log(`Successfully uploaded ${imageUrls.length} out of ${imageFiles.length} images`);
            
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            uploadWarning = 'Images failed to upload. You can add them later from your listings.';
          }
        }
      }

      // Update product with image URLs if any were uploaded
      if (imageUrls.length > 0) {
        try {
          await productService.updateProduct(createdProduct.id, {
            images: imageUrls
          });
          console.log('Product updated with images successfully');
        } catch (updateError) {
          console.error('Product update error:', updateError);
          uploadWarning = 'Product created but failed to save some images. You can add them later.';
        }
      }

      // Show warning if there were upload issues, but still proceed
      if (uploadWarning) {
        setSubmitError(uploadWarning);
        // Clear the error after showing success
        setTimeout(() => {
          clearTimeout(timeoutId);
          clearDraft();
          navigate('/my-listings', { 
            state: { 
              message: 'Product listed successfully!' + (uploadWarning ? ` Note: ${uploadWarning}` : ''),
              productId: createdProduct.id 
            }
          });
        }, 2000);
        return;
      }

      // Clear timeout and draft, then redirect
      clearTimeout(timeoutId);
      clearDraft();
      navigate('/my-listings', { 
        state: { 
          message: 'Product listed successfully!',
          productId: createdProduct.id 
        }
      });

    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error creating product:', error);
      setSubmitError(error.message || 'Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle images change
  const handleImagesChange = (newImages) => {
    setImages(newImages);
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  // Step content components
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Basic Information</h2>
            
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Product Images</h2>
            <ImageUpload
              onImagesChange={handleImagesChange}
              maxImages={5}
              existingImages={images}
            />
            {errors.images && <ErrorMessage message={errors.images} />}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Photo Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use good lighting and clear, high-quality images</li>
                <li>• Show the item from multiple angles</li>
                <li>• Include close-ups of any wear or damage</li>
                <li>• The first image will be your main product photo</li>
                <li>• <strong>Large images are automatically compressed for faster uploads</strong></li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Review & Publish</h2>
            
            {/* Product Preview */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Product Preview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images Preview */}
                <div>
                  {images.length > 0 ? (
                    <div className="space-y-2">
                      <img
                        src={images[0].preview || images[0].url}
                        alt="Main product"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {images.slice(1, 5).map((image, index) => (
                            <img
                              key={index}
                              src={image.preview || image.url}
                              alt={`Product ${index + 2}`}
                              className="aspect-square object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No images</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xl">{formData.title}</h4>
                    <p className="text-2xl font-bold text-primary">${formData.price}</p>
                  </div>
                  
                  <p className="text-gray-600">{formData.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="text-gray-600">
                        {categoryOptions.find(c => c.value === formData.category)?.label}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Condition:</span>
                      <p className="text-gray-600">
                        {conditionOptions.find(c => c.value === formData.condition)?.label}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-gray-600">{formData.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Seller:</span>
                      <p className="text-gray-600">{user?.displayName || user?.email}</p>
                    </div>
                  </div>

                  {formData.tags && (
                    <div>
                      <span className="font-medium text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-main">
      <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">List Your Item</h1>
            <button
              onClick={() => navigate(-1)}
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
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium ${step <= currentStep ? 'text-primary' : 'text-gray-600'}`}>
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Images'}
                      {step === 3 && 'Review'}
                    </p>
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        step < currentStep ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Draft Notice */}
          {isDraft && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-yellow-800 font-medium">Draft loaded</span>
                </div>
                <button
                  onClick={clearDraft}
                  className="text-yellow-600 hover:text-yellow-800 text-sm"
                >
                  Clear draft
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="card-elevated p-8">
            {renderStepContent()}

            {/* Error Message */}
            {submitError && (
              <div className="mt-6">
                <ErrorMessage message={submitError} />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn-outline"
                    disabled={isSubmitting}
                  >
                    Previous
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={saveDraft}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                  disabled={isSubmitting}
                >
                  Save Draft
                </button>
              </div>

              <div className="flex space-x-4">
                {currentStep < totalSteps ? (
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      Next Step
                    </button>
                    {currentStep === 2 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="btn-outline"
                        disabled={isSubmitting}
                      >
                        Skip Images
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="btn-primary px-8"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="small" color="white" />
                          <span className="ml-2">Publishing...</span>
                        </>
                      ) : (
                        'Publish Listing'
                      )}
                    </button>
                    {images.length === 0 && (
                      <div className="text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Publishing without images
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;