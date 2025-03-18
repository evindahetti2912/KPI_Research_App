import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import Loading from "../common/Loading";
import { employeeService } from "../../services/employeeService";

const EmployeeList = ({ onSelectCV, filters = {} }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await employeeService.getAllEmployees();

      if (response.success) {
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } else {
        setError(response.message || "Failed to retrieve employees");
      }
    } catch (error) {
      console.error("Error retrieving employees:", error);
      setError("An error occurred while retrieving employees");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Apply filters when employees or filters change
  useEffect(() => {
    if (!employees.length) return;

    let filtered = [...employees];

    // Apply search filter (case-insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          (emp.Name && emp.Name.toLowerCase().includes(searchLower)) ||
          (emp["Contact Information"]?.Email &&
            emp["Contact Information"].Email.toLowerCase().includes(
              searchLower
            ))
      );
    }

    // Apply skills filter
    if (filters.skills) {
      const skillsArray = filters.skills
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter((skill) => skill);

      if (skillsArray.length > 0) {
        filtered = filtered.filter((emp) => {
          if (!emp.Skills || !emp.Skills.length) return false;

          // Check if employee has any of the skills
          return skillsArray.some((skill) =>
            emp.Skills.some((empSkill) =>
              empSkill.toLowerCase().includes(skill)
            )
          );
        });
      }
    }

    // Apply experience level filter
    if (filters.experienceLevel) {
      filtered = filtered.filter((emp) => {
        // Calculate total years of experience
        let totalYears = 0;
        if (emp.Experience && emp.Experience.length > 0) {
          // Simple approximation from number of roles
          // In a real app, we'd calculate from actual dates
          totalYears =
            emp._derived?.total_years_experience || emp.Experience.length;
        }

        switch (filters.experienceLevel) {
          case "Junior":
            return totalYears < 2;
          case "Mid-level":
            return totalYears >= 2 && totalYears < 5;
          case "Senior":
            return totalYears >= 5 && totalYears < 8;
          case "Lead":
            return totalYears >= 8;
          default:
            return true;
        }
      });
    }

    setFilteredEmployees(filtered);
  }, [employees, filters]);

  const handleSelectEmployee = (employee) => {
    if (onSelectCV) {
      onSelectCV(employee._id, employee);
    }
  };

  // Helper function to get experience level
  const getExperienceLevel = (employee) => {
    // Use _derived data if available
    if (employee._derived?.total_years_experience !== undefined) {
      const years = employee._derived.total_years_experience;
      if (years < 2)
        return { level: "Junior", color: "bg-green-100 text-green-800" };
      if (years < 5)
        return { level: "Mid-level", color: "bg-blue-100 text-blue-800" };
      if (years < 8)
        return { level: "Senior", color: "bg-purple-100 text-purple-800" };
      return { level: "Lead", color: "bg-indigo-100 text-indigo-800" };
    }

    // Fallback to simple calculation
    const roles = employee.Experience?.length || 0;
    if (roles < 2)
      return { level: "Junior", color: "bg-green-100 text-green-800" };
    if (roles < 3)
      return { level: "Mid-level", color: "bg-blue-100 text-blue-800" };
    if (roles < 4)
      return { level: "Senior", color: "bg-purple-100 text-purple-800" };
    return { level: "Lead", color: "bg-indigo-100 text-indigo-800" };
  };

  if (isLoading) {
    return (
      <Card title="Employee List">
        <div className="py-8">
          <Loading text="Loading employees..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Employee List">
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchEmployees}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Employee List">
      <div className="space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {employees.length === 0
              ? "No employees found. Upload CVs to add employees."
              : "No employees match the current filters."}
          </div>
        ) : (
          filteredEmployees.map((employee) => {
            const experienceLevel = getExperienceLevel(employee);
            return (
              <div
                key={employee._id}
                className="p-4 transition-colors border rounded-md cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelectEmployee(employee)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 text-md">
                      {employee.Name || "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {employee["Contact Information"]?.Email ||
                        "No email available"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded ${experienceLevel.color}`}
                  >
                    {experienceLevel.level}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {employee.Skills?.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {employee.Skills?.length > 5 && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded">
                      +{employee.Skills.length - 5} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between mt-3 text-xs text-gray-500">
                  <span>
                    {employee.Experience?.[0]?.Role || "Unknown Position"}
                    {employee.Experience?.[0]?.Company &&
                      ` at ${employee.Experience[0].Company}`}
                  </span>
                  <div className="flex space-x-3">
                    <Link
                      to={`/skill-development/${employee._id}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Skills
                    </Link>
                    <Link
                      to={`/kpi-management/${employee._id}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      KPIs
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default EmployeeList;
