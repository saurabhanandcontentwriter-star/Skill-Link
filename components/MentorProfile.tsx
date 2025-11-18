

import React, { useState, useEffect, useRef } from 'react';
import { Mentor, Message } from '../types';
import StarRating from './StarRating';
import { startChatSession } from '../services/geminiService';
import type { Chat } from '@google/genai';

interface MentorProfileProps {
  mentor: Mentor;
  onBack: () => void;
}

const MentorProfile: React.FC<MentorProfileProps> = ({ mentor, onBack }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const systemInstruction = `You are ${mentor.name}, a ${mentor.title}. ${mentor.description}. Your role is to chat with a student who is interested in your mentorship. Be friendly, encouraging, and answer their questions about your skills and session offerings. Keep your responses conversational and relatively brief. Start the conversation by introducing yourself and asking how you can help.`;
    
    try {
        chatRef.current = startChatSession(systemInstruction);
        setIsLoading(true);
        chatRef.current.sendMessage({ message: "Introduce yourself." }).then(response => {
            setMessages([{ role: 'model', text: response.text }]);
        }).finally(() => setIsLoading(false));

    } catch (error) {
        console.error("Failed to start chat session:", error);
        setMessages([{ role: 'model', text: 'Sorry, the chat service is currently unavailable.' }]);
    }
  }, [mentor]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported by your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicError("Microphone access denied. Please allow it in your browser settings.");
      } else {
        setMicError(`An error occurred: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);


  const handleBooking = () => {
    alert(`Opening UPI payment app for 76679264@upi to pay ₹${mentor.sessionPrice}...\n\nPayment will be verified automatically.`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading || !chatRef.current) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: trimmedInput }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: trimmedInput });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setMicError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Could not start recognition:", e);
        setMicError("Could not start voice recognition. Please check microphone connection.");
      }
    }
  };


  return (
    <div className="animate-slide-in-fade">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden shadow-2xl shadow-electric-blue/10">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Left Column: Avatar & Booking */}
          <div className="md:col-span-1 flex flex-col items-center text-center p-8 border-b md:border-b-0 md:border-r border-slate-800">
            <img src={mentor.avatarUrl} alt={mentor.name} className="w-40 h-40 rounded-full border-4 border-slate-700 ring-4 ring-electric-blue/50" />
            <h1 className="text-3xl font-bold text-white mt-4">{mentor.name}</h1>
            <p className="text-aqua-green mt-1">{mentor.title}</p>
            <div className="mt-3">
              <StarRating rating={mentor.rating} size="lg" />
            </div>
            <div className="mt-8 w-full bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white">1-on-1 Session</h3>
              <p className="text-4xl font-extrabold text-white mt-2">₹{mentor.sessionPrice.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-gray mt-1">per 60-minute session</p>
              <button
                onClick={handleBooking}
                className="mt-6 w-full flex items-center justify-center px-4 py-3 font-bold text-white bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-electric-blue/40 transition-all duration-300 transform hover:-translate-y-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                Pay ₹{mentor.sessionPrice.toLocaleString('en-IN')} via UPI
              </button>
              <p className="text-xs text-muted-gray/70 mt-4">76679264@upi | Payment verified automatically.</p>
            </div>
          </div>
          {/* Right Column: Tabs for Details & Chat */}
          <div className="md:col-span-2 flex flex-col">
            <div className="border-b border-slate-700 px-8">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'about' ? 'border-aqua-green text-aqua-green' : 'border-transparent text-muted-gray hover:text-white hover:border-slate-500'}`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chat' ? 'border-aqua-green text-aqua-green' : 'border-transparent text-muted-gray hover:text-white hover:border-slate-500'}`}
                >
                  Live Chat
                </button>
              </nav>
            </div>
            
            <div className="flex-grow flex flex-col h-[60vh] md:h-auto">
              {activeTab === 'about' && (
                <div className="p-8 animate-slide-in-fade">
                  <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">About Me</h2>
                  <p className="text-muted-gray mt-4 leading-relaxed">{mentor.description}</p>
                  <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2 mt-8">Skills & Expertise</h2>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {mentor.skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 text-sm font-medium bg-slate-700 text-muted-gray rounded-full border border-slate-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col p-4 bg-slate-800/50 animate-slide-in-fade">
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <img src={mentor.avatarUrl} alt="Mentor Avatar" className="w-8 h-8 rounded-full bg-slate-700 self-start" />}
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white rounded-br-none' : 'bg-slate-700 text-white rounded-bl-none'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                     {isLoading && (
                      <div className="flex items-end gap-2 justify-start">
                        <img src={mentor.avatarUrl} alt="Mentor Avatar" className="w-8 h-8 rounded-full bg-slate-700" />
                        <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-slate-700 text-white rounded-bl-none">
                           <div className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-muted-gray rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                              <span className="w-2 h-2 bg-muted-gray rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                              <span className="w-2 h-2 bg-muted-gray rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isRecording ? 'Listening...' : `Message ${mentor.name}...`}
                        className="flex-grow w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                        disabled={isLoading || isRecording}
                        />
                        <button
                          type="button"
                          onClick={handleMicClick}
                          disabled={!!micError || isLoading}
                          className={`flex-shrink-0 p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              isRecording
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-slate-700 text-muted-gray hover:bg-slate-600'
                          }`}
                          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
                        </button>
                        <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="flex-shrink-0 p-2.5 rounded-full bg-electric-blue text-white disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send Message"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                    {micError && <p className="text-xs text-red-400 text-center pt-1">{micError}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;