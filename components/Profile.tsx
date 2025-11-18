
import React, { useState } from 'react';
import UpgradeModal from './UpgradeModal';

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
  { id: 1, mentor: 'Alina Petrova', date: '2024-10-15', amount: '₹2,500.00', status: 'Completed' },
  { id: 2, mentor: 'Ben Carter', date: '2024-09-28', amount: '₹3,000.00', status: 'Completed' },
];

const challenges = [
  { id: 1, title: 'Build a DeFi Dashboard', status: 'Completed', reward: '🏆' },
  { id: 2, title: 'AI Chatbot Challenge', status: 'In Progress', reward: '...'},
  { id: 3, title: 'NFT Marketplace Frontend', status: 'Completed', reward: '🏆' },
];

const referrals = [
    { id: 1, name: 'Alex Johnson', date: '2024-10-20', status: 'Completed', bonus: '₹500' },
    { id: 2, name: 'Brenda Smith', date: '2024-10-22', status: 'Pending', bonus: '₹500' },
];


interface ProfileProps {
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('payments');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  return (
    <div className="animate-slide-in-fade max-w-4xl mx-auto">
       <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <button onClick={() => alert('Profile editing will be available soon!')} className="px-4 py-2 border border-electric-blue text-sm font-medium rounded-lg text-electric-blue hover:bg-electric-blue hover:text-white transition-colors">
                        Edit Profile
                    </button>
                     <button onClick={() => setIsUpgradeModalOpen(true)} className="px-6 py-2 bg-gradient-to-r from-aqua-green to-neon-purple text-sm font-bold text-white rounded-lg shadow-lg hover:scale-105 transition-transform">
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

            {/* Tabs */}
            <div className="mt-8 border-b border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'payments'
                            ? 'border-aqua-green text-aqua-green'
                            : 'border-transparent text-muted-gray hover:text-white hover:border-slate-500'
                        }`}
                    >
                        My Payments
                    </button>
                     <button
                        onClick={() => setActiveTab('challenges')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'challenges'
                            ? 'border-aqua-green text-aqua-green'
                            : 'border-transparent text-muted-gray hover:text-white hover:border-slate-500'
                        }`}
                    >
                        My Challenges
                    </button>
                     <button
                        onClick={() => setActiveTab('referrals')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
                    <div className="space-y-4 animate-slide-in-fade">
                        {payments.length > 0 ? (
                            payments.map(payment => (
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
                            <p className="text-center text-muted-gray py-8">No payment history found.</p>
                        )}
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
                            <p className="text-muted-gray mt-1">Share your code and get <span className="text-aqua-green font-semibold">₹500 in credits</span> for every friend who books their first mentor session.</p>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-lg flex items-center justify-between">
                            <p className="text-lg font-mono text-white tracking-widest">SKILL-LINK-A1B2</p>
                            <button onClick={() => navigator.clipboard.writeText('SKILL-LINK-A1B2')} className="px-3 py-1.5 border border-electric-blue text-xs font-medium rounded-lg text-electric-blue hover:bg-electric-blue hover:text-white transition-colors">
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
      {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} />}
    </div>
  );
};

export default Profile;