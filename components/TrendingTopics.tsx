
import React from 'react';
import { TOPICS } from '../constants';

const TrendingTopics: React.FC = () => {
  return (
    <section>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Explore Trending Topics</h2>
        <p className="mt-4 text-lg text-muted-gray">
          Dive into the most popular and cutting-edge subjects our community is learning about right now.
        </p>
      </div>
      <div className="mt-12 max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {TOPICS.map((topic) => (
            <a
              key={topic}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert(`Exploring ${topic} is coming soon!`);
              }}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-800 text-muted-gray rounded-full text-sm sm:text-base font-medium border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-aqua-green transition-all duration-200"
            >
              {topic}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingTopics;