
import React, { useState, useMemo } from 'react';
import UpgradeModal from './UpgradeModal';
import { UserAchievement } from '../types';
import { BADGES } from '../constants';


// Mock data for the profile
const user = {
  name: 'SkillLink User',
  state: 'California',
  classOrProfession: 'AI Engineer',
  skills: ['AI', 'ML', 'Web3', 'Solidity', 'React'],
  avatarUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=skilllink-user',
  learningProgress: 75,
};

const payments = [
  { id: 1, mentor: 'Alina Petrova', date: '2024-10-15', amount: 'INR 2,500.00', status: 'Completed' },
  { id: 2, mentor: 'Ben Carter', date: '2024-09-28', amount: 'INR 3,000.00', status: 'Completed' },
];

const challenges = [
  { id: 1, title: 'Build a DeFi Dashboard', status: 'Completed', reward: '🏆' },
  { id: 2, title: 'AI Chatbot Challenge', status: 'In Progress', reward: '...'},
  { id: 3, title: 'NFT Marketplace Frontend', status: 'Completed', reward: '🏆' },
];

const referrals = [
    { id: 1, name: 'Alex Johnson', date: '2024-10-20', status: 'Completed', bonus: 'INR 500' },
    { id: 2, name: 'Brenda Smith', date: '2024-10-22', status: 'Pending', bonus: 'INR 500' },
];


interface ProfileProps {
  onBack: () => void;
  achievements: UserAchievement[];
  onUpgrade?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack, achievements, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState('payments');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [mentorFilter, setMentorFilter] = useState('all');

  const earnedBadges = achievements.map(ach => {
      const badgeDetails = BADGES.find(b => b.id === ach.badgeId);
      // Ensure badgeDetails is not undefined before spreading
      return badgeDetails ? { ...badgeDetails, dateEarned: ach.dateEarned } : null;
  }).filter((b): b is NonNullable<typeof b> => b !== null); // Filter out nulls and type guard

  const uniqueMentors = useMemo(() => {
    const mentorNames = payments.map(p => p.mentor);
    return ['All Mentors', ...new Set(mentorNames)];
  }, []);

  const filteredPayments = useMemo(() => {
    return payments
      .filter(payment => {
        if (mentorFilter === 'all' || mentorFilter === 'All Mentors') {
          return true;
        }
        return payment.mentor === mentorFilter;
      })
      .filter(payment => {
        if (dateFilter === 'all') {
          return true;
        }
        const paymentDate = new Date(payment.date);
        const today = new Date();
        const daysToSubtract = dateFilter === '30days' ? 30 : 180;
        const pastDate = new Date(new Date().setDate(today.getDate() - daysToSubtract));
        return paymentDate >= pastDate;
      });
  }, [dateFilter, mentorFilter]);

