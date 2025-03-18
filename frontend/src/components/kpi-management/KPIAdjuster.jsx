import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { kpiService } from "../../services/kpiService";

const KPIAdjuster = ({ projectId, kpis, onKPIsAdjusted }) => {
  const [adjustedKPIs, setAdjustedKPIs] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState("");
  const [projectProgress, setProjectProgress] = useState({
    actual_velocity: "",
    actual_cycle_time: "",
    defect_rate: "",
    test_coverage: "",
  });

  // Initialize with current KPIs
  useEffect(() => {
    if (kpis) {
      setAdjustedKPIs(JSON.parse(JSON.stringify(kpis)));
    }
  }, [kpis]);

  const handleProgressChange = (e) => {
    const { name, value } = e.target;
    setProjectProgress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdjustKPIs = async () => {
    // Validate form data
    if (
      !projectProgress.actual_velocity ||
      !projectProgress.actual_cycle_time
    ) {
      setError("Velocity and Cycle Time are required for KPI adjustment");
      return;
    }

    setIsAdjusting(true);
    setError("");

    try {
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
      };

      const response = await kpiService.adjustKPIs(projectId, {
        project_progress: progressData,
      });

      if (response.success) {
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

  useEffect(() => {
    // Pre-populate form with current values if available
    if (kpis?.productivity?.velocity?.value) {
      setProjectProgress((prev) => ({
        ...prev,
        actual_velocity: extractNumericValue(kpis.productivity.velocity.value),
      }));
    }

    if (kpis?.productivity?.cycle_time?.value) {
      setProjectProgress((prev) => ({
        ...prev,
        actual_cycle_time: extractNumericValue(
          kpis.productivity.cycle_time.value
        ),
      }));
    }

    if (kpis?.code_quality?.defect_density?.value) {
      setProjectProgress((prev) => ({
        ...prev,
        defect_rate: extractNumericValue(
          kpis.code_quality.defect_density.value
        ),
      }));
    }

    if (kpis?.code_quality?.test_coverage?.value) {
      setProjectProgress((prev) => ({
        ...prev,
        test_coverage: extractNumericValue(
          kpis.code_quality.test_coverage.value
        ),
      }));
    }
  }, [kpis]);

  return (
    <Card
      title="Adjust KPIs"
      subtitle="Update KPIs based on actual project progress"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="actual_velocity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Actual Sprint Velocity
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="actual_velocity"
                name="actual_velocity"
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 20"
                value={projectProgress.actual_velocity}
                onChange={handleProgressChange}
                min="0"
                step="0.1"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">story points</span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="actual_cycle_time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Actual Cycle Time
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="actual_cycle_time"
                name="actual_cycle_time"
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 6"
                value={projectProgress.actual_cycle_time}
                onChange={handleProgressChange}
                min="0"
                step="0.1"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">hours</span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="defect_rate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Defect Density
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="defect_rate"
                name="defect_rate"
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 1.5"
                value={projectProgress.defect_rate}
                onChange={handleProgressChange}
                min="0"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">per 1,000 LOC</span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="test_coverage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Test Coverage
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="test_coverage"
                name="test_coverage"
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 80"
                value={projectProgress.test_coverage}
                onChange={handleProgressChange}
                min="0"
                max="100"
                step="0.1"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleAdjustKPIs}
            disabled={isAdjusting}
            icon={
              isAdjusting ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  className="h-4 w-4 mr-1"
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
            {isAdjusting ? "Adjusting..." : "Adjust KPIs"}
          </Button>
        </div>

        {isAdjusting && (
          <div className="mt-4">
            <Loading text="Adjusting KPIs based on project progress..." />
          </div>
        )}
      </div>
    </Card>
  );
};

export default KPIAdjuster;
