import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import MyListings from './pages/MyListings';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Purchases from './pages/Purchases';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="App min-h-screen bg-main">
              <NetworkStatus />
              <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <Home />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/add-product" 
                element={
                  <AuthGuard>
                    <AddProduct />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/edit-product/:id" 
                element={
                  <AuthGuard>
                    <EditProduct />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/my-listings" 
                element={
                  <AuthGuard>
                    <MyListings />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/product/:id" 
                element={
                  <AuthGuard>
                    <ProductDetails />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <AuthGuard>
                    <Cart />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/purchases" 
                element={
                  <AuthGuard>
                    <Purchases />
                  </AuthGuard>
                } 
              />
              
              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
