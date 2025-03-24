import React from "react";
import Card from "../common/Card";

const KPIRadarChart = ({ kpis }) => {
  if (!kpis) {
    return (
      <Card title="KPI Radar Chart">
        <div className="py-8 text-center">
          <p className="text-gray-500">
            No KPI data available for visualization.
          </p>
        </div>
      </Card>
    );
  }

  // Extract categories and calculate scores
  const categories = Object.keys(kpis);
  const categoryScores = categories.map((category) => {
    const metrics = Object.values(kpis[category] || {});
    if (!metrics.length) return { category, score: 0 };

    // Calculate score based on statuses
    const score =
      metrics.reduce((sum, metric) => {
        switch (metric.status) {
          case "On Track":
            return sum + 1;
          case "At Risk":
            return sum + 0.6;
          case "Below Target":
            return sum + 0.3;
          default:
            return sum + 0.5;
        }
      }, 0) / metrics.length;

    // Scale to 0-100
    return {
      category,
      score: score * 100,
      displayName: formatCategoryName(category),
    };
  });

  // Helper function to format category names
  function formatCategoryName(category) {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Chart configuration
  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / categories.length;

  // Calculate points for radar chart
  const points = categoryScores.map((cat, i) => {
    const angle = i * angleStep - Math.PI / 2; // Start from top
    const distance = (cat.score / 100) * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return { ...cat, x, y, angle };
  });

  // Create polygon points string
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Create axis lines and labels
  const axisLines = points.map((point, i) => {
    const fullAxisX = centerX + radius * Math.cos(point.angle);
    const fullAxisY = centerY + radius * Math.sin(point.angle);

    // Calculate label position slightly outside the chart
    const labelDistance = radius * 1.15;
    const labelX = centerX + labelDistance * Math.cos(point.angle);
    const labelY = centerY + labelDistance * Math.sin(point.angle);

    // Adjust text anchor based on position around the circle
    let textAnchor = "middle";
    if (point.angle > -Math.PI / 4 && point.angle < Math.PI / 4) {
      textAnchor = "start";
    } else if (
      point.angle > (3 * Math.PI) / 4 ||
      point.angle < (-3 * Math.PI) / 4
    ) {
      textAnchor = "end";
    }

    return (
      <g key={i}>
        <line
          x1={centerX}
          y1={centerY}
          x2={fullAxisX}
          y2={fullAxisY}
          stroke="#CCC"
          strokeWidth="1"
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize="12"
          fill="#666"
        >
          {point.displayName}
        </text>
      </g>
    );
  });

  // Create concentric circles for scale
  const circles = [0.25, 0.5, 0.75, 1].map((scale, i) => (
    <circle
      key={i}
      cx={centerX}
      cy={centerY}
      r={radius * scale}
      fill="none"
      stroke="#DDD"
      strokeWidth="1"
      strokeDasharray={i < 3 ? "4 4" : ""}
    />
  ));

  // Scale labels
  const scaleLabels = [25, 50, 75, 100].map((value, i) => (
    <text
      key={i}
      x={centerX}
      y={centerY - (radius * value) / 100}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="10"
      fill="#999"
      fontWeight={value === 100 ? "bold" : "normal"}
    >
      {value}%
    </text>
  ));

  return (
    <Card
      title="KPI Radar Chart"
      subtitle="Performance across different KPI categories"
    >
      <div className="flex justify-center mt-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Concentric circles for scale */}
          {circles}

          {/* Scale labels */}
          {scaleLabels}

          {/* Axis lines and category labels */}
          {axisLines}

          {/* Filled polygon representing scores */}
          <polygon
            points={polygonPoints}
            fill="rgba(59, 130, 246, 0.3)"
            stroke="#3B82F6"
            strokeWidth="2"
          />

          {/* Data points */}
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3B82F6"
              stroke="#FFF"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 mt-6 gap-x-4 gap-y-2">
        {categoryScores.map((cat, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full ${getScoreColor(cat.score)}`}
            ></div>
            <span className="ml-2 text-sm text-gray-700">
              {cat.displayName}:
            </span>
            <span className="ml-1 text-sm font-medium">
              {Math.round(cat.score)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          This radar chart visualizes the overall health of your project across
          different KPI categories. Higher scores (closer to the outer edge)
          indicate better performance in that category.
        </p>
      </div>
    </Card>
  );
};

// Helper function to get color based on score
function getScoreColor(score) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export default KPIRadarChart;
