import React, { useState, useEffect } from "react";
import { employeeService } from "../../services/employeeService";
import { recommendationService } from "../../services/recommendationService";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";

const CareerPathView = ({ employeeId }) => {
  const [careerPath, setCareerPath] = useState(null);
  const [skillRecommendations, setSkillRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCareerPathData = async () => {
      setIsLoading(true);
      try {
        // Fetch career path
        const careerPathResponse = await employeeService.getCareerPath(
          employeeId
        );

        // Fetch skill recommendations
        const recommendationResponse =
          await recommendationService.getCareerProgressionRecommendations(
            employeeId,
            careerPathResponse.data.current_role
          );

        setCareerPath(careerPathResponse.data);
        setSkillRecommendations(recommendationResponse.recommendations);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchCareerPathData();
  }, [employeeId]);

  const renderCareerPathProgressBar = () => {
    const readiness = careerPath?.readiness || 0;
    const progressColor =
      readiness >= 0.8
        ? "bg-green-500"
        : readiness >= 0.5
        ? "bg-yellow-500"
        : "bg-red-500";

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className={`${progressColor} h-2.5 rounded-full`}
          style={{ width: `${readiness * 100}%` }}
        ></div>
      </div>
    );
  };

  if (isLoading) return <Loading text="Loading career path..." />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card
      title="Career Progression Insights"
      subtitle="Your path to professional growth"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Current Role: {careerPath.current_role}
          </h3>
          <p className="text-sm text-gray-600">
            {careerPath.years_experience} years of experience
          </p>
          {renderCareerPathProgressBar()}
        </div>

        <div>
          <h4 className="mb-3 font-medium text-gray-800 text-md">
            Next Career Stage: {careerPath.next_level}
          </h4>

          <div className="p-4 border rounded-md">
            <h5 className="mb-2 text-sm font-semibold text-gray-700">
              Skill Gaps to Address
            </h5>
            <div className="space-y-2">
              {skillRecommendations?.skill_gaps?.map((gap, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-gray-50"
                >
                  <span className="text-sm text-gray-700">{gap.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* Open training recommendation */
                    }}
                  >
                    Find Training
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-blue-50">
          <h4 className="mb-2 text-sm font-semibold text-blue-800">
            Recommended Learning Path
          </h4>
          <ul className="space-y-1 text-sm text-blue-700 list-disc list-inside">
            {skillRecommendations?.recommendations?.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default CareerPathView;
