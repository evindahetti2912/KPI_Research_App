// Create a new file: frontend/src/components/kpi-management/IndividualKPITracker.jsx

import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";

const IndividualKPITracker = ({
  employeeId,
  employeeName,
  employeeKPIs,
  onUpdateProgress,
}) => {
  const [kpiProgress, setKpiProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (employeeKPIs) {
      // Initialize progress tracking state
      const initialProgress = {};

      Object.entries(employeeKPIs).forEach(([category, kpis]) => {
        initialProgress[category] = {};

        Object.keys(kpis).forEach((kpiName) => {
          // Default progress is set at 70% of the target to current value ratio
          const current = extractNumericValue(
            employeeKPIs[category][kpiName].value
          );
          const target = extractNumericValue(
            employeeKPIs[category][kpiName].target
          );

          // For KPIs where lower is better, invert the ratio
          const isLowerBetter = [
            "cycle_time",
            "lead_time",
            "defect_density",
            "code_churn",
            "rework_ratio",
            "code_review_turnaround_time",
          ].includes(kpiName);

          let progress;
          if (isLowerBetter) {
            progress = target <= current ? 0 : (target - current) / target;
          } else {
            progress = target <= 0 ? 0 : current / target;
          }

          initialProgress[category][kpiName] = {
            current,
            progress: Math.min(1, progress),
          };
        });
      });

      setKpiProgress(initialProgress);

      // Set first category as active by default
      if (Object.keys(employeeKPIs).length > 0 && !activeCategory) {
        setActiveCategory(Object.keys(employeeKPIs)[0]);
      }
    }
  }, [employeeKPIs]);

  const handleProgressChange = (category, kpiName, value) => {
    setKpiProgress((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [kpiName]: {
          ...prev[category][kpiName],
          progress: value,
        },
      },
    }));
  };

  const handleUpdateProgress = () => {
    if (onUpdateProgress) {
      setIsLoading(true);

      // Format data for API
      const progressData = {};
      Object.entries(kpiProgress).forEach(([category, kpis]) => {
        progressData[category] = {};

        Object.entries(kpis).forEach(([kpiName, data]) => {
          progressData[category][kpiName] = data.progress;
        });
      });

      // Call the update function with formatted data
      onUpdateProgress(employeeId, progressData).finally(() => {
        setIsLoading(false);
      });
    }
  };

  // Helper function to extract numeric value from string
  const extractNumericValue = (value) => {
    if (!value) return 0;
    const match = value.toString().match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  if (!employeeKPIs || Object.keys(employeeKPIs).length === 0) {
    return (
      <Card title={`KPI Progress for ${employeeName || "Employee"}`}>
        <div className="py-8 text-center">
          <p className="text-gray-500">
            No KPI data available for this employee.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`KPI Progress for ${employeeName || "Employee"}`}>
      <div className="space-y-6">
        <p className="text-gray-600">
          Track progress against individual KPI targets for this team member.
        </p>

        {/* Category tabs */}
        <div className="flex pb-2 overflow-x-auto border-b">
          {Object.keys(employeeKPIs).map((category) => (
            <button
              key={category}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeCategory === category
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category.charAt(0).toUpperCase() +
                category.slice(1).replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* KPI progress tracking */}
        {activeCategory && (
          <div className="space-y-4">
            {Object.entries(employeeKPIs[activeCategory]).map(
              ([kpiName, kpiData]) => {
                const progress =
                  kpiProgress[activeCategory]?.[kpiName]?.progress || 0;

                return (
                  <div key={kpiName} className="p-4 border rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700 capitalize">
                        {kpiName.replace(/_/g, " ")}
                      </h4>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-500">
                          Target: {kpiData.target}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            progress >= 0.9
                              ? "bg-green-100 text-green-800"
                              : progress >= 0.7
                              ? "bg-yellow-100 text-yellow-800"
                              : progress >= 0.5
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {Math.round(progress * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar and slider */}
                    <div className="mb-2">
                      <div className="w-full h-3 bg-gray-200 rounded-full">
                        <div
                          className={`h-3 rounded-full ${
                            progress >= 0.9
                              ? "bg-green-500"
                              : progress >= 0.7
                              ? "bg-yellow-500"
                              : progress >= 0.5
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${progress * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="mr-2 text-xs text-gray-500">0%</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={progress}
                        onChange={(e) =>
                          handleProgressChange(
                            activeCategory,
                            kpiName,
                            parseFloat(e.target.value)
                          )
                        }
                        className="flex-grow h-2 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-500">100%</span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Current: {kpiData.value}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* Update button */}
        <div className="flex justify-end">
          <Button onClick={handleUpdateProgress} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Progress"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default IndividualKPITracker;