import { api } from './api';

// Recommendation service for handling skill development API calls
export const recommendationService = {
    /**
     * Analyze skill gaps for an employee
     * @param {string} employeeId - The ID of the employee
     * @param {string} analysisType - The type of analysis (role, career, project)
     * @param {Object} data - Additional data for the analysis
     * @returns {Promise<Object>} - The API response
     */
    analyzeSkillGap: async (employeeId, analysisType, data = {}) => {
        try {
            const response = await api.post(`/recommendations/employees/${employeeId}/skill-gap`, {
                analysis_type: analysisType,
                ...data
            });
            return response.data;
        } catch (error) {
            console.error('Error analyzing skill gap:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to analyze skill gap'
            };
        }
    },

    /**
     * Get training recommendations for an employee
     * @param {string} employeeId - The ID of the employee
     * @param {string} recommendationType - The type of recommendations to get
     * @param {Object} data - Additional data for recommendations
     * @returns {Promise<Object>} - The API response
     */
    getRecommendations: async (employeeId, recommendationType, data = {}) => {
        try {
            const response = await api.post(`/recommendations/employees/${employeeId}/recommend-training`, {
                recommendation_type: recommendationType,
                ...data
            });
            return response.data;
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get recommendations'
            };
        }
    },

    /**
     * Create a development plan for an employee
     * @param {string} employeeId - The ID of the employee
     * @param {Array} skillGaps - List of skill gaps to address
     * @param {Object} recommendedResources - Resources for each skill
     * @param {string} deadline - ISO string of the plan deadline
     * @returns {Promise<Object>} - The API response
     */
    createDevelopmentPlan: async (employeeId, skillGaps, recommendedResources, deadline) => {
        try {
            const response = await api.post(`/recommendations/employees/${employeeId}/development-plan`, {
                skill_gaps: skillGaps,
                recommended_resources: recommendedResources,
                deadline: deadline
            });
            return response.data;
        } catch (error) {
            console.error('Error creating development plan:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create development plan'
            };
        }
    },

    /**
     * Get all development plans for an employee
     * @param {string} employeeId - The ID of the employee
     * @returns {Promise<Object>} - The API response
     */
    getEmployeeDevelopmentPlans: async (employeeId) => {
        try {
            const response = await api.get(`/recommendations/employees/${employeeId}/development-plans`);
            return response.data;
        } catch (error) {
            console.error('Error getting development plans:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get development plans',
                plans: []
            };
        }
    },

    /**
     * Get a specific development plan
     * @param {string} employeeId - The ID of the employee
     * @param {string} planId - The ID of the development plan
     * @returns {Promise<Object>} - The API response
     */
    getDevelopmentPlan: async (employeeId, planId) => {
        try {
            const response = await api.get(`/recommendations/employees/${employeeId}/development-plan/${planId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting development plan:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get development plan'
            };
        }
    },

    /**
     * Track progress for a skill in a development plan
     * @param {string} employeeId - The ID of the employee
     * @param {string} planId - The ID of the development plan
     * @param {string} skillName - The name of the skill to update
     * @param {number} progress - Progress value (0-1)
     * @param {Array} completedResources - List of completed resource names
     * @returns {Promise<Object>} - The API response
     */
    trackProgress: async (employeeId, planId, skillName, progress, completedResources = []) => {
        try {
            const response = await api.post(`/recommendations/employees/${employeeId}/development-plan/${planId}/track-progress`, {
                skill_name: skillName,
                progress: progress,
                completed_resources: completedResources
            });
            return response.data;
        } catch (error) {
            console.error('Error tracking progress:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to track progress'
            };
        }
    },

    /**
     * Get all available job roles in the system
     * @returns {Promise<Object>} - The API response
     */
    getJobRoles: async () => {
        try {
            const response = await api.get('/recommendations/job-roles');
            return response.data;
        } catch (error) {
            console.error('Error getting job roles:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get job roles',
                roles: []
            };
        }
    },

    /**
     * Get details for a specific job role
     * @param {string} roleName - The name of the role
     * @returns {Promise<Object>} - The API response
     */
    getJobRole: async (roleName) => {
        try {
            const response = await api.get(`/recommendations/job-roles/${encodeURIComponent(roleName)}`);
            return response.data;
        } catch (error) {
            console.error('Error getting job role:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get job role'
            };
        }
    }
};