import { useState } from "react";
import { InnoLogo } from "./InnoLogo.jsx";
import { Divider } from "@nextui-org/react";
import { SidebarData } from "../../data/SidebarData.jsx";
import { Link, useLocation } from "react-router-dom";
import GetPermission from "../shared/GetPermission";

const SideNav = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const permissions = GetPermission();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") {
      return false;
    }
    return location.pathname.includes(path);
  };

  const filteredSidebarData = SidebarData.filter((item) => {
    if (item.permissions) {
      return permissions.includes(item.permissions);
    }
    return item.permissions === null;
  });
  //console.log("PERMISSION ni: ", permissions);
  //console.log("filtered data: ", filteredSidebarData);
  return (
    <>
      {/* mobile navbar */}
      <div className="bg-primary py-3 text-gray-100 flex justify-end md:hidden">
        {/* mobile menu */}
        <button
          className="mobile-menu-btn p-4 focus:outline-none focus:bg-gray-700"
          onClick={toggleSidebar}
        >
          {/* Menu Button */}
          <svg
            className={`w-6 h-6 transition-transform transform ${
              isSidebarOpen ? "rotate-90" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isSidebarOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 10h16M4 14h16M4 18h16"
              }
            ></path>
          </svg>
        </button>
      </div>
      {/* sidebar */}
      <div
        className={`sidebar bg-primary w-64 absolute inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-200  border-r-1 ease-in-out z-50 border-gray-300`}
      >
        {/* logo */}
        <div className="bg-lighterwhite">
          <Link
            to="/"
            className="flex items-center space-x-2 justify-center py-3"
          >
            <InnoLogo />
            <span className="text-4xl font-extrabold">
              <span className="text-[#A03223]">i</span>
              <span className=" text-primary">TMS</span>
            </span>
          </Link>
        </div>
        <Divider />
        {/* nav */}
        <nav className="flex flex-col gap-1 min-h-screen px-2 py-10">
          {/* Map over navigation items */}
          {filteredSidebarData.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`${
                isActive(item.path) ? "bg-white text-primary " : "text-white"
              } block py-2.5 px-4 rounded hover:bg-white  hover:text-primary transition duration-200 font-bold`}
            >
              <div className="flex flex-row gap-3">
                {item.icon} {item.text}
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SideNav;
