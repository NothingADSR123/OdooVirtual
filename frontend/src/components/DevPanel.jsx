import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { seedDatabase, clearDummyData, resetDatabase } from '../utils/seedDatabase';
import { productService } from '../services/productService';

const DevPanel = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAction = async (action, actionName) => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await action();
      setMessage(`✅ ${actionName} completed successfully! ${JSON.stringify(result)}`);
      showSuccess(`${actionName} completed successfully!`);
    } catch (error) {
      setMessage(`❌ ${actionName} failed: ${error.message}`);
      showError(`${actionName} failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestProduct = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const testProduct = {
        title: 'Test Product - ' + new Date().toLocaleTimeString(),
        description: 'This is a test product created from DevPanel',
        price: 99.99,
        category: 'electronics',
        condition: 'new',
        location: 'Test City',
        sellerId: user?.uid || 'test-user',
        sellerName: user?.displayName || 'Test User',
        images: [],
        status: 'available'
      };
      
      const result = await productService.createProduct(testProduct);
      setMessage(`✅ Test product created: ${result.id}`);
      showSuccess(`Test product created successfully!`);
      // Refresh the page to show new product
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setMessage(`❌ Failed to create test product: ${error.message}`);
      showError(`Failed to create test product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Test basic Firestore connection
      const products = await productService.getProducts();
      setMessage(`✅ Firestore connection successful! Found ${products.length} products.`);
      showSuccess(`Connection test successful! Found ${products.length} products.`);
    } catch (error) {
      setMessage(`❌ Firestore connection failed: ${error.message}`);
      showError(`Connection test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
        title="Developer Panel"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 z-50 bg-white rounded-lg shadow-xl border p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Developer Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTestConnection}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              🔍 Test Connection
            </button>

            <button
              onClick={handleTestProduct}
              disabled={loading}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              🧪 Create Test Product
            </button>

            <button
              onClick={() => handleAction(seedDatabase, 'Seed Database')}
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              🌱 Seed Database
            </button>

            <button
              onClick={() => handleAction(clearDummyData, 'Clear Dummy Data')}
              disabled={loading}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              🗑️ Clear Dummy Data
            </button>

            <button
              onClick={() => handleAction(resetDatabase, 'Reset Database')}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              🔄 Reset Database
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔄 Reload Page
            </button>
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            </div>
          )}

          {message && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
              <pre className="whitespace-pre-wrap text-xs">{message}</pre>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DevPanel;