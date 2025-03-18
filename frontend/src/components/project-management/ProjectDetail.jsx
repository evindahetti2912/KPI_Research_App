import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import Modal from "../common/Modal";
import { projectService } from "../../services/projectService";

const ProjectDetail = ({ projectId, onBack }) => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

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
        // Initialize edit form with current project data
        setEditFormData(response.data);
      } else {
        setError(response.message || "Failed to fetch project details");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError(
        "An error occurred while fetching project details. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Convert numeric fields
      const updateData = {
        ...editFormData,
        project_team_size: parseInt(editFormData.project_team_size),
        project_timeline: parseInt(editFormData.project_timeline),
        project_sprints: parseInt(editFormData.project_sprints),
      };

      const response = await projectService.updateProject(
        projectId,
        updateData
      );

      if (response.success) {
        setProject(updateData);
        setIsEditing(false);
      } else {
        setError(response.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      setError(
        "An error occurred while updating the project. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await projectService.deleteProject(projectId);

      if (response.success) {
        // Redirect to projects list after successful deletion
        navigate("/projects");
      } else {
        setError(response.message || "Failed to delete project");
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setError(
        "An error occurred while deleting the project. Please try again."
      );
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the appropriate status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Planning":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">
            Planning
          </span>
        );
      case "In Progress":
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded">
            In Progress
          </span>
        );
      case "Completed":
        return (
          <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded">
            Completed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded">
            {status || "Unknown"}
          </span>
        );
    }
  };

  // Function to render language tags
  const renderLanguageTags = (languages) => {
    if (!languages) return null;

    // Handle both array and comma-separated string formats
    const langArray = Array.isArray(languages)
      ? languages
      : languages.split(",").map((lang) => lang.trim());

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {langArray.map((lang, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded"
          >
            {lang}
          </span>
        ))}
      </div>
    );
  };

  const renderEditForm = () => {
    return (
      <form onSubmit={handleSubmitEdit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Project Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editFormData.name || ""}
              onChange={handleEditInputChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="project_type"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Project Type*
            </label>
            <select
              id="project_type"
              name="project_type"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editFormData.project_type || ""}
              onChange={handleEditInputChange}
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
            <label
              htmlFor="status"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Status*
            </label>
            <select
              id="status"
              name="status"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editFormData.status || "Planning"}
              onChange={handleEditInputChange}
              required
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="project_team_size"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Team Size*
            </label>
            <input
              type="number"
              id="project_team_size"
              name="project_team_size"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editFormData.project_team_size || ""}
              onChange={handleEditInputChange}
              min="1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="project_timeline"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Project Timeline (days)*
            </label>
            <input
              type="number"
              id="project_timeline"
              name="project_timeline"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editFormData.project_timeline || ""}
              onChange={handleEditInputChange}
              min="1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="project_sprints"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Number of Sprints*
            </label>
            <input
              type="number"
              id="project_sprints"
              name="project_sprints"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editFormData.project_sprints || ""}
              onChange={handleEditInputChange}
              min="1"
              required
            />
          </div>

          <div>
            <label
              htmlFor="project_languages"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Technologies & Languages
            </label>
            <input
              type="text"
              id="project_languages"
              name="project_languages"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. React, Node.js, Python (comma separated)"
              value={editFormData.project_languages || ""}
              onChange={handleEditInputChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple technologies with commas
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Project Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide a brief description of the project"
            value={editFormData.description || ""}
            onChange={handleEditInputChange}
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
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
              ) : null
            }
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    );
  };

  const renderProjectDetails = () => {
    return (
      <>
        <div className="flex flex-wrap items-start justify-between mb-6">
          <div>
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h2>
              <div className="ml-3">{renderStatusBadge(project.status)}</div>
            </div>
            <p className="mt-2 text-gray-600">
              {project.description || "No description provided"}
            </p>
          </div>

          <div className="mt-4 space-x-3 md:mt-0">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              }
            >
              Edit
            </Button>

            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Project Type
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {project.project_type || "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Team Size
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {project.project_team_size || "N/A"} members
            </p>
          </div>
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Timeline</h3>
            <p className="text-lg font-semibold text-gray-900">
              {project.project_timeline || "N/A"} days
            </p>
          </div>
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Total Sprints
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {project.project_sprints || "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Created At
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {project.created_at
                ? new Date(project.created_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Last Updated
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {project.updated_at
                ? new Date(project.updated_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-medium text-gray-800 text-md">
            Technologies & Languages
          </h3>
          {renderLanguageTags(project.project_languages) || (
            <p className="text-sm text-gray-500">No technologies specified</p>
          )}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={onBack}
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
            Back to Projects
          </Button>

          <div className="space-x-3">
            <Link to={`/kpi-management/${projectId}`}>
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
              >
                Manage KPIs
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  };

  return (
    <Card title="Project Details">
      {isLoading && !isEditing ? (
        <div className="py-8">
          <Loading text="Loading project details..." />
        </div>
      ) : error ? (
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchProjectDetails}
          >
            Retry
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 ml-2"
            onClick={onBack}
          >
            Back to Projects
          </Button>
        </div>
      ) : project ? (
        isEditing ? (
          renderEditForm()
        ) : (
          renderProjectDetails()
        )
      ) : (
        <div className="py-8 text-center">
          <p className="mb-4 text-gray-500">Project not found</p>
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to Projects
          </Button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-gray-700">
            Are you sure you want to delete this project? This action cannot be
            undone.
          </p>
          <p className="mt-2 text-gray-700">
            <strong>Project:</strong> {project?.name}
          </p>
        </div>
      </Modal>
    </Card>
  );
};

export default ProjectDetail;
