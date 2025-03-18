import React from "react";
import Card from "../common/Card";

const BurndownChartView = ({ projectTimeline, sprints, projectId }) => {
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

    return idealBurndown.map((point, i) => {
      // Add some random variation to actual burndown
      const variation = Math.random() * 10 - 5; // Between -5 and +5
      let actualRemaining = point.remaining + variation;

      // Ensure actual doesn't go below 0 or above timeline
      actualRemaining = Math.max(0, Math.min(timeline, actualRemaining));

      return {
        ...point,
        actualRemaining,
      };
    });
  };

  const idealBurndown = generateIdealBurndown(projectTimeline, sprints);
  const burndownData = generateActualBurndown(projectTimeline, sprints);

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
  const actualPath = `M ${burndownData
    .map((point) => `${xScale(point.day)},${yScale(point.actualRemaining)}`)
    .join(" L ")}`;

  return (
    <Card title="Project Burndown Chart">
      <div className="mt-4 flex justify-center">
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
          {burndownData.map((point, i) => (
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

          {/* Ideal burndown line */}
          <path
            d={idealPath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Actual burndown line */}
          <path d={actualPath} fill="none" stroke="#EF4444" strokeWidth="2" />

          {/* Data points for actual burndown */}
          {burndownData.map((point, i) => (
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

            <line
              x1="0"
              y1="27"
              x2="20"
              y2="27"
              stroke="#EF4444"
              strokeWidth="2"
            />
            <text x="25" y="30" fontSize="12" fill="#666">
              Actual Burndown
            </text>
          </g>
        </svg>
      </div>
    </Card>
  );
};

export default BurndownChartView;
