import React, { useState } from "react";
import Card from "../common/Card";

const BurndownChartView = ({ projectTimeline, sprints, projectId }) => {
  const [showIdealLine, setShowIdealLine] = useState(true);
  const [showActualLine, setShowActualLine] = useState(true);
  const [showPredictionLine, setShowPredictionLine] = useState(true);

  // Generate data for ideal burndown line
  const generateIdealBurndown = (timeline, sprints) => {
    const sprintLength = Math.floor(timeline / sprints);
    return Array.from({ length: sprints + 1 }, (_, i) => ({
      sprint: i,
      day: i * sprintLength,
      remaining: timeline - i * sprintLength,
    }));
  };

  // Generate simulated actual burndown data with some variability
  const generateActualBurndown = (timeline, sprints) => {
    const sprintLength = Math.floor(timeline / sprints);
    const idealBurndown = generateIdealBurndown(timeline, sprints);

    // Simulate a more realistic burndown with various patterns:
    // - Slow start (falling behind early)
    // - Catching up in middle sprints
    // - Some variability throughout
    const progressPattern = [0.9, 0.8, 0.7, 0.85, 0.95, 1.05]; // Progress ratios

    return idealBurndown.map((point, i) => {
      if (i === 0) {
        return { ...point, actualRemaining: point.remaining };
      }

      // Choose progress ratio based on sprint phase
      const patternIndex = Math.min(i - 1, progressPattern.length - 1);
      const progressRatio = progressPattern[patternIndex];

      // Calculate what the ideal drop would be between this and previous sprint
      const idealDrop = idealBurndown[i - 1].remaining - point.remaining;

      // Apply the progress ratio to the ideal drop, with some randomness
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1 random factor
      const actualDrop = idealDrop * progressRatio * randomFactor;

      // Calculate actual remaining based on previous actual and the actual drop
      let actualRemaining = Math.max(
        0,
        idealBurndown[i - 1].actualRemaining - actualDrop
      );

      return { ...point, actualRemaining };
    });
  };

  // Generate prediction line based on current progress
  const generatePredictionLine = (actualData, timeline, sprints) => {
    // Only generate prediction if we have at least 2 actual data points
    if (actualData.length < 3) return [];

    // Get the last two actual data points to calculate trend
    const lastActual = actualData[actualData.length - 1];
    const secondLastActual = actualData[actualData.length - 2];

    // Calculate burn rate based on last two points
    const burnRate =
      (secondLastActual.actualRemaining - lastActual.actualRemaining) /
      (lastActual.day - secondLastActual.day);

    // If burn rate is zero or negative, return empty prediction
    if (burnRate <= 0) return [];

    // Calculate days left at current rate
    const daysLeft = lastActual.actualRemaining / burnRate;
    const projectedEndDay = lastActual.day + daysLeft;

    // Generate prediction points
    const predictionLine = [
      { day: lastActual.day, remaining: lastActual.actualRemaining },
    ];

    // Add the projected completion point
    predictionLine.push({
      day: projectedEndDay,
      remaining: 0,
    });

    return predictionLine;
  };

  const sprintLength = Math.floor(projectTimeline / sprints);
  const idealBurndown = generateIdealBurndown(projectTimeline, sprints);
  const actualBurndown = generateActualBurndown(projectTimeline, sprints);
  const predictionLine = generatePredictionLine(
    actualBurndown,
    projectTimeline,
    sprints
  );

  // Calculate chart dimensions
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = 40;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  // Calculate scales
  const xScale = (day) => (day / projectTimeline) * innerWidth + padding;
  const yScale = (remaining) =>
    innerHeight - (remaining / projectTimeline) * innerHeight + padding;

  // Generate path for ideal burndown
  const idealPath = `M ${idealBurndown
    .map((point) => `${xScale(point.day)},${yScale(point.remaining)}`)
    .join(" L ")}`;

  // Generate path for actual burndown
  const actualPath = `M ${actualBurndown
    .map((point) => `${xScale(point.day)},${yScale(point.actualRemaining)}`)
    .join(" L ")}`;

  // Generate path for prediction line
  const predictionPath =
    predictionLine.length >= 2
      ? `M ${predictionLine
          .map((point) => `${xScale(point.day)},${yScale(point.remaining)}`)
          .join(" L ")}`
      : "";

  // Calculate completion metrics
  // Update the calculation for these metrics

  // Calculate completion metrics
  const currentDay = Math.min(
    actualBurndown[actualBurndown.length - 1]?.day || 0,
    projectTimeline
  );
  const currentRemaining =
    actualBurndown[actualBurndown.length - 1]?.actualRemaining ||
    projectTimeline;
  const percentComplete =
    Math.round(
      ((projectTimeline - currentRemaining) / projectTimeline) * 100
    ) || 0; // Add fallback to 0

  const daysElapsed = currentDay || 0;
  const daysRemaining = projectTimeline - daysElapsed;

  // Calculate if project is ahead or behind schedule
  const idealRemainingAtCurrentDay =
    idealBurndown.find((p) => p.day === currentDay)?.remaining ||
    projectTimeline - currentDay; // Calculate expected remaining if exact day not found
  const behindBy = currentRemaining - idealRemainingAtCurrentDay;
  const projectStatus = behindBy <= 0 ? "ahead" : "behind";
  const daysOffSchedule = Math.abs(Math.round(behindBy)) || 0; // Add fallback to 0

  return (
    <Card title="Project Burndown Chart">
      <div className="flex items-center justify-between mb-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="p-2 rounded bg-blue-50">
            <h4 className="text-xs font-medium text-blue-800">Completed</h4>
            <p className="text-lg font-bold text-blue-900">
              {percentComplete}%
            </p>
          </div>
          <div
            className={`${
              projectStatus === "ahead" ? "bg-green-50" : "bg-red-50"
            } p-2 rounded`}
          >
            <h4 className="text-xs font-medium text-gray-800">
              {projectStatus === "ahead" ? "Ahead by" : "Behind by"}
            </h4>
            <p
              className={`text-lg font-bold ${
                projectStatus === "ahead" ? "text-green-700" : "text-red-700"
              }`}
            >
              {daysOffSchedule} days
            </p>
          </div>
          <div className="p-2 rounded bg-gray-50">
            <h4 className="text-xs font-medium text-gray-800">Days Elapsed</h4>
            <p className="text-lg font-bold text-gray-900">{daysElapsed}</p>
          </div>
          <div className="p-2 rounded bg-gray-50">
            <h4 className="text-xs font-medium text-gray-800">
              Days Remaining
            </h4>
            <p className="text-lg font-bold text-gray-900">{daysRemaining}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 rounded form-checkbox"
            checked={showIdealLine}
            onChange={() => setShowIdealLine(!showIdealLine)}
          />
          <span className="ml-2 text-sm text-gray-700">Ideal Burndown</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-red-600 rounded form-checkbox"
            checked={showActualLine}
            onChange={() => setShowActualLine(!showActualLine)}
          />
          <span className="ml-2 text-sm text-gray-700">Actual Burndown</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-green-600 rounded form-checkbox"
            checked={showPredictionLine}
            onChange={() => setShowPredictionLine(!showPredictionLine)}
          />
          <span className="ml-2 text-sm text-gray-700">Prediction</span>
        </label>
      </div>

      <div className="flex justify-center mt-4">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* X and Y axes */}
          <line
            x1={padding}
            y1={innerHeight + padding}
            x2={innerWidth + padding}
            y2={innerHeight + padding}
            stroke="#666"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={innerHeight + padding}
            stroke="#666"
            strokeWidth="1"
          />

          {/* X-axis labels (days/sprints) */}
          {actualBurndown.map((point, i) => (
            <g key={i}>
              <line
                x1={xScale(point.day)}
                y1={innerHeight + padding}
                x2={xScale(point.day)}
                y2={innerHeight + padding + 5}
                stroke="#666"
              />
              <text
                x={xScale(point.day)}
                y={innerHeight + padding + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {i === 0 ? "Start" : `Sprint ${i}`}
              </text>
            </g>
          ))}

          {/* Y-axis labels (remaining work) */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const remaining = (projectTimeline * percent) / 100;
            return (
              <g key={percent}>
                <line
                  x1={padding - 5}
                  y1={yScale(remaining)}
                  x2={padding}
                  y2={yScale(remaining)}
                  stroke="#666"
                />
                <text
                  x={padding - 10}
                  y={yScale(remaining) + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#666"
                >
                  {remaining}
                </text>
              </g>
            );
          })}

          {/* Axis titles */}
          <text
            x={chartWidth / 2}
            y={chartHeight - 5}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            Days
          </text>
          <text
            x={10}
            y={chartHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
            transform={`rotate(-90, 10, ${chartHeight / 2})`}
          >
            Remaining Work
          </text>

          {/* Sprint boundary guidelines */}
          {actualBurndown.slice(1).map((point, i) => (
            <line
              key={i}
              x1={xScale(point.day)}
              y1={padding}
              x2={xScale(point.day)}
              y2={innerHeight + padding}
              stroke="#ddd"
              strokeDasharray="4,4"
            />
          ))}

          {/* Current day vertical line */}
          <line
            x1={xScale(currentDay)}
            y1={padding}
            x2={xScale(currentDay)}
            y2={innerHeight + padding}
            stroke="#FFA500"
            strokeWidth="1.5"
            strokeDasharray="4,2"
          />

          {/* Ideal burndown line */}
          {showIdealLine && (
            <path
              d={idealPath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Actual burndown line */}
          {showActualLine && (
            <path d={actualPath} fill="none" stroke="#EF4444" strokeWidth="2" />
          )}

          {/* Prediction line */}
          {showPredictionLine && predictionPath && (
            <path
              d={predictionPath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="6,3"
            />
          )}

          {/* Data points for actual burndown */}
          {showActualLine &&
            actualBurndown.map((point, i) => (
              <circle
                key={i}
                cx={xScale(point.day)}
                cy={yScale(point.actualRemaining)}
                r="4"
                fill="#EF4444"
              />
            ))}

          {/* Legend */}
          <g transform={`translate(${padding + 10}, ${padding + 10})`}>
            {showIdealLine && (
              <g>
                <line
                  x1="0"
                  y1="7"
                  x2="20"
                  y2="7"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text x="25" y="10" fontSize="12" fill="#666">
                  Ideal Burndown
                </text>
              </g>
            )}

            {showActualLine && (
              <g transform="translate(0, 20)">
                <line
                  x1="0"
                  y1="7"
                  x2="20"
                  y2="7"
                  stroke="#EF4444"
                  strokeWidth="2"
                />
                <text x="25" y="10" fontSize="12" fill="#666">
                  Actual Burndown
                </text>
              </g>
            )}

            {showPredictionLine && predictionPath && (
              <g transform="translate(0, 40)">
                <line
                  x1="0"
                  y1="7"
                  x2="20"
                  y2="7"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="6,3"
                />
                <text x="25" y="10" fontSize="12" fill="#666">
                  Prediction
                </text>
              </g>
            )}

            <g transform="translate(0, 60)">
              <line
                x1="0"
                y1="7"
                x2="20"
                y2="7"
                stroke="#FFA500"
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
              <text x="25" y="10" fontSize="12" fill="#666">
                Current Day
              </text>
            </g>
          </g>
        </svg>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          The burndown chart shows how work is progressing over time. The ideal
          line represents perfect linear progress, while the actual line shows
          real project progress. The prediction line forecasts completion based
          on current velocity.
        </p>
      </div>
    </Card>
  );
};

export default BurndownChartView;
