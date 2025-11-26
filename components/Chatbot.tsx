
import React, { useState, useRef, useEffect } from 'react';
import { startChatSession } from '../services/geminiService';
import type { Chat } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! How can I help you today? Ask me about mentors, courses, or any AI/Web3 topic.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize chat session only if it doesn't exist.
    if (!chatRef.current) {
      try {
        chatRef.current = startChatSession();
      } catch (error) {
        console.error("Failed to start chat session:", error);
        setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am unable to connect to the AI service right now.' }]);
      }
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setMicError(null);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setMicError("Microphone access denied.");
        } else {
            setMicError("Error recognizing speech.");
        }
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
    if (!recognitionRef.current) {
        setMicError("Voice not supported.");
        return;
    }
    
    if (isRecording) {
        recognitionRef.current.stop();
    } else {
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error(e);
            setMicError("Could not start microphone.");
        }
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-electric-blue to-neon-purple text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-50 animate-fade-in active:scale-95"
        aria-label={isOpen ? 'Close Chat' : 'Open Chat'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12 3L9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] flex flex-col bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl z-50 animate-slide-in-bottom">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">SkillLink AI Assistant</h3>
            <button onClick={toggleChat} className="text-muted-gray hover:text-white active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <img src="https://api.dicebear.com/8.x/bottts/svg?seed=skill-link-ai" alt="AI Avatar" className="w-8 h-8 rounded-full bg-slate-700" />}
                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-electric-blue text-white rounded-br-none' : 'bg-slate-700 text-white rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <img src="https://api.dicebear.com/8.x/bottts/svg?seed=skill-link-ai" alt="AI Avatar" className="w-8 h-8 rounded-full bg-slate-700" />
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

          {/* Input Form */}
          <div className="p-4 border-t border-slate-700">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Ask anything..."}
                className="flex-grow w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                disabled={isLoading}
                />
                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className={`flex-shrink-0 p-2.5 rounded-full transition-all active:scale-95 ${
                        isRecording 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : 'bg-slate-700 text-muted-gray hover:text-white hover:bg-slate-600'
                    }`}
                    aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="flex-shrink-0 p-2.5 rounded-full bg-electric-blue text-white disabled:bg-slate-600 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>
            {micError && <p className="text-xs text-red-400 mt-2 text-center">{micError}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
