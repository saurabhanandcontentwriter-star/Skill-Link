
import React, { useState, useEffect } from 'react';
import { MENTORS, WORKSHOPS, COURSES, PRO_FEATURES, TASKS } from '../constants';
import MentorCard from './MentorCard';
import Hero from './Hero';
import { Mentor, Workshop, Course, ProFeature, RecommendedCourse } from '../types';
import CourseModal from './CourseModal';
import ProFeatureModal from './ProFeatureModal';
import UpgradeModal from './UpgradeModal';
import ChallengeModal from './ChallengeModal';
import { getCourseRecommendations } from '../services/geminiService';
import AiRecommendations from './AiRecommendations';

interface HomeDashboardProps {
  onSelectMentor: (mentor: Mentor) => void;
  onSelectWorkshop: (workshop: Workshop) => void;
}

// Mock data to simulate a logged-in user. In a real app, this would come from context or a hook.
const mockUser = {
  skills: ['AI', 'ML', 'Web3', 'Solidity', 'React'],
};


const HomeDashboard: React.FC<HomeDashboardProps> = ({ onSelectMentor, onSelectWorkshop }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedProFeature, setSelectedProFeature] = useState<ProFeature | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoadingRecs(true);
      setRecsError(null);
      try {
        const completedTasks = TASKS.filter(task => task.completed);
        const userInterests = mockUser.skills;
        const recs = await getCourseRecommendations(userInterests, completedTasks);
        setRecommendations(recs);
      } catch (err) {
        setRecsError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, []);


  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseCourseModal = () => {
    setSelectedCourse(null);
  };
  
  const handleSelectProFeature = (feature: ProFeature) => {
    setSelectedProFeature(feature);
  };

  const handleCloseProFeatureModal = () => {
    setSelectedProFeature(null);
  };


  const getTopicColors = (topic: string) => {
    switch (topic.toLowerCase()) {
      case 'ai':
        return 'bg-indigo-500/20 text-indigo-300';
      case 'web3':
        return 'bg-purple-500/20 text-purple-300';
      case 'frontend':
        return 'bg-sky-500/20 text-sky-300';
      default:
        return 'bg-slate-700 text-muted-gray';
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 animate-slide-in-fade">
      <Hero />
      
      {/* Top Mentors Section */}
      <section>
        <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 mr-3 text-yellow-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              Top Mentors for You
            </h2>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Viewing all mentors will be available soon!'); }} className="text-sm font-medium text-electric-blue hover:underline">View All</a>
        </div>
        <div className="relative">
          <div className="flex space-x-8 pb-4 -mx-4 px-4 overflow-x-auto">
            {MENTORS.map((mentor) => (
              <div key={mentor.name} className="flex-shrink-0 w-[260px]">
                <MentorCard mentor={mentor} onSelect={onSelectMentor} />
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-dark-slate pointer-events-none"></div>
        </div>
      </section>

      {/* Main Grid: Workshops & AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
            {/* Upcoming Workshops Section */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 mr-3 text-blue-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                  Upcoming Workshops
                </h2>
                <div className="space-y-2">
                {WORKSHOPS.map((workshop, index) => (
                    <button 
                        key={workshop.title} 
                        onClick={() => onSelectWorkshop(workshop)}
                        className={`w-full p-4 flex justify-between items-center text-left transition-all duration-200 rounded-lg hover:bg-slate-800/60 active:scale-[0.99] ${index < WORKSHOPS.length - 1 ? 'border-b border-slate-800' : ''}`}
                    >
                        <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTopicColors(workshop.topic)}`}>{workshop.topic}</span>
                                {workshop.isPremium && <span className="text-xs font-semibold bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full">PRO</span>}
                            </div>
                            <h3 className="text-lg font-semibold text-white">{workshop.title}</h3>
                            <p className="text-sm text-muted-gray">with {workshop.speaker}</p>
                        </div>
                        <div className="text-center ml-4 flex-shrink-0">
                            <p className="text-2xl font-bold text-white">{workshop.date.split(' ')[1].replace(',', '')}</p>
                            <p className="text-sm text-muted-gray">{workshop.date.split(' ')[0]}</p>
                        </div>
                    </button>
                ))}
                </div>
            </section>
        </div>

        <div className="lg:col-span-2 lg:border-l lg:border-slate-800 lg:pl-8">
            <AiRecommendations
              recommendations={recommendations}
              isLoading={isLoadingRecs}
              error={recsError}
            />
        </div>
      </div>
      
      {/* Upgrade to Pro Section */}
      <section className="bg-gradient-to-br from-slate-900 via-dark-slate to-slate-900 backdrop-blur-lg border border-neon-purple/50 p-8 rounded-xl text-center shadow-2xl shadow-neon-purple/20">
        <h2 className="text-3xl font-bold text-white">Unlock Your Full Potential with <span className="bg-gradient-to-r from-aqua-green to-neon-purple text-transparent bg-clip-text">SkillLink Pro</span></h2>
        <p className="text-white/80 mt-2 max-w-2xl mx-auto">Get exclusive access to premium features designed to accelerate your learning journey.</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {PRO_FEATURES.map((feature) => (
              <div 
                key={feature.title}
                onClick={() => handleSelectProFeature(feature)}
                className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 cursor-pointer transition-all duration-300 hover:bg-slate-800 hover:shadow-lg hover:shadow-aqua-green/20 hover:-translate-y-1 border border-transparent hover:border-aqua-green active:scale-95"
              >
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-aqua-green/20 text-aqua-green">
                    {feature.icon}
                </div>
                <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-muted-gray">{feature.description}</p>
                </div>
              </div>
            ))}
        </div>
        <button onClick={() => setIsUpgradeModalOpen(true)} className="mt-8 px-8 py-3 bg-gradient-to-r from-aqua-green to-neon-purple text-white font-bold rounded-lg shadow-lg transform hover:scale-105 active:scale-95 transition-all ring-1 ring-offset-2 ring-offset-dark-slate ring-aqua-green/70 hover:ring-aqua-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aqua-green">
            Upgrade Now
        </button>
      </section>

      {/* Join a Challenge Section */}
      <section className="bg-gradient-to-r from-electric-blue to-neon-purple p-8 rounded-xl text-center">
        <h2 className="text-3xl font-bold text-white">Ready to test your skills?</h2>
        <p className="text-white mt-2 max-w-xl mx-auto">Join our weekly coding and design challenges to win prizes and showcase your talent.</p>
        <button 
            onClick={() => setIsChallengeModalOpen(true)} 
            className="mt-6 px-8 py-3 bg-white text-dark-slate font-bold rounded-xl border-2 border-black ring-2 ring-white transition-all duration-300 transform hover:-translate-y-1 active:scale-95 hover:shadow-2xl hover:shadow-white/30"
        >
            Join a Challenge
        </button>
      </section>

      {selectedCourse && <CourseModal course={selectedCourse} onClose={handleCloseCourseModal} />}
      {selectedProFeature && <ProFeatureModal feature={selectedProFeature} onClose={handleCloseProFeatureModal} />}
      {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} />}
      {isChallengeModalOpen && <ChallengeModal onClose={() => setIsChallengeModalOpen(false)} />}
    </div>
  );
};

export default HomeDashboard;
