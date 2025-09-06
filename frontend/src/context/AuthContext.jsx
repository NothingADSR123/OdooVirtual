import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, provider } from '../firebase/firebase';
import { userService } from '../services/userService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);

        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);
          
          // Get or create user profile in Firestore
          const profile = await userService.getOrCreateUserProfile(firebaseUser);
          setUserProfile(profile);
        } else {
          // User is signed out
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Sign in with Google
   */
  const login = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, provider);
      // User state will be updated by onAuthStateChanged
      return result.user;
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again');
      } else {
        setError('Failed to sign in. Please try again');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out user
   */
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await signOut(auth);
      // User state will be updated by onAuthStateChanged
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No authenticated user');
      }

      await userService.updateUserProfile(user.uid, updates);
      
      // Refresh user profile
      const updatedProfile = await userService.getUserProfile(user.uid);
      setUserProfile(updatedProfile);
      
      return updatedProfile;
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};