import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";

const KPIDashboard = ({ kpis, onAdjustKPIs }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    productivity: true,
    code_quality: true,
    collaboration: true,
    adaptability: true,
  });
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    if (kpis) {
      calculateCategoryStats();
    }
  }, [kpis]);

  const calculateCategoryStats = () => {
    const stats = {};

    Object.entries(kpis).forEach(([category, kpiItems]) => {
      const statuses = Object.values(kpiItems).map((item) => item.status);

      stats[category] = {
        total: statuses.length,
        onTrack: statuses.filter((s) => s === "On Track").length,
        atRisk: statuses.filter((s) => s === "At Risk").length,
        belowTarget: statuses.filter((s) => s === "Below Target").length,
        score:
          (statuses.filter((s) => s === "On Track").length / statuses.length) *
          100,
      };
    });

    setCategoryStats(stats);
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleAllCategories = (expand) => {
    const newState = {};
    Object.keys(expandedCategories).forEach((key) => {
      newState[key] = expand;
    });
    setExpandedCategories(newState);
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
      <div key={kpiName} className="mb-4 overflow-hidden border rounded-md">
        <div className="flex flex-wrap items-center justify-between p-3 bg-gray-50">
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

  // Function to get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "productivity":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
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
      case "code_quality":
        return (
          <svg
            className="w-5 h-5 text-green-500"
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
      case "collaboration":
        return (
          <svg
            className="w-5 h-5 text-purple-500"
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
      case "adaptability":
        return (
          <svg
            className="w-5 h-5 text-indigo-500"
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
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-500"
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
  };

  // Function to get category title
  const getCategoryTitle = (category) => {
    switch (category) {
      case "productivity":
        return "Productivity & Agile Performance";
      case "code_quality":
        return "Code Quality & Efficiency";
      case "collaboration":
        return "Collaboration & Communication";
      case "adaptability":
        return "Adaptability & Continuous Improvement";
      default:
        return (
          category.charAt(0).toUpperCase() +
          category.slice(1).replace(/_/g, " ")
        );
    }
  };

  // Function to render KPI category
  const renderKPICategory = (category, categoryData) => {
    if (!categoryData) return null;

    const isExpanded = expandedCategories[category] || false;
    const categoryTitle = getCategoryTitle(category);
    const categoryIcon = getCategoryIcon(category);
    const stats = categoryStats[category] || {
      onTrack: 0,
      atRisk: 0,
      belowTarget: 0,
      total: 0,
    };

    return (
      <div className="mb-6 overflow-hidden border rounded-lg">
        <div
          className="flex items-center justify-between p-4 bg-white shadow-sm cursor-pointer hover:bg-gray-50"
          onClick={() => toggleCategory(category)}
        >
          <div className="flex items-center">
            <span className="mr-3">{categoryIcon}</span>
            <h3 className="font-medium text-gray-800">{categoryTitle}</h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              {stats.onTrack > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded">
                  {stats.onTrack} On Track
                </span>
              )}
              {stats.atRisk > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded">
                  {stats.atRisk} At Risk
                </span>
              )}
              {stats.belowTarget > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded">
                  {stats.belowTarget} Below Target
                </span>
              )}
            </div>

            <div className="relative w-8 h-8">
              {isExpanded ? (
                <svg
                  className="w-5 h-5 text-gray-400"
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
                  className="w-5 h-5 text-gray-400"
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
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 bg-gray-50">
            {/* Progress bar for category health */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">
                  Category Health: {Math.round(stats.score)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${
                    stats.score >= 80
                      ? "bg-green-500"
                      : stats.score >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${stats.score}%` }}
                ></div>
              </div>
            </div>

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

  // Calculate overall project health
  const calculateOverallHealth = () => {
    if (!Object.keys(categoryStats).length) return 0;

    const totalScore = Object.values(categoryStats).reduce(
      (sum, cat) => sum + cat.score,
      0
    );

    return totalScore / Object.keys(categoryStats).length;
  };

  const overallHealth = calculateOverallHealth();

  return (
    <div>
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between mb-6">
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
              }
            >
              Adjust KPIs
            </Button>
          )}
        </div>

        {/* Overall Project Health */}
        <div className="p-4 mb-6 rounded-lg bg-gray-50">
          <h3 className="mb-2 text-lg font-medium text-gray-800">
            Overall Project Health
          </h3>
          <div className="flex items-center">
            <div className="w-full mr-4">
              <div className="w-full h-4 bg-gray-200 rounded-full">
                <div
                  className={`h-4 rounded-full ${
                    overallHealth >= 80
                      ? "bg-green-500"
                      : overallHealth >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${overallHealth}%` }}
                ></div>
              </div>
            </div>
            <span className="text-lg font-semibold">
              {Math.round(overallHealth)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-md bg-blue-50">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-500"
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
              {Math.round(categoryStats.productivity?.score || 0)}%
            </p>
            <p className="mt-1 text-xs text-blue-600">
              {categoryStats.productivity?.onTrack || 0} of{" "}
              {categoryStats.productivity?.total || 0} metrics on track
            </p>
          </div>

          <div className="p-4 rounded-md bg-green-50">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-green-500"
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
              {Math.round(categoryStats.code_quality?.score || 0)}%
            </p>
            <p className="mt-1 text-xs text-green-600">
              {categoryStats.code_quality?.onTrack || 0} of{" "}
              {categoryStats.code_quality?.total || 0} metrics on track
            </p>
          </div>

          <div className="p-4 rounded-md bg-purple-50">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-purple-500"
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
              {Math.round(categoryStats.collaboration?.score || 0)}%
            </p>
            <p className="mt-1 text-xs text-purple-600">
              {categoryStats.collaboration?.onTrack || 0} of{" "}
              {categoryStats.collaboration?.total || 0} metrics on track
            </p>
          </div>

          <div className="p-4 rounded-md bg-indigo-50">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-indigo-500"
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
              {Math.round(categoryStats.adaptability?.score || 0)}%
            </p>
            <p className="mt-1 text-xs text-indigo-600">
              {categoryStats.adaptability?.onTrack || 0} of{" "}
              {categoryStats.adaptability?.total || 0} metrics on track
            </p>
          </div>
        </div>

        {Object.entries(kpis).map(([category, categoryData]) =>
          renderKPICategory(category, categoryData)
        )}

        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              // Toggle expand/collapse all based on current state
              const allExpanded = Object.values(expandedCategories).every(
                (v) => v
              );
              toggleAllCategories(!allExpanded);
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