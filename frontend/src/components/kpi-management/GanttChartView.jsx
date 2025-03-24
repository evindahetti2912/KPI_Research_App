import React, { useState, useEffect } from "react";
import Card from "../common/Card";

const GanttChartView = ({ chartData, projectTimeline }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showTaskDetails, setShowTaskDetails] = useState({});
  const [hoveredTask, setHoveredTask] = useState(null);

  // Calculate days for chart display
  const dayWidth = 30 * zoomLevel; // Width per day adjusted by zoom level
  const maxDays =
    projectTimeline ||
    Math.max(...chartData.map((task) => parseInt(task.End.split(" ")[1]))) ||
    90;
  const chartWidth = maxDays * dayWidth + 200; // 200px for task names

  // Function to parse day number from "Day X" format
  const parseDayNumber = (dayString) => {
    return parseInt(dayString.split(" ")[1]);
  };

  // Function to calculate position and width of task bars
  const calculateTaskPosition = (start, end) => {
    const startDay = parseDayNumber(start);
    const endDay = parseDayNumber(end);
    const left = startDay * dayWidth;
    const width = (endDay - startDay) * dayWidth;
    return { left, width };
  };

  // Generate day headers
  const dayHeaders = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Function to generate week markers
  const weekMarkers = Array.from(
    { length: Math.ceil(maxDays / 7) },
    (_, i) => (i + 1) * 7
  );

  // Generate task rows with dependencies
  const renderTaskRows = () => {
    return chartData.map((task, index) => {
      const { left, width } = calculateTaskPosition(task.Start, task.End);
      const isHovered = hoveredTask === index;

      // Calculate task duration
      const startDay = parseDayNumber(task.Start);
      const endDay = parseDayNumber(task.End);
      const duration = endDay - startDay;

      // Determine color based on task type or phase
      let bgColor = "bg-blue-500";
      if (task.Task.toLowerCase().includes("testing")) {
        bgColor = "bg-green-500";
      } else if (task.Task.toLowerCase().includes("design")) {
        bgColor = "bg-purple-500";
      } else if (task.Task.toLowerCase().includes("deployment")) {
        bgColor = "bg-orange-500";
      }

      return (
        <div
          key={index}
          className="relative flex items-center h-10 border-b border-gray-100 hover:bg-gray-50"
          style={{ minWidth: chartWidth }}
          onMouseEnter={() => setHoveredTask(index)}
          onMouseLeave={() => setHoveredTask(null)}
          onClick={() =>
            setShowTaskDetails((prev) => ({
              ...prev,
              [index]: !prev[index],
            }))
          }
        >
          <div
            className="absolute left-0 flex items-center w-48 h-full pr-4"
            style={{
              backgroundColor: isHovered
                ? "rgba(243, 244, 246, 0.8)"
                : "transparent",
              zIndex: 10,
            }}
          >
            <span className="text-sm font-medium text-gray-700 truncate">
              {task.Task}
            </span>
          </div>

          <div
            className={`absolute h-7 rounded-md ${bgColor} opacity-80 flex items-center justify-center text-white text-xs font-medium transition-all cursor-pointer ${
              isHovered ? "opacity-90 shadow-md" : ""
            }`}
            style={{ left: `${left + 200}px`, width: `${width}px` }}
          >
            <span className="px-2 truncate">
              {duration <= 3 ? task.Task : `${task.Start} - ${task.End}`}
            </span>
          </div>

          {/* Task details popup when clicked */}
          {showTaskDetails[index] && (
            <div className="absolute z-20 w-64 p-3 mt-2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-md shadow-lg top-full left-1/2">
              <h4 className="mb-1 font-medium text-gray-900">{task.Task}</h4>
              <div className="space-y-1 text-xs">
                <p className="text-gray-600">
                  <span className="font-medium">Duration:</span> {duration} days
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Start:</span> {task.Start}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">End:</span> {task.End}
                </p>
                {task.Resources && (
                  <p className="text-gray-600">
                    <span className="font-medium">Resources:</span>{" "}
                    {task.Resources}
                  </p>
                )}
              </div>
              <button
                className="absolute text-gray-400 top-1 right-1 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTaskDetails((prev) => ({ ...prev, [index]: false }));
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card title="Project Gantt Chart">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Project Timeline: {maxDays} days
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            disabled={zoomLevel <= 0.5}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 12H4"
              ></path>
            </svg>
          </button>
          <span className="text-sm text-gray-700">
            Zoom: {Math.round(zoomLevel * 100)}%
          </span>
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
            disabled={zoomLevel >= 2}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-max">
          {/* Day headers */}
          <div
            className="flex pb-2 border-b border-gray-200"
            style={{ minWidth: chartWidth }}
          >
            <div className="w-48"></div>
            <div className="flex flex-grow">
              {dayHeaders.map((day) => (
                <div
                  key={day}
                  className={`flex-shrink-0 flex items-center justify-center ${
                    weekMarkers.includes(day) ? "border-l border-gray-300" : ""
                  }`}
                  style={{ width: `${dayWidth}px` }}
                >
                  <span
                    className={`text-xs ${
                      weekMarkers.includes(day)
                        ? "font-medium text-gray-700"
                        : "text-gray-500"
                    }`}
                  >
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Week markers */}
          <div
            className="relative flex pt-1 pb-1 border-b border-gray-200 bg-gray-50"
            style={{ minWidth: chartWidth }}
          >
            <div className="w-48"></div>
            <div className="relative flex flex-grow">
              {weekMarkers.map((day, index) => (
                <div
                  key={day}
                  className="absolute h-6 border-l border-gray-300"
                  style={{
                    left: `${day * dayWidth}px`,
                  }}
                >
                  <span className="ml-1 text-xs font-medium text-gray-700">
                    Week {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="mt-2">{renderTaskRows()}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-700">Development</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-green-500 rounded"></div>
          <span className="text-xs text-gray-700">Testing</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-purple-500 rounded"></div>
          <span className="text-xs text-gray-700">Design</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-orange-500 rounded"></div>
          <span className="text-xs text-gray-700">Deployment</span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Click on any task bar to view details. Zoom in/out to adjust timeline
        view.
      </div>
    </Card>
  );
};

export default GanttChartView;