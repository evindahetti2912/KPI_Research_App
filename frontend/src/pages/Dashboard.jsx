import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import { projectService } from "../services/projectService";
import { employeeService } from "../services/employeeService";
import { kpiService } from "../services/kpiService";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    projectsCount: 0,
    employeesCount: 0,
    projectsByStatus: { Planning: 0, "In Progress": 0, Completed: 0 },
    employeesByLevel: { Junior: 0, "Mid-level": 0, Senior: 0, Lead: 0 },
    recentProjects: [],
    topSkills: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch projects
        const projectsResponse = await projectService.getAllProjects();
        let projects = [];
        let projectsCount = 0;
        let projectsByStatus = { Planning: 0, "In Progress": 0, Completed: 0 };

        if (projectsResponse.success) {
          projects = projectsResponse.data || [];
          projectsCount = projects.length;

          // Count projects by status
          projects.forEach((project) => {
            const status = project.status || "Planning";
            projectsByStatus[status] = (projectsByStatus[status] || 0) + 1;
          });
        }

        // Fetch employees
        const employeesResponse = await employeeService.getAllEmployees();
        let employees = [];
        let employeesCount = 0;
        let employeesByLevel = {
          Junior: 0,
          "Mid-level": 0,
          Senior: 0,
          Lead: 0,
        };
        let skillsCount = {};

        if (employeesResponse.success) {
          employees = employeesResponse.data || [];
          employeesCount = employees.length;

          // Count employees by experience level
          employees.forEach((employee) => {
            const yearsOfExperience =
              employee._derived?.total_years_experience ||
              employee.Experience?.length ||
              0;

            if (yearsOfExperience >= 8) {
              employeesByLevel["Lead"]++;
            } else if (yearsOfExperience >= 5) {
              employeesByLevel["Senior"]++;
            } else if (yearsOfExperience >= 2) {
              employeesByLevel["Mid-level"]++;
            } else {
              employeesByLevel["Junior"]++;
            }

            // Count skills
            if (employee.Skills && Array.isArray(employee.Skills)) {
              employee.Skills.forEach((skill) => {
                skillsCount[skill] = (skillsCount[skill] || 0) + 1;
              });
            }
          });
        }

        // Extract recent projects (most recently created)
        const recentProjects = [...projects]
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5);

        // Extract top skills
        const topSkills = Object.entries(skillsCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([skill, count]) => ({ skill, count }));

        setDashboardData({
          projectsCount,
          employeesCount,
          projectsByStatus,
          employeesByLevel,
          recentProjects,
          topSkills,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderProjectStatusChart = () => {
    const { projectsByStatus } = dashboardData;
    const totalProjects = Object.values(projectsByStatus).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalProjects === 0) {
      return (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">No projects available</p>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        {Object.entries(projectsByStatus).map(([status, count]) => {
          const percentage = Math.round((count / totalProjects) * 100);
          let color;

          switch (status) {
            case "Planning":
              color = "bg-blue-500";
              break;
            case "In Progress":
              color = "bg-green-500";
              break;
            case "Completed":
              color = "bg-purple-500";
              break;
            default:
              color = "bg-gray-500";
          }

          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {status}
                </span>
                <span className="text-sm text-gray-600">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full">
                <div
                  className={`h-2.5 rounded-full ${color}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmployeeLevelChart = () => {
    const { employeesByLevel } = dashboardData;
    const totalEmployees = Object.values(employeesByLevel).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalEmployees === 0) {
      return (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">No employees available</p>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        {Object.entries(employeesByLevel).map(([level, count]) => {
          const percentage = Math.round((count / totalEmployees) * 100);
          let color;

          switch (level) {
            case "Junior":
              color = "bg-green-500";
              break;
            case "Mid-level":
              color = "bg-blue-500";
              break;
            case "Senior":
              color = "bg-purple-500";
              break;
            case "Lead":
              color = "bg-indigo-500";
              break;
            default:
              color = "bg-gray-500";
          }

          return (
            <div key={level}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {level}
                </span>
                <span className="text-sm text-gray-600">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full">
                <div
                  className={`h-2.5 rounded-full ${color}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-center h-96">
          <Loading text="Loading dashboard data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6 mx-auto">
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Projects</p>
                <h3 className="text-3xl font-bold text-blue-900">
                  {dashboardData.projectsCount}
                </h3>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-700"
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
              </div>
            </div>
            <div className="mt-2">
              <Link
                to="/projects"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all projects →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Employees</p>
                <h3 className="text-3xl font-bold text-green-900">
                  {dashboardData.employeesCount}
                </h3>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <svg
                  className="w-6 h-6 text-green-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <Link
                to="/talent-pool"
                className="text-sm text-green-600 hover:text-green-800"
              >
                View all employees →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Active Projects
                </p>
                <h3 className="text-3xl font-bold text-purple-900">
                  {dashboardData.projectsByStatus["In Progress"] || 0}
                </h3>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-700"
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
              </div>
            </div>
            <div className="mt-2">
              <Link
                to="/projects"
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                View active projects →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">KPIs</p>
                <h3 className="text-3xl font-bold text-orange-900">
                  {dashboardData.projectsCount > 0
                    ? `${
                        dashboardData.projectsByStatus["In Progress"] || 0
                      } Active`
                    : "No Data"}
                </h3>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <svg
                  className="w-6 h-6 text-orange-700"
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
              </div>
            </div>
            <div className="mt-2">
              <Link
                to="/kpi-management"
                className="text-sm text-orange-600 hover:text-orange-800"
              >
                Manage KPIs →
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <Card title="Project Status Distribution">
          <div className="p-4">{renderProjectStatusChart()}</div>
        </Card>

        <Card title="Employee Experience Levels">
          <div className="p-4">{renderEmployeeLevelChart()}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Recent Projects">
          <div className="p-4">
            {dashboardData.recentProjects.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                <p>No projects available</p>
                <Link to="/projects">
                  <Button variant="outline" size="sm" className="mt-2">
                    Create New Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {dashboardData.recentProjects.map((project) => (
                  <div key={project._id} className="py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/projects/${project._id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {project.project_type || "No type"} &bull;{" "}
                          {project.project_team_size || 0} members
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          project.status === "Planning"
                            ? "bg-blue-100 text-blue-800"
                            : project.status === "In Progress"
                            ? "bg-green-100 text-green-800"
                            : project.status === "Completed"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status || "Planning"}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>
                        Created:{" "}
                        {project.created_at
                          ? new Date(project.created_at).toLocaleDateString()
                          : "Unknown"}
                      </span>
                      <div>
                        <Link
                          to={`/projects/${project._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Details
                        </Link>{" "}
                        &bull;{" "}
                        <Link
                          to={`/kpi-management/${project._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          KPIs
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card title="Top Skills in Talent Pool">
          <div className="p-4">
            {dashboardData.topSkills.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                <p>No skills data available</p>
                <Link to="/cv-upload">
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload CVs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.topSkills.map(({ skill, count }) => {
                  const percentage = Math.round(
                    (count / dashboardData.employeesCount) * 100
                  );
                  return (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {skill}
                        </span>
                        <span className="text-sm text-gray-600">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full">
                        <div
                          className="h-2.5 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 text-right">
                  <Link
                    to="/talent-pool"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all skills →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link to="/cv-upload">
            <Card>
              <div className="flex items-center p-4 transition hover:bg-gray-50">
                <div className="p-3 mr-4 bg-blue-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Upload CV</h3>
                  <p className="text-sm text-gray-600">
                    Parse and analyze employee CVs
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/projects">
            <Card>
              <div className="flex items-center p-4 transition hover:bg-gray-50">
                <div className="p-3 mr-4 bg-green-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Create Project</h3>
                  <p className="text-sm text-gray-600">
                    Start a new project with KPIs
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/talent-pool">
            <Card>
              <div className="flex items-center p-4 transition hover:bg-gray-50">
                <div className="p-3 mr-4 bg-purple-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Browse Talent Pool
                  </h3>
                  <p className="text-sm text-gray-600">
                    Find the right employees for projects
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
