import matplotlib.pyplot as plt
import os
import random
from datetime import datetime, timedelta
import numpy as np
from services.chart_service import chart_service


class ChartGenerator:
    """
    Class for generating project charts and visualizations.
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
        return chart_service.create_gantt_chart(gantt_data, project_id)

    @staticmethod
    def generate_burndown_chart(timeline, sprints, project_id):
        """
        Generate a burndown chart for project tracking.

        Args:
            timeline: Total project timeline in days.
            sprints: Number of sprints in the project.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart.
        """
        return chart_service.create_burndown_chart(timeline, sprints, project_id)

    @staticmethod
    def generate_velocity_chart(sprints, team_size, project_id):
        """
        Generate a velocity chart showing expected sprint velocities.

        Args:
            sprints: Number of sprints in the project.
            team_size: Size of the project team.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart.
        """
        # Calculate expected velocity
        expected_velocity = team_size * 10

        # Create sprint numbers
        sprint_numbers = list(range(1, sprints + 1))

        # Generate expected velocities with small variations
        velocities = [expected_velocity + random.randint(-5, 5) for _ in range(sprints)]

        # Generate the chart
        plt.figure(figsize=(10, 6))
        plt.bar(sprint_numbers, velocities, color='skyblue', alpha=0.7)
        plt.axhline(y=expected_velocity, color='r', linestyle='--', label=f'Expected Velocity ({expected_velocity})')

        # Add data labels
        for i, v in enumerate(velocities):
            plt.text(i + 1, v + 2, str(v), ha='center')

        plt.xlabel('Sprint')
        plt.ylabel('Velocity (Story Points)')
        plt.title('Sprint Velocity Chart')
        plt.xticks(sprint_numbers)
        plt.ylim(0, max(velocities) * 1.2)
        plt.legend()
        plt.grid(True, alpha=0.3)

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

            for kpi_name, kpi_data in category_kpis.items():
                status = kpi_data.get('status', '')
                # Convert status to score
                if status == 'On Track':
                    category_score += 1.0
                elif status == 'At Risk':
                    category_score += 0.6
                elif status == 'Below Target':
                    category_score += 0.3
                else:
                    category_score += 0.5  # Default for unknown status

                kpi_count += 1

                # Calculate average score for the category
                avg_score = category_score / kpi_count if kpi_count > 0 else 0
                scores.append(avg_score)

                # Number of variables
            N = len(categories)

            # Convert categorical labels to proper display format
            display_categories = [cat.capitalize() for cat in categories]

            # Create angle values
            angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()

            # Close the polygon
            display_categories.append(display_categories[0])
            scores.append(scores[0])
            angles.append(angles[0])

            # Create the plot
            fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

            # Draw the polygon
            ax.plot(angles, scores, 'o-', linewidth=2, color='blue', alpha=0.7)
            ax.fill(angles, scores, color='blue', alpha=0.2)

            # Set category labels
            ax.set_xticks(angles[:-1])
            ax.set_xticklabels(display_categories[:-1])

            # Set y-ticks and limits
            ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
            ax.set_yticklabels(['0.2', '0.4', '0.6', '0.8', '1.0'])
            ax.set_ylim(0, 1)

            # Add title
            plt.title('KPI Category Performance', size=15, y=1.1)

            # Save the chart
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"kpi_radar_chart_{project_id}_{timestamp}.png"
            filepath = os.path.join(chart_service.charts_folder, filename)
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            plt.close()

            return filepath