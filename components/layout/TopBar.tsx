

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon, Bars3Icon, ChevronDownIcon } from '../shared/Icons.tsx';
import type { User, Role, Notification } from '../../types.ts';
import NotificationPanel from './NotificationPanel.tsx';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface TopBarProps {
    onToggleSidebar: () => void;
    currentUser: User | null;
    roles: Role[];
    onLogout: () => void;
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onMarkAllAsRead: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
    onToggleSidebar, 
    currentUser, 
    roles, 
    onLogout, 
    notifications, 
    onNotificationClick, 
    onMarkAllAsRead 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const currentUserRole = roles.find(r => r.id === currentUser?.rolId);

  const hasUnreadNotifications = useMemo(() => {
    return notifications.some(n => !n.isRead);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationPanelClick = (notification: Notification) => {
      onNotificationClick(notification);
      setIsNotificationsOpen(false); // Close panel after click
  }

  return (
    <header className="h-16 bg-white border-b border-munnay-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-soft">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="text-gray-500 hover:text-munnay-700 lg:hidden mr-4 transition-all duration-300">
          <Bars3Icon />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-munnay-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="w-48 md:w-64 bg-munnay-50 border border-munnay-200 text-gray-800 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-munnay-500 focus:border-munnay-500 transition-all duration-300"
          />
        </div>

        <div className="relative" ref={notificationsRef}>
            <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-gray-500 hover:text-munnay-700 p-1 hover:bg-munnay-50 rounded-full transition-all duration-300"
            >
                <GoogleIcon name="notifications" className="text-2xl" />
                {hasUnreadNotifications && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white shadow-soft"></span>
                )}
            </button>
            {isNotificationsOpen && (
                <NotificationPanel 
                    notifications={notifications}
                    onNotificationClick={handleNotificationPanelClick}
                    onMarkAllAsRead={onMarkAllAsRead}
                />
            )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 cursor-pointer p-1 rounded-xl hover:bg-munnay-50 transition-all duration-300">
            <img
              src={currentUser?.avatarUrl || "https://picsum.photos/id/237/40/40"}
              alt="User Avatar"
              className="h-9 w-9 rounded-full ring-2 ring-munnay-200"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800">{currentUser?.nombres} {currentUser?.apellidos}</p>
              <p className="text-xs text-munnay-600">{currentUserRole?.nombre}</p>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-soft-lg z-50 border border-munnay-200">
              <div className="py-1">
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-munnay-50 rounded-xl transition-all duration-300 mx-1">
                    <GoogleIcon name="person" className="mr-2 text-lg" /> Mi Perfil
                </a>
                <button
                    onClick={onLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 mx-1"
                >
                    <GoogleIcon name="logout" className="mr-2 text-lg" /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;