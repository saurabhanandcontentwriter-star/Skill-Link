
import React, { useState } from 'react';
import { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onDismiss: (id: number | string) => void;
  onClearAll: () => void;
}

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const iconClasses = "w-6 h-6";
  switch (type) {
    case 'workshop':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconClasses} text-blue-400`}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>;
    case 'message':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconClasses} text-aqua-green`}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
    case 'challenge':
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconClasses} text-yellow-400`}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
    case 'system':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconClasses} text-neon-purple`}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;
    case 'task':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconClasses} text-orange-400`}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
    default:
      return null;
  }
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onDismiss, onClearAll }) => {
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

    return (
        <div className="absolute right-0 mt-3 w-80 max-w-sm bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl z-50 animate-fade-in overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={() => setIsConfirmingClear(true)}
                        className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-400/10"
                    >
                        Clear All
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto relative">
                {isConfirmingClear && (
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-500 mb-3"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        <p className="text-white font-semibold mb-1">Clear all notifications?</p>
                        <p className="text-xs text-muted-gray mb-4">This action cannot be undone.</p>
                        <div className="flex gap-3 w-full">
                             <button
                                onClick={() => setIsConfirmingClear(false)}
                                className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onClearAll();
                                    setIsConfirmingClear(false);
                                }}
                                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                Yes, Clear
                            </button>
                        </div>
                    </div>
                )}
                
                {notifications.length > 0 ? (
                    <ul>
                        {notifications.map((notification) => (
                            <li key={notification.id} className={`relative group p-4 flex items-start gap-4 transition-colors hover:bg-slate-700/50 ${!notification.read ? 'bg-electric-blue/10' : ''}`}>
                                <div className="flex-shrink-0 mt-1">
                                    <NotificationIcon type={notification.type} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-white">{notification.title}</p>
                                    <p className="text-xs text-muted-gray">{notification.description}</p>
                                    <p className="text-xs text-muted-gray/70 mt-1">{notification.timestamp}</p>
                                </div>
                                {!notification.read && <div className="w-2.5 h-2.5 bg-electric-blue rounded-full mt-1.5 flex-shrink-0"></div>}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDismiss(notification.id);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-full text-muted-gray/50 opacity-0 group-hover:opacity-100 hover:bg-slate-600/50 hover:text-white transition-all"
                                    aria-label={`Dismiss notification: ${notification.title}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-muted-gray">No new notifications</p>
                    </div>
                )}
            </div>
            <div className="p-2 border-t border-slate-700 bg-slate-900/50 rounded-b-lg flex justify-between items-center text-sm">
                <button onClick={() => alert('Marking all as read!')} className="px-3 py-1 text-electric-blue hover:bg-slate-700/50 rounded">Mark all as read</button>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Viewing all notifications!'); }} className="px-3 py-1 text-muted-gray hover:text-white">View all</a>
            </div>
        </div>
    );
};

export default NotificationPanel;
