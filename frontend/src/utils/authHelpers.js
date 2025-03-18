/**
 * Authentication helper functions for managing user authentication,
 * token handling, and authorization checks throughout the application.
 */

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const EXPIRY_KEY = 'auth_expiry';

/**
 * Store authentication data in local storage
 * 
 * @param {string} token - JWT auth token
 * @param {object} user - User data
 * @param {number} expiresIn - Token expiration time in seconds
 */
export const setAuth = (token, user, expiresIn = 86400) => {
    const expiryTime = new Date().getTime() + expiresIn * 1000;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
};

/**
 * Remove authentication data from local storage
 */
export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRY_KEY);
};

/**
 * Get the stored auth token
 * 
 * @returns {string|null} The auth token or null if not found
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get the authenticated user data
 * 
 * @returns {object|null} The user data or null if not found
 */
export const getUser = () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

/**
 * Check if user is authenticated
 * 
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
    const token = getToken();
    const expiryTime = localStorage.getItem(EXPIRY_KEY);

    if (!token || !expiryTime) {
        return false;
    }

    // Check if token is expired
    const now = new Date().getTime();
    if (now > parseInt(expiryTime)) {
        clearAuth(); // Clear expired auth data
        return false;
    }

    return true;
};

/**
 * Update user data in storage
 * 
 * @param {object} userData - Updated user data
 */
export const updateUserData = (userData) => {
    const currentUser = getUser();

    if (currentUser) {
        localStorage.setItem(USER_KEY, JSON.stringify({
            ...currentUser,
            ...userData
        }));
    }
};

/**
 * Check if user has a specific role
 * 
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role, false otherwise
 */
export const hasRole = (role) => {
    const user = getUser();

    if (!user || !user.roles) {
        return false;
    }

    return user.roles.includes(role);
};

/**
 * Check if user has permission for a specific action
 * 
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has the permission, false otherwise
 */
export const hasPermission = (permission) => {
    const user = getUser();

    if (!user || !user.permissions) {
        return false;
    }

    return user.permissions.includes(permission);
};

/**
 * Refresh the auth token
 * 
 * @param {function} refreshCallback - Function to call to refresh the token
 * @returns {Promise<boolean>} True if refresh succeeded, false otherwise
 */
export const refreshToken = async (refreshCallback) => {
    try {
        const result = await refreshCallback();

        if (result.token) {
            setAuth(result.token, result.user, result.expiresIn);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error refreshing token:', error);
        clearAuth();
        return false;
    }
};

/**
 * Parse JWT token and extract payload
 * 
 * @param {string} token - JWT token to parse
 * @returns {object|null} Token payload or null if invalid
 */
export const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
    }
};

/**
 * Setup automatic token refresh
 * 
 * @param {function} refreshCallback - Function to call to refresh the token
 * @param {number} bufferTime - Time in ms before expiry to refresh (default: 5 minutes)
 * @returns {number} Interval ID for cleanup
 */
export const setupTokenRefresh = (refreshCallback, bufferTime = 300000) => {
    // Check token expiry every minute
    const intervalId = setInterval(async () => {
        if (!isAuthenticated()) {
            return;
        }

        const expiryTime = parseInt(localStorage.getItem(EXPIRY_KEY));
        const now = new Date().getTime();

        // If token will expire within buffer time, refresh it
        if (expiryTime - now < bufferTime) {
            await refreshToken(refreshCallback);
        }
    }, 60000);

    return intervalId;
};

/**
 * Cleanup token refresh interval
 * 
 * @param {number} intervalId - Interval ID to clear
 */
export const cleanupTokenRefresh = (intervalId) => {
    if (intervalId) {
        clearInterval(intervalId);
    }
};

/**
 * Initialize authentication from stored data
 * 
 * @returns {object} Auth state with isAuthenticated and user
 */
export const initializeAuth = () => {
    const isAuth = isAuthenticated();
    const user = isAuth ? getUser() : null;

    return {
        isAuthenticated: isAuth,
        user
    };
};