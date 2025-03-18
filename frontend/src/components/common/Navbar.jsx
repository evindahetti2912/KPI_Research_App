import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png";

const Navbar = () => {
  const location = useLocation();

  // Check if the current route matches the passed path
  const isActive = (path) => {
    return location.pathname === path
      ? "font-bold text-blue-600"
      : "text-gray-700 hover:text-blue-500";
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 mr-4" />
          <h1 className="text-xl font-semibold text-gray-800">
            KPI Allocation System
          </h1>
        </div>

        <div className="flex space-x-6">
          <Link to="/" className={isActive("/")}>
            Dashboard
          </Link>
          <Link to="/cv-upload" className={isActive("/cv-upload")}>
            CV Management
          </Link>
          <Link to="/talent-pool" className={isActive("/talent-pool")}>
            Talent Pool
          </Link>
          <Link to="/projects" className={isActive("/projects")}>
            Projects
          </Link>
          <Link to="/kpi-management" className={isActive("/kpi-management")}>
            KPI Management
          </Link>
          <Link
            to="/skill-development"
            className={isActive("/skill-development")}
          >
            Skill Development
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-gray-600">Admin</span>
          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
            A
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
