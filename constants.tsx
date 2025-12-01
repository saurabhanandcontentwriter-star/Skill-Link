
import React from 'react';
import { Mentor, Workshop, Course, ProFeature, Notification, NavLinkItem, Task, Badge, UserAchievement } from './types';

export const MENTORS: Mentor[] = [
  {
    name: 'Saurabh Anand',
    title: 'AI & Digital Marketing',
    skills: ['AI', 'Marketing', 'Automation', 'SEO'],
    avatarUrl: 'https://picsum.photos/seed/saurabh-laptop-desk/200',
    rating: 4.9,
    description: 'Expert in AI-powered marketing strategies, growth hacking, and community-led learning. Helps learners merge AI with marketing success.',
    sessionPrice: 3500,
  },
  {
    name: 'Neeraj Vani',
    title: 'AI & Web App Developer',
    skills: ['AI', 'Web Apps', 'React', 'Node.js'],
    avatarUrl: 'https://picsum.photos/seed/neeraj-architecture/200',
    rating: 4.8,
    description: 'Builds scalable web applications powered by AI. Expert in backend integrations, chatbots, and cloud architecture.',
    sessionPrice: 3200,
  },
    {
    name: 'Akash Tenguria',
    title: 'AI & LLM Expert',
    skills: ['LLMs', 'OpenAI APIs', 'AI Tools'],
    avatarUrl: 'https://picsum.photos/seed/akash-misty/200',
    rating: 4.7,
    description: 'Works on advanced AI systems and Large Language Models. Specializes in prompt engineering, model fine-tuning, and AI automation tools.',
    sessionPrice: 2800,
  },
  {
    name: 'Meet Vani',
    title: 'App Developer',
    skills: ['Android', 'iOS', 'Flutter', 'React Native'],
    avatarUrl: 'https://picsum.photos/seed/meet-cave/200',
    rating: 4.6,
    description: 'Specializes in mobile app development using Flutter and React Native. Helps learners build production-ready apps from scratch.',
    sessionPrice: 2600,
  },
];

export const TOPICS: string[] = [
  'Decentralized Finance (DeFi)',
  'Large Language Models (LLMs)',
  'Zero-Knowledge Proofs',
  'React Server Components',
  'Generative AI Applications',
  'Smart Contract Security',
  'Tokenomics and Governance',
  'AI Ethics and Alignment',
];

export const WORKSHOPS: Workshop[] = [
    { title: 'Intro to Generative AI', speaker: 'Alina Petrova', date: 'Oct 28, 2024', topic: 'AI' },
    { title: 'Advanced Solidity Patterns', speaker: 'Ben Carter', date: 'Nov 5, 2024', topic: 'Web3', isPremium: true },
    { title: 'Building with React Server Components', speaker: 'Chloe Davis', date: 'Nov 12, 2024', topic: 'Frontend', isPremium: true },
];

export const COURSES: Course[] = [
    { title: 'Machine Learning Specialization', platform: 'Coursera', description: 'Master fundamental AI concepts and practical machine learning skills.' },
    { title: 'Blockchain Basics', platform: 'edX', description: 'An introduction to the concepts of blockchain and its applications in Web3.' },
    { title: 'Full-Stack Web Development', platform: 'Udemy', description: 'Learn to build and deploy modern web applications from scratch.' },
];


export const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.2 4.2H4.2V35.8H14.2V27.8H22.2V12.2H14.2V4.2ZM14.2 12.2H18.2V20.8H14.2V12.2Z" fill="url(#grad1)"/>
        <text x="40" y="30" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="bold" fill="url(#grad1)">
            SkillLink
        </text>
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#0066FF'}} />
                <stop offset="100%" style={{stopColor: '#8B5CF6'}} />
            </linearGradient>
        </defs>
    </svg>
);

