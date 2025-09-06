import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * User service for Firestore operations
 */
export const userService = {
  /**
   * Get user profile from Firestore
   * @param {string} uid - User ID
   * @returns {Promise<Object|null>} User profile data or null if not found
   */
  async getUserProfile(uid) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  },

  /**
   * Create new user profile in Firestore
   * @param {string} uid - User ID
   * @param {Object} userData - User data from Firebase Auth
   * @returns {Promise<Object>} Created user profile
   */
  async createUserProfile(uid, userData) {
    try {
      const userProfile = {
        uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, userProfile);
      
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  },

  /**
   * Update user profile in Firestore
   * @param {string} uid - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<void>}
   */
  async updateUserProfile(uid, updates) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, updateData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  },

  /**
   * Get or create user profile
   * @param {Object} firebaseUser - Firebase Auth user object
   * @returns {Promise<Object>} User profile data
   */
  async getOrCreateUserProfile(firebaseUser) {
    try {
      let userProfile = await this.getUserProfile(firebaseUser.uid);
      
      if (!userProfile) {
        userProfile = await this.createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      }
      
      return userProfile;
    } catch (error) {
      console.error('Error getting or creating user profile:', error);
      throw error;
    }
  }
};