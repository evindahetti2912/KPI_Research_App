import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { Link } from "react-router-dom";
import { projectService } from "../../services/projectService";
import { employeeService } from "../../services/employeeService";

const DeveloperMatcher = ({ projectId, onUpdateTeam }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState("");
  const [project, setProject] = useState(null);
  const [matchedEmployees, setMatchedEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await projectService.getProject(projectId);

      if (response.success) {
        setProject(response.data);

        // If the project already has a team, load these employees as selected
        if (
          response.data.team &&
          response.data.team.employee_ids &&
          response.data.team.employee_ids.length > 0
        ) {
          setSelectedEmployees(response.data.team.employee_ids);
        }
      } else {
        setError(response.message || "Failed to fetch project details");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError("An error occurred while fetching project details");
    } finally {
      setIsLoading(false);
    }
  };

  const matchEmployees = async () => {
    if (!project) return;

    setIsMatching(true);
    setError("");

    try {
      const response = await employeeService.matchEmployees({
        project_criteria: {
          languages: project.project_languages,
          field: project.project_type,
          people_count: project.project_team_size,
          project_type: project.project_type,
        },
      });

      if (response.success) {
        setMatchedEmployees(response.matched_employees || []);
      } else {
        setError(response.message || "Failed to match employees");
      }
    } catch (error) {
      console.error("Error matching employees:", error);
      setError("An error occurred while matching employees");
    } finally {
      setIsMatching(false);
    }
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const assignTeam = async () => {
    if (!project || selectedEmployees.length === 0) return;

    setIsLoading(true);
    setError("");

    try {
      // Update project with selected team members
      const response = await projectService.updateProject(projectId, {
        team: {
          employee_ids: selectedEmployees,
          updated_at: new Date().toISOString(),
        },
      });

      if (response.success) {
        // Call the parent component's update function if provided
        if (onUpdateTeam) {
          onUpdateTeam(selectedEmployees);
        }

        // Refresh project data
        fetchProjectDetails();
      } else {
        setError(response.message || "Failed to assign team");
      }
    } catch (error) {
      console.error("Error assigning team:", error);
      setError("An error occurred while assigning the team");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the skill match score with appropriate color
  const renderMatchScore = (score) => {
    let bgColor = "bg-red-100 text-red-800";
    if (score >= 0.8) {
      bgColor = "bg-green-100 text-green-800";
    } else if (score >= 0.6) {
      bgColor = "bg-yellow-100 text-yellow-800";
    } else if (score >= 0.4) {
      bgColor = "bg-orange-100 text-orange-800";
    }

    return (
      <span className={`text-xs px-2 py-0.5 rounded ${bgColor}`}>
        {Math.round(score * 100)}%
      </span>
    );
  };

  return (
    <Card title="Match Developers to Project">
      {isLoading ? (
        <div className="py-6">
          <Loading text="Loading project details..." />
        </div>
      ) : error ? (
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
        </div>
      ) : !project ? (
        <div className="py-6 text-center">
          <p className="text-gray-500">Project not found</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-2 font-medium text-gray-800">{project.name}</h3>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div>
                <span className="text-gray-600">Project Type:</span>{" "}
                <span className="font-medium">
                  {project.project_type || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Team Size:</span>{" "}
                <span className="font-medium">
                  {project.project_team_size || "N/A"} members
                </span>
              </div>
              <div>
                <span className="text-gray-600">Technologies:</span>{" "}
                <span className="font-medium">
                  {project.project_languages || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">
              {matchedEmployees.length > 0
                ? "Matched Developers"
                : "Find Suitable Developers"}
            </h3>
            <Button
              onClick={matchEmployees}
              disabled={isMatching || !project}
              icon={
                isMatching ? (
                  <svg
                    className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )
              }
            >
              {isMatching
                ? "Matching..."
                : matchedEmployees.length > 0
                ? "Re-match Developers"
                : "Find Best Matches"}
            </Button>
          </div>

          {isMatching ? (
            <div className="py-6">
              <Loading text="Matching developers to project requirements..." />
            </div>
          ) : matchedEmployees.length === 0 ? (
            <div className="p-8 text-center rounded-md bg-gray-50">
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
                Click "Find Best Matches" to automatically match the most
                suitable developers for this project based on skills and
                experience.
              </p>
              <Button variant="outline" size="sm" onClick={matchEmployees}>
                Find Matches
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {matchedEmployees.map((matchData) => (
                  <div
                    key={matchData.employee._id}
                    className={`border rounded-lg p-4 transition ${
                      selectedEmployees.includes(matchData.employee._id)
                        ? "border-green-500 bg-green-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`employee-${matchData.employee._id}`}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedEmployees.includes(
                              matchData.employee._id
                            )}
                            onChange={() =>
                              toggleEmployeeSelection(matchData.employee._id)
                            }
                          />
                          <label
                            htmlFor={`employee-${matchData.employee._id}`}
                            className="ml-2 font-medium text-gray-900"
                          >
                            {matchData.employee.Name}
                          </label>
                          <div className="flex items-center ml-3 space-x-2">
                            <span className="text-xs text-gray-500">
                              Match:
                            </span>
                            {renderMatchScore(matchData.total_score)}
                          </div>
                        </div>

                        <div className="mt-2 ml-6">
                          <div className="text-sm text-gray-600">
                            {matchData.employee["Contact Information"]?.Email ||
                              "No email available"}
                          </div>

                          <div className="grid grid-cols-2 mt-2 text-sm gap-x-6 gap-y-2">
                            <div>
                              <span className="text-gray-500">
                                Skill Match:
                              </span>{" "}
                              {renderMatchScore(
                                matchData.scores.skill_match || 0
                              )}
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Experience Relevance:
                              </span>{" "}
                              {renderMatchScore(
                                matchData.scores.experience_relevance || 0
                              )}
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Years of Experience:
                              </span>{" "}
                              {renderMatchScore(
                                matchData.scores.years_experience || 0
                              )}
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Project Type Match:
                              </span>{" "}
                              {renderMatchScore(
                                matchData.scores.project_type_match || 0
                              )}
                            </div>
                          </div>

                          {/* Skill gaps section */}
                          {matchData.skill_gap &&
                            matchData.skill_gap.length > 0 && (
                              <div className="mt-3">
                                <div className="mb-1 text-xs font-medium text-gray-500">
                                  Missing Skills:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {matchData.skill_gap.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="mt-2 md:mt-0">
                        <Link
                          to={`/talent-pool/${matchData.employee._id}`}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
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
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-gray-500">
                  Selected {selectedEmployees.length} of{" "}
                  {matchedEmployees.length} developers
                </div>
                <Button
                  onClick={assignTeam}
                  disabled={selectedEmployees.length === 0 || isLoading}
                  icon={
                    isLoading ? (
                      <svg
                        className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )
                  }
                >
                  {isLoading ? "Assigning..." : "Assign Team"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default DeveloperMatcher;
