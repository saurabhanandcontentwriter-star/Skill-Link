
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Onboarding from './components/Onboarding';
import ProfileSetup from './components/ProfileSetup';
import HomeDashboard from './components/HomeDashboard';
import MentorProfile from './components/MentorProfile';
import FeaturedMentors from './components/FeaturedMentors';
import LiveSession from './components/LiveSession';
import Profile from './components/Profile';
import Chatbot from './components/Chatbot';
import TasksDashboard from './components/TasksDashboard';
import CertificateGenerator from './components/CertificateGenerator';
import AiInterview from './components/AiInterview';
import AtsResumeChecker from './components/AtsResumeChecker';
import AchievementToast from './components/AchievementToast';
import { Mentor, Workshop, UserAchievement, Badge, Task, ActiveView, Notification } from './types';
import { USER_ACHIEVEMENTS, TASKS, BADGES, ACHIEVEMENT_CRITERIA, NOTIFICATIONS } from './constants';

const App: React.FC = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>(USER_ACHIEVEMENTS);
  const [isPro, setIsPro] = useState(false);

  // Lifted Tasks State
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);

  // Lifted Notification State
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);

  // Daily Streak Logic
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const lastActiveDate = localStorage.getItem('lastActiveDate');
    const streakCount = parseInt(localStorage.getItem('dailyStreak') || '0', 10);
    const today = new Date().toDateString();

    if (lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActiveDate === yesterday.toDateString()) {
            const newStreak = streakCount + 1;
            setStreak(newStreak);
            localStorage.setItem('dailyStreak', newStreak.toString());
        } else {
             // Streak broken or first time
             setStreak(1);
             localStorage.setItem('dailyStreak', '1');
        }
        localStorage.setItem('lastActiveDate', today);
    } else {
        setStreak(streakCount);
    }
  }, []);

  // Check for due tasks and generate notifications
  useEffect(() => {
    const dueTasks = tasks.filter(task => !task.completed && task.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    setNotifications(prevNotifications => {
        const newNotifications: Notification[] = [];
        const existingIds = new Set(prevNotifications.map(n => n.id));

        dueTasks.forEach(task => {
            if (!task.dueDate) return;
            const dueDate = new Date(task.dueDate);
            // Adjust for timezone to compare dates correctly
            dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
            dueDate.setHours(0,0,0,0);

            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let title = '';
            let description = '';

            if (diffDays < 0) {
                title = 'Overdue Task';
                description = `"${task.text}" was due on ${task.dueDate}.`;
            } else if (diffDays === 0) {
                title = 'Task Due Today';
                description = `"${task.text}" is due today.`;
            }

            if (title) {
                const notificationId = `task-${task.id}`;
                if (!existingIds.has(notificationId)) {
                    newNotifications.push({
                        id: notificationId,
                        type: 'task',
                        title,
                        description,
                        timestamp: 'Just now',
                        read: false
                    });
                }
            }
        });

        if (newNotifications.length > 0) {
            return [...newNotifications, ...prevNotifications];
        }
        return prevNotifications;
    });
  }, [tasks]);

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  const handleProfileComplete = () => {
    setIsProfileComplete(true);
  };

  const handleLogout = () => {
    // Reset core states to simulate logging out
    setIsOnboarded(false);
    setIsProfileComplete(false);
    setActiveView('home');
    setIsPro(false);
  };

  const handleSelectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setActiveView('mentor');
  };
  
  const handleDeselectMentor = () => {
    setSelectedMentor(null);
    setActiveView('home');
  }

  const handleSelectWorkshop = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setActiveView('workshop');
  };

  const handleDeselectWorkshop = () => {
    setSelectedWorkshop(null);
    setActiveView('home');
  };

  const handleNavigate = (view: ActiveView) => {
    // Reset selections when navigating away from mentor/workshop views
    if (view !== 'mentor') setSelectedMentor(null);
    if (view !== 'workshop') setSelectedWorkshop(null);
    setActiveView(view);
  };

  const handleAwardBadge = (badge: Badge): boolean => {
    // Prevent duplicate badges
    if (!achievements.some(a => a.badgeId === badge.id)) {
        const newAchievement: UserAchievement = {
            badgeId: badge.id,
            dateEarned: new Date().toISOString(),
        };
        setAchievements(prev => [...prev, newAchievement]);
        return true; // Indicate that the badge was awarded
    }
    return false; // Indicate that the badge was already present
  };

  const handleUpgrade = () => {
      setIsPro(true);
  };

  // Task Handlers
  const handleAddTask = (text: string, dueDate: string | null = null) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      completed: false,
      dueDate,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const handleDeleteTask = (id: number) => {
    // For simplicity with the existing Dashboard component structure, 
    // we will pass this handler to the Dashboard which manages the confirmation modal.
    setTasks(prev => prev.filter(t => t.id !== id));
    
    // Also remove associated notification if it exists
    setNotifications(prev => prev.filter(n => n.id !== `task-${id}`));
  };

  const handleToggleTask = (id: number) => {
    // We need to calculate the new state to check for badges immediately
    const currentTasks = tasks;
    const taskToToggle = currentTasks.find(t => t.id === id);
    
    if (!taskToToggle) return;

    const newCompletedStatus = !taskToToggle.completed;
    const newTasks = currentTasks.map(task =>
      task.id === id ? { ...task, completed: newCompletedStatus } : task
    );

    setTasks(newTasks);

    // If completed, remove task notification
    if (newCompletedStatus) {
        setNotifications(prev => prev.filter(n => n.id !== `task-${id}`));
    }

    // Badge Logic
    if (newCompletedStatus) {
      const completedCount = newTasks.filter(t => t.completed).length;
      const totalTasks = newTasks.length;
      
      BADGES.forEach(badge => {
        const criteriaFn = ACHIEVEMENT_CRITERIA[badge.id];
        if (criteriaFn && criteriaFn(completedCount, totalTasks)) {
          const wasAwarded = handleAwardBadge(badge);
          if (wasAwarded) {
            setUnlockedBadge(badge);
            setTimeout(() => setUnlockedBadge(null), 5000);
          }
        }
      });
    }
  };

  // Notification Handlers
  const handleDismissNotification = (id: number | string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearNotifications = () => {
      setNotifications([]);
  };

  const handleMarkNotificationsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };


  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!isProfileComplete) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'mentor':
        return selectedMentor && <MentorProfile mentor={selectedMentor} onBack={handleDeselectMentor} onAddTask={handleAddTask} />;
      case 'mentors':
        return <FeaturedMentors onSelectMentor={handleSelectMentor} />;
      case 'workshop':
        return selectedWorkshop && <LiveSession workshop={selectedWorkshop} onBack={handleDeselectWorkshop} />;
      case 'profile':
        return <Profile onBack={() => handleNavigate('home')} achievements={achievements} onUpgrade={handleUpgrade} />;
      case 'tasks':
        return <TasksDashboard 
                  onBack={() => handleNavigate('home')} 
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />;
      case 'certificates':
        return <CertificateGenerator onBack={() => handleNavigate('home')} isPro={isPro} onUpgrade={handleUpgrade} />;
      case 'interview':
        return <AiInterview onBack={() => handleNavigate('home')} />;
      case 'ats':
        return <AtsResumeChecker onBack={() => handleNavigate('home')} />;
      case 'home':
      default:
        return <HomeDashboard onSelectMentor={handleSelectMentor} onSelectWorkshop={handleSelectWorkshop} onUpgrade={handleUpgrade} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-slate text-white">
      <Header 
        onNavigate={handleNavigate} 
        activeView={activeView} 
        isPro={isPro} 
        onLogout={handleLogout} 
        streak={streak}
        notifications={notifications}
        onDismissNotification={handleDismissNotification}
        onClearNotifications={handleClearNotifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <Footer />
      <Chatbot />
      {unlockedBadge && <AchievementToast badge={unlockedBadge} onClose={() => setUnlockedBadge(null)} />}
    </div>
  );
};

export default App;
