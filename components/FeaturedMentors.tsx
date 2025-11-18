import React from 'react';
import { MENTORS } from '../constants';
import MentorCard from './MentorCard';
import { Mentor } from '../types';

interface FeaturedMentorsProps {
  onSelectMentor: (mentor: Mentor) => void;
}

const FeaturedMentors: React.FC<FeaturedMentorsProps> = ({ onSelectMentor }) => {
  return (
    <section>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Connect with Industry Experts</h2>
        <p className="mt-4 text-lg text-muted-gray">
          Get personalized guidance from our curated list of mentors in AI, Web3, and beyond.
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {MENTORS.map((mentor) => (
          // FIX: Pass the onSelect prop to MentorCard to handle mentor selection and resolve the missing property error.
          <MentorCard key={mentor.name} mentor={mentor} onSelect={onSelectMentor} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedMentors;
