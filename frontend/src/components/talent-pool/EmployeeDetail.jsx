import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import SkillVisualizer from "./SkillVisualizer";
import { employeeService } from "../../services/employeeService";

const EmployeeDetail = ({ employeeId, employeeData, onBack }) => {
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    // If employee data is already provided, use it
    if (employeeData) {
      setEmployee(employeeData);
      return;
    }

    // Otherwise, fetch the employee data if ID is provided
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId, employeeData]);

  const fetchEmployeeData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await employeeService.getEmployee(employeeId);

      if (response.success) {
        setEmployee(response.data);
      } else {
        setError(response.message || "Failed to retrieve employee data");
      }
    } catch (error) {
      console.error("Error retrieving employee data:", error);
      setError("An error occurred while retrieving employee data");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get experience level
  const getExperienceLevel = () => {
    if (!employee)
      return { level: "Unknown", color: "bg-gray-100 text-gray-800" };

    // Use _derived data if available
    if (employee._derived?.total_years_experience !== undefined) {
      const years = employee._derived.total_years_experience;
      if (years < 2)
        return { level: "Junior", color: "bg-green-100 text-green-800" };
      if (years < 5)
        return { level: "Mid-level", color: "bg-blue-100 text-blue-800" };
      if (years < 8)
        return { level: "Senior", color: "bg-purple-100 text-purple-800" };
      return { level: "Lead", color: "bg-indigo-100 text-indigo-800" };
    }

    // Fallback to simple calculation
    const roles = employee.Experience?.length || 0;
    if (roles < 2)
      return { level: "Junior", color: "bg-green-100 text-green-800" };
    if (roles < 3)
      return { level: "Mid-level", color: "bg-blue-100 text-blue-800" };
    if (roles < 4)
      return { level: "Senior", color: "bg-purple-100 text-purple-800" };
    return { level: "Lead", color: "bg-indigo-100 text-indigo-800" };
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    if (dateString.toLowerCase().includes("present")) return dateString;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Render profile information tab
  const renderProfileTab = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-medium text-gray-800 text-md">
            Contact Information
          </h3>
          <div className="p-4 rounded-md bg-gray-50">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {employee["Contact Information"]?.Email && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Email:
                  </span>
                  <p className="text-gray-800">
                    {employee["Contact Information"].Email}
                  </p>
                </div>
              )}
              {employee["Contact Information"]?.Phone && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Phone:
                  </span>
                  <p className="text-gray-800">
                    {employee["Contact Information"].Phone}
                  </p>
                </div>
              )}
              {employee["Contact Information"]?.LinkedIn && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    LinkedIn:
                  </span>
                  <p className="text-gray-800">
                    <a
                      href={employee["Contact Information"].LinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {employee["Contact Information"].LinkedIn}
                    </a>
                  </p>
                </div>
              )}
              {employee["Contact Information"]?.Address && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Address:
                  </span>
                  <p className="text-gray-800">
                    {employee["Contact Information"].Address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-medium text-gray-800 text-md">Experience</h3>
          {employee.Experience && employee.Experience.length > 0 ? (
            <div className="space-y-4">
              {employee.Experience.map((exp, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex flex-wrap justify-between">
                    <h4 className="font-medium text-gray-800">{exp.Role}</h4>
                    <span className="text-sm text-gray-600">
                      {exp.Duration}
                    </span>
                  </div>
                  <p className="text-gray-700">{exp.Company}</p>

                  {exp.Responsibilities && exp.Responsibilities.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-gray-700">
                        Responsibilities:
                      </h5>
                      <ul className="pl-5 mt-1 list-disc">
                        {exp.Responsibilities.map((responsibility, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            {responsibility}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No experience listed</p>
          )}
        </div>

        <div>
          <h3 className="mb-3 font-medium text-gray-800 text-md">Education</h3>
          {employee.Education && employee.Education.length > 0 ? (
            <div className="space-y-4">
              {employee.Education.map((edu, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex flex-wrap justify-between">
                    <h4 className="font-medium text-gray-800">{edu.Degree}</h4>
                    <span className="text-sm text-gray-600">
                      {edu.Duration}
                    </span>
                  </div>
                  <p className="text-gray-700">{edu.Institution}</p>
                  {edu.Details && (
                    <p className="mt-1 text-sm text-gray-600">{edu.Details}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No education listed</p>
          )}
        </div>

        {employee["Certifications and Courses"] &&
          employee["Certifications and Courses"].length > 0 && (
            <div>
              <h3 className="mb-3 font-medium text-gray-800 text-md">
                Certifications & Courses
              </h3>
              <div className="p-4 rounded-md bg-gray-50">
                <ul className="pl-5 list-disc">
                  {employee["Certifications and Courses"].map((cert, index) => (
                    <li key={index} className="mb-1 text-gray-700">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
      </div>
    );
  };

  // Render skills tab
  const renderSkillsTab = () => {
    return (
      <div>
        <SkillVisualizer cvData={employee} />
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card title="Employee Details">
        <div className="py-8">
          <Loading text="Loading employee data..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Employee Details">
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchEmployeeData}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card title="Employee Details">
        <div className="py-8 text-center text-gray-500">
          No employee data found
        </div>
      </Card>
    );
  }

  const experienceLevel = getExperienceLevel();

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between">
          <div>
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {employee.Name}
              </h2>
              <span
                className={`ml-3 text-xs px-2.5 py-0.5 rounded ${experienceLevel.color}`}
              >
                {experienceLevel.level}
              </span>
            </div>

            <p className="mt-1 text-gray-600">
              {employee.Experience?.[0]?.Role || "No role specified"}
              {employee.Experience?.[0]?.Company &&
                ` at ${employee.Experience[0].Company}`}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {employee.Skills?.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                >
                  {skill}
                </span>
              ))}
              {employee.Skills?.length > 5 && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                  +{employee.Skills.length - 5} more
                </span>
              )}
            </div>
          </div>

          <div className="flex mt-4 space-x-2 md:mt-0">
            <Link to={`/skill-development/${employeeId}`}>
              <Button
                variant="outline"
                size="sm"
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                }
              >
                Skill Development
              </Button>
            </Link>

            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                }
              >
                Back
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-6 overflow-hidden bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex flex-wrap">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "profile"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile Details
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "skills"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("skills")}
            >
              Skills Analysis
            </button>
          </nav>
        </div>
      </div>

      <Card>
        {activeTab === "profile" ? renderProfileTab() : renderSkillsTab()}
      </Card>
    </div>
  );
};

export default EmployeeDetail;
