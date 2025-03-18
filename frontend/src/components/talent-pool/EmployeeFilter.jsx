import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";

const EmployeeFilter = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    skills: initialFilters.skills || "",
    experienceLevel: initialFilters.experienceLevel || "",
    availability: initialFilters.availability || "",
    sortBy: initialFilters.sortBy || "name",
  });

  // Track number of active filters
  const [filterCount, setFilterCount] = useState(0);

  // Update parent component when filters change
  useEffect(() => {
    // Calculate number of active filters
    let count = 0;
    if (filters.search) count++;
    if (filters.skills) count++;
    if (filters.experienceLevel) count++;
    if (filters.availability) count++;

    setFilterCount(count);

    // Notify parent component of filter changes
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      skills: "",
      experienceLevel: "",
      availability: "",
      sortBy: "name",
    });
  };

  return (
    <Card title="Filter Employees">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="search"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Search Name or Email
          </label>
          <input
            type="text"
            id="search"
            name="search"
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search employees..."
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label
            htmlFor="skills"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Skills
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. React, Python, JavaScript"
            value={filters.skills}
            onChange={handleInputChange}
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple skills with commas
          </p>
        </div>

        <div>
          <label
            htmlFor="experienceLevel"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Experience Level
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={filters.experienceLevel}
            onChange={handleInputChange}
          >
            <option value="">All Levels</option>
            <option value="Junior">Junior (0-2 years)</option>
            <option value="Mid-level">Mid-level (2-5 years)</option>
            <option value="Senior">Senior (5-8 years)</option>
            <option value="Lead">Lead (8+ years)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="availability"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Availability Status
          </label>
          <select
            id="availability"
            name="availability"
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={filters.availability}
            onChange={handleInputChange}
          >
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Partially Available">Partially Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sortBy"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Sort By
          </label>
          <select
            id="sortBy"
            name="sortBy"
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={filters.sortBy}
            onChange={handleInputChange}
          >
            <option value="name">Name</option>
            <option value="experience">Experience (High to Low)</option>
            <option value="skills">Number of Skills</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-gray-500">
            {filterCount} {filterCount === 1 ? "filter" : "filters"} applied
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            disabled={filterCount === 0}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeFilter;
