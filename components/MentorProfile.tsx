
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

  // Video Refs & State
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null); // New ref for screen share
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null); // New ref for screen stream
  
  const [cameraError, setCameraError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  // Advanced Video Features
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

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
  }, [messages, isLoading, showChat, isVideoCallOpen]);

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
  
  // Timer for call duration
  useEffect(() => {
    let interval: number;
    if (isVideoCallOpen) {
        interval = window.setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVideoCallOpen]);

  // Effect to attach user video stream to video element when it becomes available
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isVideoCallOpen, isScreenSharing]);

  // Effect to attach screen share stream to screen element
  useEffect(() => {
    if (screenRef.current && screenStreamRef.current) {
      screenRef.current.srcObject = screenStreamRef.current;
    }
  }, [isScreenSharing]);

  const formatTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVideoCall = async () => {
      setIsVideoCallOpen(true);
      setCameraError(false);
      setIsMuted(false);
      setIsCameraOff(false);
      setIsScreenSharing(false);
      setShowChat(false);
      setCallDuration(0);

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
              // stream will be attached via useEffect
          } else {
              console.warn("No video input device found, falling back to audio.");
              setCameraError(true);
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = audioStream;
          }
      } catch (err) {
          console.error("Camera/Audio access failed", err);
          setCameraError(true);
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
      if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
      }
      setIsVideoCallOpen(false);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsCameraOff(prev => !prev);
    }
  };

  const toggleScreenShare = async () => {
      if (isScreenSharing) {
          // Stop sharing
          if (screenStreamRef.current) {
              screenStreamRef.current.getTracks().forEach(track => track.stop());
              screenStreamRef.current = null;
          }
          setIsScreenSharing(false);
      } else {
          // Start sharing
          try {
              const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
              screenStreamRef.current = stream;
              setIsScreenSharing(true);
              // stream will be attached via useEffect
              
              // Handle user stopping share via browser UI
              stream.getVideoTracks()[0].onended = () => {
                  setIsScreenSharing(false);
                  screenStreamRef.current = null;
              };
          } catch (err) {
              console.error("Screen share failed", err);
          }
      }
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
          <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-fade-in">
              {/* Top Info Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-red-600/20 border border-red-600/50 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="text-red-500 font-bold text-xs tracking-wider">REC</span>
                          <span className="text-white font-mono text-sm ml-2">{formatTime(callDuration)}</span>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700">
                          <span className="text-white text-sm font-medium">{mentor.name}</span>
                          <span className="text-muted-gray text-xs ml-2">• Mentor Session</span>
                      </div>
                  </div>
                  
                  {/* Network Indicator */}
                  <div className="flex items-end gap-1 h-4">
                      <div className="w-1 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-1 h-3 bg-green-500 rounded-sm"></div>
                      <div className="w-1 h-4 bg-green-500 rounded-sm"></div>
                  </div>
              </div>

              {/* Main Stage */}
              <div className="flex-1 relative flex bg-slate-900 overflow-hidden">
                  
                  {/* Main Video Feed (Mentor or Screen Share) */}
                  <div className="flex-1 relative flex items-center justify-center">
                        {isScreenSharing ? (
                            <video ref={screenRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="absolute inset-0 bg-slate-800/30 backdrop-blur-sm"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-full border-4 border-electric-blue/50 p-1 shadow-[0_0_60px_rgba(0,102,255,0.3)] animate-pulse">
                                        <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <h2 className="mt-4 text-2xl font-bold text-white tracking-wide">{mentor.name}</h2>
                                    <p className="text-electric-blue text-sm animate-pulse mt-1">Speaking...</p>
                                </div>
                            </div>
                        )}
                  </div>

                  {/* Chat Overlay (Slide In) */}
                  {showChat && (
                      <div className="w-80 bg-slate-900/90 border-l border-slate-700 flex flex-col animate-slide-in-right z-20 backdrop-blur-md">
                          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                              <h3 className="text-white font-bold">Live Chat</h3>
                              <button onClick={() => setShowChat(false)} className="text-muted-gray hover:text-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-3">
                              {messages.map((msg, i) => (
                                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                      <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${msg.role === 'user' ? 'bg-electric-blue text-white' : 'bg-slate-700 text-slate-200'}`}>
                                          {msg.text}
                                      </div>
                                  </div>
                              ))}
                              <div ref={messagesEndRef} />
                          </div>
                          <div className="p-3 border-t border-slate-700">
                              <form onSubmit={handleSendMessage} className="flex gap-2">
                                  <input 
                                      type="text" 
                                      value={inputValue} 
                                      onChange={e => setInputValue(e.target.value)} 
                                      className="flex-1 bg-slate-800 text-white text-sm rounded-full px-3 py-2 border border-slate-600 focus:border-electric-blue outline-none"
                                      placeholder="Type a message..."
                                  />
                                  <button type="submit" className="p-2 bg-electric-blue rounded-full text-white">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                  </button>
                              </form>
                          </div>
                      </div>
                  )}

                  {/* User PiP (Picture in Picture) */}
                  <div className="absolute bottom-24 right-4 w-32 h-24 sm:w-48 sm:h-36 bg-black border border-slate-600 rounded-lg overflow-hidden shadow-2xl z-20 group cursor-move">
                      {!cameraError && !isCameraOff ? (
                          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                      ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-muted-gray">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          </div>
                      )}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={toggleCamera} className="p-1 bg-black/50 rounded text-white hover:bg-white/20">
                              {isCameraOff ? <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>}
                          </button>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 rounded text-[10px] font-bold text-white">You</div>
                  </div>
              </div>

              {/* Control Bar */}
              <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 sm:gap-8 px-4 z-30">
                  <button 
                      onClick={toggleMute}
                      className={`p-3.5 rounded-full transition-all duration-200 ${isMuted ? 'bg-red-600/20 text-red-500 hover:bg-red-600/30' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
                      title={isMuted ? "Unmute" : "Mute"}
                  >
                      {isMuted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                      )}
                  </button>

                  <button 
                      onClick={toggleCamera}
                      className={`p-3.5 rounded-full transition-all duration-200 ${isCameraOff ? 'bg-red-600/20 text-red-500 hover:bg-red-600/30' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
                      title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
                  >
                      {isCameraOff ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                      )}
                  </button>

                  <button 
                      onClick={toggleScreenShare}
                      className={`p-3.5 rounded-full transition-all ${isScreenSharing ? 'bg-green-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                      title="Share Screen"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"></path><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="m17 8 5-5"></path><path d="M17 3h5v5"></path></svg>
                  </button>

                  <button 
                      onClick={() => setShowChat(!showChat)}
                      className={`p-3.5 rounded-full transition-all relative ${showChat ? 'bg-electric-blue text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                      title="Chat"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      {/* Unread indicator could go here */}
                  </button>

                  <button 
                      onClick={endVideoCall}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-all active:scale-95 ml-2"
                  >
                      End
                  </button>
              </div>
          </div>
      )}

      {isBookingModalOpen && <BookingModal mentor={mentor} onClose={() => setIsBookingModalOpen(false)} />}
    </div>
  );
};

export default MentorProfile;
