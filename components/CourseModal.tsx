
import React, { useEffect } from 'react';
import type { Course } from '../types';

interface CourseModalProps {
  course: Course;
  onClose: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ course, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const getPlatformLink = (platform: string) => {
      switch(platform.toLowerCase()) {
          case 'coursera': return 'https://www.coursera.org/';
          case 'edx': return 'https://www.edx.org/';
          case 'udemy': return 'https://www.udemy.com/';
          default: return '#';
      }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-slide-in-fade"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-electric-blue/20 w-full max-w-lg p-6 sm:p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white">{course.title}</h2>
                <p className="text-aqua-green font-semibold mt-1">{course.platform}</p>
            </div>
            <button onClick={onClose} aria-label="Close modal" className="text-muted-gray hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="mt-6 border-t border-slate-700 pt-6">
            <h3 className="font-semibold text-white mb-2">Course Description</h3>
            <p className="text-muted-gray leading-relaxed">{course.description}</p>
        </div>
        
        <div className="mt-6">
             <h3 className="font-semibold text-white mb-2">Key Takeaways (AI Generated)</h3>
             <ul className="space-y-2 text-muted-gray list-disc list-inside">
                <li>Understand core principles and applications.</li>
                <li>Gain hands-on experience with practical projects.</li>
                <li>Prepare for industry-recognized certifications.</li>
                <li>Learn from top instructors and experts in the field.</li>
             </ul>
        </div>

        <div className="mt-8">
            <a
                href={getPlatformLink(course.platform)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center px-4 py-3 font-bold text-white bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-electric-blue/40 transition-all duration-300 transform hover:-translate-y-1"
            >
                Enroll Now on {course.platform}
            </a>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
