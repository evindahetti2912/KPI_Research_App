import React, { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";

const ParsedDataViewer = ({ cvData }) => {
  const [expandedSections, setExpandedSections] = useState({
    "Contact Information": true,
    Skills: true,
    Experience: false,
    Education: false,
    "Certifications and Courses": false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper function to render a section
  const renderSection = (title, data) => {
    if (!data) return null;

    const isExpanded = expandedSections[title] || false;

    return (
      <div className="mb-4 border rounded-md overflow-hidden">
        <div
          className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
          onClick={() => toggleSection(title)}
        >
          <h3 className="font-medium text-gray-700">{title}</h3>
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

        {isExpanded && (
          <div className="p-3">{renderSectionContent(title, data)}</div>
        )}
      </div>
    );
  };

  // Helper function to render section content based on section type
  const renderSectionContent = (title, data) => {
    if (Array.isArray(data)) {
      // For arrays like Skills, render as bullet points
      if (title === "Skills") {
        return (
          <div className="flex flex-wrap gap-2">
            {data.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-sm px-2.5 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        );
      }

      // For arrays of objects like Experience or Education
      return (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="border-b pb-3 last:border-b-0 last:pb-0"
            >
              {Object.entries(item).map(([key, value]) => {
                if (key === "Responsibilities" && Array.isArray(value)) {
                  return (
                    <div key={key} className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        {key}:
                      </h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {value.map((resp, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                return (
                  <div key={key} className="mt-1">
                    <span className="text-sm font-medium text-gray-700">
                      {key}:{" "}
                    </span>
                    <span className="text-sm text-gray-600">{value}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    // For objects like Contact Information
    if (typeof data === "object" && data !== null) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <span className="text-sm font-medium text-gray-700">{key}: </span>
              <span className="text-sm text-gray-600">{value}</span>
            </div>
          ))}
        </div>
      );
    }

    // For simple values
    return <p className="text-sm text-gray-600">{data}</p>;
  };

  // Helper function to render derived skill categories
  const renderSkillCategories = () => {
    if (!cvData || !cvData._derived || !cvData._derived.skill_categories) {
      return null;
    }

    const { skill_categories } = cvData._derived;

    return (
      <div className="mb-4 border rounded-md overflow-hidden">
        <div
          className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
          onClick={() => toggleSection("Skill Categories")}
        >
          <h3 className="font-medium text-gray-700">Skill Categories</h3>
          <button className="text-gray-400 focus:outline-none">
            {expandedSections["Skill Categories"] ? (
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

        {expandedSections["Skill Categories"] && (
          <div className="p-3">
            <div className="space-y-3">
              {Object.entries(skill_categories).map(
                ([category, skills]) =>
                  skills.length > 0 && (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">
                        {category}:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-sm px-2.5 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!cvData) {
    return (
      <Card title="Parsed CV Data">
        <div className="flex items-center justify-center h-64 text-gray-500">
          No CV data to display
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Parsed CV Data"
      subtitle="Automatically extracted information from the CV"
    >
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {cvData.Name || "Unknown"}
          </h2>
          {cvData._derived &&
            cvData._derived.total_years_experience !== undefined && (
              <p className="text-sm text-gray-600">
                {cvData._derived.total_years_experience} years of experience
              </p>
            )}
        </div>

        {renderSection("Contact Information", cvData["Contact Information"])}
        {renderSection("Skills", cvData["Skills"])}
        {renderSkillCategories()}
        {renderSection("Experience", cvData["Experience"])}
        {renderSection("Education", cvData["Education"])}
        {renderSection(
          "Certifications and Courses",
          cvData["Certifications and Courses"]
        )}

        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              // Expand or collapse all sections
              const allExpanded = Object.values(expandedSections).every(
                (v) => v
              );
              const newState = !allExpanded;

              const sections = { ...expandedSections };
              Object.keys(sections).forEach((key) => {
                sections[key] = newState;
              });

              setExpandedSections(sections);
            }}
          >
            {Object.values(expandedSections).every((v) => v)
              ? "Collapse All"
              : "Expand All"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ParsedDataViewer;
