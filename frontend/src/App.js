import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import AppRoutes from './routes/AppRoutes';
import './assets/styles/main.css';

/**
 * Main App component that serves as the root of the application.
 * Sets up context providers and routing.
 */
function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <EmployeeProvider>
          <AppRoutes />
        </EmployeeProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;