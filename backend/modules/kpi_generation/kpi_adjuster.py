import copy
from modules.kpi_generation.kpi_generator import KPIGenerator
from modules.kpi_generation.project_analyzer import ProjectAnalyzer


class KPIAdjuster:
    """
    Class for adjusting KPIs based on project progress and changes.
    """

    @staticmethod
    def adjust_kpis_based_on_progress(original_kpis, project_progress, team_performance=None):
        """
        Adjust KPIs based on current project progress.

        Args:
            original_kpis: Original KPI dictionary.
            project_progress: Dictionary with current project progress metrics.
            team_performance: Optional dictionary with team performance data.

        Returns:
            dict: Adjusted KPIs.
        """
        if not original_kpis or not project_progress:
            return original_kpis

        # Create a deep copy of original KPIs to modify
        adjusted_kpis = copy.deepcopy(original_kpis)

        # Extract progress metrics
        actual_velocity = project_progress.get('actual_velocity')
        actual_cycle_time = project_progress.get('actual_cycle_time')
        defect_rate = project_progress.get('defect_rate')
        test_coverage = project_progress.get('test_coverage')

        # Adjust Productivity KPIs
        if 'productivity' in adjusted_kpis:
            productivity = adjusted_kpis['productivity']

            # Adjust velocity
            if actual_velocity and 'velocity' in productivity:
                original_target = productivity['velocity']['target']
                original_value = productivity['velocity']['value']

                # Extract the numeric value from the target string
                target_value = float(original_target.split()[0])

                # Calculate new target based on actual performance
                new_target = (target_value + actual_velocity) / 2
                new_target_str = f"{new_target:.1f} story points per sprint"

                # Update the KPI
                productivity['velocity']['target'] = new_target_str
                productivity['velocity']['value'] = f"{actual_velocity} story points per sprint"

                # Update status
                if actual_velocity >= new_target * 0.9:
                    productivity['velocity']['status'] = "On Track"
                elif actual_velocity >= new_target * 0.7:
                    productivity['velocity']['status'] = "At Risk"
                else:
                    productivity['velocity']['status'] = "Below Target"

            # Adjust cycle time
            if actual_cycle_time and 'cycle_time' in productivity:
                original_target = productivity['cycle_time']['target']

                # Extract the numeric value from the target string
                target_value = float(original_target.split()[0])

                # Calculate new target based on actual performance
                new_target = (target_value + actual_cycle_time) / 2
                new_target_str = f"{new_target:.1f} hours per story point"

                # Update the KPI
                productivity['cycle_time']['target'] = new_target_str
                productivity['cycle_time']['value'] = f"{actual_cycle_time} hours per story point"

                # Update status
                if actual_cycle_time <= new_target * 1.1:
                    productivity['cycle_time']['status'] = "On Track"
                elif actual_cycle_time <= new_target * 1.3:
                    productivity['cycle_time']['status'] = "At Risk"
                else:
                    productivity['cycle_time']['status'] = "Below Target"

        # Adjust Code Quality KPIs
        if 'code_quality' in adjusted_kpis:
            code_quality = adjusted_kpis['code_quality']

            # Adjust defect density
            if defect_rate and 'defect_density' in code_quality:
                original_target = code_quality['defect_density']['target']

                # Extract the numeric value from the target string
                target_value = float(original_target.split()[0])

                # Calculate new target based on actual performance
                new_target = (target_value + defect_rate) / 2
                new_target_str = f"{new_target:.1f} defects per 1,000 LOC"

                # Update the KPI
                code_quality['defect_density']['target'] = new_target_str
                code_quality['defect_density']['value'] = f"{defect_rate} defects per 1,000 LOC"

                # Update status
                if defect_rate <= new_target * 1.1:
                    code_quality['defect_density']['status'] = "On Track"
                elif defect_rate <= new_target * 1.3:
                    code_quality['defect_density']['status'] = "At Risk"
                else:
                    code_quality['defect_density']['status'] = "Below Target"

            # Adjust test coverage
            if test_coverage and 'test_coverage' in code_quality:
                original_target = code_quality['test_coverage']['target']

                # Extract the numeric value from the target string
                target_value = float(original_target.split('%')[0])

                # Calculate new target based on actual performance
                new_target = (target_value + test_coverage) / 2
                new_target_str = f"{new_target:.1f}%"

                # Update the KPI
                code_quality['test_coverage']['target'] = new_target_str
                code_quality['test_coverage']['value'] = f"{test_coverage}%"

                # Update status
                if test_coverage >= new_target * 0.9:
                    code_quality['test_coverage']['status'] = "On Track"
                elif test_coverage >= new_target * 0.8:
                    code_quality['test_coverage']['status'] = "At Risk"
                else:
                    code_quality['test_coverage']['status'] = "Below Target"

        # Additional adjustments based on team performance could be added here

        return adjusted_kpis

    @staticmethod
    def adjust_kpis_for_project_changes(original_kpis, original_project, updated_project):
        """
        Adjust KPIs based on changes to project parameters.

        Args:
            original_kpis: Original KPI dictionary.
            original_project: Dictionary with original project details.
            updated_project: Dictionary with updated project details.

        Returns:
            dict: Adjusted KPIs.
        """
        if not original_kpis or not original_project or not updated_project:
            return original_kpis

        # Identify changes in key project parameters
        changes = {}
        for key in ['project_type', 'project_team_size', 'project_timeline', 'project_languages', 'project_sprints']:
            if key in original_project and key in updated_project:
                if original_project[key] != updated_project[key]:
                    changes[key] = {
                        'old': original_project[key],
                        'new': updated_project[key]
                    }

        # If no significant changes, return original KPIs
        if not changes:
            return original_kpis

        # If there are significant changes, regenerate KPIs
        new_kpis = KPIGenerator.generate_kpis(updated_project)

        # Preserve progress on unchanged KPIs
        for category in original_kpis:
            if category in new_kpis:
                for kpi_name in original_kpis[category]:
                    if kpi_name in new_kpis[category]:
                        # Preserve the current value if it exists
                        if 'value' in original_kpis[category][kpi_name]:
                            new_kpis[category][kpi_name]['value'] = original_kpis[category][kpi_name]['value']

                        # Preserve the status if it exists
                        if 'status' in original_kpis[category][kpi_name]:
                            new_kpis[category][kpi_name]['status'] = original_kpis[category][kpi_name]['status']

        return new_kpis