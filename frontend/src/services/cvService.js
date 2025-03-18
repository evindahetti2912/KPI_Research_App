import { api } from './api';

// CV service for handling CV-related API calls
export const cvService = {
    /**
     * Upload a CV file
     * @param {FormData} formData - The form data with the CV file
     * @returns {Promise<Object>} - The API response
     */
    uploadCV: async (formData) => {
        try {
            const response = await api.post('/cv/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading CV:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to upload CV'
            };
        }
    },

    /**
     * Get a parsed CV by ID
     * @param {string} cvId - The ID of the CV
     * @returns {Promise<Object>} - The API response
     */
    getParsedCV: async (cvId) => {
        try {
            const response = await api.get(`/cv/parse/${cvId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting parsed CV:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to retrieve CV data'
            };
        }
    },

    /**
     * Get all parsed CVs
     * @returns {Promise<Object>} - The API response
     */
    getAllCVs: async () => {
        try {
            const response = await api.get('/cv/list');
            return response.data;
        } catch (error) {
            console.error('Error listing CVs:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to list CVs',
                data: []
            };
        }
    },

    /**
     * Validate CV data
     * @param {Object} cvData - The CV data to validate
     * @returns {Promise<Object>} - The API response
     */
    validateCV: async (cvData) => {
        try {
            const response = await api.post('/cv/validate', cvData);
            return response.data;
        } catch (error) {
            console.error('Error validating CV:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to validate CV'
            };
        }
    },

    /**
     * Extract skills from CV data
     * @param {Object} cvData - The CV data to extract skills from
     * @returns {Object} - The extracted skills categorized
     */
    extractSkills: (cvData) => {
        if (!cvData || !cvData.Skills) {
            return {
                all: [],
                programming: [],
                frameworks: [],
                databases: [],
                other: []
            };
        }

        // If there are derived skill categories, use them
        if (cvData._derived && cvData._derived.skill_categories) {
            return {
                all: cvData.Skills,
                ...cvData._derived.skill_categories
            };
        }

        // Otherwise, categorize skills manually
        const skills = cvData.Skills;
        const programming = [];
        const frameworks = [];
        const databases = [];
        const other = [];

        // Keywords for categorization
        const programmingKeywords = ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'go', 'swift', 'kotlin'];
        const frameworkKeywords = ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'laravel', 'express', 'next.js'];
        const databaseKeywords = ['sql', 'mongodb', 'postgresql', 'mysql', 'oracle', 'nosql', 'redis', 'sqlite', 'firebase'];

        // Categorize each skill
        skills.forEach(skill => {
            const skillLower = skill.toLowerCase();

            if (programmingKeywords.some(keyword => skillLower.includes(keyword))) {
                programming.push(skill);
            } else if (frameworkKeywords.some(keyword => skillLower.includes(keyword))) {
                frameworks.push(skill);
            } else if (databaseKeywords.some(keyword => skillLower.includes(keyword))) {
                databases.push(skill);
            } else {
                other.push(skill);
            }
        });

        return {
            all: skills,
            programming,
            frameworks,
            databases,
            other
        };
    }
};