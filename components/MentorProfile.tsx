
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Mentor, Message } from '../types';
import StarRating from './StarRating';
import BookingModal from './BookingModal';
import { startChatSession } from '../services/geminiService';
import type { Chat } from '@google/genai';

interface MentorProfileProps {
  mentor: Mentor;
  onBack: () => void;
  onAddTask: (text: string, dueDate: string | null) => void;
}

const PAGE_SIZE = 10;

const MentorProfile: React.FC<MentorProfileProps> = ({ mentor, onBack, onAddTask }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  
  // Refs
  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fullHistoryRef = useRef<Message[]>([]);
  const prevScrollHeightRef = useRef<number>(0);
  const shouldScrollToBottomRef = useRef<boolean>(true);

  // Video Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);

  // --- Initialization & History Loading ---
  useEffect(() => {
    // Reset state when mentor changes
    setMessages([]);
    fullHistoryRef.current = [];
    chatSessionRef.current = null;
    shouldScrollToBottomRef.current = true;

    // Load history from LocalStorage
    const storageKey = `chat_history_${mentor.name}`;
    const storedHistory = localStorage.getItem(storageKey);
    
    if (storedHistory) {
        const parsed: Message[] = JSON.parse(storedHistory);
        fullHistoryRef.current = parsed;
        
        // Initial load: last PAGE_SIZE messages
        const initialBatch = parsed.slice(-PAGE_SIZE);
        setMessages(initialBatch);
        setHasMoreHistory(parsed.length > PAGE_SIZE);
    } else {
        // Start fresh
        setMessages([{ role: 'model', text: `Namaste! I am ${mentor.name}. How can I help you with ${mentor.skills.join(', ')} today?` }]);
        // Don't save initial greeting to history to avoid duplication on re-entry if empty
    }

    // Initialize Gemini Chat
    try {
        const systemInstruction = `You are ${mentor.name}, a ${mentor.title}. 
        Your expertise: ${mentor.skills.join(', ')}. 
        About you: ${mentor.description}.
        Traits: Professional, helpful, Indian context.
        Keep answers concise (under 100 words) and relevant to your expertise.`;
        
        chatSessionRef.current = startChatSession(systemInstruction);
    } catch (e) {
        console.error("Failed to start chat session", e);
    }
  }, [mentor]);

  // --- Scroll & History Logic ---
  
  // Restore scroll position when loading history
  useLayoutEffect(() => {
    if (!shouldScrollToBottomRef.current && chatContainerRef.current) {
        const newHeight = chatContainerRef.current.scrollHeight;
        const diff = newHeight - prevScrollHeightRef.current;
        chatContainerRef.current.scrollTop = diff;
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const loadOlderMessages = async () => {
      setIsLoadingHistory(true);
      shouldScrollToBottomRef.current = false;
      
      if (chatContainerRef.current) {
          prevScrollHeightRef.current = chatContainerRef.current.scrollHeight;
      }

      // Simulate network delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const currentDisplayCount = messages.length;
      const totalCount = fullHistoryRef.current.length;
      const nextCount = currentDisplayCount + PAGE_SIZE;
      
      // Slice from the end: take the last 'nextCount' messages
      const nextBatch = fullHistoryRef.current.slice(-nextCount);
      
      setMessages(nextBatch);
      setHasMoreHistory(totalCount > nextCount);
      setIsLoadingHistory(false);
  };

  const handleScroll = () => {
      if (chatContainerRef.current && chatContainerRef.current.scrollTop < 20 && hasMoreHistory && !isLoadingHistory) {
          loadOlderMessages();
      }
  };

  const updateHistory = (newMsgs: Message[]) => {
      // Merge with full history
      // Note: This logic assumes 'messages' state only contains the *tail* of history + new messages.
      // A safer way is to just append new interactions to fullHistoryRef directly.
      const lastMsg = newMsgs[newMsgs.length - 1];
      fullHistoryRef.current = [...fullHistoryRef.current, lastMsg];
      localStorage.setItem(`chat_history_${mentor.name}`, JSON.stringify(fullHistoryRef.current));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatSessionRef.current) return;

    shouldScrollToBottomRef.current = true;
    const userMsg: Message = { role: 'user', text: inputValue.trim() };
    
    // Optimistic Update
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    updateHistory(newMessages); // Save user msg
    setInputValue('');
    setIsLoading(true);

    try {
        const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
        const modelMsg: Message = { role: 'model', text: result.text };
        
        setMessages(prev => {
            const updated = [...prev, modelMsg];
            updateHistory(updated); // Save model msg
            return updated;
        });
    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
        setIsLoading(false);
    }
  };

  // --- Video Call Logic ---
  const startVideoCall = async () => {
      setIsVideoCallOpen(true);
      setCameraError(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setCameraError(true);
          return;
      }

      try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasVideo = devices.some(device => device.kind === 'videoinput');

          if (hasVideo) {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              streamRef.current = stream;
              if (videoRef.current) {
                  videoRef.current.srcObject = stream;
              }
          } else {
              // No video device found, fallback to audio only
              console.warn("No video input device found, falling back to audio.");
              setCameraError(true);
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = audioStream;
          }
      } catch (err) {
          console.error("Camera/Audio access failed", err);
          setCameraError(true);
          // Try to fallback to audio only if video+audio failed (e.g. permission denied specifically for video)
          try {
             const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
             streamRef.current = audioStream;
          } catch(audioErr) {
             console.error("Audio fallback failed", audioErr);
          }
      }
  };

  const endVideoCall = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      setIsVideoCallOpen(false);
  };

  const handleAddToTasks = () => {
    const taskText = `Prepare for session with ${mentor.name}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    onAddTask(taskText, dateStr);
    alert('Task added to your dashboard!');
  };

  return (
    <div className="animate-slide-in-fade max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <button onClick={onBack} className="mb-4 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-all active:scale-95 w-fit">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
        {/* Header Section */}
        <div className="bg-slate-800/50 p-6 border-b border-slate-700 flex flex-col sm:flex-row items-center gap-6">
             <img 
                src={mentor.avatarUrl} 
                alt={mentor.name} 
                className="w-20 h-20 rounded-full border-2 border-electric-blue object-cover"
            />
            <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-white">{mentor.name}</h1>
                <p className="text-electric-blue font-medium">{mentor.title}</p>
                <div className="flex justify-center sm:justify-start mt-2">
                    <StarRating rating={mentor.rating} size="sm" />
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-slate-700 text-white shadow-sm' : 'text-muted-gray hover:text-white'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-electric-blue text-white shadow-sm' : 'text-muted-gray hover:text-white'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    AI Chat
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'overview' && (
                <div className="h-full overflow-y-auto p-6 sm:p-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h2 className="text-lg font-bold text-white mb-2">About</h2>
                                <p className="text-muted-gray leading-relaxed">{mentor.description}</p>
                            </section>
                            
                            <section>
                                <h2 className="text-lg font-bold text-white mb-2">Expertise</h2>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-slate-800 text-muted-gray border border-slate-700 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <p className="text-muted-gray text-sm mb-1">Session Price</p>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-bold text-white">INR {mentor.sessionPrice.toLocaleString('en-IN')}</span>
                                    <span className="text-sm text-muted-gray">/ hour</span>
                                </div>
                                
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setIsBookingModalOpen(true)}
                                        className="w-full py-3 bg-gradient-to-r from-electric-blue to-neon-purple text-white font-bold rounded-lg shadow-lg hover:shadow-electric-blue/25 transition-all transform hover:-translate-y-1 active:scale-95"
                                    >
                                        Book Session
                                    </button>
                                    <button 
                                        onClick={startVideoCall}
                                        className="w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                        Start Video Call
                                    </button>
                                    <button 
                                        onClick={handleAddToTasks}
                                        className="w-full py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                        Add to Tasks
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="h-full flex flex-col bg-slate-900/20 animate-fade-in">
                    {/* Chat Header / Actions */}
                    <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700 flex justify-between items-center text-xs text-muted-gray">
                        <span>AI Clone of {mentor.name}</span>
                        <button 
                            onClick={startVideoCall}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded-full hover:bg-green-600/30 transition-all active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                            Start Video Call
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 p-4 overflow-y-auto space-y-4"
                    >
                        {isLoadingHistory && (
                            <div className="flex justify-center py-2">
                                <svg className="animate-spin h-5 w-5 text-electric-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                        
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                    msg.role === 'user' 
                                    ? 'bg-electric-blue text-white rounded-tr-none' 
                                    : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-600">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={`Message ${mentor.name}...`}
                                className="flex-1 bg-slate-900 border border-slate-600 rounded-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue placeholder-slate-500"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="p-3 bg-electric-blue text-white rounded-full hover:bg-blue-600 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Video Call Modal */}
      {isVideoCallOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-fade-in">
              <div className="absolute top-4 right-4 z-50">
                  <button onClick={endVideoCall} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                      End Call
                  </button>
              </div>
              
              <div className="flex-1 relative flex items-center justify-center">
                  {/* Mentor 'Video' (Avatar Simulation) */}
                  <div className="flex flex-col items-center">
                      <div className="w-48 h-48 rounded-full border-4 border-electric-blue overflow-hidden shadow-[0_0_50px_rgba(0,102,255,0.5)] animate-pulse">
                          <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full object-cover" />
                      </div>
                      <h2 className="mt-4 text-2xl font-bold text-white">{mentor.name}</h2>
                      <p className="text-electric-blue animate-pulse">Speaking...</p>
                  </div>

                  {/* User Self View (PiP) */}
                  <div className="absolute bottom-8 right-8 w-48 h-36 bg-black border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                      {!cameraError ? (
                          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                      ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-muted-gray p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 opacity-50"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                              <span className="text-[10px] text-center leading-tight">Camera Off</span>
                          </div>
                      )}
                      <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white/80">You</div>
                  </div>
              </div>
          </div>
      )}

      {isBookingModalOpen && <BookingModal mentor={mentor} onClose={() => setIsBookingModalOpen(false)} />}
    </div>
  );
};

export default MentorProfile;
