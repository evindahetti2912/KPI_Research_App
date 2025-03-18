import React, { useState, useMemo } from "react";
import { cvService } from "../../services/cvService";

const SkillVisualizer = ({ cvData }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extract skills from CV data
  const skillsByCategory = useMemo(() => {
    if (!cvData || !cvData.Skills) {
      return {
        all: [],
        programming: [],
        frameworks: [],
        databases: [],
        other: [],
      };
    }

    // Use derived data if available
    if (cvData._derived && cvData._derived.skill_categories) {
      return {
        all: cvData.Skills || [],
        ...cvData._derived.skill_categories,
      };
    }

    // Otherwise, extract skills using the cvService
    return cvService.extractSkills(cvData);
  }, [cvData]);

  // Get years of experience
  const yearsOfExperience = useMemo(() => {
    if (!cvData || !cvData._derived) return 0;
    return cvData._derived.total_years_experience || 0;
  }, [cvData]);

  // Determine experience level based on years
  const experienceLevel = useMemo(() => {
    if (yearsOfExperience < 2)
      return { level: "Junior", color: "bg-green-100 text-green-800" };
    if (yearsOfExperience < 5)
      return { level: "Mid-level", color: "bg-blue-100 text-blue-800" };
    if (yearsOfExperience < 8)
      return { level: "Senior", color: "bg-purple-100 text-purple-800" };
    return { level: "Lead", color: "bg-indigo-100 text-indigo-800" };
  }, [yearsOfExperience]);

  // Get skills for the selected category
  const displayedSkills = useMemo(() => {
    return skillsByCategory[selectedCategory] || [];
  }, [skillsByCategory, selectedCategory]);

  // Calculate skill distribution for the radar chart
  const skillDistribution = useMemo(() => {
    const categories = skillsByCategory;
    const total = categories.all.length || 1; // Avoid division by zero

    return [
      {
        category: "Programming",
        count: categories.programming?.length || 0,
        percentage: Math.round(
          ((categories.programming?.length || 0) / total) * 100
        ),
      },
      {
        category: "Frameworks",
        count: categories.frameworks?.length || 0,
        percentage: Math.round(
          ((categories.frameworks?.length || 0) / total) * 100
        ),
      },
      {
        category: "Databases",
        count: categories.databases?.length || 0,
        percentage: Math.round(
          ((categories.databases?.length || 0) / total) * 100
        ),
      },
      {
        category: "Other",
        count: categories.other?.length || 0,
        percentage: Math.round(((categories.other?.length || 0) / total) * 100),
      },
    ];
  }, [skillsByCategory]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {cvData?.Name || "Unknown"}
          </h3>
          <div className="flex items-center mt-1">
            <span
              className={`text-xs px-2.5 py-0.5 rounded ${experienceLevel.color}`}
            >
              {experienceLevel.level}
            </span>
            <span className="ml-2 text-sm text-gray-600">
              {yearsOfExperience} years of experience
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-700">Filter:</span>
          <select
            className="p-1 text-sm border border-gray-300 rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Skills</option>
            {Object.keys(skillsByCategory)
              .filter(
                (cat) => cat !== "all" && skillsByCategory[cat].length > 0
              )
              .map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} (
                  {skillsByCategory[category].length})
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm text-gray-500">
          <span>Total Skills: {skillsByCategory.all.length}</span>
        </div>

        <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
          <div className="flex h-full">
            <div
              className="bg-blue-500"
              style={{
                width:
                  `${
                    (skillsByCategory.programming?.length /
                      skillsByCategory.all.length) *
                    100
                  }%` || "0%",
              }}
            ></div>
            <div
              className="bg-green-500"
              style={{
                width:
                  `${
                    (skillsByCategory.frameworks?.length /
                      skillsByCategory.all.length) *
                    100
                  }%` || "0%",
              }}
            ></div>
            <div
              className="bg-purple-500"
              style={{
                width:
                  `${
                    (skillsByCategory.databases?.length /
                      skillsByCategory.all.length) *
                    100
                  }%` || "0%",
              }}
            ></div>
            <div
              className="bg-gray-500"
              style={{
                width:
                  `${
                    (skillsByCategory.other?.length /
                      skillsByCategory.all.length) *
                    100
                  }%` || "0%",
              }}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 bg-blue-500 rounded-full"></div>
            <span>
              Programming ({skillsByCategory.programming?.length || 0})
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 bg-green-500 rounded-full"></div>
            <span>Frameworks ({skillsByCategory.frameworks?.length || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 bg-purple-500 rounded-full"></div>
            <span>Databases ({skillsByCategory.databases?.length || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 bg-gray-500 rounded-full"></div>
            <span>Other ({skillsByCategory.other?.length || 0})</span>
          </div>
        </div>
      </div>

      {/* Radar chart visualization using CSS */}
      <div className="mb-6">
        <h4 className="mb-4 font-medium text-gray-700">Skill Distribution</h4>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* Background circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full border border-gray-200 rounded-full opacity-20"></div>
              <div className="absolute w-3/4 border border-gray-200 rounded-full h-3/4 opacity-40"></div>
              <div className="absolute w-1/2 border border-gray-200 rounded-full h-1/2 opacity-60"></div>
              <div className="absolute w-1/4 border border-gray-200 rounded-full h-1/4 opacity-80"></div>
            </div>

            {/* Skill distribution visualization */}
            {skillDistribution.map((skill, index) => {
              const angle = (Math.PI * 2 * index) / skillDistribution.length;
              const radius = (skill.percentage / 100) * 120; // 120px max radius
              const x = 130 + Math.cos(angle) * radius;
              const y = 130 + Math.sin(angle) * radius;

              // Label positioning
              const labelRadius = 140;
              const labelX = 130 + Math.cos(angle) * labelRadius;
              const labelY = 130 + Math.sin(angle) * labelRadius;

              return (
                <React.Fragment key={skill.category}>
                  {/* Dots for each skill category */}
                  <div
                    className="absolute w-3 h-3 bg-blue-500 rounded-full"
                    style={{ left: `${x}px`, top: `${y}px` }}
                  ></div>

                  {/* Labels */}
                  <div
                    className="absolute text-xs font-medium text-gray-700"
                    style={{
                      left: `${labelX - 30}px`,
                      top: `${labelY - 10}px`,
                      width: "60px",
                      textAlign: "center",
                    }}
                  >
                    {skill.category}
                    <div className="text-blue-600">{skill.percentage}%</div>
                  </div>

                  {/* Lines connecting to center */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ zIndex: -1 }}
                  >
                    <line
                      x1="130"
                      y1="130"
                      x2={x}
                      y2={y}
                      stroke="#93C5FD"
                      strokeDasharray="2,2"
                    />
                  </svg>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        <h4 className="mb-2 font-medium text-gray-700">
          {selectedCategory === "all"
            ? "All Skills"
            : `${
                selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)
              } Skills`}
        </h4>

        <div className="flex flex-wrap gap-2">
          {displayedSkills.length > 0 ? (
            displayedSkills.map((skill, index) => {
              const categoryColor =
                selectedCategory === "all"
                  ? skillsByCategory.programming?.includes(skill)
                    ? "bg-blue-100 text-blue-800"
                    : skillsByCategory.frameworks?.includes(skill)
                    ? "bg-green-100 text-green-800"
                    : skillsByCategory.databases?.includes(skill)
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                  : {
                      programming: "bg-blue-100 text-blue-800",
                      frameworks: "bg-green-100 text-green-800",
                      databases: "bg-purple-100 text-purple-800",
                      other: "bg-gray-100 text-gray-800",
                    }[selectedCategory] || "bg-gray-100 text-gray-800";

              return (
                <span
                  key={index}
                  className={`px-2.5 py-1 rounded text-sm ${categoryColor}`}
                >
                  {skill}
                </span>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">
              No skills found in this category
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillVisualizer;
