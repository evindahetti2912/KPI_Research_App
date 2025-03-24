import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { kpiService } from "../../services/kpiService";

const KPIAdjuster = ({ projectId, kpis, onKPIsAdjusted }) => {
  const [adjustedKPIs, setAdjustedKPIs] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [adjustmentMode, setAdjustmentMode] = useState("progress"); // "progress" or "changes"
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [projectProgress, setProjectProgress] = useState({
    actual_velocity: "",
    actual_cycle_time: "",
    defect_rate: "",
    test_coverage: "",
    code_review_time: "",
    feedback_implementation_rate: "",
    completion_percentage: "",
  });
  const [teamPerformance, setTeamPerformance] = useState({
    velocity_trend: "stable",
    quality_trend: "stable",
    collaboration_trend: "stable",
  });
  const [projectChanges, setProjectChanges] = useState({
    project_team_size: "",
    project_timeline: "",
    project_sprints: "",
    project_languages: "",
  });

  // Initialize with current KPIs
  useEffect(() => {
    if (kpis) {
      setAdjustedKPIs(JSON.parse(JSON.stringify(kpis)));

      // Pre-populate from existing KPI values
      const initialProgress = {
        actual_velocity: extractNumericValue(
          kpis.productivity?.velocity?.value
        ),
        actual_cycle_time: extractNumericValue(
          kpis.productivity?.cycle_time?.value
        ),
        defect_rate: extractNumericValue(
          kpis.code_quality?.defect_density?.value
        ),
        test_coverage: extractNumericValue(
          kpis.code_quality?.test_coverage?.value
        ),
        code_review_time: extractNumericValue(
          kpis.collaboration?.code_review_turnaround_time?.value
        ),
        feedback_implementation_rate: extractNumericValue(
          kpis.adaptability?.feedback_implementation_rate?.value
        ),
        completion_percentage: "25", // Default assumption
      };

      setProjectProgress(initialProgress);
    }
  }, [kpis]);

  const handleProgressChange = (e) => {
    const { name, value } = e.target;
    setProjectProgress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamPerformanceChange = (e) => {
    const { name, value } = e.target;
    setTeamPerformance((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectChangesChange = (e) => {
    const { name, value } = e.target;
    setProjectChanges((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdjustKPIs = async () => {
    if (adjustmentMode === "progress") {
      // Validate form data for progress-based adjustment
      if (
        !projectProgress.actual_velocity ||
        !projectProgress.actual_cycle_time
      ) {
        setError("Velocity and Cycle Time are required for KPI adjustment");
        return;
      }

      if (!projectProgress.completion_percentage) {
        setError("Project completion percentage is required");
        return;
      }
    } else {
      // Validate form data for changes-based adjustment
      if (!Object.values(projectChanges).some((val) => val)) {
        setError("At least one project parameter must be changed");
        return;
      }
    }

    setIsAdjusting(true);
    setError("");
    setSuccess(false);

    try {
      let response;

      if (adjustmentMode === "progress") {
        // Convert input values to numbers
        const progressData = {
          actual_velocity: parseFloat(projectProgress.actual_velocity),
          actual_cycle_time: parseFloat(projectProgress.actual_cycle_time),
          defect_rate: projectProgress.defect_rate
            ? parseFloat(projectProgress.defect_rate)
            : undefined,
          test_coverage: projectProgress.test_coverage
            ? parseFloat(projectProgress.test_coverage)
            : undefined,
          code_review_time: projectProgress.code_review_time
            ? parseFloat(projectProgress.code_review_time)
            : undefined,
          feedback_implementation_rate:
            projectProgress.feedback_implementation_rate
              ? parseFloat(projectProgress.feedback_implementation_rate)
              : undefined,
          completion_percentage: parseFloat(
            projectProgress.completion_percentage
          ),
        };

        response = await kpiService.adjustKPIs(projectId, {
          project_progress: progressData,
          team_performance: showAdvanced ? teamPerformance : undefined,
        });
      } else {
        // Prepare project changes data
        const changesData = {};

        Object.entries(projectChanges).forEach(([key, value]) => {
          if (value) {
            if (key === "project_languages") {
              changesData[key] = value.split(",").map((l) => l.trim());
            } else if (
              [
                "project_team_size",
                "project_timeline",
                "project_sprints",
              ].includes(key)
            ) {
              changesData[key] = parseInt(value);
            } else {
              changesData[key] = value;
            }
          }
        });

        response = await kpiService.adjustKPIsForChanges(
          projectId,
          changesData
        );
      }

      if (response.success) {
        setSuccess(true);
        setAdjustedKPIs(response.data.adjusted_kpis);
        if (onKPIsAdjusted) {
          onKPIsAdjusted(response.data.adjusted_kpis);
        }
      } else {
        setError(response.message || "Failed to adjust KPIs");
      }
    } catch (error) {
      console.error("Error adjusting KPIs:", error);
      setError("An error occurred while adjusting KPIs. Please try again.");
    } finally {
      setIsAdjusting(false);
    }
  };

  // Helper function to extract numeric value from KPI string
  const extractNumericValue = (kpiString) => {
    if (!kpiString) return "";
    const match = kpiString.match(/(\d+(\.\d+)?)/);
    return match ? match[0] : "";
  };

  const renderProgressBasedAdjustment = () => {
    return (
      <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-800">
              Project Status
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="completion_percentage"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Project Completion (%)
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="completion_percentage"
                    name="completion_percentage"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 25"
                    value={projectProgress.completion_percentage}
                    onChange={handleProgressChange}
                    min="0"
                    max="100"
                    step="1"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-800">
              Productivity Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="actual_velocity"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Sprint Velocity
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="actual_velocity"
                    name="actual_velocity"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 20"
                    value={projectProgress.actual_velocity}
                    onChange={handleProgressChange}
                    min="0"
                    step="0.1"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      story points
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="actual_cycle_time"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Cycle Time
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="actual_cycle_time"
                    name="actual_cycle_time"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 6"
                    value={projectProgress.actual_cycle_time}
                    onChange={handleProgressChange}
                    min="0"
                    step="0.1"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-800">
              Code Quality Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="defect_rate"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Defect Density
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="defect_rate"
                    name="defect_rate"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 1.5"
                    value={projectProgress.defect_rate}
                    onChange={handleProgressChange}
                    min="0"
                    step="0.1"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      per 1,000 LOC
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="test_coverage"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Test Coverage
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="test_coverage"
                    name="test_coverage"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 80"
                    value={projectProgress.test_coverage}
                    onChange={handleProgressChange}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-800">
              Collaboration Metrics
            </h3>
            <div>
              <label
                htmlFor="code_review_time"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Code Review Turnaround
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  id="code_review_time"
                  name="code_review_time"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 24"
                  value={projectProgress.code_review_time}
                  onChange={handleProgressChange}
                  min="0"
                  step="0.5"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">hours</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-800">
              Adaptability Metrics
            </h3>
            <div>
              <label
                htmlFor="feedback_implementation_rate"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Feedback Implementation Rate
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  id="feedback_implementation_rate"
                  name="feedback_implementation_rate"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 85"
                  value={projectProgress.feedback_implementation_rate}
                  onChange={handleProgressChange}
                  min="0"
                  max="100"
                  step="1"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? (
              <svg
                className="w-4 h-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {showAdvanced
              ? "Hide Team Performance Trends"
              : "Include Team Performance Trends"}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="velocity_trend"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Velocity Trend
              </label>
              <select
                id="velocity_trend"
                name="velocity_trend"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={teamPerformance.velocity_trend}
                onChange={handleTeamPerformanceChange}
              >
                <option value="improving">Improving</option>
                <option value="stable">Stable</option>
                <option value="declining">Declining</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quality_trend"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Quality Trend
              </label>
              <select
                id="quality_trend"
                name="quality_trend"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={teamPerformance.quality_trend}
                onChange={handleTeamPerformanceChange}
              >
                <option value="improving">Improving</option>
                <option value="stable">Stable</option>
                <option value="declining">Declining</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="collaboration_trend"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Collaboration Trend
              </label>
              <select
                id="collaboration_trend"
                name="collaboration_trend"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={teamPerformance.collaboration_trend}
                onChange={handleTeamPerformanceChange}
              >
                <option value="improving">Improving</option>
                <option value="stable">Stable</option>
                <option value="declining">Declining</option>
              </select>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderChangesBasedAdjustment = () => {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="project_team_size"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Updated Team Size
          </label>
          <input
            type="number"
            id="project_team_size"
            name="project_team_size"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter new team size"
            value={projectChanges.project_team_size}
            onChange={handleProjectChangesChange}
            min="1"
          />
        </div>

        <div>
          <label
            htmlFor="project_timeline"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Updated Timeline (days)
          </label>
          <input
            type="number"
            id="project_timeline"
            name="project_timeline"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter new timeline"
            value={projectChanges.project_timeline}
            onChange={handleProjectChangesChange}
            min="1"
          />
        </div>

        <div>
          <label
            htmlFor="project_sprints"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Updated Sprint Count
          </label>
          <input
            type="number"
            id="project_sprints"
            name="project_sprints"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter new sprint count"
            value={projectChanges.project_sprints}
            onChange={handleProjectChangesChange}
            min="1"
          />
        </div>

        <div>
          <label
            htmlFor="project_languages"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Updated Technologies
          </label>
          <input
            type="text"
            id="project_languages"
            name="project_languages"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. React, Node.js, Python"
            value={projectChanges.project_languages}
            onChange={handleProjectChangesChange}
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple technologies with commas
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card
      title="Adjust KPIs"
      subtitle="Update KPIs based on actual project progress or changes"
    >
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Adjustment Mode</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="adjustmentMode"
                value="progress"
                checked={adjustmentMode === "progress"}
                onChange={() => setAdjustmentMode("progress")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Based on Project Progress
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="adjustmentMode"
                value="changes"
                checked={adjustmentMode === "changes"}
                onChange={() => setAdjustmentMode("changes")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Based on Project Changes
              </span>
            </label>
          </div>

          <p className="text-sm text-gray-500">
            {adjustmentMode === "progress"
              ? "Adjust KPIs based on actual project metrics and team performance."
              : "Adjust KPIs due to changes in project parameters like team size or timeline."}
          </p>
        </div>

        {adjustmentMode === "progress"
          ? renderProgressBasedAdjustment()
          : renderChangesBasedAdjustment()}

        {error && (
          <div className="p-3 text-red-700 rounded-md bg-red-50">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 text-green-700 rounded-md bg-green-50">
            <p>
              KPIs have been successfully adjusted based on your project's
              {adjustmentMode === "progress"
                ? " actual progress!"
                : " updated parameters!"}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleAdjustKPIs}
            disabled={isAdjusting}
            icon={
              isAdjusting ? (
                <svg
                  className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              )
            }
          >
            {isAdjusting ? "Adjusting..." : "Update KPIs"}
          </Button>
        </div>

        {isAdjusting && (
          <div className="mt-4">
            <Loading text="Adjusting KPIs based on your inputs..." />
          </div>
        )}
      </div>
    </Card>
  );
};

export default KPIAdjuster;
