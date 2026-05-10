import React, { useContext } from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { PenLine, LogOut, User, List, Menu, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const WriterSidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded text-sm font-semibold transition-colors duration-200 ${
      isActive ? 'bg-primary text-secondary' : 'text-primary hover:bg-gray-300 hover:scale-105'
    }`;

  return (
    <aside className="w-full md:w-[250px] bg-bg-main border-r border-border p-7 flex flex-col md:h-screen shrink-0 overflow-y-auto">
      <div className="mb-8 flex justify-between items-center md:block">
        <div>
          <h2 className="font-serif text-2xl mb-1">{user?.role.toUpperCase()} PORTAL</h2>
          <p className="text-sm text-muted tracking-wide">{user?.firstName || 'Writer'}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-primary hover:bg-gray-200 rounded">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <NavLink to="/writer/dashboard" className={navClass}>
          <List size={18} />
          <span>My Posts</span>
        </NavLink>
        <NavLink to="/writer/editor" className={navClass}>
          <PenLine size={18} />
          <span>Editor</span>
        </NavLink>
        <NavLink to="/writer/settings" className={navClass} end>
          <User size={18} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-sm font-semibold text-primary text-left hover:bg-gray-100 rounded transition-colors duration-200 border-2 border-gray-300 rounded-lg hover:scale-105 cursor-pointer">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const WriterLayout = () => {
  const { user, loading } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (loading) {
    return <div className="loader"></div>;
  }

  if (!user || user.role !== 'writer') {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f4f4f5] overflow-hidden">

      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center bg-bg-main p-4 border-b border-border">
        <h2 className="font-serif text-xl">WRITER PORTAL</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-200 rounded">
          <Menu size={24} />
        </button>
      </div>

      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsSidebarOpen(false)}/>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <WriterSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default WriterLayout;
