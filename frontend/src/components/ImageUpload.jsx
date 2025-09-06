import React, { useState, useRef, useCallback } from 'react';
import { imageService } from '../services/imageService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const ImageUpload = ({ 
  onImagesChange, 
  maxImages = 5, 
  existingImages = [],
  productId = null,
  disabled = false 
}) => {
  const [images, setImages] = useState(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFiles = useCallback(async (files) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const newImages = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Validate file
        try {
          imageService.validateImage(file);
        } catch (validationError) {
          setError(validationError.message);
          continue;
        }

        // Show file size info
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.log(`Processing ${file.name} (${fileSizeMB}MB)`);

        // Create preview
        const preview = URL.createObjectURL(file);
        const imageData = {
          id: `temp-${Date.now()}-${i}`,
          file,
          preview,
          uploading: true,
          progress: 0
        };

        newImages.push(imageData);
        setImages(prev => [...prev, imageData]);

        // Upload if productId is provided
        if (productId) {
          try {
            const progressCallback = (progress) => {
              setUploadProgress(prev => ({
                ...prev,
                [imageData.id]: progress
              }));
            };

            const uploadResult = await imageService.uploadImage(file, productId, progressCallback);
            
            // Update image with upload result
            setImages(prev => prev.map(img => 
              img.id === imageData.id 
                ? { 
                    ...img, 
                    url: uploadResult.url, 
                    path: uploadResult.path,
                    uploading: false 
                  }
                : img
            ));

            // Clean up preview URL
            URL.revokeObjectURL(preview);
            
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            setImages(prev => prev.filter(img => img.id !== imageData.id));
            setError(`Failed to upload ${file.name}: ${uploadError.message}`);
          }
        }
      }

      // If no productId, just add as previews
      if (!productId && newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onImagesChange?.(updatedImages);
      }

    } catch (error) {
      console.error('Error handling files:', error);
      setError('Failed to process images. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, productId, disabled, onImagesChange]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Remove image
  const removeImage = async (imageId) => {
    if (disabled) return;

    const imageToRemove = images.find(img => img.id === imageId);
    if (!imageToRemove) return;

    try {
      // Delete from Firebase Storage if it has a path
      if (imageToRemove.path) {
        await imageService.deleteImage(imageToRemove.path);
      }

      // Clean up preview URL if it exists
      if (imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      // Remove from state
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      onImagesChange?.(updatedImages);

    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image. Please try again.');
    }
  };

  // Reorder images
  const reorderImages = (fromIndex, toIndex) => {
    if (disabled) return;

    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  // Get image URL for display
  const getImageUrl = (image) => {
    return image.url || image.preview || '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary bg-opacity-5' 
            : 'border-gray-300 hover:border-primary'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {dragActive ? 'Drop images here' : 'Upload Product Images'}
            </p>
            <p className="text-sm text-gray-500">
              Drag & drop or click to select ({images.length}/{maxImages})
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPEG, PNG, WebP up to 5MB each
            </p>
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="mt-2 text-sm text-gray-600">Compressing and uploading...</p>
              <p className="text-xs text-gray-500">This may take a moment for large images</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => setError('')}
        />
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(image)}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Upload Progress */}
                {image.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <LoadingSpinner size="medium" color="white" />
                      <p className="text-xs mt-1">
                        {Math.round(uploadProgress[image.id] || 0)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Controls */}
              {!disabled && !image.uploading && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Primary Image Indicator */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                </div>
              )}

              {/* Drag Handle for Reordering */}
              {!disabled && images.length > 1 && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white bg-opacity-75 rounded p-1 cursor-move">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Instructions */}
      {images.length === 0 && !uploading && (
        <div className="text-center text-gray-500 text-sm">
          <p>No images uploaded yet</p>
          <p>The first image will be used as the primary product image</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;