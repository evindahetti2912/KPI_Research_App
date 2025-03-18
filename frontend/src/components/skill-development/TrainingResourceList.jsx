import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { recommendationService } from "../../services/recommendationService";

const TrainingResourceList = ({
  employeeId,
  recommendations,
  onStartTraining,
}) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedResources, setSelectedResources] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset selections when recommendations change
    setSelectedSkills([]);
    setSelectedResources({});
  }, [recommendations]);

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));

      // Remove resources for this skill
      const updatedResources = { ...selectedResources };
      delete updatedResources[skill];
      setSelectedResources(updatedResources);
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleResourceToggle = (skill, resourceIndex) => {
    setSelectedResources((prev) => {
      const updated = { ...prev };

      if (!updated[skill]) {
        updated[skill] = [resourceIndex];
      } else if (updated[skill].includes(resourceIndex)) {
        updated[skill] = updated[skill].filter((idx) => idx !== resourceIndex);
        if (updated[skill].length === 0) {
          delete updated[skill];
        }
      } else {
        updated[skill] = [...updated[skill], resourceIndex];
      }

      return updated;
    });
  };

  const handleCreateDevelopmentPlan = async () => {
    if (!employeeId || Object.keys(selectedResources).length === 0) return;

    setIsLoading(true);

    try {
      // Extract skill gaps from selected skills
      const skillGaps = selectedSkills.map((skill) => ({ name: skill }));

      // Extract selected resources
      const resourcesBySkill = {};

      Object.entries(selectedResources).forEach(([skill, indices]) => {
        if (!recommendations[skill]) return;

        resourcesBySkill[skill] = indices.map(
          (idx) => recommendations[skill][idx]
        );
      });

      if (onStartTraining) {
        onStartTraining(skillGaps, resourcesBySkill);
      }
    } catch (error) {
      console.error("Error preparing development plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSkillSelected = (skill) => selectedSkills.includes(skill);

  const isResourceSelected = (skill, resourceIndex) =>
    selectedResources[skill]?.includes(resourceIndex) || false;

  if (!recommendations || Object.keys(recommendations).length === 0) {
    return (
      <Card title="Available Training Resources">
        <div className="py-8 text-center text-gray-500">
          No training resources available. Please select skills for
          recommendations.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Available Training Resources"
      subtitle="Select skills and resources to create your development plan"
    >
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Select Skills to Develop
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(recommendations).map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`px-3 py-1 rounded-full text-sm ${
                  isSkillSelected(skill)
                    ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {selectedSkills.length > 0 && (
          <div className="space-y-6">
            {selectedSkills.map((skill) => (
              <div key={skill} className="pt-4 border-t">
                <h3 className="mb-3 font-medium text-gray-800 text-md">
                  {skill}
                </h3>
                <div className="space-y-3">
                  {recommendations[skill]?.map((resource, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        isResourceSelected(skill, idx)
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => handleResourceToggle(skill, idx)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">
                            {resource.name}
                          </h4>
                          <p className="mt-1 text-xs text-gray-600">
                            {resource.provider}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
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

                          <div
                            className={`h-5 w-5 rounded-full border ${
                              isResourceSelected(skill, idx)
                                ? "bg-blue-500 border-blue-500 flex items-center justify-center"
                                : "border-gray-300"
                            }`}
                          >
                            {isResourceSelected(skill, idx) && (
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
                        </div>
                      </div>

                      {resource.description && (
                        <p className="mt-2 text-xs text-gray-600">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedSkills.length > 0 && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleCreateDevelopmentPlan}
              disabled={
                isLoading || Object.keys(selectedResources).length === 0
              }
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                )
              }
            >
              {isLoading ? "Creating..." : "Create Development Plan"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TrainingResourceList;