  const recentActivities = [
    {
      id: 1,
      type: 'badge',
      description: 'Earned the "Task Novice" badge.',
      timestamp: '1 day ago',
      icon: (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-300">
          <span className="text-lg">🌱</span>
        </div>
      ),
    },
    {
      id: 2,
      type: 'task',
      description: 'Completed: "Watch Intro to Generative AI workshop recording"',
      timestamp: '2 days ago',
      icon: (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
    },
    {
      id: 3,
      type: 'challenge',
      description: 'Joined the "AI Chatbot Challenge"',
      timestamp: '3 days ago',
      icon: (
         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-electric-blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
        </div>
      ),
    },
    {
      id: 4,
      type: 'payment',
      description: 'Booked a session with Alina Petrova',
      timestamp: '5 days ago',
      icon: (
         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-neon-purple">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
        </div>
      ),
    },
  ];


  return (
    <div className="animate-slide-in-fade max-w-4xl mx-auto">
       <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl shadow-electric-blue/10 overflow-hidden">
        <div className="p-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-slate-700 ring-4 ring-electric-blue/50" />
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">{user.name}</h1>
                    <p className="text-muted-gray mt-1">{user.classOrProfession} from {user.state}</p>
                    <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                        {user.skills.map(skill => (
                             <span key={skill} className="px-2 py-1 text-xs font-medium bg-slate-700 text-muted-gray rounded-full">
                                {skill}
                             </span>
                        ))}
                    </div>
                </div>
                <div className="flex-grow flex justify-center sm:justify-end items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                    <button onClick={() => alert('Profile editing will be available soon!')} className="px-4 py-2 border border-electric-blue text-sm font-medium rounded-lg text-electric-blue hover:bg-electric-blue hover:text-white transition-all active:scale-95">
                        Edit Profile
                    </button>
                     <button onClick={() => setIsUpgradeModalOpen(true)} className="px-6 py-2 bg-gradient-to-r from-aqua-green to-neon-purple text-sm font-bold text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all">
                        Go Pro
                    </button>
                </div>
            </div>

             {/* Progress Bar */}
            <div className="mt-8">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-white">Learning Progress</span>
                    <span className="text-sm font-medium text-aqua-green">{user.learningProgress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-electric-blue to-aqua-green h-2.5 rounded-full" style={{ width: `${user.learningProgress}%` }}></div>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white">My Achievements</h2>
              {earnedBadges.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {earnedBadges.map(badge => (
                          <div key={badge.id} className="group relative flex flex-col items-center text-center p-4 bg-slate-800/40 border border-slate-700 rounded-lg" title={badge.name}>
                              <span className="text-5xl mb-2 transition-transform duration-300 group-hover:scale-110">{badge.icon}</span>
                              <p className="text-sm font-semibold text-white truncate w-full">{badge.name}</p>
                              {/* Tooltip for description */}
                              <div className="absolute bottom-full z-10 mb-2 w-max max-w-xs p-3 text-xs text-white bg-slate-900 border border-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <p className="font-bold">{badge.name}</p>
                                  <p>{badge.description}</p>
                                  <p className="text-muted-gray/70 mt-1">Earned: {new Date(badge.dateEarned).toLocaleDateString()}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="mt-4 text-center py-6 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
                      <p className="text-muted-gray">Start completing tasks to earn badges!</p>
                  </div>
              )}
            </div>
            
            {/* Recent Activity Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <div className="mt-4 space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="bg-slate-800/40 backdrop-blur-sm p-3 rounded-lg flex justify-between items-center border border-slate-700">
                    <div className="flex items-center gap-3">
                        {activity.icon}
                        <p className="text-sm text-white">{activity.description}</p>
                    </div>
                    <p className="text-sm text-muted-gray flex-shrink-0 ml-4">{activity.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>


            {/* Tabs */}
            <div className="mt-8 border-b border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all active:scale-95 ${
                            activeTab === 'payments'
                            ? 'border-aqua-green text-aqua-green'
                            : 'border-transparent text-muted-gray hover:text-white hover:border-slate-500'
                        }`}
                    >
                        My Payments
                    </button>
                     <button
                        onClick={() => setActiveTab('challenges')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all active:scale-95 ${
                            activeTab === 'challenges'
                            ? 'border-aqua-green text-aqua-green'
                            : 'border-transparent text-muted-gray hover:text-white hover:border-slate-500'
                        }`}
                    >
                        My Challenges
                    </button>
                     <button
                        onClick={() => setActiveTab('referrals')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all active:scale-95 ${
                            activeTab === 'referrals'
                            ? 'border-aqua-green text-aqua-green'
                            : 'border-transparent text-muted-gray hover:text-white hover:border-slate-500'
                        }`}
                    >
                        Referrals
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'payments' && (
                    <div className="animate-slide-in-fade">
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                          <div className="flex-1">
                            <label htmlFor="mentorFilter" className="block text-sm font-medium text-muted-gray mb-1">Filter by Mentor</label>
                            <select
                              id="mentorFilter"
                              value={mentorFilter}
                              onChange={(e) => setMentorFilter(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                            >
                              {uniqueMentors.map(mentor => (
                                <option key={mentor} value={mentor}>{mentor}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label htmlFor="dateFilter" className="block text-sm font-medium text-muted-gray mb-1">Filter by Date</label>
                            <select
                              id="dateFilter"
                              value={dateFilter}
                              onChange={(e) => setDateFilter(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                            >
                              <option value="all">All Time</option>
                              <option value="30days">Last 30 Days</option>
                              <option value="6months">Last 6 Months</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map(payment => (
                                    <div key={payment.id} className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg flex justify-between items-center border border-slate-700">
                                        <div>
                                            <p className="font-semibold text-white">Session with {payment.mentor}</p>
                                            <p className="text-sm text-muted-gray">{payment.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">{payment.amount}</p>
                                            <p className="text-sm text-green-400">{payment.status}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-gray py-8">No payments match your selected filters.</p>
                            )}
                        </div>
                    </div>
                )}
                 {activeTab === 'challenges' && (
                    <div className="space-y-4 animate-slide-in-fade">
                        {challenges.length > 0 ? (
                             challenges.map(challenge => (
                                <div key={challenge.id} className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg flex justify-between items-center border border-slate-700">
                                    <div>
                                        <p className="font-semibold text-white">{challenge.title}</p>
                                        <p className={`text-sm ${challenge.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>{challenge.status}</p>
                                    </div>
                                    <p className="text-2xl">{challenge.reward}</p>
                                </div>
                            ))
                        ) : (
                             <p className="text-center text-muted-gray py-8">You haven't joined any challenges yet.</p>
                        )}
                    </div>
                )}
                {activeTab === 'referrals' && (
                    <div className="space-y-6 animate-slide-in-fade">
                        <div>
                            <h3 className="text-xl font-bold text-white">Refer & Earn</h3>
                            <p className="text-muted-gray mt-1">Share your code and get <span className="text-aqua-green font-semibold">INR 500 in credits</span> for every friend who books their first mentor session.</p>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-lg flex items-center justify-between">
                            <p className="text-lg font-mono text-white tracking-widest">SKILL-LINK-A1B2</p>
                            <button onClick={() => navigator.clipboard.writeText('SKILL-LINK-A1B2')} className="px-3 py-1.5 border border-electric-blue text-xs font-medium rounded-lg text-electric-blue hover:bg-electric-blue hover:text-white transition-all active:scale-95">
                                Copy Code
                            </button>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Your Referrals</h3>
                            <div className="mt-2 space-y-3">
                                {referrals.map(ref => (
                                    <div key={ref.id} className="bg-slate-800/40 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                                        <div>
                                            <p className="font-semibold text-white">{ref.name}</p>
                                            <p className="text-sm text-muted-gray">Joined: {ref.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${ref.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>{ref.status}</p>
                                            <p className="text-sm text-muted-gray">{ref.bonus} Credit</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={onUpgrade} />}
    </div>
  );
};

export default Profile;
