import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import Modal from "../common/Modal";
import { projectService } from "../../services/projectService";
import { employeeService } from "../../services/employeeService";
import { kpiService } from "../../services/kpiService";
import IndividualKPITracker from "./IndividualKPITracker";
import KPIComparisonChart from "./KPIComparisonChart";

const TeamKPIDashboard = ({ projectId, projectKPIs }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamData, setTeamData] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [specializedKPIs, setSpecializedKPIs] = useState({});
  const [selectedEmployeeKPIs, setSelectedEmployeeKPIs] = useState(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(""); // Add this line
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // Add this line
  const [kpiData, setKpiData] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchTeamData();
    }
  }, [projectId]);

  const fetchTeamData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // First get the KPI data to access role criteria
      const kpiResponse = await kpiService.getProjectKPIs(projectId);
      if (kpiResponse.success) {
        setKpiData(kpiResponse.data);
      }

      // Then get team data
      const response = await projectService.getProjectTeam(projectId);

      if (response.success) {
        setTeamData(response.data);

        // Get employee IDs to fetch
        let employeeIds = response.data.employee_ids || [];

        // Fetch employee details if there are IDs
        if (employeeIds.length > 0) {
          await fetchEmployeeDetails(employeeIds);
          await fetchSpecializedKPIs(employeeIds);
        } else {
          setEmployeeDetails([]);
          setSpecializedKPIs({});
        }
      } else {
        setError(response.message || "Failed to fetch team data");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      setError("An error occurred while fetching team data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeIds) => {
    try {
      // Map each ID to a promise that fetches the employee details
      const employeePromises = employeeIds.map((id) =>
        employeeService.getEmployee(id)
      );

      // Wait for all promises to resolve
      const employeeResponses = await Promise.all(employeePromises);

      // Extract employee data from successful responses
      const employees = employeeResponses
        .filter((response) => response.success)
        .map((response) => response.data);

      setEmployeeDetails(employees);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setError("An error occurred while fetching employee details");
    }
  };

  const fetchSpecializedKPIs = async (employeeIds) => {
    try {
      // Get role criteria from project KPIs
      const kpiResponse = await kpiService.getProjectKPIs(projectId);
      if (!kpiResponse.success) {
        throw new Error("Failed to fetch KPI data");
      }

      const roleCriteria = kpiResponse.data.employee_criteria || [];

      // Get role assignments from team data
      const roleAssignments = teamData.role_assignments || {};

      // Map employee IDs to their assigned roles
      const employeeRoleMap = {};
      Object.entries(roleAssignments).forEach(([roleId, employeeId]) => {
        if (employeeId && roleCriteria[parseInt(roleId)]) {
          employeeRoleMap[employeeId] = roleCriteria[parseInt(roleId)];
        }
      });

      // Get specialized KPIs for each employee
      const specializedKPIsResults = {};

      for (const employeeId of employeeIds) {
        const roleData = employeeRoleMap[employeeId];

        if (roleData) {
          // Fetch individual employee KPIs
          const response = await employeeService.matchEmployeesWithKPIs({
            project_criteria: {
              field: kpiResponse.data.project_details.project_type,
              languages: roleData.skills,
              people_count: 1,
            },
            project_kpis: kpiResponse.data.kpis,
            role_criteria: roleData,
          });

          if (response.success && response.matched_employees.length > 0) {
            specializedKPIsResults[employeeId] =
              response.matched_employees[0].specialized_kpis;
          }
        }
      }

      setSpecializedKPIs(specializedKPIsResults);
    } catch (error) {
      console.error("Error fetching specialized KPIs:", error);
    }
  };

  const viewEmployeeKPIs = (employeeId, employeeName) => {
    if (specializedKPIs[employeeId]) {
      setSelectedEmployeeKPIs(specializedKPIs[employeeId]);
      setSelectedEmployeeName(employeeName);
      setSelectedEmployeeId(employeeId); // Add this line
      setActiveTab("details"); // Reset to details tab
      setShowKpiModal(true);
    }
  };

  // Function to render the status badge for a KPI
  const renderStatusBadge = (status) => {
    switch (status) {
      case "On Track":
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
            On Track
          </span>
        );
      case "At Risk":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
            At Risk
          </span>
        );
      case "Below Target":
        return (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
            Below Target
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <Card title="Team KPI Dashboard">
      {isLoading ? (
        <div className="py-6">
          <Loading text="Loading team KPI data..." />
        </div>
      ) : error ? (
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchTeamData}
          >
            Retry
          </Button>
        </div>
      ) : employeeDetails.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">
            No team members assigned to this project yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-gray-600">
            Each team member has personalized KPIs based on their role and
            skills. Click on "View KPIs" to see detailed metrics for each team
            member.
          </p>

          <div className="space-y-4">
            {employeeDetails.map((employee) => (
              <div
                key={employee._id}
                className="p-4 border rounded-md hover:bg-gray-50"
              >
                <div className="flex flex-wrap items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {employee.Name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {employee.Experience?.[0]?.Role || "Unknown Position"}
                    </p>
                    {/* Display assigned role if available */}
                    {teamData?.role_assignments &&
                      Object.entries(teamData.role_assignments).map(
                        ([roleId, empId]) => {
                          if (
                            empId === employee._id &&
                            kpiData?.employee_criteria
                          ) {
                            return (
                              <span
                                key={roleId}
                                className="mt-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded inline-block"
                              >
                                {kpiData.employee_criteria[parseInt(roleId)]
                                  ?.role || `Role ${roleId}`}
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        viewEmployeeKPIs(employee._id, employee.Name)
                      }
                      disabled={!specializedKPIs[employee._id]}
                    >
                      View KPIs
                    </Button>
                  </div>
                </div>

                {/* KPI Summary */}
                {specializedKPIs[employee._id] && (
                  <div className="grid grid-cols-2 gap-3 mt-4 md:grid-cols-4">
                    {Object.entries(specializedKPIs[employee._id]).map(
                      ([category, kpis]) => {
                        const totalKPIs = Object.keys(kpis).length;
                        const onTrackCount = Object.values(kpis).filter(
                          (kpi) => kpi.status === "On Track"
                        ).length;

                        const percentage = Math.round(
                          (onTrackCount / totalKPIs) * 100
                        );
                        let statusColor = "bg-red-100 text-red-800";
                        if (percentage >= 75)
                          statusColor = "bg-green-100 text-green-800";
                        else if (percentage >= 50)
                          statusColor = "bg-yellow-100 text-yellow-800";

                        return (
                          <div
                            key={category}
                            className="p-2 rounded bg-gray-50"
                          >
                            <h4 className="text-xs font-medium text-gray-700 capitalize">
                              {category.replace(/_/g, " ")}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${statusColor}`}
                              >
                                {percentage}%
                              </span>
                              <span className="text-xs text-gray-500">
                                {onTrackCount}/{totalKPIs} on track
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee KPIs Modal */}
      <Modal
        isOpen={showKpiModal}
        onClose={() => setShowKpiModal(false)}
        title={`Specialized KPIs for ${selectedEmployeeName}`}
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            These KPIs are tailored specifically for {selectedEmployeeName}{" "}
            based on their skills and assigned role requirements.
          </p>

          {/* Add tabs for Details and Progress */}
          <div className="flex mb-4 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "details"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("details")}
            >
              KPI Details
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "progress"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("progress")}
            >
              Track Progress
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "comparison"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("comparison")}
            >
              Compare to Project
            </button>
          </div>

          {activeTab === "details" && (
            <div>
              {selectedEmployeeKPIs &&
                Object.entries(selectedEmployeeKPIs).map(([category, kpis]) => (
                  <div key={category} className="mb-6 space-y-3">
                    <h3 className="font-medium text-gray-800 capitalize text-md">
                      {category.replace("_", " ")}
                    </h3>

                    <div className="space-y-2">
                      {Object.entries(kpis).map(([kpiName, kpiData]) => (
                        <div key={kpiName} className="p-3 border rounded-md">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700 capitalize">
                              {kpiName.replace(/_/g, " ")}
                            </h4>
                            {renderStatusBadge(kpiData.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="text-sm">
                              <span className="text-gray-500">Current:</span>{" "}
                              {kpiData.value}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Target:</span>{" "}
                              {kpiData.target}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === "progress" && (
            <IndividualKPITracker
              employeeId={selectedEmployeeId}
              employeeName={selectedEmployeeName}
              employeeKPIs={selectedEmployeeKPIs}
              onUpdateProgress={(id, data) =>
                kpiService.updateIndividualKPIProgress(projectId, id, data)
              }
            />
          )}

          {activeTab === "comparison" && (
            <KPIComparisonChart
              projectKPIs={projectKPIs}
              employeeKPIs={selectedEmployeeKPIs}
              employeeName={selectedEmployeeName}
            />
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowKpiModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default TeamKPIDashboard;
