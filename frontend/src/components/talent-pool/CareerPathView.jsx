import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { employeeService } from "../../services/employeeService";
import { recommendationService } from "../../services/recommendationService";

const CareerPathView = ({ employeeId }) => {
  const [employee, setEmployee] = useState(null);
  const [careerPath, setCareerPath] = useState(null);
  const [skillRecommendations, setSkillRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobRoles, setJobRoles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch employee data
        const employeeResponse = await employeeService.getEmployee(employeeId);
        if (!employeeResponse.success) {
          throw new Error(
            employeeResponse.message || "Failed to fetch employee data"
          );
        }

        const employeeData = employeeResponse.data;
        setEmployee(employeeData);

        // Get all job roles for context
        const rolesResponse = await recommendationService.getJobRoles();
        if (rolesResponse.success) {
          setJobRoles(rolesResponse.roles || []);
        }

        // Analyze career path
        const analyzeResponse = await recommendationService.analyzeSkillGap(
          employeeId,
          "career",
          { current_role: employeeData.Experience?.[0]?.Role || "" }
        );

        if (!analyzeResponse.success) {
          throw new Error(
            analyzeResponse.message || "Failed to analyze career path"
          );
        }

        setCareerPath(analyzeResponse.analysis);

        // Get skill recommendations
        const recommendationsResponse =
          await recommendationService.getRecommendations(employeeId, "career");

        if (recommendationsResponse.success) {
          setSkillRecommendations(recommendationsResponse.recommendations);
        }
      } catch (err) {
        console.error("Error fetching career data:", err);
        setError(err.message || "An error occurred while loading career data");
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  // Create career progression path visualization
  const renderCareerPath = () => {
    if (!careerPath || !jobRoles.length) return null;

    const currentRole = careerPath.current_role;
    const nextRole = careerPath.next_role;

    // Find current role level
    const currentRoleData = jobRoles.find(
      (role) => role.name === currentRole
    ) || { level: 1 };
    const currentLevel = currentRoleData.level;

    // Create a path array of all roles, marking current and next
    const sortedRoles = [...jobRoles].sort((a, b) => a.level - b.level);

    return (
      <div className="my-6">
        <h3 className="mb-4 font-medium text-gray-800 text-md">
          Career Progression Path
        </h3>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-5 top-6 h-full w-0.5 bg-gray-200"></div>

          {/* Role nodes */}
          <div className="space-y-8">
            {sortedRoles.map((role) => {
              const isCurrent = role.name === currentRole;
              const isNext = role.name === nextRole;

              let nodeColor = "bg-gray-200 border-gray-300";
              let textColor = "text-gray-500";

              if (isCurrent) {
                nodeColor = "bg-blue-500 border-blue-600";
                textColor = "text-blue-800 font-medium";
              } else if (isNext) {
                nodeColor = "bg-green-200 border-green-300";
                textColor = "text-green-800";
              }

              return (
                <div key={role.name} className="flex items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${nodeColor} border-2 z-10`}
                  >
                    <span className="text-sm font-bold text-white">
                      {role.level}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className={`text-sm ${textColor}`}>{role.name}</h4>
                    {role.min_experience > 0 && (
                      <p className="text-xs text-gray-500">
                        {role.min_experience}+ years of experience
                      </p>
                    )}
                    {isCurrent && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mt-1 inline-block">
                        Current Role
                      </span>
                    )}
                    {isNext && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded mt-1 inline-block">
                        Next Step
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Loading text="Analyzing career path..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 rounded-md bg-red-50">
        <p>{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {employee && careerPath && (
        <>
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {employee.Name}
                </h2>
                <p className="text-sm text-gray-500">
                  Current Role: {careerPath.current_role || "Not specified"}
                </p>
              </div>
              <div className="p-2 rounded-md bg-blue-50">
                <span className="block text-xs text-gray-500">
                  Years of Experience
                </span>
                <span className="text-2xl font-bold text-blue-700">
                  {employee._derived?.total_years_experience || "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-700">
                  Readiness for {careerPath.next_role}:
                </span>
                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      careerPath.readiness >= 0.7
                        ? "bg-green-500"
                        : careerPath.readiness >= 0.4
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${careerPath.readiness * 100}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-sm font-semibold">
                  {Math.round(careerPath.readiness * 100)}%
                </span>
              </div>
            </div>
          </div>

          {renderCareerPath()}

          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-3 font-medium text-gray-800 text-md">
              Required Skills for Next Role
            </h3>

            {careerPath.skill_gaps && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {careerPath.skill_gaps.technical &&
                  careerPath.skill_gaps.technical.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-700">
                        Technical Skills
                      </h4>
                      <div className="p-3 rounded-md bg-gray-50">
                        {careerPath.skill_gaps.technical.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <span className="text-sm text-gray-700">
                              {skill.name}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Required
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {careerPath.skill_gaps.soft &&
                  careerPath.skill_gaps.soft.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-700">
                        Soft Skills
                      </h4>
                      <div className="p-3 rounded-md bg-gray-50">
                        {careerPath.skill_gaps.soft.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <span className="text-sm text-gray-700">
                              {skill.name}
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              Required
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {(!careerPath.skill_gaps ||
              (!careerPath.skill_gaps.technical?.length &&
                !careerPath.skill_gaps.soft?.length)) && (
              <p className="text-gray-500">
                No skill gaps identified for next role.
              </p>
            )}
          </div>

          {skillRecommendations && (
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <h3 className="mb-3 font-medium text-gray-800 text-md">
                Recommended Learning Path
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Object.entries(skillRecommendations).some(
                  ([category, resources]) =>
                    category !== "next_role" &&
                    category !== "readiness" &&
                    Object.keys(resources).length > 0
                ) ? (
                  Object.entries(skillRecommendations).map(
                    ([category, resources]) => {
                      if (category === "next_role" || category === "readiness")
                        return null;
                      if (Object.keys(resources).length === 0) return null;

                      return (
                        <div key={category}>
                          <h4 className="mb-2 text-sm font-medium text-gray-700 capitalize">
                            {category} Skills
                          </h4>
                          <div className="space-y-3">
                            {Object.entries(resources).map(
                              ([skill, skillResources]) => (
                                <div
                                  key={skill}
                                  className="p-3 rounded-md bg-gray-50"
                                >
                                  <h5 className="mb-2 text-sm font-medium text-gray-800">
                                    {skill}
                                  </h5>
                                  {skillResources.length > 0 ? (
                                    <ul className="space-y-2">
                                      {skillResources
                                        .slice(0, 2)
                                        .map((resource, index) => (
                                          <li key={index} className="text-sm">
                                            <div className="flex items-start">
                                              <span
                                                className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-2 ${
                                                  resource.type === "Course"
                                                    ? "bg-blue-500"
                                                    : resource.type === "Book"
                                                    ? "bg-green-500"
                                                    : "bg-purple-500"
                                                }`}
                                              ></span>
                                              <div>
                                                <span className="font-medium">
                                                  {resource.name}
                                                </span>
                                                <span className="block text-xs text-gray-500">
                                                  {resource.provider}
                                                </span>
                                              </div>
                                            </div>
                                          </li>
                                        ))}
                                      {skillResources.length > 2 && (
                                        <li className="text-xs text-gray-500">
                                          +{skillResources.length - 2} more
                                          resources
                                        </li>
                                      )}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      No resources available
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="col-span-2">
                    <p className="text-gray-500">
                      No learning recommendations available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Link to={`/skill-development/${employeeId}`}>
              <Button
                variant="primary"
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
                Create Development Plan
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CareerPathView;
