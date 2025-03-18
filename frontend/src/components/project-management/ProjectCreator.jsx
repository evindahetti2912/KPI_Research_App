import React, { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { projectService } from "../../services/projectService";

const ProjectCreator = ({ onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    project_type: "",
    project_team_size: "",
    project_timeline: "",
    project_languages: "",
    project_sprints: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const requiredFields = ["name", "project_type", "project_team_size", "project_timeline", "project_sprints"];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      // Convert numeric fields
      const projectData = {
        ...formData,
        project_team_size: parseInt(formData.project_team_size),
        project_timeline: parseInt(formData.project_timeline),
        project_sprints: parseInt(formData.project_sprints),
      };

      const response = await projectService.createProject(projectData);

      if (response.success) {
        setSuccess(true);
        setFormData({
          name: "",
          project_type: "",
          project_team_size: "",
          project_timeline: "",
          project_languages: "",
          project_sprints: "",
          description: "",
        });
        
        if (onProjectCreated) {
          onProjectCreated(response.project_id);
        }
      } else {
        setError(response.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError("An error occurred while creating the project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Create New Project" subtitle="Fill in the details to create a new project">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
              Project Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="project_type" className="block mb-1 text-sm font-medium text-gray-700">
              Project Type*
            </label>
            <select
              id="project_type"
              name="project_type"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.project_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Project Type</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Enterprise">Enterprise Solutions</option>
              <option value="Cloud">Cloud Infrastructure</option>
            </select>
          </div>

          <div>
            <label htmlFor="project_team_size" className="block mb-1 text-sm font-medium text-gray-700">
              Team Size*
            </label>
            <input
              type="number"
              id="project_team_size"
              name="project_team_size"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Number of team members"
              value={formData.project_team_size}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="project_timeline" className="block mb-1 text-sm font-medium text-gray-700">
              Project Timeline (days)*
            </label>
            <input
              type="number"
              id="project_timeline"
              name="project_timeline"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Duration in days"
              value={formData.project_timeline}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="project_sprints" className="block mb-1 text-sm font-medium text-gray-700">
              Number of Sprints*
            </label>
            <input
              type="number"
              id="project_sprints"
              name="project_sprints"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Number of sprints"
              value={formData.project_sprints}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="project_languages" className="block mb-1 text-sm font-medium text-gray-700">
              Technologies & Languages
            </label>
            <input
              type="text"
              id="project_languages"
              name="project_languages"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. React, Node.js, Python (comma separated)"
              value={formData.project_languages}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-gray-500">Separate multiple technologies with commas</p>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
            Project Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide a brief description of the project"
            value={formData.description}
            onChange={handleInputChange}
          ></textarea>
        </div>

        {error && (
          <div className="p-3 text-red-700 rounded-md bg-red-50">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 text-green-700 rounded-md bg-green-50">
            <p>Project created successfully!</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            icon={
              isSubmitting ? (
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              )
            }
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProjectCreator;