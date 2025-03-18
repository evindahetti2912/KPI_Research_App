/**
 * Utility functions for formatting data for display
 */

/**
 * Format a date to a readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format options: 'short', 'long', 'relative'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return 'N/A';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return 'Invalid date';

    switch (format) {
        case 'short':
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

        case 'long':
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

        case 'relative':
            return formatRelativeTime(dateObj);

        default:
            return dateObj.toLocaleDateString();
    }
};

/**
 * Format a date as a relative time (e.g., "2 days ago")
 * @param {Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;

    // Convert to seconds
    const seconds = Math.floor(diff / 1000);

    // Less than a minute
    if (seconds < 60) {
        return 'just now';
    }

    // Less than an hour
    if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than a day
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Less than a week
    if (seconds < 604800) {
        const days = Math.floor(seconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Less than a month
    if (seconds < 2592000) {
        const weeks = Math.floor(seconds / 604800);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Default to standard date format
    return formatDate(date, 'short');
};

/**
 * Format a number with commas
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (number, decimals = 0) => {
    if (number === null || number === undefined) return 'N/A';

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
};

/**
 * Format a percentage value
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return 'N/A';

    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value / 100);
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';

    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
};

/**
 * Format a duration in days to a readable string
 * @param {number} days - Number of days
 * @returns {string} Formatted duration
 */
export const formatDuration = (days) => {
    if (!days && days !== 0) return 'N/A';

    if (days < 7) {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;

        if (remainingDays === 0) {
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
        }

        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} and ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
    } else if (days < 365) {
        const months = Math.floor(days / 30);

        return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
        const years = Math.floor(days / 365);

        return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
};

/**
 * Get an appropriate color for a status
 * @param {string} status - Status text
 * @returns {object} Tailwind CSS classes for background and text colors
 */
export const getStatusColor = (status) => {
    if (!status) return { bg: 'bg-gray-100', text: 'text-gray-800' };

    switch (status.toLowerCase()) {
        case 'planning':
            return { bg: 'bg-blue-100', text: 'text-blue-800' };

        case 'in progress':
            return { bg: 'bg-green-100', text: 'text-green-800' };

        case 'completed':
            return { bg: 'bg-purple-100', text: 'text-purple-800' };

        case 'on track':
            return { bg: 'bg-green-100', text: 'text-green-800' };

        case 'at risk':
            return { bg: 'bg-yellow-100', text: 'text-yellow-800' };

        case 'behind':
        case 'below target':
            return { bg: 'bg-red-100', text: 'text-red-800' };

        default:
            return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};

/**
 * Get experience level color
 * @param {string} level - Experience level
 * @returns {object} Tailwind CSS classes for background and text colors
 */
export const getExperienceLevelColor = (level) => {
    if (!level) return { bg: 'bg-gray-100', text: 'text-gray-800' };

    switch (level.toLowerCase()) {
        case 'junior':
            return { bg: 'bg-green-100', text: 'text-green-800' };

        case 'mid-level':
            return { bg: 'bg-blue-100', text: 'text-blue-800' };

        case 'senior':
            return { bg: 'bg-purple-100', text: 'text-purple-800' };

        case 'lead':
            return { bg: 'bg-indigo-100', text: 'text-indigo-800' };

        default:
            return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};