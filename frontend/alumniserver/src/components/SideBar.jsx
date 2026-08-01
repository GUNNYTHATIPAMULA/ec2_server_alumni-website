import React, { useState } from 'react';
import {
  Home, Users, Calendar, Briefcase, User, LogOut,
  Award, GraduationCap, Heart, Settings, FileText,
  Bell, LogIn, UserRoundPlus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SideBar = ({ user, onClose }) => {

  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const currentPath = location.pathname;
  const user_role = user?.role || "guest";

  const isActive = (path) => currentPath.endsWith(path);

  const navConfig = {
    guest: [
      { icon: LogIn, label: "Login", href: "/login" },
      { icon: UserRoundPlus, label: "Register", href: "/register" }
    ],
    admin: [
      { icon: Home, label: 'Dashboard', href: '/admindashboard' },
      { icon: Users, label: 'All Alumni', href: '/admindashboard/alumni' },
      { icon: Briefcase, label: 'Jobs', href: '/admindashboard/jobs' },
      { icon: GraduationCap, label: 'Mentorship', href: '/admindashboard/mentorship' },
      { icon: FileText, label: 'Posts', href: '/admindashboard/posts' },
      { icon: Calendar, label: 'Events', href: '/admindashboard/events' },
      { icon: User, label: 'Pending Approvals', href: '/admindashboard/pending' },
    ],
    alumni: [
      { icon: Home, label: 'Dashboard', href: '/alumnidashboard' },
      { icon: User, label: 'My Profile', href: '/alumnidashboard/profile' },
      { icon: Users, label: 'Alumni Directory', href: '/alumnidashboard/alumnidirectory' },
      { icon: Briefcase, label: 'Job Portal', href: '/alumnidashboard/jobs' },
      { icon: GraduationCap, label: 'Mentorship', href: '/alumnidashboard/mentorship' },
      { icon: FileText, label: 'Career Resources', href: '/alumnidashboard/resources' },
      { icon: Calendar, label: 'Events & Reunions', href: '/alumnidashboard/events' },
      { icon: Award, label: 'Alumni Spotlights', href: '/alumnidashboard/spotlights' },
      { icon: Heart, label: 'Giving Back', href: '/alumnidashboard/contribute' },
      { icon: Settings, label: 'Settings', href: '/alumnidashboard/settings' },
      { icon: FileText, label: 'Community Posts', href: '/alumnidashboard/posts' }
    ],
    student: [
      { icon: Home, label: 'Dashboard', href: '/studentdashboard' },
      { icon: Calendar, label: 'Events', href: '/studentdashboard/events' },
      { icon: User, label: 'Profile', href: '/studentdashboard/profile' },
    ]
  };

  const navItems = navConfig[user_role] || [];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-white text-black shadow-md z-50
        transition-all duration-300 flex flex-col
        ${isOpen ? 'w-64' : 'w-0 md:w-20'}
        overflow-hidden md:relative
      `}
    >

      {/* 🔹 User Info */}
      <div className={`p-4  border-gray-700 ${!isOpen && 'md:px-2'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>

          <div className={`${!isOpen && 'md:hidden'}`}>
            <p className="font-medium">{user?.fullname || "Guest User"}</p>
            <p className="text-xs text-gray-300">{user_role}</p>
          </div>
        </div>
      </div>

      {/* 🔹 Navigation */}
      <nav className="flex-2 py-2 overflow-auto">
        <ul className="space-y-2 px-3">
          {navItems.map((item, index) => {
            const active = isActive(item.href);

            return (
              <li key={index}>
                <button
                  onClick={() => {
                    navigate(item.href);
                    if (onClose) onClose();
                  }}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all
                    ${active
                      ? "bg-blue-800 text-white font-semibold border-l-5 border-yellow-400"
                      : "text-black hover:bg-indigo-50 hover:text-indigo-600"}
                  `}
                  title={!isOpen ? item.label : ""}
                >
                  <item.icon size={20} />
                  <span className={`${!isOpen && 'md:hidden'}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 🔹 Quick Actions */}
      <div className={`p-4 flex-1  ${!isOpen && 'md:px-2'}`}>
        <p className={`${!isOpen && 'md:hidden'} text-xs mb-3 text-gray-300`}>
          Quick Actions
        </p>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">
            <Briefcase size={18} />
            <span className={`${!isOpen && 'md:hidden'}`}>Post a Job</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">
            <Calendar size={18} />
            <span className={`${!isOpen && 'md:hidden'}`}>Schedule Mentoring</span>
          </button>

          <button
            onClick={() => {
              logout();
              if (onClose) onClose();
            }} className="w-full flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">
            <LogOut size={18} />
            <span className={`${!isOpen && 'md:hidden'}`}>Logout</span>
          </button>
        </div>
      </div>

    </aside>
  );
};

export default SideBar;