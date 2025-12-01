
import React, { useState } from 'react';
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
import { Mentor, Workshop, UserAchievement, Badge, Task, ActiveView } from './types';
import { USER_ACHIEVEMENTS, TASKS, BADGES, ACHIEVEMENT_CRITERIA } from './constants';

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

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  const handleProfileComplete = () => {
    setIsProfileComplete(true);
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
      <Header onNavigate={handleNavigate} activeView={activeView} isPro={isPro} />
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
