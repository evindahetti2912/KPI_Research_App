import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  // Navigation items with icons and paths
  const navItems = [
    { name: "Dashboard", path: "/", icon: "grid" },
    { name: "CV Management", path: "/cv-upload", icon: "file-text" },
    { name: "Talent Pool", path: "/talent-pool", icon: "users" },
    { name: "Projects", path: "/projects", icon: "briefcase" },
    { name: "KPI Management", path: "/kpi-management", icon: "bar-chart-2" },
    { name: "Skill Development", path: "/skill-development", icon: "award" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-screen fixed">
      <div className="p-4">
        <h2 className="text-xl font-bold">KPI Allocation</h2>
      </div>

      <nav className="mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="px-4 py-3">
              <Link
                to={item.path}
                className={`flex items-center space-x-3 ${
                  location.pathname === item.path
                    ? "text-blue-400 font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <i className={`lucide-${item.icon}`}></i>
                <span>{item.name}</span>
                {location.pathname === item.path && (
                  <span className="ml-auto w-1 h-6 bg-blue-400 rounded-full"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
