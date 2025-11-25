import React from 'react';
import { RecommendedCourse } from '../types';

interface AiRecommendationsProps {
  recommendations: RecommendedCourse[];
  isLoading: boolean;
  error: string | null;
}

const RecommendationSkeleton: React.FC = () => (
  <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 animate-pulse">
    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-slate-700 rounded w-1/4 mb-4"></div>
    <div className="h-3 bg-slate-700 rounded w-full mb-1"></div>
    <div className="h-3 bg-slate-700 rounded w-5/6"></div>
    <div className="h-4 bg-slate-700 rounded w-1/2 mt-4"></div>
  </div>
);

const AiRecommendations: React.FC<AiRecommendationsProps> = ({ recommendations, isLoading, error }) => {
  const handleCourseClick = (platform: string) => {
    let url = '#';
    switch (platform.toLowerCase()) {
      case 'coursera': url = 'https://www.coursera.org/'; break;
      case 'edx': url = 'https://www.edx.org/'; break;
      case 'udemy': url = 'https://www.udemy.com/'; break;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <RecommendationSkeleton />
          <RecommendationSkeleton />
          <RecommendationSkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-4 text-center">
          <p className="font-semibold">Could not load recommendations</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (recommendations.length === 0) {
      return (
        <div className="text-center py-8 text-muted-gray">
          <p>No recommendations available at the moment.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recommendations.map((course, index) => (
          <button
            key={index}
            onClick={() => handleCourseClick(course.platform)}
            className="w-full text-left block bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-aqua-green transition-colors hover:bg-slate-800/50"
          >
            <h3 className="font-semibold text-white">{course.title}</h3>
            <p className="text-xs text-aqua-green font-medium mb-2">{course.platform}</p>
            <p className="text-sm text-muted-gray mb-3">{course.description}</p>
            <div className="border-t border-slate-700/50 pt-3">
               <p className="text-xs font-semibold text-white/90">
                <span className="text-neon-purple">Reason:</span> {course.reason}
               </p>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <section>
      <h2 className="text-3xl font-bold text-white mb-1 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 mr-3 text-purple-400"><path d="M12 3L9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/></svg>
        Recommended For You
        <span className="ml-3 text-sm font-semibold bg-yellow-400/20 text-yellow-300 px-2.5 py-1 rounded-full">PRO</span>
      </h2>
      <p className="text-sm text-muted-gray mb-6">Personalized suggestions from Gemini</p>
      {renderContent()}
    </section>
  );
};

export default AiRecommendations;
