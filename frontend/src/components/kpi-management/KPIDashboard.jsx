import React, { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";

const KPIDashboard = ({ kpis, onAdjustKPIs }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    productivity: true,
    code_quality: true,
    collaboration: true,
    adaptability: true,
  });

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "On Track":
        return "bg-green-100 text-green-800";
      case "At Risk":
        return "bg-yellow-100 text-yellow-800";
      case "Below Target":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to render KPI item
  const renderKPIItem = (kpiName, kpiData) => {
    return (
      <div key={kpiName} className="border rounded-md overflow-hidden mb-4">
        <div className="bg-gray-50 p-3 flex flex-wrap justify-between items-center">
          <h4 className="font-medium text-gray-700 capitalize">
            {kpiName.replace(/_/g, " ")}
          </h4>
          <span
            className={`text-xs px-2.5 py-0.5 rounded ${getStatusColor(
              kpiData.status
            )}`}
          >
            {kpiData.status}
          </span>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Current Value:{" "}
              </span>
              <span className="text-sm text-gray-600">{kpiData.value}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">
                Target:{" "}
              </span>
              <span className="text-sm text-gray-600">{kpiData.target}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to render KPI category
  const renderKPICategory = (category, categoryData) => {
    if (!categoryData) return null;

    const isExpanded = expandedCategories[category] || false;
    let categoryTitle;
    let categoryIcon;

    switch (category) {
      case "productivity":
        categoryTitle = "Productivity & Agile Performance";
        categoryIcon = (
          <svg
            className="h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
        break;
      case "code_quality":
        categoryTitle = "Code Quality & Efficiency";
        categoryIcon = (
          <svg
            className="h-5 w-5 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        );
        break;
      case "collaboration":
        categoryTitle = "Collaboration & Communication";
        categoryIcon = (
          <svg
            className="h-5 w-5 text-purple-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
        break;
      case "adaptability":
        categoryTitle = "Adaptability & Continuous Improvement";
        categoryIcon = (
          <svg
            className="h-5 w-5 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
        break;
      default:
        categoryTitle =
          category.charAt(0).toUpperCase() +
          category.slice(1).replace(/_/g, " ");
        categoryIcon = (
          <svg
            className="h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        );
    }

    // Calculate status counts
    const statuses = Object.values(categoryData).map((kpi) => kpi.status);
    const onTrackCount = statuses.filter(
      (status) => status === "On Track"
    ).length;
    const atRiskCount = statuses.filter(
      (status) => status === "At Risk"
    ).length;
    const belowTargetCount = statuses.filter(
      (status) => status === "Below Target"
    ).length;

    return (
      <div className="mb-6 border rounded-lg overflow-hidden">
        <div
          className="bg-white p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 shadow-sm"
          onClick={() => toggleCategory(category)}
        >
          <div className="flex items-center">
            <span className="mr-3">{categoryIcon}</span>
            <h3 className="font-medium text-gray-800">{categoryTitle}</h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              {onTrackCount > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded">
                  {onTrackCount} On Track
                </span>
              )}
              {atRiskCount > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded">
                  {atRiskCount} At Risk
                </span>
              )}
              {belowTargetCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded">
                  {belowTargetCount} Below Target
                </span>
              )}
            </div>

            <button className="text-gray-400 focus:outline-none">
              {isExpanded ? (
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 bg-gray-50">
            {Object.entries(categoryData).map(([kpiName, kpiData]) =>
              renderKPIItem(kpiName, kpiData)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!kpis) {
    return (
      <Card title="KPI Dashboard">
        <div className="py-8 text-center">
          <p className="text-gray-500">
            No KPIs available. Generate KPIs first.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6 bg-white shadow rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">KPI Dashboard</h2>
            <p className="text-gray-600">
              Key Performance Indicators for your project
            </p>
          </div>

          {onAdjustKPIs && (
            <Button
              variant="outline"
              onClick={onAdjustKPIs}
              icon={
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
              }
            >
              Adjust KPIs
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-blue-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-sm font-medium text-blue-800">
                Productivity
              </h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-900">
              {Object.keys(kpis.productivity || {}).length}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-green-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <h3 className="text-sm font-medium text-green-800">
                Code Quality
              </h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-900">
              {Object.keys(kpis.code_quality || {}).length}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-purple-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-sm font-medium text-purple-800">
                Collaboration
              </h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-purple-900">
              {Object.keys(kpis.collaboration || {}).length}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-indigo-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <h3 className="text-sm font-medium text-indigo-800">
                Adaptability
              </h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-indigo-900">
              {Object.keys(kpis.adaptability || {}).length}
            </p>
          </div>
        </div>

        {Object.entries(kpis).map(([category, categoryData]) =>
          renderKPICategory(category, categoryData)
        )}

        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              // Expand or collapse all categories
              const allExpanded = Object.values(expandedCategories).every(
                (v) => v
              );
              const newState = !allExpanded;

              const categories = { ...expandedCategories };
              Object.keys(categories).forEach((key) => {
                categories[key] = newState;
              });

              setExpandedCategories(categories);
            }}
          >
            {Object.values(expandedCategories).every((v) => v)
              ? "Collapse All"
              : "Expand All"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KPIDashboard;
