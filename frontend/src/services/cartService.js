import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { productService } from './productService';

class CartService {
  constructor() {
    this.collectionName = 'carts';
  }

  // Get user's cart
  async getCart(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const cartRef = doc(db, this.collectionName, userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        
        // Get full product details for each cart item
        const cartItems = await Promise.all(
          cartData.items.map(async (item) => {
            try {
              const product = await productService.getProductById(item.productId);
              return {
                ...item,
                product
              };
            } catch (error) {
              // Product might be deleted, skip it
              console.warn(`Product ${item.productId} not found in cart`);
              return null;
            }
          })
        );

        // Filter out null items (deleted products)
        const validItems = cartItems.filter(item => item !== null);

        return {
          userId,
          items: validItems,
          updatedAt: cartData.updatedAt
        };
      } else {
        // Return empty cart
        return {
          userId,
          items: [],
          updatedAt: null
        };
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw new Error('Failed to load cart. Please try again.');
    }
  }

  // Add product to cart
  async addToCart(userId, productId) {
    try {
      if (!userId || !productId) {
        throw new Error('User ID and Product ID are required');
      }

      // Check if product exists and is available
      const product = await productService.getProductById(productId);
      if (product.status !== 'available') {
        throw new Error('This product is no longer available');
      }

      // Don't allow users to add their own products to cart
      if (product.sellerId === userId) {
        throw new Error('You cannot add your own product to cart');
      }

      const cartRef = doc(db, this.collectionName, userId);
      const cartSnap = await getDoc(cartRef);

      const cartItem = {
        productId,
        addedAt: new Date()
      };

      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        
        // Check if product is already in cart
        const existingItem = cartData.items.find(item => item.productId === productId);
        if (existingItem) {
          throw new Error('Product is already in your cart');
        }

        // Add to existing cart
        await updateDoc(cartRef, {
          items: arrayUnion(cartItem),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new cart
        await setDoc(cartRef, {
          items: [cartItem],
          updatedAt: serverTimestamp()
        });
      }

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Remove product from cart
  async removeFromCart(userId, productId) {
    try {
      if (!userId || !productId) {
        throw new Error('User ID and Product ID are required');
      }

      const cartRef = doc(db, this.collectionName, userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        throw new Error('Cart not found');
      }

      const cartData = cartSnap.data();
      const itemToRemove = cartData.items.find(item => item.productId === productId);

      if (!itemToRemove) {
        throw new Error('Product not found in cart');
      }

      // Remove the item
      await updateDoc(cartRef, {
        items: arrayRemove(itemToRemove),
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const cartRef = doc(db, this.collectionName, userId);
      await deleteDoc(cartRef);
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart. Please try again.');
    }
  }

  // Get cart item count
  async getCartCount(userId) {
    try {
      if (!userId) {
        return 0;
      }

      const cart = await this.getCart(userId);
      return cart.items.length;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }

  // Check if product is in cart
  async isInCart(userId, productId) {
    try {
      if (!userId || !productId) {
        return false;
      }

      const cart = await this.getCart(userId);
      return cart.items.some(item => item.productId === productId);
    } catch (error) {
      console.error('Error checking cart status:', error);
      return false;
    }
  }

  // Get cart total (sum of all product prices)
  async getCartTotal(userId) {
    try {
      const cart = await this.getCart(userId);
      
      return cart.items.reduce((total, item) => {
        return total + (item.product?.price || 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  }

  // Validate cart items (check if products are still available)
  async validateCart(userId) {
    try {
      const cart = await this.getCart(userId);
      const unavailableItems = [];

      for (const item of cart.items) {
        if (!item.product || item.product.status !== 'available') {
          unavailableItems.push(item);
        }
      }

      // Remove unavailable items
      if (unavailableItems.length > 0) {
        const cartRef = doc(db, this.collectionName, userId);
        const validItems = cart.items.filter(item => 
          item.product && item.product.status === 'available'
        );

        await updateDoc(cartRef, {
          items: validItems.map(item => ({
            productId: item.productId,
            addedAt: item.addedAt
          })),
          updatedAt: serverTimestamp()
        });
      }

      return {
        validItems: cart.items.filter(item => 
          item.product && item.product.status === 'available'
        ),
        removedItems: unavailableItems
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      throw new Error('Failed to validate cart items');
    }
  }
}

// Export singleton instance
export const cartService = new CartService();
export default cartService;