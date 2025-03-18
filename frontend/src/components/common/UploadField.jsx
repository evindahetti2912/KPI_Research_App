import React, { useState, useRef } from "react";

const UploadField = ({
  onFileSelect,
  accept = ".pdf,.jpg,.jpeg,.png",
  label = "Upload File",
  multiple = false,
  maxSize = 5, // in MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    // Check file type
    const fileType = file.type;
    const acceptableTypes = accept
      .split(",")
      .map((type) => type.trim().replace(".", ""));

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (
      !acceptableTypes.includes(fileExtension) &&
      !acceptableTypes.includes(fileType)
    ) {
      setError(`File type not supported. Accepted types: ${accept}`);
      return false;
    }

    setError("");
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = multiple ? files : files[0];

    if (multiple) {
      // For multiple files, validate each one
      const validFiles = Array.from(files).filter(validateFile);
      if (validFiles.length > 0) {
        setSelectedFile(validFiles);
        onFileSelect(validFiles);
      }
    } else {
      // For single file
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = multiple ? files : files[0];

    if (multiple) {
      // For multiple files
      const validFiles = Array.from(files).filter(validateFile);
      if (validFiles.length > 0) {
        setSelectedFile(validFiles);
        onFileSelect(validFiles);
      }
    } else {
      // For single file
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <svg
          className="h-10 w-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>

        <p className="mt-2 text-sm text-gray-600">
          Drag & drop your {multiple ? "files" : "file"} here, or click to
          browse
        </p>

        <p className="text-xs text-gray-500 mt-1">
          Accepted formats: {accept.replace(/\./g, "")}
        </p>

        {selectedFile && !multiple && (
          <div className="mt-3 flex items-center space-x-2 bg-gray-100 p-2 rounded">
            <svg
              className="h-5 w-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
          </div>
        )}

        {selectedFile && multiple && Array.isArray(selectedFile) && (
          <div className="mt-3 w-full">
            <p className="text-sm font-medium text-gray-700">
              {selectedFile.length} files selected
            </p>
            <ul className="mt-1 max-h-24 overflow-auto">
              {selectedFile.map((file, index) => (
                <li key={index} className="text-xs text-gray-600 truncate">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          accept={accept}
          multiple={multiple}
        />
      </div>
    </div>
  );
};

export default UploadField;
