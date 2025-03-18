import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { projectService } from "../../services/projectService";
import { employeeService } from "../../services/employeeService";

const TeamComposition = ({ projectId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamData, setTeamData] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState([]);

  useEffect(() => {
    if (projectId) {
      fetchTeamData();
    }
  }, [projectId]);

  const fetchTeamData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await projectService.getProjectTeam(projectId);

      if (response.success) {
        setTeamData(response.data);

        // If employees are already included in the response
        if (response.data.employees && response.data.employees.length > 0) {
          setEmployeeDetails(response.data.employees);
        }
        // Otherwise, fetch employee details if there are employee IDs
        else if (
          response.data.employee_ids &&
          response.data.employee_ids.length > 0
        ) {
          await fetchEmployeeDetails(response.data.employee_ids);
        }
      } else {
        setError(response.message || "Failed to fetch team data");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      setError("An error occurred while fetching team data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeIds) => {
    try {
      const employeePromises = employeeIds.map((id) =>
        employeeService.getEmployee(id)
      );

      const employeeResponses = await Promise.all(employeePromises);

      // Extract employee data from successful responses
      const employees = employeeResponses
        .filter((response) => response.success)
        .map((response) => response.data);

      setEmployeeDetails(employees);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setError("An error occurred while fetching employee details");
    }
  };

  // Function to categorize skills
  const categorizeSkills = (skills = []) => {
    if (!skills.length) return {};

    // Simple categorization logic
    const categories = {
      programming: [],
      frameworks: [],
      databases: [],
      other: [],
    };

    const programmingKeywords = [
      "java",
      "python",
      "javascript",
      "c++",
      "c#",
      "ruby",
      "php",
      "swift",
      "kotlin",
      "go",
    ];
    const frameworkKeywords = [
      "react",
      "angular",
      "vue",
      "django",
      "flask",
      "spring",
      "laravel",
      "express",
      "next.js",
    ];
    const databaseKeywords = [
      "sql",
      "mongodb",
      "postgresql",
      "mysql",
      "oracle",
      "nosql",
      "redis",
      "firebase",
      "dynamodb",
    ];

    skills.forEach((skill) => {
      const skillLower = skill.toLowerCase();

      if (programmingKeywords.some((keyword) => skillLower.includes(keyword))) {
        categories.programming.push(skill);
      } else if (
        frameworkKeywords.some((keyword) => skillLower.includes(keyword))
      ) {
        categories.frameworks.push(skill);
      } else if (
        databaseKeywords.some((keyword) => skillLower.includes(keyword))
      ) {
        categories.databases.push(skill);
      } else {
        categories.other.push(skill);
      }
    });

    return categories;
  };

  // Function to render skill badges
  const renderSkillBadges = (skills = [], limit = 5) => {
    if (!skills.length)
      return <span className="text-sm text-gray-500">No skills listed</span>;

    return (
      <div className="flex flex-wrap gap-2">
        {skills.slice(0, limit).map((skill, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
          >
            {skill}
          </span>
        ))}
        {skills.length > limit && (
          <span className="text-gray-500 text-xs px-2 py-0.5 rounded border">
            +{skills.length - limit} more
          </span>
        )}
      </div>
    );
  };

  return (
    <Card title="Project Team">
      {isLoading ? (
        <div className="py-6">
          <Loading text="Loading team data..." />
        </div>
      ) : error ? (
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchTeamData}
          >
            Retry
          </Button>
        </div>
      ) : !teamData ||
        (!teamData.employee_ids?.length && !employeeDetails.length) ? (
        <div className="py-8 text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-400"
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
          <p className="mb-4 text-gray-500">
            No team members assigned to this project yet
          </p>
          <Link to={`/projects/${projectId}/match`}>
            <Button variant="primary" size="sm">
              Assign Team Members
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                Team Members ({employeeDetails.length})
              </h3>
              <p className="text-sm text-gray-500">
                {teamData.updated_at
                  ? `Last updated: ${new Date(
                      teamData.updated_at
                    ).toLocaleString()}`
                  : `Total: ${employeeDetails.length} developers`}
              </p>
            </div>
            <Link to={`/projects/${projectId}/match`}>
              <Button variant="outline" size="sm">
                Update Team
              </Button>
            </Link>
          </div>

          <div className="space-y-4 divide-y">
            {employeeDetails.map((employee) => {
              // Calculate experience level based on total years
              const yearsOfExperience =
                employee._derived?.total_years_experience ||
                employee.Experience?.length ||
                0;

              let experienceLevel = "Junior";
              let badgeColor = "bg-green-100 text-green-800";

              if (yearsOfExperience >= 8) {
                experienceLevel = "Lead";
                badgeColor = "bg-indigo-100 text-indigo-800";
              } else if (yearsOfExperience >= 5) {
                experienceLevel = "Senior";
                badgeColor = "bg-purple-100 text-purple-800";
              } else if (yearsOfExperience >= 2) {
                experienceLevel = "Mid-level";
                badgeColor = "bg-blue-100 text-blue-800";
              }

              // Get categorized skills
              const skillCategories =
                employee._derived?.skill_categories ||
                categorizeSkills(employee.Skills);

              return (
                <div key={employee._id} className="pt-4 first:pt-0">
                  <div className="flex flex-wrap justify-between">
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">
                          {employee.Name}
                        </h4>
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded ${badgeColor}`}
                        >
                          {experienceLevel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {employee["Contact Information"]?.Email ||
                          "No email available"}
                      </p>
                    </div>
                    <div>
                      <Link
                        to={`/talent-pool/${employee._id}`}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Profile
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-3 md:grid-cols-2">
                    <div>
                      <h5 className="mb-1 text-xs font-medium text-gray-700">
                        Key Skills
                      </h5>
                      {renderSkillBadges(employee.Skills, 8)}
                    </div>
                    <div>
                      <h5 className="mb-1 text-xs font-medium text-gray-700">
                        Experience
                      </h5>
                      <div className="text-sm">
                        {employee.Experience &&
                        employee.Experience.length > 0 ? (
                          <div className="space-y-1">
                            {employee.Experience.slice(0, 2).map(
                              (exp, index) => (
                                <div key={index} className="text-gray-600">
                                  {exp.Role} at {exp.Company} ({exp.Duration})
                                </div>
                              )
                            )}
                            {employee.Experience.length > 2 && (
                              <div className="text-xs text-gray-500">
                                + {employee.Experience.length - 2} more
                                positions
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            No experience listed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Link to={`/projects/${projectId}`}>
              <Button
                variant="outline"
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
                Back to Project Details
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TeamComposition;
