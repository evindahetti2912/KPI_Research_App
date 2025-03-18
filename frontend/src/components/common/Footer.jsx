import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-4 px-6 border-t">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} KPI Allocation System. All rights
            reserved.
          </p>
          <div className="text-gray-500 text-sm">
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
