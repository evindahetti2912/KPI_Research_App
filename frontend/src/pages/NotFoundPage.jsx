import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="font-extrabold text-blue-600 text-9xl">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="mt-8">
          <Link to="/">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
