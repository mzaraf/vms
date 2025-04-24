import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, UsersIcon, ClipboardIcon, LogOutIcon, BarChart3Icon, UserCheckIcon, UserPlusIcon, BuildingIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const Sidebar: React.FC = () => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const navLinkClass = ({
    isActive
  }: {
    isActive: boolean;
  }) => `flex items-center p-3 rounded-lg transition-all ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`;
  return <div className="w-64 bg-white h-full shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">NASRDA Visitor Manager</h1>
      </div>
      <div className="p-4">
        <div className="mb-6">
          <p className="text-sm text-gray-500">Welcome,</p>
          <p className="font-medium">{user?.first_name} {user?.last_name || ''}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          {user?.role === 'director' && <p className="text-xs text-gray-500">
              {user.department_name} Department
            </p>}
        </div>
        <nav className="space-y-2">
          <NavLink to="/dashboard" className={navLinkClass}>
            <HomeIcon className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
          <NavLink to="/pre-register" className={navLinkClass}>
            <ClipboardIcon className="w-5 h-5 mr-3" />
            Pre-Register
          </NavLink>
          {(user?.role === 'admin' || user?.role === 'staff') && <NavLink to="/check-in" className={navLinkClass}>
              <UserPlusIcon className="w-5 h-5 mr-3" />
              Check In
            </NavLink>}
          <NavLink to="/visitors" className={navLinkClass}>
            <UserCheckIcon className="w-5 h-5 mr-3" />
            Visitors
          </NavLink>
          {user?.role === 'admin' && <>
              <NavLink to="/users" className={navLinkClass}>
                <UsersIcon className="w-5 h-5 mr-3" />
                Users
              </NavLink>
              <NavLink to="/departments" className={navLinkClass}>
                <BuildingIcon className="w-5 h-5 mr-3" />
                Departments
              </NavLink>
            </>}
          {(user?.role === 'admin' || user?.role === 'director') && <NavLink to="/analytics" className={navLinkClass}>
              <BarChart3Icon className="w-5 h-5 mr-3" />
              Analytics
            </NavLink>}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-gray-200">
        <button onClick={handleLogout} className="flex items-center p-3 text-gray-700 hover:bg-red-100 rounded-lg w-full transition-all">
          <LogOutIcon className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>;
};
export default Sidebar;