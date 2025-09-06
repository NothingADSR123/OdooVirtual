import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to read from products collection
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log('Firestore connection successful!');
    console.log('Products found:', snapshot.size);
    
    snapshot.forEach((doc) => {
      console.log('Product:', doc.id, doc.data());
    });
    
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    return false;
  }
};

export const addTestProduct = async () => {
  try {
    const testProduct = {
      title: 'Test Product',
      description: 'This is a test product',
      price: 29.99,
      category: 'electronics',
      condition: 'new',
      location: 'Test City',
      sellerId: 'test-user',
      sellerName: 'Test User',
      images: [],
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'products'), testProduct);
    console.log('Test product added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Failed to add test product:', error);
    throw error;
  }
};