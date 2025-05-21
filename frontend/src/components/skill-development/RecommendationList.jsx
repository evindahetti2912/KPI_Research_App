import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { recommendationService } from "../../services/recommendationService";

const RecommendationList = ({ employeeId, employeeData, analysis }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationType, setRecommendationType] = useState("career");

  const handleGetRecommendations = async () => {
    if (!employeeId) return;

    setIsLoading(true);
    setError("");

    try {
      const currentRole = employeeData?.Experience?.[0]?.Role || "";
      let requestData = {
        current_role: currentRole,
      };

      // If we have skill gaps from analysis, use them
      if (analysis && analysis.skill_gaps) {
        requestData.skill_gaps = analysis.skill_gaps;
      }

      const response = await recommendationService.getRecommendations(
        employeeId,
        recommendationType,
        requestData
      );

      if (response.success) {
        setRecommendations(response.recommendations);
      } else {
        setError(response.message || "Failed to get recommendations");
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setError("An error occurred while getting recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      handleGetRecommendations();
    }
  }, [employeeId, recommendationType, analysis]);

  const renderResourceItem = (resource) => {
    return (
      <div className="p-3 bg-white border rounded-md shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-800">
              {resource.name}
            </h4>
            <p className="mt-1 text-xs text-gray-600">{resource.provider}</p>
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

        {resource.description && (
          <p className="mt-2 text-xs text-gray-600">{resource.description}</p>
        )}

        {resource.url && (
          <div className="mt-3">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Learn More &rarr;
            </a>
          </div>
        )}
      </div>
    );
  };

  const renderCareerRecommendations = () => {
    if (
      !recommendations ||
      !recommendations.technical ||
      !recommendations.soft
    ) {
      return (
        <p className="text-gray-500">
          No recommendations available for career progression.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-medium text-gray-800 text-md">
            For Next Role: {recommendations.next_role}
          </h3>
          <div className="flex items-center mb-4">
            <div className="flex-grow h-2 mr-2 bg-gray-200 rounded-full">
              <div
                className={`h-full rounded-full ${
                  recommendations.readiness >= 0.7
                    ? "bg-green-500"
                    : recommendations.readiness >= 0.4
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${recommendations.readiness * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(recommendations.readiness * 100)}% Ready
            </span>
          </div>
        </div>

        {Object.keys(recommendations.technical).length > 0 && (
          <div>
            <h3 className="mb-3 font-medium text-gray-800 text-md">
              Technical Skills Recommendations
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(recommendations.technical).map(
                ([skill, resources]) => (
                  <div key={skill} className="space-y-3">
                    <h4 className="text-sm font-medium text-blue-700">
                      {skill}
                    </h4>
                    {resources.map((resource, idx) => (
                      <div key={idx}>{renderResourceItem(resource)}</div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {Object.keys(recommendations.soft).length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-medium text-gray-800 text-md">
              Soft Skills Recommendations
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(recommendations.soft).map(
                ([skill, resources]) => (
                  <div key={skill} className="space-y-3">
                    <h4 className="text-sm font-medium text-purple-700">
                      {skill}
                    </h4>
                    {resources.map((resource, idx) => (
                      <div key={idx}>{renderResourceItem(resource)}</div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

const renderSkillGapRecommendations = () => {
  if (!recommendations || Object.keys(recommendations).length === 0) {
    return (
      <p className="text-gray-500">
        No recommendations available for identified skill gaps.
      </p>
    );
  }


return (
    <div className="space-y-6">
      {Object.entries(recommendations).map(([skill, resources]) => (
        <div key={skill} className="space-y-3">
          <h3 className="font-medium text-gray-800 text-md">{skill}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.isArray(resources) ? (
              resources.map((resource, idx) => (
                <div key={idx}>{renderResourceItem(resource)}</div>
              ))
            ) : (
              <p className="text-gray-500">No resources available for this skill.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

  const renderRecommendations = () => {
    if (!recommendations) return null;

    if (recommendationType === "career") {
      return renderCareerRecommendations();
    } else if (recommendationType === "skill_gaps") {
      return renderSkillGapRecommendations();
    }

    return null;
  };

  return (
    <Card
      title="Learning Recommendations"
      subtitle="Personalized training recommendations based on skill gaps"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={recommendationType === "career" ? "primary" : "outline"}
            size="sm"
            onClick={() => setRecommendationType("career")}
          >
            Career Path
          </Button>
          <Button
            variant={
              recommendationType === "skill_gaps" ? "primary" : "outline"
            }
            size="sm"
            onClick={() => setRecommendationType("skill_gaps")}
          >
            Skill Gaps
          </Button>
        </div>

        {isLoading ? (
          <div className="py-8">
            <Loading text="Finding learning resources..." />
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 rounded-md bg-red-50">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleGetRecommendations}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="mt-4">{renderRecommendations()}</div>
        )}
      </div>
    </Card>
  );
};

export default RecommendationList;
