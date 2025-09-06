import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/cartService';

const Navbar = () => {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadCartCount();
    }
  }, [user]);

  const loadCartCount = async () => {
    try {
      const cart = await cartService.getCart(user.uid);
      setCartCount(cart.items.length);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/add-product', label: 'Sell', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { path: '/my-listings', label: 'My Items', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { path: '/purchases', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white border-opacity-20 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              EcoFinds
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center space-x-2 px-4 py-2 font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-white border-b-2 border-white'
                    : 'text-white text-opacity-80 hover:text-white hover:text-opacity-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              className={`relative flex items-center space-x-2 px-4 py-2 font-medium transition-all duration-300 ${
                isActive('/cart')
                  ? 'text-white border-b-2 border-white'
                  : 'text-white text-opacity-80 hover:text-white hover:text-opacity-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-30 transition-all duration-300">
                <span className="text-sm font-bold text-white">
                  {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-white">
                <p className="text-sm font-medium">
                  {userProfile?.displayName || user?.displayName || 'User'}
                </p>
                <p className="text-xs text-white text-opacity-70">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/profile"
                className="btn-glass text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 text-sm"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="btn-glass text-white hover:bg-red-500 hover:bg-opacity-80 px-4 py-2 text-sm transition-colors duration-300"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white border-opacity-20 animate-fadeInUp">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-white border-l-4 border-white bg-white bg-opacity-10'
                      : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-5'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {/* Mobile Cart Link */}
              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/cart')
                    ? 'text-white border-l-4 border-white bg-white bg-opacity-10'
                    : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ml-auto">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <div className="border-t border-white border-opacity-20 pt-4 mt-4">
                <div className="flex items-center space-x-3 px-4 py-2 text-white">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {userProfile?.displayName || user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-white text-opacity-70">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-3">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-xl transition-all duration-300"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-white text-opacity-80 hover:text-white hover:bg-red-500 hover:bg-opacity-20 rounded-xl transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;