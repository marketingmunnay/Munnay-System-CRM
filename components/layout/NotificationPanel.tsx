import React from 'react';
import type { Notification } from '../../types.ts';
import NotificationItem from './NotificationItem.tsx';

interface NotificationPanelProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onMarkAllAsRead: () => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onNotificationClick, onMarkAllAsRead }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-2xl z-50 ring-1 ring-black ring-opacity-5">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
                <button 
                    onClick={onMarkAllAsRead} 
                    className="text-xs font-medium text-[#aa632d] hover:underline"
                >
                    Marcar todo como leído
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem 
                            key={notification.id} 
                            notification={notification} 
                            onClick={() => onNotificationClick(notification)}
                        />
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <GoogleIcon name="notifications_off" className="text-4xl mx-auto mb-2" />
                        <p className="text-sm">No tienes notificaciones nuevas.</p>
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-50 text-center border-t">
                 <button className="w-full text-sm font-medium text-[#aa632d] hover:bg-gray-100 p-2 rounded-md">
                    Ver todas las notificaciones
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;