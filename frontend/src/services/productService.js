import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  setDoc 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

class ProductService {
  constructor() {
    this.collectionName = 'products';
    this.productsRef = collection(db, this.collectionName);
  }

  // Create a new product
  async createProduct(productData, customId = null) {
    try {
      const product = {
        ...productData,
        createdAt: productData.createdAt || serverTimestamp(),
        updatedAt: productData.updatedAt || serverTimestamp(),
        status: productData.status || 'available'
      };

      let docRef;
      if (customId) {
        // Use custom ID for dummy data
        docRef = doc(db, this.collectionName, customId);
        await setDoc(docRef, product);
        return { id: customId, ...product };
      } else {
        // Generate new ID
        docRef = await addDoc(this.productsRef, product);
        return { id: docRef.id, ...product };
      }
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product. Please try again.');
    }
  }

  // Get all products with optional filters - simplified to avoid index requirements
  async getProducts(filters = {}) {
    try {
      console.log('🔍 ProductService: Getting all products and filtering in memory...');
      
      // Get all products without any query constraints to avoid index requirements
      const querySnapshot = await getDocs(this.productsRef);
      console.log('✅ ProductService: Query executed, documents found:', querySnapshot.size);
      
      let products = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data
        });
      });

      // Apply filters in memory
      if (filters.category) {
        products = products.filter(product => product.category === filters.category);
      }
      
      if (filters.sellerId) {
        products = products.filter(product => product.sellerId === filters.sellerId);
      }

      if (filters.status) {
        products = products.filter(product => product.status === filters.status);
      }

      // Sort by createdAt in memory
      products.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA; // Descending order (newest first)
      });

      // Apply limit after sorting
      if (filters.limit) {
        products = products.slice(0, filters.limit);
      }

      console.log('✅ ProductService: Processed products:', products.length);
      return products;
    } catch (error) {
      console.error('❌ ProductService: Error in getProducts:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // More specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore is currently unavailable. Please try again later.');
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }
  }

  // Get a single product by ID
  async getProductById(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to load product details.');
    }
  }

  // Update a product
  async updateProduct(id, updates) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product. Please try again.');
    }
  }

  // Delete a product
  async deleteProduct(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product. Please try again.');
    }
  }

  // Search products by title and description
  async searchProducts(searchQuery) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation - for production, consider using Algolia or similar
      const products = await this.getProducts(); // This now uses the index-free version
      
      if (!searchQuery || searchQuery.trim() === '') {
        return products;
      }

      const query = searchQuery.toLowerCase().trim();
      
      return products.filter(product => {
        const title = product.title?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const tags = product.tags?.join(' ').toLowerCase() || '';
        
        return title.includes(query) || 
               description.includes(query) || 
               tags.includes(query);
      });
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Search failed. Please try again.');
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    return this.getProducts({ category });
  }

  // Get products by seller
  async getProductsBySeller(userId) {
    return this.getProducts({ sellerId: userId });
  }

  // Get available products only
  async getAvailableProducts() {
    try {
      console.log('🔍 ProductService: Getting available products...');
      const products = await this.getProducts({ status: 'available' });
      console.log('✅ ProductService: Successfully loaded products:', products.length);
      return products;
    } catch (error) {
      console.error('❌ ProductService: Error in getAvailableProducts:', error);
      throw error;
    }
  }

  // Mark product as sold
  async markAsSold(id) {
    return this.updateProduct(id, { status: 'sold' });
  }

  // Mark product as available
  async markAsAvailable(id) {
    return this.updateProduct(id, { status: 'available' });
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;