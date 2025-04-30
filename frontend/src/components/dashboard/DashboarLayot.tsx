
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./sidebar";
import DashboardHeader from "./Header";

const DashboarLayot = () => {
  return (
    <div className="flex">
        <DashboardSidebar/>
        <div className="flex flex-col w-full">
          <DashboardHeader/>
          <Outlet />
        </div>
    </div>
  )
}

export default DashboarLayot;