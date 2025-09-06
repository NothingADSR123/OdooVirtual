import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search for pre-owned treasures...", 
  showSuggestions = true,
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('ecofinds_search_history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Update query from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && searchParam !== query) {
      setQuery(searchParam);
    }
  }, [location.search]);

  // Debounced search function
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        handleSearch(query);
      }, 300);
    } else {
      // Clear search when query is empty
      handleSearch('');
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Handle search execution
  const handleSearch = async (searchQuery) => {
    setIsLoading(true);
    
    try {
      // Update URL with search parameter
      const urlParams = new URLSearchParams(location.search);
      if (searchQuery.trim()) {
        urlParams.set('search', searchQuery.trim());
      } else {
        urlParams.delete('search');
      }
      
      const newUrl = `${location.pathname}?${urlParams.toString()}`;
      navigate(newUrl, { replace: true });

      // Call the search callback
      if (onSearch) {
        await onSearch(searchQuery.trim());
      }

      // Add to search history if it's a meaningful search
      if (searchQuery.trim() && searchQuery.length > 2) {
        addToSearchHistory(searchQuery.trim());
      }

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setShowSuggestionsList(false);
    }
  };

  // Add search term to history
  const addToSearchHistory = (searchTerm) => {
    const newHistory = [
      searchTerm,
      ...searchHistory.filter(item => item !== searchTerm)
    ].slice(0, 10); // Keep only last 10 searches

    setSearchHistory(newHistory);
    localStorage.setItem('ecofinds_search_history', JSON.stringify(newHistory));
  };

  // Generate search suggestions
  const generateSuggestions = (inputValue) => {
    if (!inputValue.trim() || inputValue.length < 2) {
      return searchHistory.slice(0, 5);
    }

    const commonSearches = [
      'iPhone', 'MacBook', 'furniture', 'books', 'clothes', 'shoes',
      'electronics', 'vintage', 'antique', 'collectibles', 'toys',
      'sports equipment', 'musical instruments', 'art', 'jewelry'
    ];

    const filtered = commonSearches.filter(item =>
      item.toLowerCase().includes(inputValue.toLowerCase())
    );

    const historyMatches = searchHistory.filter(item =>
      item.toLowerCase().includes(inputValue.toLowerCase())
    );

    return [...new Set([...historyMatches, ...filtered])].slice(0, 8);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (showSuggestions) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestionsList(value.length > 0 && newSuggestions.length > 0);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle input focus
  const handleFocus = () => {
    if (showSuggestions && query.length > 0) {
      const newSuggestions = generateSuggestions(query);
      setSuggestions(newSuggestions);
      setShowSuggestionsList(newSuggestions.length > 0);
    } else if (searchHistory.length > 0) {
      setSuggestions(searchHistory.slice(0, 5));
      setShowSuggestionsList(true);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('ecofinds_search_history');
    setShowSuggestionsList(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white"
          />
          
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="w-5 h-5">
                <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                handleSearch('');
                setShowSuggestionsList(false);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* Search History Header */}
          {query.length === 0 && searchHistory.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Recent Searches</span>
              <button
                onClick={clearSearchHistory}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Suggestions List */}
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {query.length === 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  )}
                </svg>
                <span className="text-gray-700">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;