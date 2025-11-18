import React, { useState, useEffect, useRef } from 'react';
import { Logo, NOTIFICATIONS } from '../constants';
import { Notification } from '../types';
import NotificationPanel from './NotificationPanel';

const NavLink: React.FC<{ href: string; icon: React.ReactNode; text: string; active?: boolean; onClick?: (e: React.MouseEvent) => void; }> = ({ href, icon, text, active, onClick }) => (
  <a 
    href={href}
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      active 
        ? 'bg-electric-blue/10 text-electric-blue' 
        : 'text-muted-gray hover:bg-slate-700/50 hover:text-white'
    }`}
  >
    {icon}
    <span>{text}</span>
  </a>
);

interface HeaderProps {
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const notificationRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setHasUnread(notifications.some(n => !n.read));
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (feature: string, e: React.MouseEvent) => {
    e.preventDefault();
    alert(`${feature} feature coming soon!`);
  };

  const handleNotificationClick = () => {
    setIsPanelOpen(prev => !prev);
    if (hasUnread) {
      setHasUnread(false);
      // In a real app, you'd also mark notifications as read in the backend/state management
      setNotifications(currentNotifications => 
        currentNotifications.map(n => ({ ...n, read: true }))
      );
    }
  };

  const handleDismissNotification = (id: number) => {
    setNotifications(currentNotifications =>
      currentNotifications.filter(n => n.id !== id)
    );
  };


  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = currentDateTime.toLocaleDateString(undefined, dateOptions);
  const formattedTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="bg-dark-slate/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="#" aria-label="Home">
              <Logo className="h-8 w-auto"/>
            </a>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-4">
            <NavLink href="#" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>} text="Home" active />
            <NavLink href="#" onClick={(e) => handleNavClick('Challenges', e)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>} text="Challenges" />
            <NavLink href="#" onClick={(e) => handleNavClick('Mentors', e)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} text="Mentors" />
            <NavLink href="#" onClick={(e) => handleNavClick('Community', e)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>} text="Community" />
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <div className="text-sm font-medium text-white">{formattedTime}</div>
              <div className="text-xs text-muted-gray">{formattedDate}</div>
            </div>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationClick}
                className="relative text-muted-gray hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {hasUnread && notifications.length > 0 && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-dark-slate" />}
              </button>
              {isPanelOpen && <NotificationPanel notifications={notifications} onClose={() => setIsPanelOpen(false)} onDismiss={handleDismissNotification} />}
            </div>

            <button onClick={onProfileClick} className="relative" aria-label="User Profile">
              <img 
                className="h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-dark-slate ring-electric-blue" 
                src="https://api.dicebear.com/8.x/bottts/svg?seed=skilllink-user" 
                alt="User avatar" 
              />
               <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-dark-slate" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;