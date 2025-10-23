import React from 'react';
import type { Notification } from '../../types.ts';
import { formatDistanceToNow } from '../../utils/time.ts';

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const NOTIFICATION_ICONS: Record<Notification['type'], { icon: string, color: string }> = {
    complicacion_paciente: { icon: 'warning', color: 'text-red-500' },
    pago_por_vencer: { icon: 'receipt_long', color: 'text-orange-500' },
    nuevo_lead: { icon: 'person_add', color: 'text-blue-500' },
    cita_proxima: { icon: 'event', color: 'text-purple-500' },
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
    const { icon, color } = NOTIFICATION_ICONS[notification.type];

    return (
        <div 
            onClick={onClick}
            className={`flex items-start p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                notification.isRead ? 'bg-white' : 'bg-blue-50'
            } hover:bg-gray-100`}
        >
            <div className={`mr-4 mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 ${color}`}>
                <GoogleIcon name={icon} className="text-xl" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{notification.message}</p>
                <p className="text-sm text-gray-600">{notification.details}</p>
                <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp))}
                </p>
            </div>
            {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-4 mt-1 flex-shrink-0"></div>
            )}
        </div>
    );
};

export default NotificationItem;