import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";

const KPIProgressTracker = ({ projectId, kpis, sprintData }) => {
  const [selectedSprint, setSelectedSprint] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [progressData, setProgressData] = useState({});
  const [showDetail, setShowDetail] = useState(false);

  // Mock sprint data if not provided
  const sprints =
    sprintData ||
    Array.from({ length: 5 }, (_, i) => ({
      number: i + 1,
      status: i < 2 ? "completed" : i < 3 ? "in-progress" : "planned",
    }));

  useEffect(() => {
    if (kpis) {
      generateProgressData();
    }
  }, [kpis, selectedSprint]);

  const generateProgressData = () => {
    setIsLoading(true);

    // This would normally come from an API call
    // Here we're generating mock data for demonstration
    setTimeout(() => {
      const data = {};

      // Generate progress data for each KPI category
      Object.keys(kpis).forEach((category) => {
        data[category] = {};

        Object.keys(kpis[category]).forEach((kpiName) => {
          const baseValue = extractNumericValue(kpis[category][kpiName].value);
          const targetValue = extractNumericValue(
            kpis[category][kpiName].target
          );
          const isHigherBetter = ![
            "cycle_time",
            "lead_time",
            "defect_density",
            "code_churn",
            "rework_ratio",
            "code_review_turnaround_time",
          ].includes(kpiName);

          // Generate sprint progress data
          const sprintProgress = [];
          for (let i = 1; i <= sprints.length; i++) {
            let progressValue;
            if (i < selectedSprint) {
              // Past sprints - random variation around target
              if (isHigherBetter) {
                progressValue =
                  targetValue *
                  (0.8 + (i / sprints.length) * 0.4) *
                  (0.9 + Math.random() * 0.2);
              } else {
                progressValue =
                  targetValue *
                  (1.2 - (i / sprints.length) * 0.4) *
                  (0.9 + Math.random() * 0.2);
              }
            } else if (i === selectedSprint) {
              // Current sprint - closer to actual
              progressValue = baseValue * (0.9 + Math.random() * 0.2);
            } else {
              // Future sprints - prediction trending toward target
              if (isHigherBetter) {
                progressValue =
                  baseValue +
                  (targetValue - baseValue) *
                    ((i - selectedSprint) /
                      (sprints.length - selectedSprint + 1));
              } else {
                progressValue =
                  baseValue -
                  (baseValue - targetValue) *
                    ((i - selectedSprint) /
                      (sprints.length - selectedSprint + 1));
              }
            }

            sprintProgress.push({
              sprint: i,
              value: Math.round(progressValue * 100) / 100,
              status:
                i < selectedSprint
                  ? "actual"
                  : i === selectedSprint
                  ? "current"
                  : "projected",
            });
          }

          data[category][kpiName] = {
            current: baseValue,
            target: targetValue,
            progress: sprintProgress,
            trend: calculateTrend(sprintProgress, isHigherBetter),
            isHigherBetter: isHigherBetter,
          };
        });
      });

      setProgressData(data);
      setIsLoading(false);
    }, 1000);
  };

  const calculateTrend = (progressData, isHigherBetter) => {
    if (progressData.length < 2) return "steady";

    const recentValues = progressData
      .filter((p) => p.status === "actual" || p.status === "current")
      .map((p) => p.value);

    if (recentValues.length < 2) return "steady";

    const latest = recentValues[recentValues.length - 1];
    const previous = recentValues[recentValues.length - 2];

    const difference = latest - previous;
    const percentChange = Math.abs(difference / previous) * 100;

    if (percentChange < 2) return "steady";

    if (isHigherBetter) {
      return difference > 0 ? "improving" : "declining";
    } else {
      return difference < 0 ? "improving" : "declining";
    }
  };

  const getTrendIcon = (trend, isHigherBetter) => {
    if (trend === "steady") {
      return (
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 12h14"
          ></path>
        </svg>
      );
    } else if (trend === "improving") {
      return (
        <svg
          className="w-4 h-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          ></path>
        </svg>
      );
    } else {
      return (
        <svg
          className="w-4 h-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          ></path>
        </svg>
      );
    }
  };

  const extractNumericValue = (value) => {
    if (!value) return 0;
    const match = value.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const getProgressPercentage = (kpiData) => {
    if (!kpiData) return 0;

    const { current, target, isHigherBetter } = kpiData;

    if (isHigherBetter) {
      // For metrics where higher is better
      if (current >= target) return 100;
      if (current <= 0 || target <= 0) return 0;
      return Math.min(100, Math.round((current / target) * 100));
    } else {
      // For metrics where lower is better
      if (current <= target) return 100;
      if (current <= 0 || target <= 0) return 0;
      return Math.min(100, Math.round((target / current) * 100));
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const renderProgressChart = (kpiData) => {
    if (!kpiData || !kpiData.progress) return null;

    const { progress, isHigherBetter } = kpiData;
    const maxValue = Math.max(...progress.map((p) => p.value)) * 1.1;
    const minValue = Math.min(...progress.map((p) => p.value)) * 0.9;
    const range = maxValue - minValue;

    return (
      <div className="h-16 mt-2">
        <div className="relative w-full h-full">
          {/* Axis */}
          <div className="absolute bottom-0 w-full h-px bg-gray-300"></div>

          {/* Target line */}
          <div
            className="absolute w-full h-px bg-blue-500 border-t border-blue-500 border-dashed"
            style={{
              bottom: `${((kpiData.target - minValue) / range) * 100}%`,
            }}
          ></div>

          {/* Data points */}
          {progress.map((point, index) => {
            const xPos = `${(index / (progress.length - 1)) * 100}%`;
            const yPos = `${((point.value - minValue) / range) * 100}%`;

            return (
              <div
                key={index}
                className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                  point.status === "actual"
                    ? "bg-green-500"
                    : point.status === "current"
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                }`}
                style={{ left: xPos, bottom: yPos }}
              ></div>
            );
          })}

          {/* Connect points with lines */}
          <svg className="absolute inset-0 w-full h-full">
            <polyline
              points={progress
                .map((point, index) => {
                  const x = (index / (progress.length - 1)) * 100;
                  const y = 100 - ((point.value - minValue) / range) * 100;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    );
  };

  const renderKPICategory = (category, categoryData) => {
    if (!categoryData) return null;

    return (
      <div className="mt-4">
        <h3 className="mb-2 font-medium capitalize text-md">
          {category.replace("_", " ")}
        </h3>
        <div className="space-y-4">
          {Object.entries(categoryData).map(([kpiName, kpiData]) => {
            const progressPercentage = getProgressPercentage(kpiData);

            return (
              <div key={kpiName} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium capitalize">
                    {kpiName.replace(/_/g, " ")}
                  </h4>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(kpiData.trend, kpiData.isHigherBetter)}
                    <span className="text-xs">
                      {kpiData.current} / {kpiData.target}
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${getProgressBarColor(
                      progressPercentage
                    )}`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>

                {showDetail && renderProgressChart(kpiData)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!kpis) {
    return (
      <Card title="KPI Progress Tracker">
        <div className="py-8 text-center">
          <p className="text-gray-500">No KPIs available for tracking.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="KPI Progress Tracker">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label
              htmlFor="sprint-select"
              className="text-sm font-medium text-gray-700"
            >
              Sprint:
            </label>
            <select
              id="sprint-select"
              className="py-1 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(parseInt(e.target.value))}
            >
              {sprints.map((sprint) => (
                <option key={sprint.number} value={sprint.number}>
                  Sprint {sprint.number}{" "}
                  {sprint.status === "in-progress" ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setShowDetail(!showDetail)}
            >
              {showDetail ? "Hide Details" : "Show Details"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8">
            <Loading text="Loading KPI progress data..." />
          </div>
        ) : (
          <div>
            {/* Sprint summary */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
              <div className="p-3 rounded-md bg-blue-50">
                <h4 className="text-xs font-medium text-blue-800">
                  Sprint Progress
                </h4>
                <p className="mt-1 text-lg font-bold">
                  {Math.round((selectedSprint / sprints.length) * 100)}%
                </p>
                <div className="w-full h-1.5 mt-1 bg-gray-200 rounded-full">
                  <div
                    className="h-1.5 bg-blue-500 rounded-full"
                    style={{
                      width: `${(selectedSprint / sprints.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-green-50">
                <h4 className="text-xs font-medium text-green-800">
                  On Track KPIs
                </h4>
                <p className="mt-1 text-lg font-bold">
                  {Object.values(progressData).reduce((count, category) => {
                    return (
                      count +
                      Object.values(category).filter((kpi) => {
                        const percentage = getProgressPercentage(kpi);
                        return percentage >= 90;
                      }).length
                    );
                  }, 0)}
                </p>
              </div>
              <div className="p-3 rounded-md bg-yellow-50">
                <h4 className="text-xs font-medium text-yellow-800">
                  At Risk KPIs
                </h4>
                <p className="mt-1 text-lg font-bold">
                  {Object.values(progressData).reduce((count, category) => {
                    return (
                      count +
                      Object.values(category).filter((kpi) => {
                        const percentage = getProgressPercentage(kpi);
                        return percentage >= 50 && percentage < 90;
                      }).length
                    );
                  }, 0)}
                </p>
              </div>

              <div className="p-3 rounded-md bg-red-50">
                <h4 className="text-xs font-medium text-red-800">
                  Below Target KPIs
                </h4>
                <p className="mt-1 text-lg font-bold">
                  {Object.values(progressData).reduce((count, category) => {
                    return (
                      count +
                      Object.values(category).filter((kpi) => {
                        const percentage = getProgressPercentage(kpi);
                        return percentage < 50;
                      }).length
                    );
                  }, 0)}
                </p>
              </div>
            </div>

            {/* KPI categories */}
            {Object.entries(progressData).map(([category, categoryData]) =>
              renderKPICategory(category, categoryData)
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default KPIProgressTracker;