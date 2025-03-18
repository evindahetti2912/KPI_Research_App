import React, { useState, useCallback } from "react";
import UploadField from "../common/UploadField";
import Button from "../common/Button";
import Loading from "../common/Loading";
import Card from "../common/Card";
import { cvService } from "../../services/cvService";

const CVUploader = ({ onCVUploaded }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setUploadError("");
    setUploadSuccess(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setUploadError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await cvService.uploadCV(formData);

      if (response.success) {
        setUploadSuccess(true);
        setFile(null);
        if (onCVUploaded) {
          onCVUploaded(response.cv_id, response.parsed_data);
        }
      } else {
        setUploadError(response.message || "Failed to upload CV");
      }
    } catch (error) {
      console.error("Error uploading CV:", error);
      setUploadError(
        "An error occurred while uploading the CV. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }, [file, onCVUploaded]);

  return (
    <Card
      title="Upload CV"
      subtitle="Upload employee CV in PDF, JPG, or PNG format"
    >
      <div className="space-y-6">
        <UploadField
          onFileSelect={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png"
          label="Employee CV"
          multiple={false}
          maxSize={10} // 10MB limit
        />

        {uploadError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md">
            <p>{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md">
            <p>CV uploaded and processed successfully!</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            icon={
              isUploading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              )
            }
          >
            {isUploading ? "Uploading..." : "Upload CV"}
          </Button>
        </div>

        {isUploading && (
          <div className="mt-4">
            <Loading text="Processing CV, this may take a moment..." />
          </div>
        )}
      </div>
    </Card>
  );
};

export default CVUploader;
