import React, { useState } from "react";
import CVUploader from "../components/cv-management/CVUploader";
import CVPreview from "../components/cv-management/CVPreview";
import ParsedDataViewer from "../components/cv-management/ParsedDataViewer";
import SkillsExtractor from "../components/cv-management/SkillsExtractor";
import { cvService } from "../services/cvService";
import Loading from "../components/common/Loading";

const CVUploadPage = () => {
  const [selectedCV, setSelectedCV] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCVUploaded = async (cvId, parsedData) => {
    // If parsed data is provided directly, use it
    if (parsedData) {
      setSelectedCV({
        id: cvId,
        data: parsedData,
      });
      return;
    }

    // Otherwise, fetch the parsed data
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CV Management</h1>
        <p className="text-gray-600">
          Upload and process employee CVs for skill analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CVUploader onCVUploaded={handleCVUploaded} />
        <CVPreview
          cvData={selectedCV?.data}
          fileName={selectedCV?.data?._meta?.source_file}
        />
      </div>

      {isLoading ? (
        <div className="py-12">
          <Loading text="Loading CV data..." />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      ) : selectedCV?.data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ParsedDataViewer cvData={selectedCV.data} />
          </div>
          <div>
            <SkillsExtractor cvData={selectedCV.data} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CVUploadPage;
