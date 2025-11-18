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
import { Mentor, Workshop } from './types';

const App: React.FC = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  const handleProfileComplete = () => {
    setIsProfileComplete(true);
  };

  const handleSelectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsProfileVisible(false);
  };
  
  const handleDeselectMentor = () => {
    setSelectedMentor(null);
  }

  const handleSelectWorkshop = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setIsProfileVisible(false);
  };

  const handleDeselectWorkshop = () => {
    setSelectedWorkshop(null);
  };

  const handleShowProfile = () => {
    setSelectedMentor(null);
    setSelectedWorkshop(null);
    setIsProfileVisible(true);
  };

  const handleHideProfile = () => {
    setIsProfileVisible(false);
  };


  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!isProfileComplete) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  const renderContent = () => {
    if (isProfileVisible) {
      return <Profile onBack={handleHideProfile} />;
    }
    if (selectedMentor) {
      return <MentorProfile mentor={selectedMentor} onBack={handleDeselectMentor} />;
    }
    if (selectedWorkshop) {
      return <LiveSession workshop={selectedWorkshop} onBack={handleDeselectWorkshop} />;
    }
    return <HomeDashboard onSelectMentor={handleSelectMentor} onSelectWorkshop={handleSelectWorkshop} />;
  };

  return (
    <div className="min-h-screen bg-dark-slate text-white">
      <Header onProfileClick={handleShowProfile} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default App;