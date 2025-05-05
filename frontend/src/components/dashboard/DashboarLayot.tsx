import { Outlet } from "react-router-dom";
import DashboardSidebar from "./sidebar";
import DashboardHeader from "./DashboardHeader";

const DashboarLayot = () => {
  return (
    <div className="flex flex-grow">
      <DashboardSidebar />
      <div className="flex flex-col w-full">
        <DashboardHeader />
        <Outlet />
      </div>
    </div>
  );
};

export default DashboarLayot;
