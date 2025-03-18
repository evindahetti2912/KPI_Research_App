import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { projectService } from "../services/projectService";

// Create context
const ProjectContext = createContext(null);

// Hook for using the project context
export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectService.getAllProjects();

      if (response.success) {
        setProjects(response.data || []);
      } else {
        setError(response.message || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("An error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load projects on initial mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch project by ID
  const fetchProjectById = useCallback(async (projectId) => {
    if (!projectId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await projectService.getProject(projectId);

      if (response.success) {
        setCurrentProject(response.data);
        return response.data;
      } else {
        setError(response.message || "Failed to fetch project details");
        return null;
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError("An error occurred while fetching project details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create project
  const createProject = async (projectData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectService.createProject(projectData);

      if (response.success) {
        // Refresh projects list
        await fetchProjects();
        return response.project_id;
      } else {
        setError(response.message || "Failed to create project");
        return null;
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError("An error occurred while creating the project");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update project
  const updateProject = async (projectId, projectData) => {
    if (!projectId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await projectService.updateProject(
        projectId,
        projectData
      );

      if (response.success) {
        // Refresh current project and projects list
        await fetchProjectById(projectId);
        await fetchProjects();
        return true;
      } else {
        setError(response.message || "Failed to update project");
        return false;
      }
    } catch (error) {
      console.error("Error updating project:", error);
      setError("An error occurred while updating the project");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    if (!projectId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await projectService.deleteProject(projectId);

      if (response.success) {
        // Refresh projects list
        if (currentProject && currentProject._id === projectId) {
          setCurrentProject(null);
        }
        await fetchProjects();
        return true;
      } else {
        setError(response.message || "Failed to delete project");
        return false;
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("An error occurred while deleting the project");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Match employees to project
  const matchEmployeesToProject = async (projectId) => {
    if (!projectId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await projectService.matchEmployeesToProject(projectId);

      if (response.success) {
        // Refresh current project
        await fetchProjectById(projectId);
        return response.matched_employees;
      } else {
        setError(response.message || "Failed to match employees to project");
        return null;
      }
    } catch (error) {
      console.error("Error matching employees to project:", error);
      setError("An error occurred while matching employees");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    matchEmployeesToProject,
    setCurrentProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
