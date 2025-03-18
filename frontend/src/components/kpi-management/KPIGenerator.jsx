import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { kpiService } from "../../services/kpiService";

const KPIGenerator = ({ projectData, onKPIsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    project_type: "",
    project_team_size: "",
    project_timeline: "",
    project_languages: "",
    project_sprints: "",
  });

  // Initialize form with project data if available
  useEffect(() => {
    if (projectData) {
      setFormData({
        project_type: projectData.project_type || "",
        project_team_size: projectData.project_team_size || "",
        project_timeline: projectData.project_timeline || "",
        project_languages: projectData.project_languages || "",
        project_sprints: projectData.project_sprints || "",
      });
    }
  }, [projectData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateKPIs = async () => {
    // Validate form data
    const requiredFields = [
      "project_type",
      "project_team_size",
      "project_timeline",
      "project_sprints",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError(
        `Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      // Convert numeric fields
      const kpiData = {
        ...formData,
        project_team_size: parseInt(formData.project_team_size),
        project_timeline: parseInt(formData.project_timeline),
        project_sprints: parseInt(formData.project_sprints),
        // Convert comma-separated languages to array if it's a string
        project_languages:
          typeof formData.project_languages === "string"
            ? formData.project_languages.split(",").map((lang) => lang.trim())
            : formData.project_languages,
      };

      const response = await kpiService.generateKPIs(kpiData);

      if (response.success) {
        if (onKPIsGenerated) {
          onKPIsGenerated(response.data);
        }
      } else {
        setError(response.message || "Failed to generate KPIs");
      }
    } catch (error) {
      console.error("Error generating KPIs:", error);
      setError("An error occurred while generating KPIs. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card
      title="Generate KPIs"
      subtitle="Enter project details to generate relevant Key Performance Indicators"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="project_type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Type*
            </label>
            <select
              id="project_type"
              name="project_type"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.project_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Project Type</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Enterprise">Enterprise Solutions</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="project_team_size"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Team Size*
            </label>
            <input
              type="number"
              id="project_team_size"
              name="project_team_size"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Number of team members"
              value={formData.project_team_size}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="project_timeline"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Timeline (days)*
            </label>
            <input
              type="number"
              id="project_timeline"
              name="project_timeline"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Duration in days"
              value={formData.project_timeline}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="project_sprints"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Sprints*
            </label>
            <input
              type="number"
              id="project_sprints"
              name="project_sprints"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Number of sprints"
              value={formData.project_sprints}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="project_languages"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Technologies & Languages
            </label>
            <input
              type="text"
              id="project_languages"
              name="project_languages"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. React, Node.js, Python (comma separated)"
              value={formData.project_languages}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple technologies with commas
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleGenerateKPIs}
            disabled={isGenerating}
            icon={
              isGenerating ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  className="h-4 w-4 mr-1"
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
            {isGenerating ? "Generating..." : "Generate KPIs"}
          </Button>
        </div>

        {isGenerating && (
          <div className="mt-4">
            <Loading text="Generating KPIs, this may take a moment..." />
          </div>
        )}
      </div>
    </Card>
  );
};

export default KPIGenerator;
