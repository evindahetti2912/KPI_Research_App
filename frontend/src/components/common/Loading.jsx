import React from "react";

const Loading = ({
  size = "md",
  color = "primary",
  fullScreen = false,
  text = "Loading...",
}) => {
  // Define size classes
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
  };

  // Define color classes
  const colorClasses = {
    primary: "border-blue-600 border-t-transparent",
    secondary: "border-gray-600 border-t-transparent",
    success: "border-green-600 border-t-transparent",
    danger: "border-red-600 border-t-transparent",
    warning: "border-yellow-600 border-t-transparent",
  };

  const spinnerClasses = `rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className={spinnerClasses}></div>
          {text && <p className="mt-4 text-gray-600">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className={spinnerClasses}></div>
      {text && <span className="ml-3 text-gray-600">{text}</span>}
    </div>
  );
};

export default Loading;
