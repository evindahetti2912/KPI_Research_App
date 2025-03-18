/**
 * Utility functions for chart generation and formatting
 */

/**
 * Create data for a Gantt chart from task data
 * @param {Array} tasks - Array of task objects with Task, Start, and End properties
 * @returns {object} Formatted data for Gantt chart visualization
 */
export const createGanttChartData = (tasks) => {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return { data: [], config: { width: 600, height: 300 } };
    }

    // Sort tasks by start date
    const sortedTasks = [...tasks].sort((a, b) => {
        const aStartDay = parseInt(a.Start.split(' ')[1]);
        const bStartDay = parseInt(b.Start.split(' ')[1]);
        return aStartDay - bStartDay;
    });

    // Find the maximum end day to determine chart width
    const maxEndDay = Math.max(...sortedTasks.map(task => parseInt(task.End.split(' ')[1])));

    // Calculate chart dimensions
    const taskHeight = 30;
    const chartHeight = sortedTasks.length * taskHeight * 2;
    const dayWidth = 30;
    const chartWidth = maxEndDay * dayWidth + 200;

    // Generate task bars data
    const data = sortedTasks.map((task, index) => {
        const startDay = parseInt(task.Start.split(' ')[1]);
        const endDay = parseInt(task.End.split(' ')[1]);
        const duration = endDay - startDay;

        return {
            task: task.Task,
            index,
            startDay,
            endDay,
            duration,
            startPosition: startDay * dayWidth,
            width: duration * dayWidth,
            y: index * taskHeight * 2
        };
    });

    // Generate day markers
    const days = Array.from({ length: maxEndDay + 1 }, (_, i) => ({
        day: i,
        position: i * dayWidth
    }));

    return {
        data,
        days,
        config: {
            width: chartWidth,
            height: chartHeight,
            dayWidth,
            taskHeight
        }
    };
};

/**
 * Create data for a burndown chart
 * @param {number} projectTimeline - Project duration in days
 * @param {number} sprints - Number of sprints
 * @returns {object} Formatted data for burndown chart visualization
 */
export const createBurndownChartData = (projectTimeline, sprints) => {
    if (!projectTimeline || !sprints) {
        return {
            ideal: [],
            actual: [],
            config: { width: 600, height: 300 }
        };
    }

    const sprintLength = Math.floor(projectTimeline / sprints);

    // Generate ideal burndown data
    const ideal = Array.from({ length: sprints + 1 }, (_, index) => {
        const day = index * sprintLength;
        const remaining = Math.max(0, projectTimeline - day);

        return { sprint: index, day, remaining };
    });

    // Generate simulated actual burndown with some variance
    const actual = ideal.map((point) => {
        // Add realistic variance: actual progress often lags behind ideal initially
        // but may catch up or even sprint ahead at the end
        let variance;
        const progressPercentage = point.day / projectTimeline;

        if (progressPercentage < 0.3) {
            // Early phase: tend to be behind
            variance = Math.random() * 10 + 5;
        } else if (progressPercentage < 0.7) {
            // Middle phase: getting closer to ideal
            variance = Math.random() * 10 - 2;
        } else {
            // Final phase: catching up, may go slightly under ideal
            variance = Math.random() * 10 - 5;
        }

        // Ensure remaining work doesn't go below 0 or above original work
        const actualRemaining = Math.max(0, Math.min(projectTimeline, point.remaining + variance));

        return {
            ...point,
            actualRemaining
        };
    });

    return {
        ideal,
        actual,
        config: {
            width: 600,
            height: 300,
            sprintLength,
            totalSprints: sprints
        }
    };
};

/**
 * Create data for radar chart to visualize KPI performance
 * @param {object} kpis - KPI data object with categories and metrics
 * @returns {object} Formatted data for radar chart visualization
 */
