import copy
import datetime
import json
from modules.kpi_generation.kpi_generator import KPIGenerator
from modules.kpi_generation.project_analyzer import ProjectAnalyzer
from services.openai_service import openai_service


class KPIAdjuster:
    """
    Enhanced class for adjusting KPIs based on project progress and changes.
    Uses dynamic adjustment logic and AI assistance for more realistic KPI targets.
    """

    @staticmethod
    def adjust_kpis_based_on_progress(original_kpis, project_progress, team_performance=None):
        """
        Adjust KPIs based on current project progress using dynamic thresholds.

        Args:
            original_kpis: Original KPI dictionary.
            project_progress: Dictionary with current project progress metrics.
            team_performance: Optional dictionary with team performance data.

        Returns:
            dict: Adjusted KPIs.
        """
        if not original_kpis or not project_progress:
            return original_kpis

        # Try to use OpenAI for more intelligent KPI adjustment
        try:
            # Create a prompt for OpenAI to generate adjusted KPIs
            kpi_prompt = f"""
            Based on the current project progress and the original KPIs, adjust the KPI targets to be more realistic.

            Original KPIs:
            {json.dumps(original_kpis, indent=2)}

            Current Project Progress:
            {json.dumps(project_progress, indent=2)}

            Team Performance (if available):
            {json.dumps(team_performance, indent=2) if team_performance else "No team performance data available."}

            For each KPI, adjust the target value to be more realistic based on actual performance.
            Then update the 'status' field to be one of "On Track", "At Risk", or "Below Target" based on the relationship
            between the current value and the adjusted target.

            Return only a valid JSON object matching the structure of the original KPIs, but with updated target values and statuses.
            Preserve the current value fields exactly as they are in the original KPIs.
            """

            # Get adjusted KPI suggestions from OpenAI
            kpi_response = openai_service.generate_completion(kpi_prompt, temperature=0.2)

            try:
                # Parse the JSON response
                adjusted_kpis = json.loads(kpi_response)

                # Validate the structure matches the original KPIs
                if (isinstance(adjusted_kpis, dict) and
                        all(category in original_kpis for category in adjusted_kpis.keys())):

                    # Ensure all original KPIs are preserved
                    for category in original_kpis:
                        if category not in adjusted_kpis:
                            adjusted_kpis[category] = original_kpis[category]
                        else:
                            for kpi_name in original_kpis[category]:
                                if kpi_name not in adjusted_kpis[category]:
                                    adjusted_kpis[category][kpi_name] = original_kpis[category][kpi_name]

                    return adjusted_kpis
            except (json.JSONDecodeError, TypeError):
                # Fallback to rule-based adjustment if JSON parsing fails
                print("Failed to parse AI-generated KPI adjustments, using fallback method")
        except Exception as e:
            print(f"Error generating AI-based KPI adjustments: {e}")

        # Fallback to rule-based KPI adjustment
        return KPIAdjuster._adjust_kpis_rule_based(original_kpis, project_progress, team_performance)

    @staticmethod
    def _adjust_kpis_rule_based(original_kpis, project_progress, team_performance=None):
        """
        Rule-based fallback method for adjusting KPIs based on project progress.

        Args:
            original_kpis: Original KPI dictionary.
            project_progress: Dictionary with current project progress metrics.
            team_performance: Optional dictionary with team performance data.

        Returns:
            dict: Adjusted KPIs.
        """
        # Create a deep copy of original KPIs to modify
        adjusted_kpis = copy.deepcopy(original_kpis)

        # Extract progress metrics
        actual_velocity = project_progress.get('actual_velocity')
        actual_cycle_time = project_progress.get('actual_cycle_time')
        defect_rate = project_progress.get('defect_rate')
        test_coverage = project_progress.get('test_coverage')

        # Extract team metrics if available
        team_velocity_trend = None
        team_quality_trend = None
        team_collaboration_trend = None

        if team_performance:
            team_velocity_trend = team_performance.get('velocity_trend')
            team_quality_trend = team_performance.get('quality_trend')
            team_collaboration_trend = team_performance.get('collaboration_trend')

        # Adjustment weights (how much to blend original target with actual performance)
        # Higher weight = more adjustment toward actual performance
        early_project_weight = 0.3  # Early in project, slight adjustments
        mid_project_weight = 0.5  # Mid-project, moderate adjustments
        late_project_weight = 0.7  # Late in project, heavier adjustments

        # Determine project phase
        project_completion = project_progress.get('completion_percentage', 50)

        if project_completion < 30:
            adjustment_weight = early_project_weight
        elif project_completion < 70:
            adjustment_weight = mid_project_weight
        else:
            adjustment_weight = late_project_weight

        # Apply trend factors if available
        trend_factor = 1.0
        if team_performance:
            # Positive trend = higher targets, negative trend = lower targets
            trend_mapping = {
                "improving": 1.1,  # 10% higher targets
                "stable": 1.0,  # No change
                "declining": 0.9  # 10% lower targets
            }

            velocity_factor = trend_mapping.get(team_velocity_trend, 1.0)
            quality_factor = trend_mapping.get(team_quality_trend, 1.0)
            collaboration_factor = trend_mapping.get(team_collaboration_trend, 1.0)

        # Adjust Productivity KPIs
        if 'productivity' in adjusted_kpis:
            productivity = adjusted_kpis['productivity']

            # Adjust velocity
            if actual_velocity and 'velocity' in productivity:
                original_target = productivity['velocity']['target']
                original_value = productivity['velocity']['value']

                # Extract the numeric value from the target and value strings
                try:
                    target_value = float(original_target.split()[0])
                    current_value = float(original_value.split()[0])

                    # Calculate new target based on actual performance
                    if team_velocity_trend:
                        velocity_adjustment = velocity_factor
                    else:
                        velocity_adjustment = 1.0

                    new_target = (target_value * (1 - adjustment_weight) +
                                  current_value * adjustment_weight) * velocity_adjustment

                    # Format the new target string
                    units = original_target.split(" ", 1)[1] if " " in original_target else ""
                    new_target_str = f"{new_target:.1f} {units}"

                    # Update the KPI
                    productivity['velocity']['target'] = new_target_str

                    # Update status
                    if current_value >= new_target * 0.9:
                        productivity['velocity']['status'] = "On Track"
                    elif current_value >= new_target * 0.7:
                        productivity['velocity']['status'] = "At Risk"
                    else:
                        productivity['velocity']['status'] = "Below Target"
                except (ValueError, IndexError):
                    # If parsing fails, leave original target
                    pass

            # Adjust cycle time
            if actual_cycle_time and 'cycle_time' in productivity:
                try:
                    original_target = productivity['cycle_time']['target']
                    original_value = productivity['cycle_time']['value']

                    # Extract numeric values
                    target_value = float(original_target.split()[0])
                    current_value = float(original_value.split()[0])

                    # For cycle time, lower is better, so adjust target differently
                    new_target = (target_value * (1 - adjustment_weight) +
                                  current_value * adjustment_weight)

                    # Format the new target string
                    units = original_target.split(" ", 1)[1] if " " in original_target else ""
                    new_target_str = f"{new_target:.1f} {units}"

                    # Update the KPI
                    productivity['cycle_time']['target'] = new_target_str

                    # Update status - for cycle time, lower is better
                    if current_value <= new_target * 1.1:
                        productivity['cycle_time']['status'] = "On Track"
                    elif current_value <= new_target * 1.3:
                        productivity['cycle_time']['status'] = "At Risk"
                    else:
                        productivity['cycle_time']['status'] = "Below Target"
                except (ValueError, IndexError):
                    # If parsing fails, leave original target
                    pass

        # Adjust Code Quality KPIs
        if 'code_quality' in adjusted_kpis and team_quality_trend:
            code_quality = adjusted_kpis['code_quality']

            # Apply quality trend factor to all code quality KPIs
            quality_adjustment = quality_factor

            # Adjust defect density
            if defect_rate and 'defect_density' in code_quality:
                try:
                    original_target = code_quality['defect_density']['target']
                    original_value = code_quality['defect_density']['value']

                    # Extract numeric values
                    target_value = float(original_target.split()[0])
                    current_value = float(original_value.split()[0])

                    # For defect density, lower is better
                    new_target = (target_value * (1 - adjustment_weight) +
                                  current_value * adjustment_weight) * quality_adjustment

                    # Format the new target string
                    units = original_target.split(" ", 1)[1] if " " in original_target else ""
                    new_target_str = f"{new_target:.1f} {units}"

                    # Update the KPI
                    code_quality['defect_density']['target'] = new_target_str

                    # Update status - for defect density, lower is better
                    if current_value <= new_target * 1.1:
                        code_quality['defect_density']['status'] = "On Track"
                    elif current_value <= new_target * 1.3:
                        code_quality['defect_density']['status'] = "At Risk"
                    else:
                        code_quality['defect_density']['status'] = "Below Target"
                except (ValueError, IndexError):
                    # If parsing fails, leave original target
                    pass

            # Adjust test coverage
            if test_coverage and 'test_coverage' in code_quality:
                try:
                    original_target = code_quality['test_coverage']['target']
                    original_value = code_quality['test_coverage']['value']

                    # Extract numeric values
                    target_value = float(original_target.split('%')[0])
                    current_value = float(original_value.split('%')[0])

                    # For test coverage, higher is better
                    new_target = (target_value * (1 - adjustment_weight) +
                                  current_value * adjustment_weight) * quality_adjustment
                    new_target = min(new_target, 100)  # Cap at 100%

                    # Format the new target string
                    new_target_str = f"{new_target:.1f}%"

                    # Update the KPI
                    code_quality['test_coverage']['target'] = new_target_str

                    # Update status
                    if current_value >= new_target * 0.9:
                        code_quality['test_coverage']['status'] = "On Track"
                    elif current_value >= new_target * 0.8:
                        code_quality['test_coverage']['status'] = "At Risk"
                    else:
                        code_quality['test_coverage']['status'] = "Below Target"
                except (ValueError, IndexError):
                    # If parsing fails, leave original target
                    pass

        # Adjust Collaboration KPIs
        if 'collaboration' in adjusted_kpis and team_collaboration_trend:
            collaboration = adjusted_kpis['collaboration']

            # Apply collaboration trend factor
            collaboration_adjustment = collaboration_factor

            # Adjust all collaboration KPIs by the same trend factor
            for kpi_name, kpi_data in collaboration.items():
                try:
                    original_target = kpi_data['target']
                    original_value = kpi_data['value']

                    # Different KPIs have different units and better/worse directions
                    if kpi_name == 'code_review_turnaround_time':
                        # Extract numeric values - lower is better
                        target_value = float(original_target.split()[0])
                        current_value = float(original_value.split()[0])

                        # For turnaround time, lower is better
                        new_target = (target_value * (1 - adjustment_weight) +
                                      current_value * adjustment_weight) / collaboration_adjustment

                        # Format the new target string
                        units = original_target.split(" ", 1)[1] if " " in original_target else ""
                        new_target_str = f"{new_target:.1f} {units}"

                        # Update the KPI
                        collaboration[kpi_name]['target'] = new_target_str

                        # Update status - for time, lower is better
                        if current_value <= new_target * 1.1:
                            collaboration[kpi_name]['status'] = "On Track"
                        elif current_value <= new_target * 1.3:
                            collaboration[kpi_name]['status'] = "At Risk"
                        else:
                            collaboration[kpi_name]['status'] = "Below Target"
                    else:
                        # For percentage KPIs like merge conflict resolution, higher is better
                        # Extract numeric values
                        target_value = float(original_target.split('%')[0])
                        current_value = float(original_value.split('%')[0])

                        # Calculate new target
                        new_target = (target_value * (1 - adjustment_weight) +
                                      current_value * adjustment_weight) * collaboration_adjustment
                        new_target = min(new_target, 100)  # Cap at 100%

                        # Format the new target string
                        new_target_str = f"{new_target:.1f}%"

                        # Update the KPI
                        collaboration[kpi_name]['target'] = new_target_str

                        # Update status
                        if current_value >= new_target * 0.9:
                            collaboration[kpi_name]['status'] = "On Track"
                        elif current_value >= new_target * 0.8:
                            collaboration[kpi_name]['status'] = "At Risk"
                        else:
                            collaboration[kpi_name]['status'] = "Below Target"
                except (ValueError, IndexError):
                    # If parsing fails, leave original target
                    pass

        return adjusted_kpis

    @staticmethod
    def adjust_kpis_for_project_changes(original_kpis, original_project, updated_project):
        """
        Adjust KPIs based on changes to project parameters, with intelligent
        preservation of progress on unchanged KPIs.

        Args:
            original_kpis: Original KPI dictionary.
            original_project: Dictionary with original project details.
            updated_project: Dictionary with updated project details.

        Returns:
            dict: Adjusted KPIs.
        """
        if not original_kpis or not original_project or not updated_project:
            return original_kpis

        # Identify significant changes in key project parameters
        significant_changes = {}
        change_impact = {}

        for key in ['project_type', 'project_team_size', 'project_timeline', 'project_languages', 'project_sprints']:
            if key in original_project and key in updated_project:
                original_value = original_project[key]
                updated_value = updated_project[key]

                if original_value != updated_value:
                    significant_changes[key] = {
                        'old': original_value,
                        'new': updated_value
                    }

                    # Calculate impact of each change
                    if key == 'project_team_size':
                        # Team size changes have direct impact on velocity expectations
                        old_size = int(original_value) if original_value else 1
                        new_size = int(updated_value) if updated_value else 1
                        size_ratio = new_size / old_size if old_size > 0 else 1

                        change_impact['velocity'] = size_ratio
                        change_impact['code_review_time'] = 1.0 + (size_ratio - 1.0) * 0.5  # Less than linear scaling

                    elif key == 'project_timeline':
                        # Timeline changes affect cycle times
                        old_time = int(original_value) if original_value else 30
                        new_time = int(updated_value) if updated_value else 30
                        time_ratio = new_time / old_time if old_time > 0 else 1

                        change_impact['cycle_time'] = 1.0 / time_ratio  # Inverse relationship
                        change_impact['test_coverage'] = 1.0 + (
                                    time_ratio - 1.0) * 0.2  # More time = higher coverage expectations

                    elif key == 'project_sprints':
                        # Sprint count changes affect planning granularity
                        change_impact['story_completion'] = 1.05  # Slight upward adjustment

                    elif key == 'project_languages':
                        # Language changes can affect quality metrics
                        change_impact['test_coverage'] = 0.95  # Slightly lower expectations initially
                        change_impact['defect_density'] = 1.1  # Higher tolerance temporarily

        # If there are no significant changes, return original KPIs
        if not significant_changes:
            return original_kpis

        # Try to use OpenAI for more intelligent KPI adjustment
        try:
            # Create a prompt for OpenAI to intelligently adjust KPIs
            kpi_prompt = f"""
            Based on the following project changes and the original KPIs, adjust the KPI targets intelligently.

            Original KPIs:
            {json.dumps(original_kpis, indent=2)}

            Project Changes:
            {json.dumps(significant_changes, indent=2)}

            For each KPI, determine if and how it should be adjusted based on the project changes.
            Consider how each change impacts KPI expectations. For example:
            - Increased team size would increase velocity expectations but might decrease code quality initially
            - Decreased timeline would increase time pressure and might affect quality metrics
            - Technology changes might temporarily reduce productivity but improve quality long-term

            Return only a valid JSON object matching the structure of the original KPIs, but with updated target values.
            Preserve the current value fields exactly as they are in the original KPIs.
            """

            # Get adjusted KPI suggestions from OpenAI
            kpi_response = openai_service.generate_completion(kpi_prompt, temperature=0.3)

            try:
                # Parse the JSON response
                adjusted_kpis = json.loads(kpi_response)

                # Validate the structure matches the original KPIs
                if (isinstance(adjusted_kpis, dict) and
                        all(category in original_kpis for category in adjusted_kpis.keys())):

                    # Preserve current values from original KPIs
                    for category in original_kpis:
                        if category in adjusted_kpis:
                            for kpi_name in original_kpis[category]:
                                if kpi_name in adjusted_kpis[category] and 'value' in original_kpis[category][kpi_name]:
                                    adjusted_kpis[category][kpi_name]['value'] = original_kpis[category][kpi_name][
                                        'value']

                    return adjusted_kpis
            except (json.JSONDecodeError, TypeError):
                # Fallback to rule-based adjustment if JSON parsing fails
                print("Failed to parse AI-generated KPI adjustments for project changes, using fallback method")
        except Exception as e:
            print(f"Error generating AI-based KPI adjustments for project changes: {e}")

        # Significant changes found, regenerate KPIs but preserve current values
        new_kpis = KPIGenerator.generate_kpis(updated_project)

        # Create adjusted KPIs by merging new targets with original current values and statuses
        adjusted_kpis = copy.deepcopy(new_kpis)

        # Apply impact factors from changes to new KPI targets
        for category in adjusted_kpis:
            for kpi_name, kpi_data in adjusted_kpis[category].items():
                # Find relevant impact factor if any
                impact_key = kpi_name.lower().replace('_', '')
                for key, factor in change_impact.items():
                    if key in impact_key:
                        try:
                            # Extract target value and adjust it
                            if '%' in kpi_data['target']:
                                # Percentage value
                                target_value = float(kpi_data['target'].split('%')[0])
                                adjusted_value = target_value * factor
                                # Cap at 100%
                                adjusted_value = min(adjusted_value, 100)
                                kpi_data['target'] = f"{adjusted_value:.1f}%"
                            elif ' ' in kpi_data['target']:
                                # Value with units
                                parts = kpi_data['target'].split(' ', 1)
                                target_value = float(parts[0])
                                units = parts[1]
                                adjusted_value = target_value * factor
                                kpi_data['target'] = f"{adjusted_value:.1f} {units}"
                            else:
                                # Simple numeric value
                                target_value = float(kpi_data['target'])
                                adjusted_value = target_value * factor
                                kpi_data['target'] = f"{adjusted_value:.1f}"
                        except (ValueError, IndexError):
                            pass

        # Preserve progress on KPIs
        for category in original_kpis:
            if category in adjusted_kpis:
                for kpi_name in original_kpis[category]:
                    if kpi_name in adjusted_kpis[category]:
                        # Preserve the current value if it exists
                        if 'value' in original_kpis[category][kpi_name]:
                            adjusted_kpis[category][kpi_name]['value'] = original_kpis[category][kpi_name]['value']

                            # Recalculate status based on new target and preserved value
                            try:
                                current_value_str = adjusted_kpis[category][kpi_name]['value']
                                target_value_str = adjusted_kpis[category][kpi_name]['target']

                                # Determine if higher or lower is better for this KPI
                                if kpi_name in ['cycle_time', 'lead_time', 'defect_density', 'code_churn',
                                                'rework_ratio', 'code_review_turnaround_time']:
                                    # For these KPIs, lower is better
                                    current_value = float(current_value_str.split()[
                                                              0] if ' ' in current_value_str else current_value_str.rstrip(
                                        '%'))
                                    target_value = float(target_value_str.split()[
                                                             0] if ' ' in target_value_str else target_value_str.rstrip(
                                        '%'))

                                    if current_value <= target_value * 1.1:
                                        adjusted_kpis[category][kpi_name]['status'] = "On Track"
                                    elif current_value <= target_value * 1.3:
                                        adjusted_kpis[category][kpi_name]['status'] = "At Risk"
                                    else:
                                        adjusted_kpis[category][kpi_name]['status'] = "Below Target"
                                else:
                                    # For other KPIs, higher is better
                                    current_value = float(current_value_str.split()[
                                                              0] if ' ' in current_value_str else current_value_str.rstrip(
                                        '%'))
                                    target_value = float(target_value_str.split()[
                                                             0] if ' ' in target_value_str else target_value_str.rstrip(
                                        '%'))

                                    if current_value >= target_value * 0.9:
                                        adjusted_kpis[category][kpi_name]['status'] = "On Track"
                                    elif current_value >= target_value * 0.7:
                                        adjusted_kpis[category][kpi_name]['status'] = "At Risk"
                                    else:
                                        adjusted_kpis[category][kpi_name]['status'] = "Below Target"
                            except (ValueError, IndexError):
                                # If parsing fails, leave original status
                                if 'status' in original_kpis[category][kpi_name]:
                                    adjusted_kpis[category][kpi_name]['status'] = original_kpis[category][kpi_name][
                                        'status']

                        # If no value exists but there's a status, preserve it
                        elif 'status' in original_kpis[category][kpi_name]:
                            adjusted_kpis[category][kpi_name]['status'] = original_kpis[category][kpi_name]['status']

        return adjusted_kpis

    @staticmethod
    def recalibrate_kpis_mid_project(original_kpis, current_progress, completion_percentage, team_feedback=None):
        """
        Comprehensive recalibration of KPIs at a mid-project milestone.

        Args:
            original_kpis: Original KPI dictionary.
            current_progress: Dictionary with current project metrics.
            completion_percentage: Percentage of project completed (0-100).
            team_feedback: Optional dictionary with qualitative team feedback.

        Returns:
            dict: Recalibrated KPIs.
        """
        if not original_kpis or completion_percentage < 15:
            return original_kpis  # Too early to recalibrate

        # Try to use OpenAI for comprehensive KPI recalibration
        try:
            # Create a prompt for OpenAI
            recalibration_prompt = f"""
            Perform a mid-project recalibration of KPIs based on actual progress and team feedback.

            Original KPIs:
            {json.dumps(original_kpis, indent=2)}

            Current Progress Metrics:
            {json.dumps(current_progress, indent=2)}

            Project Completion: {completion_percentage}%

            Team Feedback:
            {json.dumps(team_feedback, indent=2) if team_feedback else "No specific team feedback provided."}

            For each KPI:
            1. Analyze the gap between target and actual values
            2. Consider the project completion stage ({completion_percentage}%)
            3. Take into account any team feedback
            4. Determine if the KPI target should be adjusted up, down, or kept the same
            5. Set appropriate status based on current performance vs new target

            For KPIs where we're significantly ahead of target, consider making the target more ambitious.
            For KPIs where we're significantly behind target, consider if the target was unrealistic.

            Return a complete KPI structure matching the original format but with recalibrated targets and updated statuses.
            Preserve current values exactly as they are.
            """

            # Get recalibrated KPI suggestions from OpenAI
            recalibration_response = openai_service.generate_completion(recalibration_prompt, temperature=0.3)

            try:
                # Parse the JSON response
                recalibrated_kpis = json.loads(recalibration_response)

                if isinstance(recalibrated_kpis, dict) and all(
                        category in original_kpis for category in recalibrated_kpis.keys()):
                    # Add annotation about recalibration
                    recalibrated_kpis["_meta"] = {
                        "recalibrated_at": completion_percentage,
                        "recalibration_date": datetime.now().isoformat(),
                    }

                    return recalibrated_kpis
            except (json.JSONDecodeError, TypeError):
                print("Failed to parse AI-generated KPI recalibration, using fallback method")
        except Exception as e:
            print(f"Error generating AI-based KPI recalibration: {e}")

        # Fallback to rule-based recalibration
        recalibrated_kpis = copy.deepcopy(original_kpis)

        # Determine recalibration factor based on project stage
        if completion_percentage < 33:
            # Early stage - more aggressive recalibration
            recalibration_factor = 0.6
        elif completion_percentage < 66:
            # Mid-stage - moderate recalibration
            recalibration_factor = 0.8
        else:
            # Late stage - light recalibration
            recalibration_factor = 0.9

        # Apply recalibration to each KPI category
        for category in recalibrated_kpis:
            for kpi_name, kpi_data in recalibrated_kpis[category].items():
                if 'value' in kpi_data and 'target' in kpi_data:
                    try:
                        # Determine if this is a percentage, time, or other value
                        is_percentage = '%' in kpi_data['target']
                        has_units = ' ' in kpi_data['target'] and not is_percentage

                        # Extract current and target values
                        if is_percentage:
                            current_value = float(kpi_data['value'].rstrip('%'))
                            target_value = float(kpi_data['target'].rstrip('%'))
                            units = '%'
                        elif has_units:
                            current_value = float(kpi_data['value'].split(' ')[0])
                            target_value = float(kpi_data['target'].split(' ')[0])
                            units = ' ' + kpi_data['target'].split(' ', 1)[1]
                        else:
                            current_value = float(kpi_data['value'])
                            target_value = float(kpi_data['target'])
                            units = ''

                        # Determine if higher or lower is better
                        if kpi_name in ['cycle_time', 'lead_time', 'defect_density', 'code_churn', 'rework_ratio',
                                        'code_review_turnaround_time']:
                            # For these KPIs, lower is better
                            is_higher_better = False
                        else:
                            # For most KPIs, higher is better
                            is_higher_better = True

                        # Calculate recalibrated target
                        if is_higher_better:
                            # Calculate performance ratio
                            ratio = current_value / target_value if target_value > 0 else 1

                            if ratio > 1.2:
                                # We're exceeding target by 20%+, raise the bar
                                new_target = target_value * (1 + (ratio - 1) * recalibration_factor)
                                if is_percentage:
                                    new_target = min(new_target, 100)  # Cap at 100%
                            elif ratio < 0.8:
                                # We're more than 20% below target, adjust downward
                                new_target = target_value * (1 - (1 - ratio) * recalibration_factor)
                            else:
                                # We're close to target, maintain it
                                new_target = target_value
                        else:
                            # For lower-is-better metrics, invert the logic
                            ratio = target_value / current_value if current_value > 0 else 1

                            if ratio > 1.2:
                                # We're performing better than target by 20%+, make target more ambitious
                                new_target = target_value * (1 - (ratio - 1) * recalibration_factor)
                            elif ratio < 0.8:
                                # We're performing worse than target by 20%+, adjust target to be more achievable
                                new_target = target_value * (1 + (1 - ratio) * recalibration_factor)
                            else:
                                # We're close to target, maintain it
                                new_target = target_value

                        # Format new target with appropriate units
                        if is_percentage:
                            new_target_str = f"{new_target:.1f}%"
                        elif has_units:
                            new_target_str = f"{new_target:.1f}{units}"
                        else:
                            new_target_str = f"{new_target:.1f}"

                        # Update target
                        kpi_data['target'] = new_target_str

                        # Update status based on new target
                        if is_higher_better:
                            if current_value >= new_target * 0.9:
                                kpi_data['status'] = "On Track"
                            elif current_value >= new_target * 0.7:
                                kpi_data['status'] = "At Risk"
                            else:
                                kpi_data['status'] = "Below Target"
                        else:
                            if current_value <= new_target * 1.1:
                                kpi_data['status'] = "On Track"
                            elif current_value <= new_target * 1.3:
                                kpi_data['status'] = "At Risk"
                            else:
                                kpi_data['status'] = "Below Target"
                    except (ValueError, IndexError):
                        # If parsing fails, leave target as is
                        pass

        # Add metadata about recalibration
        recalibrated_kpis["_meta"] = {
            "recalibrated_at": completion_percentage,
            "recalibration_date": datetime.now().isoformat(),
        }

        return recalibrated_kpis