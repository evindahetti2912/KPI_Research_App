import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import EmployeeList from "../components/talent-pool/EmployeeList";
import EmployeeDetail from "../components/talent-pool/EmployeeDetail";
import EmployeeFilter from "../components/talent-pool/EmployeeFilter";
import CareerPathView from "../components/talent-pool/CareerPathView";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Loading from "../components/common/Loading";
import Modal from "../components/common/Modal";
import { employeeService } from "../services/employeeService";
import { projectService } from "../services/projectService";

const TalentPoolPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    skills: location.state?.skillFilter || "", // Support for direct skill filtering
    experienceLevel: "",
    availability: "",
    sortBy: "name",
  });
  
  // Project team selection state
  const [isSelectingForProject, setIsSelectingForProject] = useState(false);
  const [projectContext, setProjectContext] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Check if we're being navigated from project team selection
  useEffect(() => {
    if (location.state?.isSelectingForProject) {
      setIsSelectingForProject(true);
      setProjectContext({
        projectId: location.state.projectId,
        roleId: location.state.roleId,
        roleName: location.state.roleName
      });
      
      // Apply skill filter automatically
      if (location.state.skillFilter) {
        setFilters(prev => ({
          ...prev,
          skills: location.state.skillFilter
        }));
      }
    }
  }, [location.state]);

  // Fetch employees based on filters
  const fetchEmployees = useCallback(async () => {
    setIsListLoading(true);
    setError("");

    try {
      // Prepare filter parameters
      const filterParams = {};
      if (filters.search) filterParams.search = filters.search;
      if (filters.skills) filterParams.skills = filters.skills;
      if (filters.experienceLevel)
        filterParams.experienceLevel = filters.experienceLevel;
      if (filters.availability)
        filterParams.availability = filters.availability;

      // Use filtered endpoint if filters are applied, otherwise get all
      const response =
        Object.keys(filterParams).length > 0
          ? await employeeService.filterEmployees(filterParams)
          : await employeeService.getAllEmployees();

      if (response.success) {
        let employeeList = response.data || [];

        // Apply sorting
        if (filters.sortBy) {
          employeeList = sortEmployees(employeeList, filters.sortBy);
        }

        setEmployees(employeeList);
      } else {
        setError(response.message || "Failed to fetch employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("An error occurred while fetching employees");
    } finally {
      setIsListLoading(false);
    }
  }, [filters]);

  // Sort employees based on selected criteria
  const sortEmployees = (employeeList, sortBy) => {
    switch (sortBy) {
      case "name":
        return [...employeeList].sort((a, b) =>
          (a.Name || "").localeCompare(b.Name || "")
        );

      case "experience":
        return [...employeeList].sort((a, b) => {
          const aExp =
            a._derived?.total_years_experience || a.Experience?.length || 0;
          const bExp =
            b._derived?.total_years_experience || b.Experience?.length || 0;
          return bExp - aExp; // High to low
        });

      case "skills":
        return [...employeeList].sort(
          (a, b) => (b.Skills?.length || 0) - (a.Skills?.length || 0)
        );

      case "recent":
        // Sort by _id (assuming MongoDB ObjectIds have timestamp)
        return [...employeeList].sort((a, b) => b._id?.localeCompare(a._id));

      default:
        return employeeList;
    }
  };

  // Load data when component mounts or params/filters change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Load employee details if ID is in URL
  useEffect(() => {
    if (employeeId) {
      handleSelectEmployee(employeeId);
    } else {
      setSelectedEmployee(null);
    }
  }, [employeeId]);

  // Handle employee selection
  const handleSelectEmployee = async (id) => {
    // In selection mode, don't navigate to employee details
    if (isSelectingForProject) return;
    
    // Check if employee is already in our list
    const employeeInList = employees.find((emp) => emp._id === id);

    if (employeeInList) {
      setSelectedEmployee({
        id,
        data: employeeInList,
      });
      return;
    }

    // Otherwise fetch the employee data
    setIsLoading(true);
    setError("");

    try {
      const response = await employeeService.getEmployee(id);

      if (response.success) {
        setSelectedEmployee({
          id,
          data: response.data,
        });
      } else {
        setError(response.message || "Failed to retrieve employee data");
      }
    } catch (error) {
      console.error("Error retrieving employee data:", error);
      setError("An error occurred while retrieving employee data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle employee selection in project mode
  const handleEmployeeToggle = (employee) => {
    setSelectedEmployees(prev => {
      // Toggle selection
      if (prev.some(e => e._id === employee._id)) {
        return prev.filter(e => e._id !== employee._id);
      } else {
        return [...prev, employee];
      }
    });
  };

  // Assign selected employees to the project
  const assignEmployeesToProject = async () => {
    if (!projectContext || selectedEmployees.length === 0) return;
    
    setAssignmentLoading(true);
    setError("");
    
    try {
      const employeeIds = selectedEmployees.map(emp => emp._id);
      
      const response = await projectService.updateProject(projectContext.projectId, {
        team: {
          employee_ids: employeeIds,
          role: projectContext.roleName,
          role_id: projectContext.roleId,
          updated_at: new Date().toISOString()
        }
      });
      
      if (response.success) {
        // Navigate back to the KPI management page
        navigate(`/kpi-management/${projectContext.projectId}`);
      } else {
        setError(response.message || "Failed to assign team members");
      }
    } catch (error) {
      console.error("Error assigning team members:", error);
      setError("An error occurred while assigning team members");
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Handle filter changes from EmployeeFilter component
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Navigate back to talent pool list
  const handleBackToList = () => {
    navigate("/talent-pool");
  };

  // Navigate back to KPI management without making changes
  const cancelProjectSelection = () => {
    if (projectContext?.projectId) {
      navigate(`/kpi-management/${projectContext.projectId}`);
    } else {
      setIsSelectingForProject(false);
      setProjectContext(null);
      setSelectedEmployees([]);
    }
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1>
          <p className="text-gray-600">
            {isSelectingForProject
              ? `Select employees for ${projectContext?.roleName || "project role"}`
              : employeeId
              ? "View and analyze employee details"
              : "Browse and analyze employee profiles"}
          </p>
        </div>

        <div className="mt-4 space-x-3 md:mt-0">
          {!employeeId && !isSelectingForProject && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowFilterModal(true)}
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                }
              >
                Filter
              </Button>

              <Button
                variant="primary"
                onClick={() => navigate("/cv-upload")}
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
                Add New CV
              </Button>
            </>
          )}

          {employeeId && selectedEmployee && !isSelectingForProject && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowCareerModal(true)}
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
              >
                Career Path
              </Button>

              <Button
                variant="outline"
                onClick={handleBackToList}
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
                Back to List
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Selection mode header */}
      {isSelectingForProject && (
        <div className="p-4 mb-6 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">
                Selecting employees for: <span className="text-blue-700">{projectContext?.roleName || "Role"}</span>
              </h3>
              <p className="text-sm text-gray-600">
                Selected {selectedEmployees.length} employee(s)
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={cancelProjectSelection}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={assignEmployeesToProject}
                disabled={selectedEmployees.length === 0 || assignmentLoading}
                icon={assignmentLoading ? (
                  <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
              >
                {assignmentLoading ? "Assigning..." : "Assign to Project"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Display filters applied if any */}
      {!employeeId && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {filters.search && (
            <span className="flex items-center px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
              Search: {filters.search}
              <button
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={() => setFilters({ ...filters, search: "" })}
              >
                <svg
                  className="w-3 h-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}

          {filters.skills && (
            <span className="flex items-center px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
              Skills: {filters.skills}
              <button
                className="ml-1 text-green-500 hover:text-green-700"
                onClick={() => setFilters({ ...filters, skills: "" })}
              >
                <svg
                  className="w-3 h-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}

          {filters.experienceLevel && (
            <span className="flex items-center px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded-full">
              Level: {filters.experienceLevel}
              <button
                className="ml-1 text-purple-500 hover:text-purple-700"
                onClick={() => setFilters({ ...filters, experienceLevel: "" })}
              >
                <svg
                  className="w-3 h-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}

          {filters.availability && (
            <span className="flex items-center px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded-full">
              Availability: {filters.availability}
              <button
                className="ml-1 text-yellow-500 hover:text-yellow-700"
                onClick={() => setFilters({ ...filters, availability: "" })}
              >
                <svg
                  className="w-3 h-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          )}

          {/* Clear all filters button if any filters are applied */}
          {(filters.search ||
            filters.skills ||
            filters.experienceLevel ||
            filters.availability) && (
            <button
              className="ml-2 text-sm text-gray-500 hover:text-gray-700"
              onClick={() =>
                setFilters({
                  search: "",
                  skills: "",
                  experienceLevel: "",
                  availability: "",
                  sortBy: filters.sortBy,
                })
              }
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {employeeId && !isSelectingForProject ? (
        // Single employee view
        isLoading ? (
          <div className="py-12">
            <Loading text="Loading employee data..." />
          </div>
        ) : error ? (
          <div className="p-4 mb-6 text-red-700 rounded-md bg-red-50">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleSelectEmployee(employeeId)}
            >
              Retry
            </Button>
          </div>
        ) : selectedEmployee ? (
          <EmployeeDetail
            employeeId={employeeId}
            employeeData={selectedEmployee.data}
            onBack={handleBackToList}
          />
        ) : (
          <Card>
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-500">Employee not found</p>
              <Button variant="outline" size="sm" onClick={handleBackToList}>
                Back to Talent Pool
              </Button>
            </div>
          </Card>
        )
      ) : (
        // Employee list view
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/4">
            <Card title={`Employees (${employees.length})`}>
              {isListLoading ? (
                <div className="py-8">
                  <Loading text="Loading employees..." />
                </div>
              ) : employees.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    {filters.search ||
                    filters.skills ||
                    filters.experienceLevel ||
                    filters.availability
                      ? "No employees match your filter criteria."
                      : "No employees found."}
                  </p>
                  {(filters.search ||
                    filters.skills ||
                    filters.experienceLevel ||
                    filters.availability) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        setFilters({
                          search: "",
                          skills: "",
                          experienceLevel: "",
                          availability: "",
                          sortBy: filters.sortBy,
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-gray-500">Sort by:</span>
                    <select
                      className="p-1 text-xs border border-gray-300 rounded"
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                    >
                      <option value="name">Name</option>
                      <option value="experience">
                        Experience (High to Low)
                      </option>
                      <option value="skills">Number of Skills</option>
                      <option value="recent">Recently Added</option>
                    </select>
                  </div>
                  <EmployeeList
                    employees={employees}
                    onSelectEmployee={(id) => navigate(`/talent-pool/${id}`)}
                    selectionMode={isSelectingForProject}
                    selectedEmployees={selectedEmployees}
                    onEmployeeToggle={handleEmployeeToggle}
                  />
                </div>
              )}
            </Card>
          </div>

          <div className="w-full md:w-3/4">
            {!selectedEmployee || isSelectingForProject ? (
              <Card>
                <div className="py-8 text-center">
                  {isSelectingForProject ? (
                    <>
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-blue-300"
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
                      <h2 className="mb-2 text-lg font-medium text-gray-700">
                        Employee Selection Mode
                      </h2>
                      <p className="mb-6 text-gray-500">
                        Select employees from the list on the left to assign to{" "}
                        <strong>{projectContext?.roleName || "project role"}</strong>
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button
                          variant={selectedEmployees.length === 0 ? "outline" : "primary"}
                          onClick={assignEmployeesToProject}
                          disabled={selectedEmployees.length === 0 || assignmentLoading}
                        >
                          {selectedEmployees.length === 0 
                            ? "No Employees Selected" 
                            : `Assign ${selectedEmployees.length} Employees`}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                      <h2 className="mb-2 text-lg font-medium text-gray-700">
                        Talent Pool
                      </h2>
                      <p className="mb-6 text-gray-500">
                        Select an employee from the list to view their details or
                        upload a new CV to add to the talent pool.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowFilterModal(true)}
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
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                              />
                            </svg>
                          }
                        >
                          Filter Employees
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => navigate("/cv-upload")}
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
                          Upload New CV
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card title="Employee Summary" className="md:col-span-2">
                  <div className="flex flex-wrap items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedEmployee.data.Name}
                      </h2>
                      <p className="mt-1 text-gray-600">
                        {selectedEmployee.data.Experience?.[0]?.Role ||
                          "No role specified"}
                        {selectedEmployee.data.Experience?.[0]?.Company &&
                          ` at ${selectedEmployee.data.Experience[0].Company}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedEmployee.data.Skills?.slice(0, 5).map(
                          (skill, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                            >
                              {skill}
                            </span>
                          )
                        )}
                        {selectedEmployee.data.Skills?.length > 5 && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                            +{selectedEmployee.data.Skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        navigate(`/talent-pool/${selectedEmployee.id}`)
                      }
                    >
                      View Full Profile
                    </Button>
                  </div>
                </Card>

                <Card title="Contact Information">
                  <div className="space-y-2">
                    {selectedEmployee.data["Contact Information"]?.Email && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Email:
                        </span>
                        <p className="text-gray-800">
                          {selectedEmployee.data["Contact Information"].Email}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.data["Contact Information"]?.Phone && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Phone:
                        </span>
                        <p className="text-gray-800">
                          {selectedEmployee.data["Contact Information"].Phone}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.data["Contact Information"]?.LinkedIn && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            LinkedIn:
                          </span>
                          <p className="text-gray-800">
                            
                              href={
                                selectedEmployee.data["Contact Information"]
                                  .LinkedIn
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                              {
                                selectedEmployee.data["Contact Information"]
                                  .LinkedIn
                              }
                          </p>
                        </div>
                      )}
                  </div>
                </Card>

                <Card title="Experience Summary">
                  {selectedEmployee.data.Experience &&
                  selectedEmployee.data.Experience.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.data.Experience.slice(0, 2).map(
                        (exp, index) => (
                          <div
                            key={index}
                            className="pb-2 border-b last:border-b-0 last:pb-0"
                          >
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium text-gray-800">
                                {exp.Role}
                              </h4>
                              <span className="text-xs text-gray-600">
                                {exp.Duration}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {exp.Company}
                            </p>
                          </div>
                        )
                      )}
                      {selectedEmployee.data.Experience.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{selectedEmployee.data.Experience.length - 2} more
                          positions
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No experience listed</p>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Employees"
      >
        <EmployeeFilter
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </Modal>

      {/* Career Path Modal */}
      <Modal
        isOpen={showCareerModal}
        onClose={() => setShowCareerModal(false)}
        title="Career Path Analysis"
        size="lg"
      >
        {selectedEmployee && (
          <CareerPathView employeeId={selectedEmployee.id} />
        )}
      </Modal>
    </div>
  );
};

export default TalentPoolPage;