import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProjectCreator from "../components/project-management/ProjectCreator";
import ProjectList from "../components/project-management/ProjectList";
import ProjectDetail from "../components/project-management/ProjectDetail";
import DeveloperMatcher from "../components/project-management/DeveloperMatcher";
import TeamComposition from "../components/project-management/TeamComposition";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";

const ProjectsPage = () => {
  const { projectId, action } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const teamComponentRef = useRef(null);

  const handleProjectCreated = (createdProjectId) => {
    setShowCreateModal(false);
    // Refresh the project list
    setRefreshCounter((prev) => prev + 1);
    // Navigate to the newly created project
    if (createdProjectId) {
      navigate(`/projects/${createdProjectId}`);
    }
  };

  const handleBackToProjects = () => {
    navigate("/projects");
  };

  const handleTeamUpdated = async (employeeIds) => {
    // Increment refresh counter to trigger ProjectList refresh
    setRefreshCounter((prev) => prev + 1);

    // Refresh TeamComposition component if we are viewing it
    if (action === "team" && teamComponentRef.current?.refreshTeam) {
      // Allow some time for the backend to update
      setTimeout(() => {
        teamComponentRef.current.refreshTeam();
      }, 500);
    }
  };

  const handleNavigateToTeam = () => {
    navigate(`/projects/${projectId}/team`);
  };

  // Render the appropriate content based on the URL params
  const renderContent = () => {
    // If we're viewing a specific project
    if (projectId) {
      // If there's an action (match or team)
      if (action) {
        switch (action) {
          case "match":
            // Check if we have a selectedRole from location state
            const selectedRole = location.state?.roleCriteria;
            return (
              <DeveloperMatcher
                projectId={projectId}
                roleCriteria={selectedRole} // Pass the selected role if available
                onUpdateTeam={handleTeamUpdated}
                onBack={() => navigate(`/projects/${projectId}/team`)}
              />
            );
          case "team":
            return (
              <TeamComposition
                ref={teamComponentRef}
                projectId={projectId}
                onBack={() => navigate(`/projects/${projectId}`)}
              />
            );
          default:
            return (
              <ProjectDetail
                projectId={projectId}
                onBack={handleBackToProjects}
              />
            );
        }
      }

      // Default project detail view
      return (
        <ProjectDetail projectId={projectId} onBack={handleBackToProjects} />
      );
    }

    // If we're on the main projects page, show the list
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <Button
            onClick={() => setShowCreateModal(true)}
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
          >
            Create Project
          </Button>
        </div>

        <ProjectList
          key={refreshCounter}
          onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
        />
      </div>
    );
  };

  // We need to forward the ref to TeamComposition when using it
  const ForwardedTeamComposition = React.forwardRef((props, ref) => (
    <TeamComposition {...props} ref={ref} />
  ));

  return (
    <div className="container px-4 py-6 mx-auto">
      {renderContent()}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="lg"
      >
        <ProjectCreator onProjectCreated={handleProjectCreated} />
      </Modal>
    </div>
  );
};

export default ProjectsPage;
