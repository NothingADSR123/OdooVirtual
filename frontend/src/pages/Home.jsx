import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ConditionFilter from '../components/ConditionFilter';
import ErrorMessage from '../components/ErrorMessage';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import DevPanel from '../components/DevPanel';

const Home = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // State for products and filters
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [cartItems, setCartItems] = useState([]);

    // Load URL parameters on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchParam = urlParams.get('search');
        const categoryParam = urlParams.get('category');
        const conditionParam = urlParams.get('condition');
        
        if (searchParam) setSearchQuery(searchParam);
        if (categoryParam) setSelectedCategory(categoryParam);
        if (conditionParam) setSelectedCondition(conditionParam);
    }, [location.search]);

    // Load products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError('');
                
                console.log('🔍 Starting to load products...');
                
                // Simple product loading without seeding first
                const availableProducts = await productService.getAvailableProducts();
                
                console.log(`📊 Loaded ${availableProducts.length} products`);
                setProducts(availableProducts);
                setFilteredProducts(availableProducts);
                
                // If no products, show a message but don't error
                if (availableProducts.length === 0) {
                    console.log('📦 No products found. Use DevPanel to seed database.');
                }
                
            } catch (err) {
                console.error('❌ Error loading products:', err);
                console.error('Error details:', err.code, err.message);
                
                setError(`Failed to load products: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Load cart items
    useEffect(() => {
        const loadCartItems = async () => {
            if (!user) return;
            try {
                const cart = await cartService.getCart(user.uid);
                setCartItems(cart.items);
            } catch (error) {
                console.error('Error loading cart items:', error);
            }
        };
        loadCartItems();
    }, [user]);

    // Filter products based on search, category, and condition
    useEffect(() => {
        let filtered = products;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.tags && product.tags.some(tag => 
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                ))
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Apply condition filter
        if (selectedCondition) {
            filtered = filtered.filter(product => product.condition === selectedCondition);
        }

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [products, searchQuery, selectedCategory, selectedCondition]);

    // Pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);



    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Update URL when filters change
    const updateURL = (search, category, condition) => {
        const urlParams = new URLSearchParams();
        if (search) urlParams.set('search', search);
        if (category) urlParams.set('category', category);
        if (condition) urlParams.set('condition', condition);
        
        const newUrl = `${location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        navigate(newUrl, { replace: true });
    };

    // Handle search change
    const handleSearchChange = (newSearchQuery) => {
        setSearchQuery(newSearchQuery);
        updateURL(newSearchQuery, selectedCategory, selectedCondition);
    };

    // Handle category change
    const handleCategoryChange = (newCategory) => {
        setSelectedCategory(newCategory);
        updateURL(searchQuery, newCategory, selectedCondition);
    };

    // Handle condition change
    const handleConditionChange = (newCondition) => {
        setSelectedCondition(newCondition);
        updateURL(searchQuery, selectedCategory, newCondition);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedCondition('');
        navigate(location.pathname, { replace: true });
    };

    const handleAddToCart = async (product) => {
        if (!user) {
            showError('Please login to add items to cart');
            navigate('/login');
            return;
        }

        try {
            await cartService.addToCart(user.uid, product.id);

            // Update cart items state
            const cart = await cartService.getCart(user.uid);
            setCartItems(cart.items);
            
            showSuccess(`${product.title} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            showError(error.message || 'Failed to add item to cart');
        }
    };

    return (
        <div className="min-h-screen gradient-main">
            <Navbar />

            {/* Search and Filter Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 max-w-2xl">
                            <SearchBar
                                onSearch={handleSearchChange}
                                placeholder="Search for amazing finds..."
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <CategoryFilter
                                selectedCategory={selectedCategory}
                                onCategoryChange={handleCategoryChange}
                            />
                            <ConditionFilter
                                selectedCondition={selectedCondition}
                                onConditionChange={handleConditionChange}
                            />
                            <Link
                                to="/add-product"
                                className="btn-primary whitespace-nowrap"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Sell Item
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {searchQuery || selectedCategory ? 'Search Results' : 'Discover Amazing Finds'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available
                            {searchQuery && ` for "${searchQuery}"`}
                            {selectedCategory && ` in ${selectedCategory}`}
                        </p>
                    </div>
                    
                    {(searchQuery || selectedCategory) && (
                        <button
                            onClick={clearAllFilters}
                            className="btn-outline"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="mb-8">
                        <ProductGridSkeleton count={8} />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="max-w-2xl mx-auto py-16">
                        <ErrorMessage message={error} />
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery || selectedCategory ? 'No items found' : 'No items available'}
                        </h3>
                        <p className="text-white text-opacity-80 mb-6">
                            {searchQuery || selectedCategory 
                                ? 'Try adjusting your search or filters'
                                : 'Be the first to list an item!'
                            }
                        </p>
                        
                        {/* Search suggestions for no results */}
                        {(searchQuery || selectedCategory) && (
                            <div className="mb-6">
                                <p className="text-white text-opacity-60 mb-3">Try searching for:</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['electronics', 'furniture', 'books', 'clothes', 'vintage'].map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => handleSearchChange(suggestion)}
                                            className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm hover:bg-opacity-30 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <Link to="/add-product" className="btn-primary">
                            {searchQuery || selectedCategory ? 'List This Item Instead' : 'List Your First Item'}
                        </Link>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && currentProducts.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {currentProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => handleProductClick(product.id)}
                                    currentUserId={user?.uid}
                                    onAddToCart={() => handleAddToCart(product)}
                                    isInCart={cartItems.some(item => item.productId === product.id)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="btn-outline text-white border-white hover:bg-white hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                <div className="flex space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                                currentPage === pageNumber
                                                    ? 'bg-white text-primary'
                                                    : 'text-white hover:bg-white hover:bg-opacity-20'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="btn-outline text-white border-white hover:bg-white hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Floating Add Button (Mobile) */}
            <Link
                to="/add-product"
                className="fixed bottom-8 right-8 w-16 h-16 gradient-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300 transform hover:scale-110 lg:hidden z-50 animate-pulse-slow"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </Link>

            {/* Developer Panel */}
            <DevPanel />
        </div>
    );
};

export default Home;