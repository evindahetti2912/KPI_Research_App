import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { kpiService } from "../../services/kpiService";

const RoleCriteriaSelector = ({ projectId, onSelectRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [teamCriteria, setTeamCriteria] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeamCriteria();
  }, [projectId]);

  const fetchTeamCriteria = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch project KPIs which should include team criteria
      const response = await kpiService.getProjectKPIs(projectId);

      if (response.success && response.data.employee_criteria) {
        setTeamCriteria(response.data.employee_criteria);
      } else {
        setError("No team criteria found for this project");
      }
    } catch (error) {
      console.error("Error fetching team criteria:", error);
      setError("An error occurred while fetching team criteria");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamData = async () => {
    try {
      const response = await projectService.getProjectTeam(projectId);

      if (response.success) {
        let roleAssignmentsData = {};

        // Handle the new structure with role_assignments
        if (response.data.role_assignments) {
          roleAssignmentsData = response.data.role_assignments;
        }
        // Handle the legacy structure with a single role
        else if (response.data.role) {
          roleAssignmentsData = {
            [response.data.role]: response.data.employee_ids || [],
          };
        }

        setRoleAssignments(roleAssignmentsData);

        // Fetch details for assigned employees
        const employeeDetailsMap = {};

        for (const [role, employeeIds] of Object.entries(roleAssignmentsData)) {
          if (employeeIds && employeeIds.length > 0) {
            employeeDetailsMap[role] = [];

            for (const id of employeeIds) {
              try {
                const employeeResponse = await employeeService.getEmployee(id);
                if (employeeResponse.success) {
                  employeeDetailsMap[role].push(employeeResponse.data);
                }
              } catch (err) {
                console.error(`Error fetching employee ${id}:`, err);
              }
            }
          }
        }

        setAssignedEmployees(employeeDetailsMap);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  return (
    <Card title="Team Roles">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 bg-red-100 rounded-md">{error}</div>
        ) : teamCriteria.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No team roles defined for this project.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a role to find the most compatible developers:
            </p>

            {teamCriteria.map((role, index) => (
              <div
                key={index}
                className="p-4 border rounded-md hover:bg-gray-50"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{role.role}</h3>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500">
                        Required Skills:
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {role.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectRole(role)}
                  >
                    Find Developers
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RoleCriteriaSelector;
