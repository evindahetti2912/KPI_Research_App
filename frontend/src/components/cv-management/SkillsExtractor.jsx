import React, { useMemo, useState } from "react";
import Card from "../common/Card";

const SkillsExtractor = ({ cvData }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extract skills from CV data
  const skillsByCategory = useMemo(() => {
    if (!cvData || !cvData._derived || !cvData._derived.skill_categories) {
      return {
        all: cvData?.Skills || [],
        programming: [],
        frameworks: [],
        databases: [],
        other: [],
      };
    }

    const { skill_categories } = cvData._derived;

    // Calculate total skills
    const allSkills = cvData.Skills || [];

    return {
      all: allSkills,
      ...skill_categories,
    };
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

  return (
    <Card title="Skills Analysis" className="h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4 flex items-center justify-between">
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
            <span className="text-sm text-gray-700 mr-2">Filter:</span>
            <select
              className="border border-gray-300 rounded-md text-sm p-1"
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

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Total Skills: {skillsByCategory.all.length}</span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span>
                Programming ({skillsByCategory.programming?.length || 0})
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>
                Frameworks ({skillsByCategory.frameworks?.length || 0})
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
              <span>Databases ({skillsByCategory.databases?.length || 0})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
              <span>Other ({skillsByCategory.other?.length || 0})</span>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <h4 className="font-medium text-gray-700 mb-2">
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
              <p className="text-gray-500 text-sm">
                No skills found in this category
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SkillsExtractor;
