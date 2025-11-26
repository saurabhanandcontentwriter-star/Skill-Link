
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Onboarding from './components/Onboarding';
import ProfileSetup from './components/ProfileSetup';
import HomeDashboard from './components/HomeDashboard';
import MentorProfile from './components/MentorProfile';
import LiveSession from './components/LiveSession';
import Profile from './components/Profile';
import Chatbot from './components/Chatbot';
import TasksDashboard from './components/TasksDashboard';
import CertificateGenerator from './components/CertificateGenerator';
import AiInterview from './components/AiInterview';
import AtsResumeChecker from './components/AtsResumeChecker';
import { Mentor, Workshop, UserAchievement, Badge } from './types';
import { USER_ACHIEVEMENTS } from './constants';

export type ActiveView = 'home' | 'mentor' | 'workshop' | 'profile' | 'tasks' | 'certificates' | 'interview' | 'ats';

const App: React.FC = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>(USER_ACHIEVEMENTS);
  const [isPro, setIsPro] = useState(false);

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


  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!isProfileComplete) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'mentor':
        return selectedMentor && <MentorProfile mentor={selectedMentor} onBack={handleDeselectMentor} />;
      case 'workshop':
        return selectedWorkshop && <LiveSession workshop={selectedWorkshop} onBack={handleDeselectWorkshop} />;
      case 'profile':
        return <Profile onBack={() => handleNavigate('home')} achievements={achievements} onUpgrade={handleUpgrade} />;
      case 'tasks':
        return <TasksDashboard 
                  onBack={() => handleNavigate('home')} 
                  achievements={achievements} 
                  onAwardBadge={handleAwardBadge}
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
    </div>
  );
};

export default App;