export const PRO_FEATURES: ProFeature[] = [
  {
    title: 'Verified Certificates',
    description: 'Generate & download official certificates.',
    longDescription: "Get access to our professional certificate generator. Create verifiable, signed certificates for your completed courses and workshops to showcase on LinkedIn and your resume.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
  },
  {
    title: 'Unlimited AI Interviews',
    description: 'Practice with AI avatars anytime.',
    longDescription: "Master your interview skills with unlimited access to our AI Interview Coach. Choose from various technical topics, get real-time feedback on your tone and answers, and improve with every session.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path><path d="M16 14c.83 0 1.5.67 1.5 1.5V19c0 .55-.45 1-1 1H7.5c-.55 0-1-.45-1-1v-3.5c0-.83.67-1.5 1.5-1.5H16z"></path></svg>
  },
  {
    title: 'Unlimited ATS Scans',
    description: 'Optimize your resume without limits.',
    longDescription: "Ensure your resume never gets rejected by a bot. Run unlimited ATS scans against any job description to identify missing keywords, formatting issues, and get actionable tips to boost your match score.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
  },
  {
    title: 'AI Course Recommender',
    description: 'Personalized course suggestions.',
    longDescription: "Get hyper-personalized course suggestions from Gemini, tailored to your skills, interests, and career goals. Our AI analyzes your profile and learning patterns to recommend the most relevant content.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'workshop',
    title: 'Workshop Reminder',
    description: 'Advanced Solidity Patterns with Ben Carter starts in 1 hour.',
    timestamp: '15m ago',
    read: false,
  },
  {
    id: 2,
    type: 'message',
    title: 'New Message from Saurabh',
    description: 'Hey! I saw your profile and think we could have a great session...',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 3,
    type: 'challenge',
    title: 'New Challenge Posted',
    description: 'Test your skills in the "AI Chatbot Challenge". Prizes await!',
    timestamp: '3h ago',
    read: true,
  },
  {
    id: 4,
    type: 'system',
    title: 'Profile Update',
    description: 'You have earned a "React Pro" badge!',
    timestamp: '1d ago',
    read: true,
  },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export const TASKS: Task[] = [
  { id: 1, text: 'Complete Chapter 3 of the Solidity course', completed: false, dueDate: tomorrow.toISOString().split('T')[0] },
  { id: 2, text: 'Watch "Intro to Generative AI" workshop recording', completed: true, dueDate: yesterday.toISOString().split('T')[0] },
  { id: 3, text: 'Prepare questions for my session with Saurabh Anand', completed: false, dueDate: today.toISOString().split('T')[0] },
  { id: 4, text: 'Research ZK-Proofs for a side project', completed: false, dueDate: null },
  { id: 5, text: 'Review PR on the main project repo', completed: false, dueDate: yesterday.toISOString().split('T')[0] }
];

export const NAV_LINKS: NavLinkItem[] = [
  {
    text: 'Home',
    href: '#',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    view: 'home',
  },
  {
    text: 'Tasks',
    href: '#',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    view: 'tasks',
  },
  {
    text: 'Certificates',
    href: '#',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    view: 'certificates',
  },
  {
    text: 'Interview',
    href: '#',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path><path d="M16 14c.83 0 1.5.67 1.5 1.5V19c0 .55-.45 1-1 1H7.5c-.55 0-1-.45-1-1v-3.5c0-.83.67-1.5 1.5-1.5H16z"></path><path d="M20 21v-2a4 4 0 0 0-3-3.87"></path><path d="M4 21v-2a4 4 0 0 1 3-3.87"></path></svg>,
    view: 'interview',
  },
  {
    text: 'Resume Checker',
    href: '#',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
    view: 'ats',
  },
  {
    text: 'Mentors',
    href: '#',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    view: 'mentors',
  },
];

// Gamification Content
export const BADGES: Badge[] = [
  { id: 'task_novice', name: 'Task Novice', description: 'Complete your first task.', icon: '🌱' },
  { id: 'task_master', name: 'Task Master', description: 'Complete 5 tasks.', icon: '🚀' },
  { id: 'dedicated_learner', name: 'Dedicated Learner', description: 'Complete 10 tasks.', icon: '🔥' },
  { id: 'react_pro', name: 'React Pro', description: 'Master core React concepts.', icon: '⚛️' },
];

export const ACHIEVEMENT_CRITERIA: Record<string, (completedCount: number, totalCount: number) => boolean> = {
  'task_novice': (c) => c >= 1,
  'task_master': (c) => c >= 5,
  'dedicated_learner': (c) => c >= 10,
  'react_pro': () => false, // Manual award for now
};

export const USER_ACHIEVEMENTS: UserAchievement[] = [];
