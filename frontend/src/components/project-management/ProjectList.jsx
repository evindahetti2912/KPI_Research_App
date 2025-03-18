import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { projectService } from "../../services/projectService";

const ProjectList = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await projectService.getAllProjects();

      if (response.success) {
        setProjects(response.data || []);
      } else {
        setError(response.message || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("An error occurred while fetching projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const response = await projectService.deleteProject(projectId);

      if (response.success) {
        // Remove the deleted project from the list
        setProjects(projects.filter((project) => project._id !== projectId));
      } else {
        setError(response.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setError(
        "An error occurred while deleting the project. Please try again."
      );
    }
  };

  // Filter projects by name or type
  const filteredProjects = projects.filter((project) => {
    return (
      filter === "" ||
      project.name.toLowerCase().includes(filter.toLowerCase()) ||
      project.project_type.toLowerCase().includes(filter.toLowerCase())
    );
  });

  // Get project status badge
  const getStatusBadge = (status) => {
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

  return (
    <Card title="Projects" className="h-full">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="w-full mb-2 md:w-auto md:mb-0">
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm md:w-64 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter by name or type..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="flex justify-end w-full md:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchProjects}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8">
          <Loading text="Loading projects..." />
        </div>
      ) : error ? (
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchProjects}
          >
            Retry
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-8 text-center">
          <p className="mb-4 text-gray-500">
            {filter
              ? "No projects match your filter criteria."
              : "No projects found. Create your first project!"}
          </p>
          {filter && (
            <Button variant="outline" size="sm" onClick={() => setFilter("")}>
              Clear Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="p-4 transition border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectProject && onSelectProject(project._id)}
            >
              <div className="flex flex-wrap items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {project.description || "No description provided"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Type:</span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded">
                      {project.project_type || "Not specified"}
                    </span>

                    <span className="ml-2 text-xs text-gray-500">Status:</span>
                    {getStatusBadge(project.status)}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2 md:mt-0 md:flex-row">
                  <Link
                    to={`/projects/${project._id}`}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
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
                    View
                  </Link>

                  <Link
                    to={`/kpi-management/${project._id}`}
                    className="flex items-center text-sm text-green-600 hover:text-green-800 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    KPIs
                  </Link>

                  <button
                    className="flex items-center text-sm text-red-600 hover:text-red-800 whitespace-nowrap"
                    onClick={(e) => handleDeleteProject(project._id, e)}
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-2 text-center rounded bg-gray-50">
                  <span className="block text-xs text-gray-500">Team Size</span>
                  <span className="text-sm font-medium">
                    {project.project_team_size || "N/A"}
                  </span>
                </div>
                <div className="p-2 text-center rounded bg-gray-50">
                  <span className="block text-xs text-gray-500">Timeline</span>
                  <span className="text-sm font-medium">
                    {project.project_timeline || "N/A"} days
                  </span>
                </div>
                <div className="p-2 text-center rounded bg-gray-50">
                  <span className="block text-xs text-gray-500">Sprints</span>
                  <span className="text-sm font-medium">
                    {project.project_sprints || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ProjectList;
