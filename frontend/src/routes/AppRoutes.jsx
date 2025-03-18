import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout components
import MainLayout from "../layouts/MainLayout";

// Page components
import Dashboard from "../pages/Dashboard";
import ProjectsPage from "../pages/ProjectsPage";
import CVUploadPage from "../pages/CVUploadPage";
import TalentPoolPage from "../pages/TalentPoolPage";
import KPIManagementPage from "../pages/KPIManagementPage";
import SkillDevelopmentPage from "../pages/SkillDevelopmentPage";

// Authentication
import LoginPage from "../pages/LoginPage";
import { useAuth } from "../contexts/AuthContext";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Authentication routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />

        {/* Protected routes within MainLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* CV Management */}
          <Route path="cv-upload" element={<CVUploadPage />} />

          {/* Talent Pool */}
          <Route path="talent-pool" element={<TalentPoolPage />} />
          <Route path="talent-pool/:employeeId" element={<TalentPoolPage />} />

          {/* Projects routes - uses nested routing defined in ProjectsPage */}
          <Route path="projects/*" element={<ProjectsPage />} />

          {/* KPI Management */}
          <Route
            path="projects/:projectId/kpi"
            element={<KPIManagementPage />}
          />

          {/* Skill Development */}
          <Route path="skill-development" element={<SkillDevelopmentPage />} />
          <Route
            path="skill-development/:employeeId"
            element={<SkillDevelopmentPage />}
          />
        </Route>

        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
