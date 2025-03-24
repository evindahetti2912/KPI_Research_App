import { api } from './api';

// KPI service for handling KPI-related API calls
export const kpiService = {
    /**
     * Generate KPIs based on project details
     * @param {Object} projectDetails - The project details
     * @returns {Promise<Object>} - The API response
     */
    generateKPIs: async (projectDetails) => {
        try {
            const response = await api.post('/kpi/generate', projectDetails);
            return response.data;
        } catch (error) {
            console.error('Error generating KPIs:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to generate KPIs'
            };
        }
    },

    /**
     * Create KPIs for a specific project
     * @param {string} projectId - The ID of the project
     * @param {Object} kpiData - The KPI data to save
     * @returns {Promise<Object>} - The API response
     */
    createProjectKPIs: async (projectId, kpiData) => {
        try {
            const response = await api.post(`/kpi/projects/${projectId}/kpis`, kpiData);
            return response.data;
        } catch (error) {
            console.error('Error creating project KPIs:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create project KPIs'
            };
        }
    },

    /**
     * Get KPIs for a specific project
     * @param {string} projectId - The ID of the project
     * @returns {Promise<Object>} - The API response
     */
    getProjectKPIs: async (projectId) => {
        try {
            const response = await api.get(`/kpi/projects/${projectId}/kpis`);
            return response.data;
        } catch (error) {
            console.error('Error getting project KPIs:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get project KPIs'
            };
        }
    },

    /**
     * Get a specific chart for a project
     * @param {string} projectId - The ID of the project
     * @param {string} chartType - The type of chart (gantt, burndown, etc.)
     * @returns {Promise<Object>} - The API response
     */
    getProjectChart: async (projectId, chartType) => {
        try {
            const response = await api.get(`/kpi/projects/${projectId}/charts/${chartType}`);
            return response.data;
        } catch (error) {
            console.error('Error getting project chart:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get project chart'
            };
        }
    },

    /**
     * Adjust KPIs based on project progress
     * @param {string} projectId - The ID of the project
     * @param {Object} adjustmentData - The adjustment data
     * @returns {Promise<Object>} - The API response
     */
    adjustKPIs: async (projectId, adjustmentData) => {
        try {
            const response = await api.post(`/kpi/projects/${projectId}/kpis/adjust`, adjustmentData);
            return response.data;
        } catch (error) {
            console.error('Error adjusting KPIs:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to adjust KPIs'
            };
        }
    },

    /**
     * Adjust KPIs based on project changes
     * @param {string} projectId - The ID of the project
     * @param {Object} projectChanges - The project changes
     * @returns {Promise<Object>} - The API response
     */
    adjustKPIsForChanges: async (projectId, projectChanges) => {
        try {
            const response = await api.post(`/kpi/projects/${projectId}/kpis/adjust-for-changes`, {
                updated_project: projectChanges
            });
            return response.data;
        } catch (error) {
            console.error('Error adjusting KPIs for changes:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to adjust KPIs for changes'
            };
        }
    },

    /**
     * Export project KPI report
     * @param {string} projectId - The ID of the project
     * @param {string} format - The export format (pdf, excel)
     * @returns {Promise<Object>} - The API response
     */
    exportKPIReport: async (projectId, format = 'pdf') => {
        try {
            const response = await api.get(`/kpi/projects/${projectId}/export?format=${format}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `project_kpi_report.${format}`);
            document.body.appendChild(link);
            link.click();

            return { success: true };
        } catch (error) {
            console.error('Error exporting KPI report:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to export KPI report'
            };
        }
    },

    /**
     * Get KPI metrics history for trend analysis
     * @param {string} projectId - The ID of the project
     * @param {string} metric - Specific metric to get history for
     * @returns {Promise<Object>} - The API response
     */
    getKPIHistory: async (projectId, metric = null) => {
        try {
            let url = `/kpi/projects/${projectId}/history`;
            if (metric) {
                url += `?metric=${metric}`;
            }

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error getting KPI history:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get KPI history'
            };
        }
    }
};