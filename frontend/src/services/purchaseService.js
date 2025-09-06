import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  runTransaction 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { cartService } from './cartService';
import { productService } from './productService';

class PurchaseService {
  constructor() {
    this.collectionName = 'purchases';
    this.purchasesRef = collection(db, this.collectionName);
  }

  // Create a purchase from cart items
  async createPurchase(userId, cartItems) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error('No items to purchase');
      }

      // Validate all items are still available
      const validationResults = await Promise.all(
        cartItems.map(async (item) => {
          const product = await productService.getProductById(item.productId);
          return {
            item,
            product,
            isValid: product.status === 'available' && product.sellerId !== userId
          };
        })
      );

      const invalidItems = validationResults.filter(result => !result.isValid);
      if (invalidItems.length > 0) {
        throw new Error('Some items are no longer available for purchase');
      }

      // Create purchases using transaction to ensure consistency
      const purchases = [];
      
      for (const result of validationResults) {
        const { item, product } = result;
        
        const purchase = await runTransaction(db, async (transaction) => {
          // Create purchase record
          const purchaseData = {
            buyerId: userId,
            sellerId: product.sellerId,
            productId: item.productId,
            productSnapshot: {
              title: product.title,
              description: product.description,
              price: product.price,
              images: product.images,
              category: product.category,
              condition: product.condition
            },
            amount: product.price,
            purchaseDate: serverTimestamp(),
            status: 'completed'
          };

          const purchaseRef = await addDoc(this.purchasesRef, purchaseData);
          
          // Mark product as sold
          const productRef = doc(db, 'products', item.productId);
          transaction.update(productRef, { 
            status: 'sold',
            soldAt: serverTimestamp(),
            soldTo: userId
          });

          return {
            id: purchaseRef.id,
            ...purchaseData
          };
        });

        purchases.push(purchase);
      }

      // Clear cart after successful purchase
      await cartService.clearCart(userId);

      return purchases;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  }

  // Get purchase history for a user
  async getPurchaseHistory(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const q = query(
        this.purchasesRef,
        where('buyerId', '==', userId),
        orderBy('purchaseDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const purchases = [];

      querySnapshot.forEach((doc) => {
        purchases.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return purchases;
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw new Error('Failed to load purchase history. Please try again.');
    }
  }

  // Get sales history for a seller
  async getSalesHistory(sellerId) {
    try {
      if (!sellerId) {
        throw new Error('Seller ID is required');
      }

      const q = query(
        this.purchasesRef,
        where('sellerId', '==', sellerId),
        orderBy('purchaseDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const sales = [];

      querySnapshot.forEach((doc) => {
        sales.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return sales;
    } catch (error) {
      console.error('Error fetching sales history:', error);
      throw new Error('Failed to load sales history. Please try again.');
    }
  }

  // Get a single purchase by ID
  async getPurchaseById(id) {
    try {
      if (!id) {
        throw new Error('Purchase ID is required');
      }

      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Purchase not found');
      }
    } catch (error) {
      console.error('Error fetching purchase:', error);
      throw new Error('Failed to load purchase details.');
    }
  }

  // Get purchase statistics for a user
  async getPurchaseStats(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const purchases = await this.getPurchaseHistory(userId);
      
      const stats = {
        totalPurchases: purchases.length,
        totalSpent: purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0),
        averageOrderValue: 0,
        categoriesCount: {},
        monthlySpending: {}
      };

      if (purchases.length > 0) {
        stats.averageOrderValue = stats.totalSpent / stats.totalPurchases;

        // Calculate category distribution
        purchases.forEach(purchase => {
          const category = purchase.productSnapshot?.category || 'Other';
          stats.categoriesCount[category] = (stats.categoriesCount[category] || 0) + 1;
        });

        // Calculate monthly spending
        purchases.forEach(purchase => {
          if (purchase.purchaseDate?.seconds) {
            const date = new Date(purchase.purchaseDate.seconds * 1000);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            stats.monthlySpending[monthKey] = (stats.monthlySpending[monthKey] || 0) + purchase.amount;
          }
        });
      }

      return stats;
    } catch (error) {
      console.error('Error calculating purchase stats:', error);
      throw new Error('Failed to calculate purchase statistics.');
    }
  }

  // Get sales statistics for a seller
  async getSalesStats(sellerId) {
    try {
      if (!sellerId) {
        throw new Error('Seller ID is required');
      }

      const sales = await this.getSalesHistory(sellerId);
      
      const stats = {
        totalSales: sales.length,
        totalEarned: sales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
        averageSaleValue: 0,
        categoriesCount: {},
        monthlySales: {}
      };

      if (sales.length > 0) {
        stats.averageSaleValue = stats.totalEarned / stats.totalSales;

        // Calculate category distribution
        sales.forEach(sale => {
          const category = sale.productSnapshot?.category || 'Other';
          stats.categoriesCount[category] = (stats.categoriesCount[category] || 0) + 1;
        });

        // Calculate monthly sales
        sales.forEach(sale => {
          if (sale.purchaseDate?.seconds) {
            const date = new Date(sale.purchaseDate.seconds * 1000);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            stats.monthlySales[monthKey] = (stats.monthlySales[monthKey] || 0) + sale.amount;
          }
        });
      }

      return stats;
    } catch (error) {
      console.error('Error calculating sales stats:', error);
      throw new Error('Failed to calculate sales statistics.');
    }
  }

  // Check if user has purchased a specific product
  async hasPurchased(userId, productId) {
    try {
      if (!userId || !productId) {
        return false;
      }

      const q = query(
        this.purchasesRef,
        where('buyerId', '==', userId),
        where('productId', '==', productId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking purchase status:', error);
      return false;
    }
  }

  // Get recent purchases (for dashboard/notifications)
  async getRecentPurchases(userId, limit = 5) {
    try {
      if (!userId) {
        return [];
      }

      const q = query(
        this.purchasesRef,
        where('buyerId', '==', userId),
        orderBy('purchaseDate', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const purchases = [];

      querySnapshot.forEach((doc) => {
        purchases.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return purchases;
    } catch (error) {
      console.error('Error fetching recent purchases:', error);
      return [];
    }
  }
}

// Export singleton instance
export const purchaseService = new PurchaseService();
export default purchaseService;