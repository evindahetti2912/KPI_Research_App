import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CVList from "../components/cv-management/CVList";
import ParsedDataViewer from "../components/cv-management/ParsedDataViewer";
import SkillsExtractor from "../components/cv-management/SkillsExtractor";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Loading from "../components/common/Loading";
import Modal from "../components/common/Modal";
import { cvService } from "../services/cvService";

const TalentPoolPage = () => {
  const [selectedCV, setSelectedCV] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [skillFilter, setSkillFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCount, setFilterCount] = useState(0);

  useEffect(() => {
    // Update the filter count when any filter changes
    let count = 0;
    if (skillFilter) count++;
    if (experienceFilter) count++;
    if (searchQuery) count++;
    setFilterCount(count);
  }, [skillFilter, experienceFilter, searchQuery]);

  const handleSelectCV = async (cvId, cvData) => {
    // If we already have the CV data, use it
    if (cvData) {
      setSelectedCV({
        id: cvId,
        data: cvData,
      });
      return;
    }

    // Otherwise, fetch the data
    setIsLoading(true);
    setError("");

    try {
      const response = await cvService.getParsedCV(cvId);

      if (response.success) {
        setSelectedCV({
          id: cvId,
          data: response.data,
        });
      } else {
        setError(response.message || "Failed to retrieve CV data");
      }
    } catch (error) {
      console.error("Error retrieving CV data:", error);
      setError("An error occurred while retrieving CV data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSkillFilter("");
    setExperienceFilter("");
    setSearchQuery("");
  };

  const renderFilterSection = () => {
    return (
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800 mb-2 md:mb-0">
            Filter Talent Pool
          </h2>

          {filterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              icon={
                <svg
                  className="h-4 w-4"
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
              }
            >
              Clear Filters ({filterCount})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="col-span-3 md:col-span-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Name or Email
            </label>
            <input
              type="text"
              id="search"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="skills"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Skills
            </label>
            <input
              type="text"
              id="skills"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. React, Python"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="experience"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Experience Level
            </label>
            <select
              id="experience"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="Junior">Junior (0-2 years)</option>
              <option value="Mid-level">Mid-level (2-5 years)</option>
              <option value="Senior">Senior (5-8 years)</option>
              <option value="Lead">Lead (8+ years)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderSkillBadge = () => {
    if (!selectedCV?.data) return null;

    // Calculate years of experience
    const yearsOfExperience =
      selectedCV.data._derived?.total_years_experience || 0;

    // Determine experience level
    let experienceLevel = "Junior";
    let badgeColor = "bg-green-100 text-green-800";

    if (yearsOfExperience >= 8) {
      experienceLevel = "Lead";
      badgeColor = "bg-indigo-100 text-indigo-800";
    } else if (yearsOfExperience >= 5) {
      experienceLevel = "Senior";
      badgeColor = "bg-purple-100 text-purple-800";
    } else if (yearsOfExperience >= 2) {
      experienceLevel = "Mid-level";
      badgeColor = "bg-blue-100 text-blue-800";
    }

    return (
      <span className={`text-xs px-2.5 py-0.5 rounded ${badgeColor}`}>
        {experienceLevel}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1>
          <p className="text-gray-600">Browse and analyze employee profiles</p>
        </div>

        <div className="mt-4 md:mt-0 space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
            icon={
              <svg
                className="h-4 w-4 mr-1"
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
            Filter Options
          </Button>

          <Link to="/cv-upload">
            <Button
              variant="primary"
              icon={
                <svg
                  className="h-4 w-4 mr-1"
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
          </Link>
        </div>
      </div>

      {filterCount > 0 && (
        <div className="mb-6 flex items-center space-x-2 text-sm">
          <span className="text-gray-600">Active filters:</span>

          {searchQuery && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              Search: {searchQuery}
              <button
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={() => setSearchQuery("")}
              >
                <svg
                  className="h-3 w-3"
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

          {skillFilter && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
              Skills: {skillFilter}
              <button
                className="ml-1 text-green-500 hover:text-green-700"
                onClick={() => setSkillFilter("")}
              >
                <svg
                  className="h-3 w-3"
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

          {experienceFilter && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center">
              Experience: {experienceFilter}
              <button
                className="ml-1 text-purple-500 hover:text-purple-700"
                onClick={() => setExperienceFilter("")}
              >
                <svg
                  className="h-3 w-3"
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

          <button
            className="text-gray-500 hover:text-gray-700 text-sm"
            onClick={handleClearFilters}
          >
            Clear all
          </button>
        </div>
      )}

      {/* CV List */}
      <div className="mb-6">
        <CVList
          onSelectCV={handleSelectCV}
          filters={{
            search: searchQuery,
            skills: skillFilter,
            experienceLevel: experienceFilter,
          }}
        />
      </div>

      {/* Selected CV Details */}
      {isLoading ? (
        <div className="py-12">
          <Loading text="Loading CV data..." />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      ) : selectedCV?.data ? (
        <div>
          <div className="mb-6 bg-white shadow rounded-lg p-6">
            <div className="flex flex-wrap justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedCV.data.Name || "Unknown"}
                  </h2>
                  {renderSkillBadge()}
                </div>

                <p className="text-gray-600 mt-1">
                  {selectedCV.data["Contact Information"]?.Email ||
                    "No email available"}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Logic to match with a project could be added here
                    console.log("Find projects for", selectedCV.data.Name);
                  }}
                  icon={
                    <svg
                      className="h-4 w-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  }
                >
                  Find Projects
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Logic to recommend skills could be added here
                    console.log("Recommend skills for", selectedCV.data.Name);
                  }}
                  icon={
                    <svg
                      className="h-4 w-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  }
                >
                  Recommend Skills
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Experience
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCV.data._derived?.total_years_experience || 0} years
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Skills
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCV.data.Skills?.length || 0} skills
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Education
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCV.data.Education?.length || 0} degrees
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Roles
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCV.data.Experience?.length || 0} positions
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ParsedDataViewer cvData={selectedCV.data} />
            </div>
            <div>
              <SkillsExtractor cvData={selectedCV.data} />
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <div className="py-8 text-center">
            <svg
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="text-gray-500 mb-4">
              Select a CV from the list to view details
            </p>
            <Link to="/cv-upload">
              <Button variant="outline" size="sm">
                Upload a new CV
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Filter Talent Pool"
        footer={
          <div className="flex space-x-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // Apply filters and close modal
                setShowModal(false);
              }}
            >
              Apply Filters
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label
              htmlFor="modal-search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Name or Email
            </label>
            <input
              type="text"
              id="modal-search"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="modal-skills"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Skills
            </label>
            <input
              type="text"
              id="modal-skills"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. React, Python"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple skills with commas
            </p>
          </div>

          <div>
            <label
              htmlFor="modal-experience"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Experience Level
            </label>
            <select
              id="modal-experience"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="Junior">Junior (0-2 years)</option>
              <option value="Mid-level">Mid-level (2-5 years)</option>
              <option value="Senior">Senior (5-8 years)</option>
              <option value="Lead">Lead (8+ years)</option>
            </select>
          </div>

          {filterCount > 0 && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TalentPoolPage;
