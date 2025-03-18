/**
 * Utility functions for validating data
 */

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
    if (!email) return false;

    // Regular expression for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email);
};

/**
 * Validate a password
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result with isValid flag and message
 */
export const validatePassword = (password, options = {}) => {
    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = false
    } = options;

    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }

    if (password.length < minLength) {
        return {
            isValid: false,
            message: `Password must be at least ${minLength} characters long`
        };
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one uppercase letter'
        };
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one lowercase letter'
        };
    }

    if (requireNumbers && !/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one number'
        };
    }

    if (requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one special character'
        };
    }

    return { isValid: true, message: 'Password is valid' };
};

/**
 * Check if a value is a valid number
 * @param {any} value - Value to check
 * @returns {boolean} Whether the value is a valid number
 */
export const isValidNumber = (value) => {
    if (value === null || value === undefined || value === '') return false;

    if (typeof value === 'number') return !isNaN(value);

    if (typeof value === 'string') {
        // Convert to number and check
        const number = Number(value);
        return !isNaN(number);
    }

    return false;
};

/**
 * Validate project form data
 * @param {object} data - Project form data
 * @returns {object} Validation result with isValid flag and errors
 */
export const validateProjectForm = (data) => {
    const errors = {};

    // Validate name
    if (!data.name || data.name.trim() === '') {
        errors.name = 'Project name is required';
    }

    // Validate project type
    if (!data.project_type || data.project_type.trim() === '') {
        errors.project_type = 'Project type is required';
    }

    // Validate team size
    if (!isValidNumber(data.project_team_size)) {
        errors.project_team_size = 'Team size must be a valid number';
    } else if (Number(data.project_team_size) <= 0) {
        errors.project_team_size = 'Team size must be greater than 0';
    }

    // Validate timeline
    if (!isValidNumber(data.project_timeline)) {
        errors.project_timeline = 'Timeline must be a valid number';
    } else if (Number(data.project_timeline) <= 0) {
        errors.project_timeline = 'Timeline must be greater than 0';
    }

    // Validate sprints
    if (!isValidNumber(data.project_sprints)) {
        errors.project_sprints = 'Number of sprints must be a valid number';
    } else if (Number(data.project_sprints) <= 0) {
        errors.project_sprints = 'Number of sprints must be greater than 0';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate KPI form data
 * @param {object} data - KPI form data
 * @returns {object} Validation result with isValid flag and errors
 */
export const validateKPIForm = (data) => {
    const errors = {};

    // Validate actual velocity
    if (!isValidNumber(data.actual_velocity)) {
        errors.actual_velocity = 'Velocity must be a valid number';
    }

    // Validate actual cycle time
    if (!isValidNumber(data.actual_cycle_time)) {
        errors.actual_cycle_time = 'Cycle time must be a valid number';
    }

    // Validate defect rate if provided
    if (data.defect_rate !== '' && !isValidNumber(data.defect_rate)) {
        errors.defect_rate = 'Defect rate must be a valid number';
    }

    // Validate test coverage if provided
    if (data.test_coverage !== '') {
        if (!isValidNumber(data.test_coverage)) {
            errors.test_coverage = 'Test coverage must be a valid number';
        } else if (Number(data.test_coverage) < 0 || Number(data.test_coverage) > 100) {
            errors.test_coverage = 'Test coverage must be between 0 and 100';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate a date string is in ISO format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} Whether the date string is valid
 */
export const isValidISODate = (dateString) => {
    if (!dateString) return false;

    // Regular expression for ISO date validation
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;

    if (!isoDateRegex.test(dateString)) return false;

    // Check if it creates a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

/**
 * Validate file type against allowed extensions
 * @param {string} filename - File name to check
 * @param {Array} allowedExtensions - List of allowed extensions
 * @returns {boolean} Whether the file type is allowed
 */
export const isAllowedFileType = (filename, allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png']) => {
    if (!filename) return false;

    const extension = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
};

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSizeMB - Maximum allowed size in MB
 * @returns {boolean} Whether the file size is within limits
 */
export const isValidFileSize = (fileSize, maxSizeMB = 5) => {
    if (!fileSize && fileSize !== 0) return false;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileSize <= maxSizeBytes;
};