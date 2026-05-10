import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { AuthContext } from "../../context/AuthContext";

const AdminLayout = () => {
  const { user, loading } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // adding loading animation
  if (loading) {
    return <div className="loader"></div>;
  }
  // checking if the user is admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#ffffff] overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center bg-bg-main p-4 border-b border-border">
        <h2 className="font-serif text-xl">ADMIN PORTAL</h2>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-200 rounded"
        >
          <Menu size={24} />
        </button>
      </div>

      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
