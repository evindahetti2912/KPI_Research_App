import React from "react";
import Card from "../common/Card";

const GanttChartView = ({ chartData, projectTimeline }) => {
  // Calculate days for chart display
  const dayWidth = 30; // Width per day in pixels
  const maxDays =
    projectTimeline ||
    Math.max(...chartData.map((task) => parseInt(task.End.split(" ")[1]))) ||
    90;
  const chartWidth = maxDays * dayWidth + 200; // 200px for task names

  // Function to calculate task position and width
  const calculateTaskPosition = (start, end) => {
    const startDay = parseInt(start.split(" ")[1]);
    const endDay = parseInt(end.split(" ")[1]);
    const left = startDay * dayWidth;
    const width = (endDay - startDay) * dayWidth;
    return { left, width };
  };

  // Generate day headers
  const dayHeaders = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Generate task rows
  const taskRows = chartData.map((task, index) => {
    const { left, width } = calculateTaskPosition(task.Start, task.End);
    return (
      <div
        key={index}
        className="relative h-10 border-b border-gray-100 flex items-center"
        style={{ minWidth: chartWidth }}
      >
        <div className="absolute left-0 w-48 pr-4 h-full flex items-center">
          <span className="text-sm font-medium text-gray-700 truncate">
            {task.Task}
          </span>
        </div>
        <div
          className="absolute h-7 rounded-md bg-blue-500 opacity-80 flex items-center justify-center text-white text-xs font-medium"
          style={{ left: `${left + 200}px`, width: `${width}px` }}
        >
          <span className="truncate px-2">{task.Task}</span>
        </div>
      </div>
    );
  });

  return (
    <Card title="Project Gantt Chart">
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-max">
          {/* Day headers */}
          <div
            className="flex border-b border-gray-200 pb-2"
            style={{ minWidth: chartWidth }}
          >
            <div className="w-48"></div>
            <div className="flex flex-grow">
              {dayHeaders.map((day) => (
                <div
                  key={day}
                  className="flex-shrink-0"
                  style={{ width: `${dayWidth}px` }}
                >
                  <span className="text-xs font-medium text-gray-500">
                    Day {day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="mt-2">{taskRows}</div>
        </div>
      </div>
    </Card>
  );
};

export default GanttChartView;
