import { productService } from '../services/productService';
import { DUMMY_PRODUCTS } from './dummyData';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of DUMMY_PRODUCTS) {
      try {
        // Check if product already exists
        const existingProduct = await productService.getProductById(product.id);
        if (existingProduct) {
          console.log(`⏭️  Product "${product.title}" already exists, skipping...`);
          skippedCount++;
          continue;
        }
      } catch (error) {
        // Product doesn't exist, we can add it
      }
      
      try {
        // Create the product with the predefined ID
        await productService.createProduct(product, product.id);
        console.log(`✅ Added: "${product.title}"`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Failed to add "${product.title}":`, error);
      }
    }
    
    console.log(`🎉 Database seeding completed!`);
    console.log(`📊 Summary: ${addedCount} added, ${skippedCount} skipped`);
    
    return { addedCount, skippedCount };
  } catch (error) {
    console.error('💥 Error seeding database:', error);
    throw error;
  }
};

// Function to clear all dummy data (for development)
export const clearDummyData = async () => {
  try {
    console.log('🧹 Clearing dummy data...');
    
    let deletedCount = 0;
    
    for (const product of DUMMY_PRODUCTS) {
      try {
        await productService.deleteProduct(product.id);
        console.log(`🗑️  Deleted: "${product.title}"`);
        deletedCount++;
      } catch (error) {
        console.log(`⏭️  Product "${product.title}" not found, skipping...`);
      }
    }
    
    console.log(`🎉 Dummy data cleared! ${deletedCount} products deleted.`);
    return { deletedCount };
  } catch (error) {
    console.error('💥 Error clearing dummy data:', error);
    throw error;
  }
};

// Development helper to reset and reseed
export const resetDatabase = async () => {
  console.log('🔄 Resetting database...');
  await clearDummyData();
  await seedDatabase();
  console.log('✨ Database reset complete!');
};