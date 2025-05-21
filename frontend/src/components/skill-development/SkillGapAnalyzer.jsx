import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { recommendationService } from "../../services/recommendationService";

const SkillGapAnalyzer = ({ employeeId, employeeData, onAnalysisComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analysisType, setAnalysisType] = useState("career");

const handleAnalyzeSkillGap = async () => {
  if (!employeeId) return;

  setIsLoading(true);
  setError("");

  try {
    const currentRole = employeeData?.Experience?.[0]?.Role || "";
    
    // Make sure we provide role_name for role-based analysis
    const requestData = {
      analysis_type: analysisType,
      current_role: currentRole
    };
    
    // For role analysis, ensure we have a default role if none provided
    if (analysisType === "role") {
      requestData.role_name = "Software Engineer"; // Default role if none selected
    }

    const response = await recommendationService.analyzeSkillGap(
      employeeId,
      analysisType,
      requestData
    );

    if (response.success) {
      setAnalysis(response.analysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(response.analysis);
      }
    } else {
      setError(response.message || "Failed to analyze skill gap");
    }
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    setError("An error occurred while analyzing skill gap");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    if (employeeId) {
      handleAnalyzeSkillGap();
    }
  }, [employeeId, analysisType]);

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    if (analysisType === "career") {
      return renderCareerAnalysis();
    } else if (analysisType === "role") {
      return renderRoleAnalysis();
    }

    return null;
  };

  const renderCareerAnalysis = () => {
    if (!analysis) return null;

    const { current_role, next_role, readiness, skill_gaps } = analysis;
    const readinessPercentage = Math.round((readiness || 0) * 100);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
          <div className="p-4 bg-white rounded-md shadow">
            <h3 className="mb-1 text-sm font-medium text-gray-700">
              Current Role
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {current_role || "Unknown"}
            </p>
          </div>

          <div className="p-4 bg-white rounded-md shadow">
            <h3 className="mb-1 text-sm font-medium text-gray-700">
              Next Role
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {next_role || "Highest Level"}
            </p>
          </div>

          <div className="p-4 bg-white rounded-md shadow">
            <h3 className="mb-1 text-sm font-medium text-gray-700">
              Readiness
            </h3>
            <div className="flex items-center">
              <div className="flex-grow h-2 mr-2 bg-gray-200 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    readinessPercentage >= 70
                      ? "bg-green-500"
                      : readinessPercentage >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${readinessPercentage}%` }}
                ></div>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {readinessPercentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-md shadow">
          <h3 className="mb-3 font-medium text-gray-800">
            Skill Gaps for Next Role
          </h3>

          {skill_gaps && (
            <div className="space-y-4">
              {skill_gaps.technical && skill_gaps.technical.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skill_gaps.technical.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skill_gaps.soft && skill_gaps.soft.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    Soft Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skill_gaps.soft.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(!skill_gaps ||
            (!skill_gaps.technical?.length && !skill_gaps.soft?.length)) && (
            <p className="text-gray-500">
              No skill gaps identified for the next role.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderRoleAnalysis = () => {
    if (!analysis || !analysis.role) return null;

    // Destructure with default values to prevent "undefined" errors
    const {
      role,
      technical = {},
      soft = {},
      overall_coverage = 0,
      is_qualified = false,
    } = analysis;

    // Provide default objects for technical and soft skill data
    const technicalData = {
      coverage: technical?.coverage || 0,
      gaps: technical?.gaps || [],
      matches: technical?.matches || [],
    };

    const softData = {
      coverage: soft?.coverage || 0,
      gaps: soft?.gaps || [],
      matches: soft?.matches || [],
    };

    const coveragePercentage = Math.round(overall_coverage * 100);

    return (
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-md shadow">
          <h3 className="mb-2 font-medium text-gray-800">
            Role Analysis: {role}
          </h3>

          <div className="mb-4">
            <h4 className="mb-1 text-sm font-medium text-gray-700">
              Overall Coverage
            </h4>
            <div className="flex items-center">
              <div className="flex-grow h-2 mr-2 bg-gray-200 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    coveragePercentage >= 70
                      ? "bg-green-500"
                      : coveragePercentage >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${coveragePercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {coveragePercentage}%
              </span>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <span className="mr-2 text-sm text-gray-700">
              Qualification Status:
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded ${
                is_qualified
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {is_qualified ? "Qualified" : "Not Qualified"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="p-4 bg-white rounded-md shadow">
            <h3 className="mb-3 font-medium text-gray-800">Technical Skills</h3>

            <div className="mb-2">
              <div className="flex justify-between mb-1 text-xs text-gray-500">
                <span>Coverage</span>
                <span>{Math.round(technicalData.coverage * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${technicalData.coverage * 100}%` }}
                ></div>
              </div>
            </div>

            {technicalData.gaps.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {technicalData.gaps.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {technicalData.matches.length > 0 && (
              <div className="mt-3">
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Matching Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {technicalData.matches.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white rounded-md shadow">
            <h3 className="mb-3 font-medium text-gray-800">Soft Skills</h3>

            <div className="mb-2">
              <div className="flex justify-between mb-1 text-xs text-gray-500">
                <span>Coverage</span>
                <span>{Math.round(softData.coverage * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${softData.coverage * 100}%` }}
                ></div>
              </div>
            </div>

            {softData.gaps.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {softData.gaps.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {softData.matches.length > 0 && (
              <div className="mt-3">
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Matching Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {softData.matches.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card
      title="Skill Gap Analysis"
      subtitle="Analyze skill gaps against roles or career progression paths"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={analysisType === "career" ? "primary" : "outline"}
            size="sm"
            onClick={() => setAnalysisType("career")}
          >
            Career Progression
          </Button>
          <Button
            variant={analysisType === "role" ? "primary" : "outline"}
            size="sm"
            onClick={() => setAnalysisType("role")}
          >
            Role Requirements
          </Button>
        </div>

        {isLoading ? (
          <div className="py-8">
            <Loading text="Analyzing skill gaps..." />
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 rounded-md bg-red-50">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleAnalyzeSkillGap}
            >
              Retry
            </Button>
          </div>
        ) : (
          renderAnalysisResults()
        )}
      </div>
    </Card>
  );
};

export default SkillGapAnalyzer;
