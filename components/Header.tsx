
import React, { useState, useEffect, useRef } from 'react';
import { Logo, NOTIFICATIONS, NAV_LINKS } from '../constants';
import { Notification, NavLinkItem } from '../types';
import NotificationPanel from './NotificationPanel';
import { ActiveView } from '../App';

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
  onNavigate: (view: ActiveView) => void;
  activeView: ActiveView;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeView }) => {
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

  const handleNavClick = (e: React.MouseEvent, link: NavLinkItem) => {
    e.preventDefault();
    if (link.isFeature) {
      alert(`${link.text} feature coming soon!`);
    } else if (link.view) {
      onNavigate(link.view);
    }
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

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };


  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = currentDateTime.toLocaleDateString(undefined, dateOptions);
  const formattedTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const getActiveLinkText = () => {
    if (activeView === 'home') return 'Home';
    if (activeView === 'tasks') return 'Tasks';
    if (activeView === 'certificates') return 'Certificates';
    if (activeView === 'interview') return 'Interview';
    return '';
  };

  return (
    <header className="bg-dark-slate/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="#" onClick={(e) => handleNavClick(e, NAV_LINKS[0])} aria-label="Home">
              <Logo className="h-8 w-auto"/>
            </a>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.text}
                href={link.href}
                icon={link.icon}
                text={link.text}
                active={getActiveLinkText() === link.text}
                onClick={(e) => handleNavClick(e, link)}
              />
            ))}
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
              {isPanelOpen && (
                <NotificationPanel 
                  notifications={notifications} 
                  onClose={() => setIsPanelOpen(false)} 
                  onDismiss={handleDismissNotification}
                  onClearAll={handleClearAllNotifications}
                />
              )}
            </div>

            <button onClick={() => onNavigate('profile')} className="relative" aria-label="User Profile">
              <img 
                className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-dark-slate ${activeView === 'profile' ? 'ring-aqua-green' : 'ring-electric-blue'}`}
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
