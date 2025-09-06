import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const { user, login, loading, error } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await login();
      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error is handled by AuthContext, but we can add additional handling here
      console.error('Login failed:', err);
      
      // Handle specific cases that might need user action
      if (err.code === 'auth/popup-blocked') {
        // Additional guidance for popup blocked
        alert('Please enable popups for this site and try again. Check your browser settings or popup blocker.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Main Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome to EcoFinds
            </h1>
            <p className="text-gray-600">
              Sign in to discover unique pre-owned treasures
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage 
              message={error} 
              onRetry={() => window.location.reload()}
              className="mb-6"
            />
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 rounded-lg px-6 py-3 flex items-center justify-center space-x-3 hover:border-primary hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            New to EcoFinds? Your account will be created automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;