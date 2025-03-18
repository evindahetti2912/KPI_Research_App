import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Modal from "../common/Modal";
import Button from "../common/Button";

const CVPreview = ({ cvData, fileName }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate preview if a file URL is available
  useEffect(() => {
    if (fileName && fileName.endsWith(".pdf")) {
      setPreviewUrl(`/uploads/${fileName}`);
    }
  }, [fileName]);

  // Function to render the metadata section
  const renderMetadata = () => {
    if (!cvData || !cvData._meta) return null;

    return (
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          File Information
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-600">Source File:</div>
          <div className="text-gray-900">
            {cvData._meta.source_file.split("/").pop()}
          </div>

          <div className="text-gray-600">Content Length:</div>
          <div className="text-gray-900">
            {cvData._meta.raw_text_length} characters
          </div>
        </div>
      </div>
    );
  };

  const openFullPreview = () => {
    setShowFullPreview(true);
  };

  const closeFullPreview = () => {
    setShowFullPreview(false);
  };

  return (
    <Card title="CV Preview" className="h-full flex flex-col">
      <div className="flex flex-col flex-grow">
        {!cvData ? (
          <div className="flex items-center justify-center flex-grow text-gray-500">
            No CV selected
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {cvData.Name || "Unknown"}
              </h3>
              {cvData["Contact Information"] && (
                <p className="text-sm text-gray-600">
                  {cvData["Contact Information"].Email || ""}
                </p>
              )}
            </div>

            {previewUrl ? (
              <div className="relative mb-4 flex-grow border rounded-md overflow-hidden">
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title="CV Preview"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setError("Failed to load preview");
                    }}
                  />

                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}

                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                      <div className="text-red-500">{error}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 mb-4 rounded-md">
                <p className="text-sm text-gray-600">
                  No preview available for this CV format. Please use the parsed
                  data view.
                </p>
              </div>
            )}

            {renderMetadata()}

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={openFullPreview}
                disabled={!previewUrl}
              >
                View Full CV
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Full preview modal */}
      <Modal
        isOpen={showFullPreview}
        onClose={closeFullPreview}
        title="CV Full Preview"
        size="lg"
      >
        <div className="h-[70vh]">
          <iframe
            src={previewUrl}
            className="w-full h-full border"
            title="CV Full Preview"
          />
        </div>
      </Modal>
    </Card>
  );
};

export default CVPreview;
