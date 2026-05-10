import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { List, PenLine, User, LogOut, UserPlus, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded text-sm font-semibold transition-colors duration-200 ${
    isActive
      ? 'bg-primary text-secondary'
      : 'text-primary hover:bg-gray-300 hover:scale-105'
  }`;

  return (
    <aside className="w-full md:w-[250px] bg-bg-main border-r border-border p-7 flex flex-col md:h-screen shrink-0 overflow-y-auto">
      <div className="mb-8 flex justify-between items-center md:block">
        <div>
          <h2 className="font-serif text-2xl mb-1">{user?.role.toUpperCase()} PORTAL</h2>
          <p className="text-sm text-muted tracking-wide">{user?.firstName.toUpperCase() || 'Admin'}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-primary hover:bg-gray-200 rounded">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <NavLink to="/admin/dashboard" className={navClass}>
          <List size={18} />
          <span>All Posts</span>
        </NavLink>
        
        <NavLink to="/admin/editor" className={navClass}>
          <PenLine size={18} />
          <span>Editor</span>
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink to="/admin/add-writer" className={navClass}>
            <UserPlus size={18} />
            <span>Add Writer</span>
          </NavLink>
        )}

        <NavLink to="/admin/settings" className={navClass} end>
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

export default Sidebar;
