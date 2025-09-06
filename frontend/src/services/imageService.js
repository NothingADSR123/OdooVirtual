import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable 
} from 'firebase/storage';
import { storage } from '../firebase/firebase';

class ImageService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  // Validate image file
  validateImage(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new Error('File size must be less than 5MB');
    }

    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    return true;
  }

  // Generate unique filename
  generateFileName(originalName, productId) {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `${productId}_${timestamp}.${extension}`;
  }

  // Compress image before upload - more aggressive compression
  async compressImage(file, maxWidth = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions with better scaling
          let { width, height } = img;
          
          // More aggressive resizing for faster uploads
          const maxDimension = Math.max(width, height);
          if (maxDimension > maxWidth) {
            const scale = maxWidth / maxDimension;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Use better image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with better compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            }, 
            'image/jpeg', 
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Upload single image with aggressive compression and faster processing
  async uploadImage(file, productId, onProgress = null) {
    try {
      this.validateImage(file);

      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

      // Always compress images for faster uploads
      let fileToUpload = file;
      if (file.size > 500 * 1024) { // If larger than 500KB, compress aggressively
        console.log('Compressing image for faster upload...');
        const compressedBlob = await this.compressImage(file, 600, 0.6); // More aggressive
        fileToUpload = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        console.log(`Compressed file size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
      }

      const fileName = this.generateFileName(file.name, productId);
      const imagePath = `product-images/${productId}/${fileName}`;
      const imageRef = ref(storage, imagePath);

      // Shorter timeout for faster feedback
      const uploadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Upload timeout - image may be too large. Try a smaller image.'));
        }, 15000); // 15 second timeout for faster feedback

        // Always use resumable upload for better reliability
        const uploadTask = uploadBytesResumable(imageRef, fileToUpload);
        
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress.toFixed(1)}%`);
            if (onProgress) onProgress(progress);
          },
          (error) => {
            clearTimeout(timeout);
            console.error('Upload error:', error);
            
            // More specific error messages
            let errorMessage = 'Upload failed';
            if (error.code === 'storage/unauthorized') {
              errorMessage = 'Permission denied. Check Firebase storage rules.';
            } else if (error.code === 'storage/canceled') {
              errorMessage = 'Upload was cancelled';
            } else if (error.code === 'storage/unknown') {
              errorMessage = 'Network error. Please check your connection.';
            }
            
            reject(new Error(errorMessage));
          },
          async () => {
            try {
              clearTimeout(timeout);
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Upload completed successfully');
              resolve({
                url: downloadURL,
                path: imagePath,
                name: fileName
              });
            } catch (error) {
              clearTimeout(timeout);
              reject(new Error('Failed to get download URL'));
            }
          }
        );
      });

      return await uploadPromise;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, productId, onProgress = null) {
    try {
      const uploadPromises = files.map((file, index) => {
        const progressCallback = onProgress 
          ? (progress) => onProgress(index, progress)
          : null;
        
        return this.uploadImage(file, productId, progressCallback);
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload one or more images');
    }
  }

  // Delete image from storage
  async deleteImage(imagePath) {
    try {
      if (!imagePath) {
        throw new Error('No image path provided');
      }

      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for delete operations as the image might already be deleted
      return false;
    }
  }

  // Delete multiple images
  async deleteMultipleImages(imagePaths) {
    try {
      const deletePromises = imagePaths.map(path => this.deleteImage(path));
      const results = await Promise.allSettled(deletePromises);
      
      return results.map(result => result.status === 'fulfilled' && result.value);
    } catch (error) {
      console.error('Error deleting multiple images:', error);
      return [];
    }
  }

  // Resize image on client side (basic implementation)
  async resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            }));
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Get image URL from path
  async getImageURL(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw new Error('Failed to load image');
    }
  }

  // Extract path from Firebase Storage URL
  extractPathFromURL(url) {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
      return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return null;
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();
export default imageService;