export const createKPIRadarChartData = (kpis) => {
    if (!kpis) return { axes: [], values: [] };

    const categories = Object.keys(kpis);

    // Convert categorical ratings to scores
    const getStatusScore = (status) => {
        switch (status) {
            case 'On Track': return 1.0;
            case 'At Risk': return 0.6;
            case 'Below Target': return 0.3;
            default: return 0.5;
        }
    };

    // Calculate average scores for each category
    const categoryScores = categories.map(category => {
        const metrics = Object.entries(kpis[category] || {});
        if (metrics.length === 0) return { category, score: 0 };

        const totalScore = metrics.reduce((sum, [_, data]) => {
            return sum + getStatusScore(data.status);
        }, 0);

        return {
            category,
            score: totalScore / metrics.length
        };
    });

    // Add first point again to close the polygon
    const axes = [...categoryScores.map(item => item.category), categoryScores[0].category];
    const values = [...categoryScores.map(item => item.score), categoryScores[0].score];

    return {
        axes,
        values,
        config: {
            width: 500,
            height: 500,
            padding: 70,
            axisLabels: categoryScores.map(item => ({
                category: item.category.charAt(0).toUpperCase() + item.category.slice(1).replace(/_/g, ' '),
                score: Math.round(item.score * 100)
            }))
        }
    };
};

/**
 * Create data for velocity chart
 * @param {number} sprints - Number of sprints
 * @param {number} teamSize - Team size 
 * @returns {object} Formatted data for velocity chart visualization
 */
export const createVelocityChartData = (sprints, teamSize) => {
    if (!sprints || !teamSize) {
        return { data: [], config: { width: 600, height: 300 } };
    }

    // Calculate baseline velocity based on team size (10 points per developer per sprint)
    const baseVelocity = teamSize * 10;

    // Generate sprint data with realistic variations
    const data = Array.from({ length: sprints }, (_, index) => {
        // Gradually increase velocity for a realistic team ramp-up
        let trendFactor = 1;
        if (index < sprints / 3) {
            // Early sprints - team is ramping up
            trendFactor = 0.7 + (index / (sprints / 3)) * 0.3;
        } else if (index > (2 * sprints) / 3) {
            // Late sprints - team is in peak performance
            trendFactor = 1.05;
        }

        // Add some random variation around the trend
        const randomVariation = Math.random() * 0.2 - 0.1; // -10% to +10%

        // Calculate final velocity with trend and randomness
        const velocity = Math.round(baseVelocity * trendFactor * (1 + randomVariation));

        return {
            sprint: index + 1,
            velocity,
            expected: baseVelocity
        };
    });

    return {
        data,
        config: {
            width: 600,
            height: 300,
            barColor: '#60A5FA',
            lineColor: '#EF4444',
            baseVelocity
        }
    };
};

/**
 * Generate color scale for heatmaps
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} steps - Number of color steps
 * @returns {Function} Function that returns color for a given value
 */
export const createColorScale = (min, max, steps = 5) => {
    // Default blue color scale from light to dark
    const colors = [
        '#EFF6FF', // blue-50
        '#DBEAFE', // blue-100
        '#93C5FD', // blue-200
        '#60A5FA', // blue-300
        '#3B82F6', // blue-400
        '#2563EB', // blue-500
        '#1D4ED8', // blue-600
        '#1E40AF', // blue-700
        '#1E3A8A'  // blue-800
    ];

    // Use just enough colors based on steps
    const selectedColors = colors.slice(0, steps);

    return (value) => {
        if (value === undefined || value === null) return selectedColors[0];

        // Normalize value to 0-1 range
        const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));

        // Map to color index
        const index = Math.min(Math.floor(normalizedValue * selectedColors.length), selectedColors.length - 1);

        return selectedColors[index];
    };
};

/**
 * Create a cohort-based skill matrix chart data
 * @param {Array} employees - Array of employee data
 * @param {Array} skills - Array of skills to include
 * @returns {object} Formatted data for skill matrix visualization
 */
export const createSkillMatrixData = (employees, skills) => {
    if (!employees || !Array.isArray(employees) || !skills || !Array.isArray(skills)) {
        return { matrix: [], skills: [], employees: [] };
    }

    // Check which employees have which skills
    const matrix = employees.map(employee => {
        const employeeSkills = employee.Skills || [];

        return {
            id: employee._id,
            name: employee.Name || 'Unknown',
            // For each skill, check if employee has it
            skills: skills.map(skill => {
                const hasSkill = employeeSkills.some(empSkill =>
                    empSkill.toLowerCase().includes(skill.toLowerCase())
                );

                return hasSkill ? 1 : 0;
            })
        };
    });

    return {
        matrix,
        skills,
        employees: employees.map(emp => ({ id: emp._id, name: emp.Name || 'Unknown' }))
    };
};