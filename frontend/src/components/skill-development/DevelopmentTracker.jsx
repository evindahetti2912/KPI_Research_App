import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { recommendationService } from "../../services/recommendationService";

const DevelopmentTracker = ({ employeeId, planId }) => {
  const [developmentPlan, setDevelopmentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillProgress, setSkillProgress] = useState({});
  const [completedResources, setCompletedResources] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (employeeId && planId) {
      fetchDevelopmentPlan();
    }
  }, [employeeId, planId]);

  const fetchDevelopmentPlan = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await recommendationService.getDevelopmentPlan(
        employeeId,
        planId
      );

      if (response.success) {
        setDevelopmentPlan(response.development_plan);

        // Initialize progress tracking state
        const initialProgress = {};
        const initialCompletedResources = {};

        response.development_plan.skills.forEach((skill) => {
          initialProgress[skill.name] = skill.progress || 0;
          initialCompletedResources[skill.name] = skill.resources
            .filter((resource) => resource.completed)
            .map((resource) => resource.name);
        });

        setSkillProgress(initialProgress);
        setCompletedResources(initialCompletedResources);
      } else {
        setError(response.message || "Failed to fetch development plan");
      }
    } catch (error) {
      console.error("Error fetching development plan:", error);
      setError("An error occurred while fetching the development plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressChange = (skillName, value) => {
    setSkillProgress((prev) => ({
      ...prev,
      [skillName]: value,
    }));
  };

  const handleResourceToggle = (skillName, resourceName) => {
    setCompletedResources((prev) => {
      const updated = { ...prev };

      if (!updated[skillName]) {
        updated[skillName] = [resourceName];
      } else if (updated[skillName].includes(resourceName)) {
        updated[skillName] = updated[skillName].filter(
          (name) => name !== resourceName
        );
      } else {
        updated[skillName] = [...updated[skillName], resourceName];
      }

      return updated;
    });
  };

  const handleUpdateProgress = async (skillName) => {
    if (!skillProgress[skillName]) return;

    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      const progress = parseFloat(skillProgress[skillName]);
      const resources = completedResources[skillName] || [];

      const response = await recommendationService.trackProgress(
        employeeId,
        planId,
        skillName,
        progress,
        resources
      );

      if (response.success) {
        setDevelopmentPlan(response.updated_plan);
        setUpdateSuccess(true);

        // Update other skills' progress from the response
        const updatedProgress = {};
        const updatedCompletedResources = {};

        response.updated_plan.skills.forEach((skill) => {
          updatedProgress[skill.name] = skill.progress || 0;
          updatedCompletedResources[skill.name] = skill.resources
            .filter((resource) => resource.completed)
            .map((resource) => resource.name);
        });

        setSkillProgress(updatedProgress);
        setCompletedResources(updatedCompletedResources);
      } else {
        setError(response.message || "Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      setError("An error occurred while updating progress");
    } finally {
      setIsUpdating(false);

      // Clear success message after 3 seconds
      if (updateSuccess) {
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 0.8) return "bg-green-500";
    if (progress >= 0.4) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getStatusText = (progress) => {
    if (progress >= 1) return "Completed";
    if (progress >= 0.7) return "Advanced";
    if (progress >= 0.3) return "In Progress";
    if (progress > 0) return "Started";
    return "Not Started";
  };

  const getStatusColor = (progress) => {
    if (progress >= 1) return "bg-green-100 text-green-800";
    if (progress >= 0.7) return "bg-blue-100 text-blue-800";
    if (progress >= 0.3) return "bg-yellow-100 text-yellow-800";
    if (progress > 0) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card title="Development Plan">
        <div className="py-8">
          <Loading text="Loading development plan..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Development Plan">
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchDevelopmentPlan}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!developmentPlan) {
    return (
      <Card title="Development Plan">
        <div className="py-8 text-center text-gray-500">
          No development plan found. Create one from recommendations.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Development Plan Tracker"
      subtitle={`Created on ${formatDate(developmentPlan.created_at)}`}
    >
      <div className="space-y-6">
        <div className="p-4 rounded-md bg-gray-50">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Overall Progress</h3>
              <p className="mt-1 text-sm text-gray-600">
                Plan duration: {developmentPlan.duration_days} days (
                {formatDate(developmentPlan.start_date)} to{" "}
                {formatDate(developmentPlan.end_date)})
              </p>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(developmentPlan.overall_progress * 100)}%
            </div>
          </div>

          <div className="mt-3">
            <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
              <div
                className={`h-full ${getProgressColor(
                  developmentPlan.overall_progress
                )}`}
                style={{ width: `${developmentPlan.overall_progress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {developmentPlan.skills.map((skill) => (
            <div key={skill.name} className="pt-4 border-t">
              <div className="flex flex-wrap items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-800">{skill.name}</h3>
                  <div className="flex items-center mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getStatusColor(
                        skill.progress
                      )}`}
                    >
                      {getStatusText(skill.progress)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      Due by {formatDate(skill.target_date)}
                    </span>
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(skill.progress * 100)}%
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1 text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(skill.progress * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className={`h-full ${getProgressColor(skill.progress)}`}
                    style={{ width: `${skill.progress * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor={`progress-${skill.name}`}
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Update Progress
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id={`progress-${skill.name}`}
                    min="0"
                    max="1"
                    step="0.1"
                    value={skillProgress[skill.name] || 0}
                    onChange={(e) =>
                      handleProgressChange(skill.name, e.target.value)
                    }
                    className="flex-grow h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {Math.round((skillProgress[skill.name] || 0) * 100)}%
                  </span>
                </div>
              </div>

              {skill.resources && skill.resources.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    Learning Resources
                  </h4>
                  <div className="space-y-2">
                    {skill.resources.map((resource, idx) => (
                      <div
                        key={idx}
                        className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          handleResourceToggle(skill.name, resource.name)
                        }
                      >
                        <div
                          className={`h-5 w-5 rounded border mr-3 ${
                            completedResources[skill.name]?.includes(
                              resource.name
                            )
                              ? "bg-green-500 border-green-500 flex items-center justify-center"
                              : "border-gray-300"
                          }`}
                        >
                          {completedResources[skill.name]?.includes(
                            resource.name
                          ) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p
                            className={`text-sm ${
                              completedResources[skill.name]?.includes(
                                resource.name
                              )
                                ? "line-through text-gray-500"
                                : "text-gray-800"
                            }`}
                          >
                            {resource.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {resource.provider}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            resource.type === "Course"
                              ? "bg-blue-100 text-blue-800"
                              : resource.type === "Book"
                              ? "bg-purple-100 text-purple-800"
                              : resource.type === "Tutorial"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {resource.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateProgress(skill.name)}
                  disabled={isUpdating}
                >
                  Update Progress
                </Button>
              </div>
            </div>
          ))}
        </div>

        {updateSuccess && (
          <div className="p-3 mt-4 text-green-700 rounded-md bg-green-50">
            Progress updated successfully!
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <span className="text-sm text-gray-500">
            Keep track of your progress and mark completed resources
          </span>

          <Button
            variant="primary"
            onClick={fetchDevelopmentPlan}
            disabled={isLoading}
          >
            Refresh Plan
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DevelopmentTracker;
