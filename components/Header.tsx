
import React, { useState, useEffect, useRef } from 'react';
import { Logo, NAV_LINKS } from '../constants';
import { Notification, NavLinkItem, ActiveView, WorkStatus } from '../types';
import NotificationPanel from './NotificationPanel';

const NavLink: React.FC<{ href: string; icon: React.ReactNode; text: string; active?: boolean; onClick?: (e: React.MouseEvent) => void; }> = ({ href, icon, text, active, onClick }) => (
  <a 
    href={href}
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 active:scale-95 ${
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
  isPro?: boolean;
  onLogout?: () => void;
  streak?: number;
  notifications: Notification[];
  onDismissNotification: (id: number | string) => void;
  onClearNotifications: () => void;
  onMarkNotificationsRead: () => void;
}

// Demo limit: 60 seconds for lunch break before auto-logout.
// In a real app, this might be 45 * 60 (2700 seconds).
const LUNCH_TIME_LIMIT = 60; 

const Header: React.FC<HeaderProps> = ({ 
    onNavigate, 
    activeView, 
    isPro = false, 
    onLogout, 
    streak = 0,
    notifications,
    onDismissNotification,
    onClearNotifications,
    onMarkNotificationsRead
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // --- Work Timer Logic ---
  const [workStatus, setWorkStatus] = useState<WorkStatus>('idle');
  const [timers, setTimers] = useState({ working: 0, lunch: 0, break: 0 });
  
  // --- Current Clock Logic ---
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Weather Logic ---
  const [weather, setWeather] = useState<{ temp: number; city: string; code: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (workStatus !== 'idle') {
      interval = setInterval(() => {
        setTimers(prev => ({
          ...prev,
          [workStatus]: prev[workStatus] + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workStatus]);

  // Monitor Lunch Break Limit
  useEffect(() => {
    if (workStatus === 'lunch' && timers.lunch >= LUNCH_TIME_LIMIT) {
        // Use timeout to let the render cycle finish
        const timeoutId = setTimeout(() => {
            alert(`Lunch break limit (${LUNCH_TIME_LIMIT}s) exceeded. For security, you are being logged out.`);
            if (onLogout) {
                onLogout();
            } else {
                // Fallback reset if onLogout isn't provided (unlikely)
                setWorkStatus('idle');
                setTimers({ working: 0, lunch: 0, break: 0 });
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }
  }, [timers.lunch, workStatus, onLogout]);

  // Fetch Weather & Location
  useEffect(() => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                
                // Parallel fetch for weather and location name
                const [weatherRes, locRes] = await Promise.all([
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`),
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                ]);

                if (weatherRes.ok) {
                    const weatherData = await weatherRes.json();
                    let city = "Local";

                    if (locRes.ok) {
                        const locData = await locRes.json();
                        // Try to find the most relevant city name
                        city = locData.address?.city || locData.address?.town || locData.address?.village || locData.address?.suburb || locData.address?.state || "Local";
                    }

                    setWeather({
                        temp: Math.round(weatherData.current.temperature_2m),
                        city: city,
                        code: weatherData.current.weather_code
                    });
                }
            } catch (error) {
                console.error("Error fetching weather/location:", error);
            }
        }, (err) => {
            console.warn("Geolocation permission denied or error:", err);
        });
    }
  }, []);

  const getWeatherIcon = (code: number) => {
      if (code === 0) return "☀️"; // Clear sky
      if (code >= 1 && code <= 3) return "⛅"; // Partly cloudy
      if (code >= 45 && code <= 48) return "🌫️"; // Fog
      if (code >= 51 && code <= 67) return "🌧️"; // Drizzle/Rain
      if (code >= 71 && code <= 77) return "❄️"; // Snow
      if (code >= 80 && code <= 82) return "🌦️"; // Showers
      if (code >= 95) return "⛈️"; // Thunderstorm
      return "☁️"; // Default
  };

  const formatSeconds = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    // Updated format to include units
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  // ---

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
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

  const hasUnread = notifications.some(n => !n.read);

  const handleNotificationClick = () => {
    setIsPanelOpen(prev => !prev);
    if (hasUnread) {
      onMarkNotificationsRead();
    }
  };

  const handleEndSession = () => {
      if(window.confirm("Are you sure you want to log out and end your work session?")) {
          if (onLogout) {
              onLogout();
          } else {
            setWorkStatus('idle');
            setTimers({ working: 0, lunch: 0, break: 0 });
          }
      }
  };

  const getActiveLinkText = () => {
    if (activeView === 'home') return 'Home';
    if (activeView === 'tasks') return 'Tasks';
    if (activeView === 'certificates') return 'Certificates';
    if (activeView === 'interview') return 'Interview';
    if (activeView === 'ats') return 'Resume Checker';
    if (activeView === 'mentors') return 'Mentors';
    return '';
  };

  // Timer Control Component
  const TimerControls = () => {
      if (workStatus === 'idle') {
          return (
              <button 
                onClick={() => setWorkStatus('working')}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-green-500/20"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Start Work
              </button>
          );
      }

      return (
          <div className="flex items-center gap-2 bg-slate-800/80 rounded-full p-1 border border-slate-700">
              {/* Status Indicator */}
              <div className={`px-3 py-1 rounded-full flex items-center gap-2 min-w-[120px] justify-center transition-colors ${
                  workStatus === 'working' ? 'bg-green-500/20 text-green-400' :
                  workStatus === 'lunch' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                      workStatus === 'working' ? 'bg-green-500' :
                      workStatus === 'lunch' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></span>
                  <span className="font-mono text-xs font-bold whitespace-nowrap">
                      {formatSeconds(timers[workStatus])}
                  </span>
              </div>

              {/* Actions */}
              {workStatus === 'working' ? (
                  <>
                    <button onClick={() => setWorkStatus('lunch')} title="Lunch Break" className="p-1.5 hover:bg-orange-500/20 text-muted-gray hover:text-orange-400 rounded-full transition-colors active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                    </button>
                    <button onClick={() => setWorkStatus('break')} title="Office Break" className="p-1.5 hover:bg-blue-500/20 text-muted-gray hover:text-blue-400 rounded-full transition-colors active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"></path><path d="M5 20v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"></path><path d="M12 13V8"></path><path d="M12 3v2"></path><path d="M8.5 5.5l1 1"></path><path d="M15.5 5.5l-1 1"></path></svg>
                    </button>
                    <button onClick={handleEndSession} title="Log Out" className="p-1.5 hover:bg-red-500/20 text-muted-gray hover:text-red-400 rounded-full transition-colors active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                    </button>
                  </>
              ) : (
                  <button onClick={() => setWorkStatus('working')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-full transition-colors active:scale-95">
                      Resume Work
                  </button>
              )}
          </div>
      );
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
            
            {/* Time Tracker & Clock & Weather */}
            <div className="hidden lg:flex items-center gap-4">
                
                {/* Weather Widget */}
                {weather && (
                    <div className="text-right hidden xl:block mr-2 border-r border-slate-700 pr-4">
                        <p className="text-[10px] text-muted-gray uppercase tracking-widest font-bold flex items-center justify-end gap-1">
                            {weather.city}
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric-blue"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </p>
                        <p className="text-xs font-mono text-white font-bold tracking-widest flex items-center justify-end gap-1.5">
                            <span className="text-sm">{getWeatherIcon(weather.code)}</span>
                            {weather.temp}°C
                        </p>
                    </div>
                )}

                <div className="text-right hidden xl:block mr-2">
                    <p className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">Current Time</p>
                    <p className="text-xs font-mono text-white font-bold tracking-widest">
                        {currentTime.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
                <TimerControls />
            </div>

            {/* Daily Streak */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700" title="Daily Streak">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-bold text-orange-400">{streak}</span>
            </div>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationClick}
                className="relative text-muted-gray hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50 active:scale-95"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {hasUnread && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-dark-slate" />}
              </button>
              {isPanelOpen && (
                <NotificationPanel 
                  notifications={notifications} 
                  onClose={() => setIsPanelOpen(false)} 
                  onDismiss={onDismissNotification}
                  onClearAll={onClearNotifications}
                />
              )}
            </div>

            <div className="relative" ref={profileMenuRef}>
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="relative active:scale-95 flex items-center" aria-label="User Profile">
                <div className="relative">
                    <img 
                        className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-dark-slate ${activeView === 'profile' ? 'ring-aqua-green' : 'ring-electric-blue'}`}
                        src="https://api.dicebear.com/8.x/bottts/svg?seed=skilllink-user" 
                        alt="User avatar" 
                    />
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-dark-slate" />
                </div>
                {isPro && (
                    <span className="ml-[-8px] mt-[20px] z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-dark-slate shadow-sm">
                        PRO
                    </span>
                )}
                </button>

                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50 animate-fade-in">
                        <button 
                            onClick={() => { onNavigate('profile'); setIsProfileMenuOpen(false); }}
                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700"
                        >
                            My Profile
                        </button>
                        <button 
                            onClick={() => { if(onLogout) { onLogout(); setIsProfileMenuOpen(false); } }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            Log Out
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
