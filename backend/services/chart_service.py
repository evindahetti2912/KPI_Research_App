import matplotlib.pyplot as plt
import os
from datetime import datetime
import random
from config import active_config


class ChartService:
    """Service for generating charts and visualizations."""

    def __init__(self):
        """Initialize the chart service."""
        self.charts_folder = os.path.join(active_config.UPLOAD_FOLDER, 'charts')
        os.makedirs(self.charts_folder, exist_ok=True)

    def create_gantt_chart(self, gantt_data, project_id):
        """
        Create a Gantt chart based on task data.

        Args:
            gantt_data: List of dictionaries with Task, Start, and End keys.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart image.
        """
        fig, ax = plt.subplots(figsize=(12, 8))

        # Extract tasks and sort by start day
        tasks = [(task["Task"],
                  int(task["Start"].split(" ")[1]),
                  int(task["End"].split(" ")[1]))
                 for task in gantt_data]
        tasks.sort(key=lambda x: x[1])  # Sort by start day

        # Plot each task as a horizontal bar
        for i, (task, start, end) in enumerate(tasks):
            ax.barh(i, end - start, left=start, height=0.5, color="skyblue",
                    alpha=0.8, edgecolor="blue")
            ax.text(start + (end - start) / 2, i, task,
                    ha='center', va='center', color='black')

        # Set labels and formatting
        ax.set_yticks(range(len(tasks)))
        ax.set_yticklabels([task[0] for task in tasks])
        ax.set_xlabel("Days")
        ax.set_ylabel("Tasks")
        ax.set_title("Project Gantt Chart")
        ax.grid(True, alpha=0.3)

        # Set aesthetic improvements
        fig.tight_layout()

        # Save the chart
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"gantt_chart_{project_id}_{timestamp}.png"
        filepath = os.path.join(self.charts_folder, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()

        return filepath

    def create_burndown_chart(self, timeline, sprints, project_id):
        """
        Create a burndown chart based on timeline and sprints.

        Args:
            timeline: Total project timeline in days.
            sprints: Number of sprints in the project.
            project_id: The ID of the project for file naming.

        Returns:
            str: Path to the generated chart image.
        """
        sprint_days = timeline // sprints
        x = [i * sprint_days for i in range(sprints + 1)]
        ideal_burndown = [timeline - i for i in x]

        # Generate realistic burndown data with some variability
        actual_burndown = [timeline]
        for i in range(1, sprints + 1):
            # Add some randomness to the actual burndown
            progress = (i * sprint_days) + random.randint(-5, 3)
            # Ensure progress doesn't exceed timeline
            actual_burndown.append(max(0, timeline - progress))

        plt.figure(figsize=(10, 6))
        plt.plot(x, ideal_burndown, label="Ideal Burndown", marker="o", linestyle="--", color="blue")
        plt.plot(x, actual_burndown, label="Actual Burndown", marker="s", color="orange")

        plt.xlabel("Days")
        plt.ylabel("Work Remaining")
        plt.title("Project Burndown Chart")
        plt.legend()
        plt.grid(True, alpha=0.3)

        # Annotate sprint boundaries
        for i, day in enumerate(x):
            if i > 0:
                plt.axvline(x=day, color="gray", linestyle=":", alpha=0.5)
                plt.text(day, ideal_burndown[0] * 0.9, f"Sprint {i}",
                         ha='center', rotation=90, alpha=0.7)

        # Save the chart
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"burndown_chart_{project_id}_{timestamp}.png"
        filepath = os.path.join(self.charts_folder, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()

        return filepath


# Singleton instance of chart service
chart_service = ChartService()