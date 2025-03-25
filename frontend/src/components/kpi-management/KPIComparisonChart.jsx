// Create a new file: frontend/src/components/kpi-management/KPIComparisonChart.jsx

import React from "react";
import Card from "../common/Card";

const KPIComparisonChart = ({ projectKPIs, employeeKPIs, employeeName }) => {
  if (!projectKPIs || !employeeKPIs) {
    return (
      <Card title="KPI Comparison">
        <div className="py-8 text-center">
          <p className="text-gray-500">No KPI data available for comparison.</p>
        </div>
      </Card>
    );
  }

  // Prepare data for comparison
  const comparisonData = {};

  // Function to extract numeric value from KPI string
  const extractNumericValue = (kpiString) => {
    if (!kpiString) return 0;
    const match = kpiString.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Process KPIs for comparison
  Object.keys(projectKPIs).forEach((category) => {
    if (employeeKPIs[category]) {
      comparisonData[category] = {};

      Object.keys(projectKPIs[category]).forEach((kpiName) => {
        if (employeeKPIs[category][kpiName]) {
          const projectValue = extractNumericValue(
            projectKPIs[category][kpiName].value
          );
          const projectTarget = extractNumericValue(
            projectKPIs[category][kpiName].target
          );
          const employeeValue = extractNumericValue(
            employeeKPIs[category][kpiName].value
          );
          const employeeTarget = extractNumericValue(
            employeeKPIs[category][kpiName].target
          );

          comparisonData[category][kpiName] = {
            projectValue,
            projectTarget,
            employeeValue,
            employeeTarget,
            // Determine if higher is better based on common KPIs
            isHigherBetter: ![
              "cycle_time",
              "lead_time",
              "defect_density",
              "code_churn",
              "rework_ratio",
              "code_review_turnaround_time",
            ].includes(kpiName),
          };
        }
      });
    }
  });

  return (
    <Card
      title="KPI Comparison"
      subtitle={
        employeeName
          ? `Project vs ${employeeName}'s KPIs`
          : "Project vs Individual KPIs"
      }
    >
      <div className="space-y-6">
        <p className="text-gray-600">
          This chart compares the project-level KPIs with the specialized KPIs
          for this team member.
        </p>

        {Object.entries(comparisonData).map(([category, kpis]) => (
          <div key={category} className="mt-6">
            <h3 className="mb-3 font-medium text-gray-800 capitalize">
              {category.replace(/_/g, " ")}
            </h3>

            <div className="space-y-4">
              {Object.entries(kpis).map(([kpiName, data]) => (
                <div key={kpiName} className="p-4 border rounded-md">
                  <h4 className="mb-3 text-sm font-medium text-gray-700 capitalize">
                    {kpiName.replace(/_/g, " ")}
                  </h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Project KPI */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          Project KPI:
                        </span>
                        <span className="text-xs font-medium">
                          {projectKPIs[category][kpiName].value} /{" "}
                          {projectKPIs[category][kpiName].target}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(
                            data.projectValue,
                            data.projectTarget,
                            data.isHigherBetter
                          )}`}
                          style={{
                            width: `${getPercentage(
                              data.projectValue,
                              data.projectTarget,
                              data.isHigherBetter
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Employee KPI */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          Individual KPI:
                        </span>
                        <span className="text-xs font-medium">
                          {employeeKPIs[category][kpiName].value} /{" "}
                          {employeeKPIs[category][kpiName].target}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(
                            data.employeeValue,
                            data.employeeTarget,
                            data.isHigherBetter
                          )}`}
                          style={{
                            width: `${getPercentage(
                              data.employeeValue,
                              data.employeeTarget,
                              data.isHigherBetter
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Show difference */}
                  <div className="mt-3 text-xs text-gray-600">
                    {diffDescription(
                      data.projectTarget,
                      data.employeeTarget,
                      kpiName,
                      data.isHigherBetter
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Helper functions
function getPercentage(value, target, isHigherBetter) {
  if (isHigherBetter) {
    // For metrics where higher is better
    return Math.min(100, (value / target) * 100);
  } else {
    // For metrics where lower is better
    if (value <= target) return 100;
    if (value <= 0 || target <= 0) return 0;
    return Math.min(100, (target / value) * 100);
  }
}

function getProgressColor(value, target, isHigherBetter) {
  const percentage = getPercentage(value, target, isHigherBetter);

  if (percentage >= 90) return "bg-green-500";
  if (percentage >= 75) return "bg-yellow-500";
  if (percentage >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function diffDescription(
  projectTarget,
  employeeTarget,
  kpiName,
  isHigherBetter
) {
  const diff = employeeTarget - projectTarget;
  const percentDiff = (diff / projectTarget) * 100;

  if (Math.abs(percentDiff) < 5) {
    return "Individual target is similar to project target.";
  }

  if (isHigherBetter) {
    if (diff > 0) {
      return `Individual target is ${Math.abs(percentDiff).toFixed(
        1
      )}% higher, reflecting higher expectations.`;
    } else {
      return `Individual target is ${Math.abs(percentDiff).toFixed(
        1
      )}% lower, accounting for role-specific factors.`;
    }
  } else {
    if (diff > 0) {
      return `Individual target allows for ${Math.abs(percentDiff).toFixed(
        1
      )}% more ${kpiName.replace(/_/g, " ")}, reflecting role complexity.`;
    } else {
      return `Individual target is ${Math.abs(percentDiff).toFixed(
        1
      )}% lower, setting higher expectations.`;
    }
  }
}

export default KPIComparisonChart;
