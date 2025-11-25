

import React, { useState } from 'react';
import type { Mentor } from '../types';
import StarRating from './StarRating';
import BookingModal from './BookingModal';

interface MentorCardProps {
  mentor: Mentor;
  onSelect: (mentor: Mentor) => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBooking = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    setIsModalOpen(true);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Messaging feature for ${mentor.name} coming soon!`);
  };


  return (
    <>
      <div 
        onClick={() => onSelect(mentor)}
        className="cursor-pointer group relative rounded-xl p-5 text-center transition-all duration-300 shadow-lg hover:shadow-electric-blue/20 hover:-translate-y-2 flex flex-col h-full border border-transparent [background:linear-gradient(theme(colors.slate.800),theme(colors.slate.800))_padding-box,linear-gradient(135deg,theme(colors.neon-purple),theme(colors.electric-blue))_border-box]"
      >
        <div className="relative z-10 flex flex-col flex-grow">
          <img className="mx-auto h-20 w-20 rounded-full" src={mentor.avatarUrl} alt={mentor.name} />
          <h3 className="mt-4 text-lg font-medium text-white">{mentor.name}</h3>
          <p className="mt-1 text-sm text-muted-gray">{mentor.title}</p>
          
          <div className="my-3 flex justify-center">
              <StarRating rating={mentor.rating} size="md" />
          </div>

          <div className="flex-grow flex items-center justify-center py-3">
            <div className="flex flex-wrap justify-center gap-2">
              {mentor.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2 py-1 text-xs font-medium bg-slate-700 text-muted-gray rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4">
              <p className="text-2xl font-bold text-white mb-3">
                  INR {mentor.sessionPrice.toLocaleString('en-IN')}
                  <span className="text-sm font-normal text-muted-gray"> / session</span>
              </p>
              <div className="flex items-center gap-3">
                  <button 
                      onClick={handleBooking}
                      className="w-full px-4 py-2.5 font-bold text-white bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-electric-blue/40 transition-all duration-300 transform hover:-translate-y-1"
                  >
                      Book Session
                  </button>
                  <button
                      onClick={handleMessage}
                      aria-label={`Message ${mentor.name}`}
                      className="flex-shrink-0 p-3 bg-slate-700/50 rounded-lg text-muted-gray hover:bg-slate-700 hover:text-white transition-colors"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  </button>
              </div>
          </div>
        </div>
      </div>
      {isModalOpen && <BookingModal mentor={mentor} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default MentorCard;