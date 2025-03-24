import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import os
import random
import numpy as np
from datetime import datetime, timedelta
from services.chart_service import chart_service
from modules.kpi_generation.project_analyzer import ProjectAnalyzer


class ChartGenerator:
    """
    Enhanced class for generating project charts and visualizations.
    Creates more realistic and dynamic charts based on project analysis.
    """

    @staticmethod
    def generate_gantt_chart(gantt_data, project_id):
        """
        Generate a Gantt chart from task data.

        Args:
            gantt_data: List of dictionaries with Task, Start, and End keys.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart.
        """
        fig, ax = plt.subplots(figsize=(14, 10))

        # Extract tasks and sort by start day
        tasks = [(task["Task"],
                  int(task["Start"].split(" ")[1]),
                  int(task["End"].split(" ")[1]))
                 for task in gantt_data]

        # Sort tasks by start date and then by task name
        tasks.sort(key=lambda x: (x[1], x[0]))

        # Create a colormap for different task types
        # Define task categories
        task_categories = {
            "Planning": ["Kickoff", "Requirements", "Planning"],
            "Design": ["Design", "Architecture", "Mockup"],
            "Development": ["Development", "Implementation", "Coding", "Feature"],
            "Testing": ["Testing", "QA", "Validation"],
            "Deployment": ["Deployment", "Release", "Launch", "Handover"]
        }

        # Define colors for each category
        category_colors = {
            "Planning": "#8CB9BD",  # Blue-green
            "Design": "#69A2B0",  # Teal
            "Development": "#A1CDF1",  # Light blue
            "Testing": "#7E93C8",  # Medium blue
            "Deployment": "#6E7DAB"  # Dark blue
        }

        # Assign colors to tasks based on their names
        task_colors = []
        for task_name, _, _ in tasks:
            # Default color
            color = "#AAAAAA"  # Gray for unmatched tasks

            # Find matching category
            for category, keywords in task_categories.items():
                if any(keyword in task_name for keyword in keywords):
                    color = category_colors[category]
                    break

            task_colors.append(color)

        # Plot each task as a horizontal bar
        for i, ((task, start, end), color) in enumerate(zip(tasks, task_colors)):
            duration = end - start
            ax.barh(i, duration, left=start, height=0.5, color=color, alpha=0.8, edgecolor="black", linewidth=0.5)

            # Adjust text position and color
            text_x = start + duration / 2
            text_color = "black"
            ax.text(text_x, i, task, ha='center', va='center', color=text_color, fontsize=10, fontweight='bold')

            # Add start and end days as small annotations
            ax.text(start, i - 0.3, f"Day {start}", ha='left', va='center', color='black', fontsize=8)
            ax.text(end, i + 0.3, f"Day {end}", ha='right', va='center', color='black', fontsize=8)

        # Add legend for task categories
        legend_handles = [plt.Rectangle((0, 0), 1, 1, color=color, alpha=0.8) for color in category_colors.values()]
        legend_labels = list(category_colors.keys())
        ax.legend(legend_handles, legend_labels, loc='upper right', fontsize=10)

        # Set labels and formatting
        ax.set_yticks(range(len(tasks)))
        ax.set_yticklabels([task[0] for task in tasks])
        ax.set_xlabel("Project Timeline (Days)", fontsize=12)
        ax.set_title("Project Gantt Chart", fontsize=16, fontweight='bold')

        # Add gridlines
        ax.grid(True, axis='x', alpha=0.3, linestyle='--')

        # Add sprint divisions if more than 10 tasks (likely a proper project plan)
        if len(tasks) > 10:
            max_day = max(task[2] for task in tasks)
            sprint_duration = max_day // 4  # Assume 4-5 sprints

            for sprint in range(1, 5):
                sprint_day = sprint * sprint_duration
                if sprint_day < max_day:
                    ax.axvline(x=sprint_day, color='red', linestyle='--', alpha=0.5)
                    ax.text(sprint_day, len(tasks) + 0.5, f"Sprint {sprint} End",
                            ha='center', va='bottom', color='red', fontsize=10, rotation=90)

        # Set aesthetic improvements
        fig.tight_layout()

        # Adjust y-axis to make room for all tasks
        plt.subplots_adjust(left=0.2)

        # Save the chart
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"gantt_chart_{project_id}_{timestamp}.png"
        filepath = os.path.join(chart_service.charts_folder, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()

        return filepath

    @staticmethod
    def generate_burndown_chart(timeline, sprints, project_id):
        """
        Generate a burndown chart for project tracking.
        Creates a realistic burndown with typical project patterns.

        Args:
            timeline: Total project timeline in days.
            sprints: Number of sprints in the project.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart.
        """
        # Calculate key parameters
        sprint_days = timeline // sprints
        x = [i * sprint_days for i in range(sprints + 1)]
        ideal_burndown = [timeline - i for i in x]

        # Generate realistic burndown data with common project patterns
        actual_burndown = [timeline]  # Start with full timeline

        # Define different burndown patterns
        patterns = {
            "ideal": lambda i, sprint_days: i * sprint_days,  # Perfect linear burndown
            "slow_start": lambda i, sprint_days: i * sprint_days * 0.7 if i <= sprints // 2 else (
                                                                                                             i - sprints // 2) * sprint_days * 1.3 + (
                                                                                                             sprints // 2) * sprint_days * 0.7,
            # Slow start, fast finish
            "fast_start": lambda i, sprint_days: i * sprint_days * 1.3 if i <= sprints // 2 else (
                                                                                                             i - sprints // 2) * sprint_days * 0.7 + (
                                                                                                             sprints // 2) * sprint_days * 1.3,
            # Fast start, slow finish
            "consistent_delay": lambda i, sprint_days: i * sprint_days * 0.85,  # Consistently behind
            "intermittent": lambda i, sprint_days: i * sprint_days + random.randint(-10, 5)  # Variable progress
        }

        # Select a random pattern
        selected_pattern = random.choice(list(patterns.keys()))
        pattern_func = patterns[selected_pattern]

        # Generate actual burndown based on selected pattern
        for i in range(1, sprints + 1):
            progress = pattern_func(i, sprint_days)

            # Ensure we're within realistic limits
            progress = min(timeline, max(0, progress))

            # Calculate remaining work
            remaining = max(0, timeline - progress)
            actual_burndown.append(remaining)

        # Create the chart
        plt.figure(figsize=(12, 8))
        plt.plot(x, ideal_burndown, label="Ideal Burndown", marker="o", linestyle="--", color="#355C7D", linewidth=2)
        plt.plot(x, actual_burndown, label=f"Actual Burndown ({selected_pattern.replace('_', ' ')})",
                 marker="s", color="#F67280", linewidth=3)

        # Add area fill for clearer visualization
        plt.fill_between(x, ideal_burndown, actual_burndown,
                         where=(np.array(actual_burndown) > np.array(ideal_burndown)),
                         color="#F67280", alpha=0.3, interpolate=True, label="Behind Schedule")
        plt.fill_between(x, ideal_burndown, actual_burndown,
                         where=(np.array(actual_burndown) <= np.array(ideal_burndown)),
                         color="#6C5B7B", alpha=0.3, interpolate=True, label="Ahead of Schedule")

        # Add labels and styling
        plt.xlabel("Project Days", fontsize=12)
        plt.ylabel("Work Remaining", fontsize=12)
        plt.title("Project Burndown Chart", fontsize=16, fontweight='bold')
        plt.legend(loc="upper right", fontsize=10)
        plt.grid(True, alpha=0.3, linestyle='--')

        # Add sprint boundaries and labels
        for i, day in enumerate(x):
            if i > 0:
                plt.axvline(x=day, color="#8A9B68", linestyle=":", alpha=0.7)
                plt.text(day, ideal_burndown[0] * 0.95, f"Sprint {i}",
                         ha='center', va='top', rotation=90, alpha=0.8, fontsize=10)

        # Add annotations about the burndown pattern
        pattern_descriptions = {
            "ideal": "Team is following the ideal burndown closely",
            "slow_start": "Slow start with accelerated progress later",
            "fast_start": "Fast initial progress with slower completion",
            "consistent_delay": "Consistent progress but behind schedule",
            "intermittent": "Variable progress throughout project"
        }

        plt.figtext(0.5, 0.01, pattern_descriptions[selected_pattern],
                    ha="center", fontsize=10, style='italic')

        # Save the chart
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"burndown_chart_{project_id}_{timestamp}.png"
        filepath = os.path.join(chart_service.charts_folder, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()

        return filepath

    @staticmethod
    def generate_velocity_chart(sprints, team_size, project_id):
        """
        Generate a velocity chart showing expected sprint velocities.
        Includes realistic velocity variations and trend lines.

        Args:
            sprints: Number of sprints in the project.
            team_size: Size of the project team.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart.
        """
        # Calculate expected velocity based on team size and typical per-developer velocity
        expected_velocity = team_size * 10

        # Create sprint numbers
        sprint_numbers = list(range(1, sprints + 1))

        # Generate velocity patterns
        velocity_patterns = {
            "improving": [expected_velocity * (0.7 + 0.1 * i) for i in range(sprints)],  # Team improves over time
            "consistent": [expected_velocity + random.randint(-5, 5) for _ in range(sprints)],
            # Consistent with minor variations
            "variable": [expected_velocity * random.uniform(0.7, 1.3) for _ in range(sprints)],  # More variable
            "declining": [expected_velocity * (1.1 - 0.05 * i) for i in range(sprints)]
            # Declining (e.g., increasing complexity)
        }

        # Choose a pattern
        selected_pattern = random.choice(list(velocity_patterns.keys()))
        velocities = velocity_patterns[selected_pattern]

        # Round velocities to integers
        velocities = [round(v) for v in velocities]

        # Calculate moving average for trend line
        window_size = min(3, sprints)
        moving_averages = []

        for i in range(sprints):
            if i < window_size - 1:
                # Not enough data points yet for full window
                moving_averages.append(sum(velocities[:i + 1]) / (i + 1))
            else:
                # Full window
                moving_averages.append(sum(velocities[i - (window_size - 1):i + 1]) / window_size)

        # Create the chart
        plt.figure(figsize=(12, 8))

        # Plot expected velocity as horizontal line
        plt.axhline(y=expected_velocity, color='#355C7D', linestyle='--',
                    label=f'Expected Velocity ({expected_velocity})')

        # Create bar chart of actual velocities
        bars = plt.bar(sprint_numbers, velocities, color='#6C5B7B', alpha=0.7, label='Sprint Velocity')

        # Add trend line
        plt.plot(sprint_numbers, moving_averages, color='#C06C84', marker='o', linewidth=2,
                 label=f'Trend ({selected_pattern})')

        # Add data labels
        for i, v in enumerate(velocities):
            plt.text(i + 1, v + 2, str(v), ha='center', fontsize=10)

        # Add labels and styling
        plt.xlabel('Sprint Number', fontsize=12)
        plt.ylabel('Velocity (Story Points)', fontsize=12)
        plt.title('Sprint Velocity Chart', fontsize=16, fontweight='bold')
        plt.xticks(sprint_numbers)
        plt.ylim(0, max(max(velocities), expected_velocity) * 1.2)  # Set y-axis limit with headroom
        plt.legend(loc='upper right')
        plt.grid(True, alpha=0.3, linestyle='--')

        # Add annotations about velocity pattern
        pattern_descriptions = {
            "improving": "Team velocity is improving as they become more familiar with the project",
            "consistent": "Team is maintaining consistent velocity throughout the project",
            "variable": "Team velocity varies significantly between sprints",
            "declining": "Team velocity is gradually declining, possibly due to increasing complexity"
        }

        plt.figtext(0.5, 0.01, pattern_descriptions[selected_pattern],
                    ha="center", fontsize=10, style='italic')

        # Save the chart
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"velocity_chart_{project_id}_{timestamp}.png"
        filepath = os.path.join(chart_service.charts_folder, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()

        return filepath

    @staticmethod
    def generate_kpi_radar_chart(kpis, project_id):
        """
        Generate a radar chart showing KPI categories.
        Visualizes all KPI categories with clear scoring.

        Args:
            kpis: Dictionary of KPIs by category.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart.
        """
        # Calculate average scores for each KPI category
        categories = list(kpis.keys())
        scores = []

        for category in categories:
            category_kpis = kpis[category]
            category_score = 0
            kpi_count = 0

            # Track individual KPI scores for detailed display
            kpi_scores = {}

            for kpi_name, kpi_data in category_kpis.items():
                status = kpi_data.get('status', '')

                # Convert status to score
                if status == 'On Track':
                    kpi_score = 1.0
                elif status == 'At Risk':
                    kpi_score = 0.6
                elif status == 'Below Target':
                    kpi_score = 0.3
                else:
                    kpi_score = 0.5  # Default for unknown status

                # Store individual KPI score
                kpi_scores[kpi_name] = kpi_score

                # Add to category total
                category_score += kpi_score
                kpi_count += 1

            # Calculate average score for the category
            avg_score = category_score / kpi_count if kpi_count > 0 else 0
            scores.append(avg_score)

        # Number of variables/categories
        N = len(categories)

        # Convert categorical labels to proper display format
        display_categories = [cat.capitalize() for cat in categories]

        # Create angle values for radar chart
        angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()

        # Close the polygon
        display_categories.append(display_categories[0])
        scores.append(scores[0])
        angles.append(angles[0])

        # Create the plot
        fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))

        # Draw the polygon for the scores
        ax.plot(angles, scores, 'o-', linewidth=2, color='#355C7D', label='KPI Performance')
        ax.fill(angles, scores, color='#355C7D', alpha=0.25)

        # Add category labels
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(display_categories[:-1], fontsize=12)

        # Set y-ticks and limits
        ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
        ax.set_yticklabels(['0.2', '0.4', '0.6', '0.8', '1.0'], fontsize=10)
        ax.set_ylim(0, 1)

        # Add background grid with more definite circles
        for ytick in [0.2, 0.4, 0.6, 0.8, 1.0]:
            ax.plot(angles, [ytick] * len(angles), '--', color='gray', alpha=0.3, linewidth=0.5)

        # Add title
        plt.title('KPI Category Performance', size=16, y=1.1, fontweight='bold')

        # Add scoring legend
        plt.figtext(0.1, 0.01, "Scoring: 1.0 = On Track, 0.6 = At Risk, 0.3 = Below Target",
                    ha="left", fontsize=10, style='italic')

        # Save the chart
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"kpi_radar_chart_{project_id}_{timestamp}.png"
        filepath = os.path.join(chart_service.charts_folder, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()

        return filepath

    @staticmethod
    def generate_kpi_breakdown_chart(kpis, project_id):
        """
        Generate a detailed breakdown chart of all KPIs.
        Provides a comprehensive visualization of all KPI statuses.

        Args:
            kpis: Dictionary of KPIs by category.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart.
        """
        # Extract all KPIs and statuses
        all_kpis = []
        statuses = []
        categories = []
        values = []
        targets = []

        # Status color mapping
        status_colors = {
            'On Track': '#5cb85c',  # Green
            'At Risk': '#f0ad4e',  # Yellow/Orange
            'Below Target': '#d9534f'  # Red
        }

        # Process KPIs by category
        for category, category_kpis in kpis.items():
            for kpi_name, kpi_data in category_kpis.items():
                all_kpis.append(f"{kpi_name}")
                statuses.append(kpi_data.get('status', 'Unknown'))
                categories.append(category)

                # Extract numeric values (strip units)
                value_str = kpi_data.get('value', 'N/A')
                target_str = kpi_data.get('target', 'N/A')

                # Add raw strings to lists for display purposes
                values.append(value_str)
                targets.append(target_str)

        # Create figure with specific size based on number of KPIs
        fig_height = max(8, len(all_kpis) * 0.4)
        fig, ax = plt.subplots(figsize=(12, fig_height))

        # Create y-coordinates for KPIs
        y_pos = np.arange(len(all_kpis))

        # Create color array based on statuses
        colors = [status_colors.get(status, '#AAAAAA') for status in statuses]

        # Create KPI status bars (all same length, just showing status)
        bars = ax.barh(y_pos, [1] * len(all_kpis), align='center', color=colors, alpha=0.7)

        # Add KPI names, values, and targets as text
        for i, (kpi, value, target, category) in enumerate(zip(all_kpis, values, targets, categories)):
            # KPI name on left
            ax.text(-0.05, i, f"{kpi} ({category})", ha='right', va='center', fontsize=10)

            # Value and target on the bar
            bar_text = f"Current: {value} | Target: {target}"
            ax.text(0.5, i, bar_text, ha='center', va='center', fontsize=9, fontweight='bold')

        # Configure axis
        ax.set_yticks(y_pos)
        ax.set_yticklabels([])  # Hide y-tick labels since we're adding custom text
        ax.set_xlim(-4, 2)  # Extend x-axis to left to make room for KPI names

        # Hide x-axis ticks and spines
        ax.tick_params(axis='x', which='both', bottom=False, top=False, labelbottom=False)
        for spine in ax.spines.values():
            spine.set_visible(False)

        # Add title and legend
        plt.title('KPI Status Overview', fontsize=16, fontweight='bold')

        # Create legend for KPI statuses
        status_handles = [plt.Rectangle((0, 0), 1, 1, color=color, alpha=0.7) for color in status_colors.values()]
        status_labels = list(status_colors.keys())
        ax.legend(status_handles, status_labels, loc='upper right', title='Status', fontsize=10)

        # Add grid lines
        ax.grid(axis='y', linestyle='--', alpha=0.3)

        # Adjust layout
        plt.tight_layout()

        # Save the chart
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"kpi_breakdown_{project_id}_{timestamp}.png"
        filepath = os.path.join(chart_service.charts_folder, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()

        return filepath