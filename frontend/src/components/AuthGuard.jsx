import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AuthGuard = ({ children, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-center text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Render protected content if authenticated
  return children;
};

export default AuthGuard;