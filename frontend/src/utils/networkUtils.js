/**
 * Network utility functions for handling connectivity and retries
 */

/**
 * Check if the user is online
 * @returns {boolean} True if online, false if offline
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Wait for network connectivity
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} Resolves when online or timeout
 */
export const waitForNetwork = (timeout = 10000) => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function or throws last error
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/cancelled-popup-request') {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check if an error is network-related
 * @param {Error} error - Error to check
 * @returns {boolean} True if network-related
 */
export const isNetworkError = (error) => {
  return error.code === 'auth/network-request-failed' ||
         error.message?.includes('network') ||
         error.message?.includes('fetch') ||
         !isOnline();
};