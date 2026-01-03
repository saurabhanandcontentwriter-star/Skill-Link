
import React, { useState, useRef, useEffect } from 'react';
import { getInterviewQuestion, evaluateInterviewResponse, getInterviewerIntro } from '../services/geminiService';
import { InterviewFeedback, VoiceStyle } from '../types';

interface AiInterviewProps {
  onBack: () => void;
}

type InterviewState = 'setup' | 'interview' | 'feedback';
type Gender = 'male' | 'female';

const TOPICS = ['React', 'Node.js', 'System Design', 'Behavioral', 'Web3', 'AI Concepts'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const VOICE_STYLES: { id: VoiceStyle; icon: string }[] = [
  { id: 'Friendly', icon: '😊' },
  { id: 'Formal', icon: '👔' },
  { id: 'Calm', icon: '🌿' },
  { id: 'Energetic', icon: '⚡' },
];

const AiInterview: React.FC<AiInterviewProps> = ({ onBack }) => {
  const [state, setState] = useState<InterviewState>('setup');
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[1]);
  const [selectedGender, setSelectedGender] = useState<Gender>('male');
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<VoiceStyle>('Friendly');
  
  // Interview Logic State
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  
  // Audio/Video State
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  
  // Meeting Controls State
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const recognitionRef = useRef<any>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Speech Recognition & Load Voices
  useEffect(() => {
    // Load voices
    const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Setup Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-IN'; // Set to Indian English for better recognition of accents
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
             setUserAnswer(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        setIsRecording(false);
        setMicError("Microphone error. Please use text input.");
      };

      recognitionRef.current = recognition;
    }
    
    // Cleanup camera on unmount
    return () => {
        stopVideo();
    };
  }, []);

  // Effect to attach user video stream to video element when it becomes available
  useEffect(() => {
    if (state === 'interview' && videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
    }
  }, [state]);

  const startVideo = async () => {
    setCameraError(false);
    setIsMuted(false);
    setIsCameraOff(false);
    
    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setCameraError(true);
        return;
    }

    try {
        // Check for video input devices before requesting stream
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideo = devices.some(device => device.kind === 'videoinput');
        
        if (!hasVideo) {
            console.warn("No video input device found.");
            setCameraError(true);
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        // Stream will be attached via useEffect
    } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError(true);
        // Do not block the interview; proceed without video
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(prev => !prev);
      
      // Also update recognition state if needed
      if (!isMuted && isRecording) {
          recognitionRef.current?.stop();
          setIsRecording(false);
      }
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsCameraOff(prev => !prev);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel previous speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      // Tone Adjustment based on Voice Style
      let pitch = 1;
      let rate = 1;

      switch (selectedVoiceStyle) {
        case 'Friendly':
          pitch = selectedGender === 'female' ? 1.1 : 1.05;
          rate = 1.05; // Slightly upbeat
          break;
        case 'Formal':
          pitch = selectedGender === 'female' ? 1.0 : 1.0;
          rate = 0.9; // Measured, professional pace
          break;
        case 'Calm':
          pitch = selectedGender === 'female' ? 0.95 : 0.9; // Lower
          rate = 0.85; // Slower, soothing
          break;
        case 'Energetic':
          pitch = selectedGender === 'female' ? 1.2 : 1.15; // Higher
          rate = 1.2; // Faster
          break;
      }
      utterance.pitch = pitch;
      utterance.rate = rate;

      // Attempt to find high-quality Natural voices first, then specific Indian ones
      const voices = voicesRef.current;
      let preferredVoice;

      if (selectedGender === 'female') {
          // Priority: Natural English (often higher quality) -> Indian English -> Generic English
          preferredVoice = voices.find(v => v.name.includes('Natural') && v.name.includes('Female'));
          if (!preferredVoice) preferredVoice = voices.find(v => v.lang === 'en-IN' && v.name.includes('Female'));
          if (!preferredVoice) preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
      } else {
          preferredVoice = voices.find(v => v.name.includes('Natural') && v.name.includes('Male'));
          if (!preferredVoice) preferredVoice = voices.find(v => v.lang === 'en-IN' && v.name.includes('Male'));
          if (!preferredVoice) preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel'));
      }
      
      // Fallback
      if (!preferredVoice) {
         preferredVoice = voices.find(v => v.lang === 'en-IN');
      }

      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  const startInterview = async () => {
    setState('interview');
    setIsLoading(true);
    setMicError(null);
    setIsIntroPhase(true); // Start with Intro Phase
    startVideo(); // Enable Camera
    
    const interviewerName = selectedGender === 'male' ? 'Arjun' : 'Aditi';

    try {
      // Get Persona Introduction with selected style
      const introText = await getInterviewerIntro(interviewerName, selectedGender, selectedTopic, selectedVoiceStyle);
      setCurrentQuestion(introText);
      setIsLoading(false);
      speakText(introText);
    } catch (error) {
      console.error(error);
      alert("Failed to start interview. Check API Key.");
      stopVideo();
      setState('setup');
    }
  };

  const endSession = () => {
      stopVideo();
      setState('setup');
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    
    // Stop recording if active
    if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
    }

    setIsLoading(true);

    try {
      if (isIntroPhase) {
        // Transition from Intro to First Question
        const firstQuestion = await getInterviewQuestion(
            selectedTopic, 
            selectedDifficulty, 
            `User just introduced themselves saying: "${userAnswer}". Acknowledge this politely in Indian English style and ask the first question.`,
            selectedVoiceStyle
        );
        setIsIntroPhase(false);
        setFeedback(null);
        setCurrentQuestion(firstQuestion);
        speakText(firstQuestion);
        setUserAnswer('');
      } else {
        // Standard Q&A Evaluation
        const result = await evaluateInterviewResponse(currentQuestion, userAnswer);
        setFeedback(result);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to process answer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    setFeedback(null);
    setUserAnswer('');
    setIsLoading(true);
    try {
        const question = await getInterviewQuestion(selectedTopic, selectedDifficulty, currentQuestion, selectedVoiceStyle);
        setCurrentQuestion(question);
        speakText(question);
    } catch(e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
        setMicError("Browser does not support speech recognition.");
        return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setMicError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
        case 'Expert': return 'bg-green-500 text-white';
        case 'Good': return 'bg-blue-500 text-white';
        case 'Average': return 'bg-yellow-500 text-black';
        case 'Needs Improvement': return 'bg-red-500 text-white';
        default: return 'bg-slate-600 text-muted-gray';
    }
  };

  // Avatar Component
  const Avatar = () => {
      // Photorealistic Images
      const maleImage = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80";
      const femaleImage = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80";
      
      const avatarSrc = selectedGender === 'male' ? maleImage : femaleImage;
      const interviewerName = selectedGender === 'male' ? 'Arjun' : 'Aditi';

      return (
        <div className="relative w-full max-w-4xl mx-auto aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-600 mb-6 group">
            {/* Real Avatar Feed */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                 <img 
                    src={avatarSrc} 
                    alt="AI Interviewer" 
                    className={`w-full h-full object-cover object-top transition-transform duration-300 ${isSpeaking ? 'animate-talking' : 'animate-breathe'}`}
                />
                {/* Overlay gradient for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>

            {/* Name Tag / Status Overlay */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3 z-20">
                 <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                 <div>
                    <span className="text-white font-semibold block leading-tight text-sm shadow-black drop-shadow-md">{interviewerName}</span>
                    <span className="text-[10px] text-electric-blue uppercase tracking-wider font-bold">{selectedVoiceStyle}</span>
                 </div>
            </div>
            
            {/* Question / Captions Overlay */}
            {currentQuestion && (
                <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-white text-lg font-medium leading-relaxed drop-shadow-md">
                            "{currentQuestion}"
                        </p>
                        {!isSpeaking && (
                            <button 
                                onClick={() => speakText(currentQuestion)}
                                className="mt-2 text-xs text-electric-blue hover:text-white transition-colors inline-flex items-center gap-1 opacity-80 hover:opacity-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                Replay
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="animate-slide-in-fade max-w-6xl mx-auto">
      <button onClick={onBack} className="mb-4 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-all active:scale-95 w-fit">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </button>

      {state === 'setup' && (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">AI Avatar Interview Training</h1>
            <p className="text-muted-gray">Experience a realistic virtual interview. Choose your interviewer, set the tone, and start practicing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Topic Selection */}
             <div>
                <label className="block text-sm font-medium text-muted-gray mb-3">Select Topic</label>
                <div className="grid grid-cols-2 gap-3">
                    {TOPICS.map(topic => (
                        <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all active:scale-95 border ${
                                selectedTopic === topic 
                                ? 'bg-electric-blue/20 border-electric-blue text-white' 
                                : 'bg-slate-800 border-slate-700 text-muted-gray hover:border-slate-500'
                            }`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>
             </div>

             <div className="space-y-6">
                {/* Gender Selection */}
                <div>
                    <label className="block text-sm font-medium text-muted-gray mb-3">Choose Interviewer</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setSelectedGender('male')}
                            className={`flex flex-col items-center p-4 rounded-xl border transition-all active:scale-95 ${
                                selectedGender === 'male'
                                ? 'bg-slate-800 border-electric-blue ring-2 ring-electric-blue/30'
                                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                            }`}
                        >
                            <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" className="w-16 h-16 rounded-full mb-2 object-cover border-2 border-transparent" alt="Male" />
                            <span className="text-white font-semibold">Arjun</span>
                        </button>
                        <button
                            onClick={() => setSelectedGender('female')}
                            className={`flex flex-col items-center p-4 rounded-xl border transition-all active:scale-95 ${
                                selectedGender === 'female'
                                ? 'bg-slate-800 border-neon-purple ring-2 ring-neon-purple/30'
                                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                            }`}
                        >
                             <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80" className="w-16 h-16 rounded-full mb-2 object-cover border-2 border-transparent" alt="Female" />
                            <span className="text-white font-semibold">Aditi</span>
                        </button>
                    </div>
                </div>

                {/* Voice Style */}
                <div>
                    <label className="block text-sm font-medium text-muted-gray mb-3">Voice Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {VOICE_STYLES.map(style => (
                            <button
                                key={style.id}
                                onClick={() => setSelectedVoiceStyle(style.id)}
                                className={`px-3 py-2 rounded-lg text-center text-sm font-medium transition-all active:scale-95 border flex items-center justify-center gap-2 ${
                                    selectedVoiceStyle === style.id
                                    ? 'bg-neon-purple/20 border-neon-purple text-white'
                                    : 'bg-slate-800 border-slate-700 text-muted-gray hover:border-slate-500'
                                }`}
                            >
                                <span>{style.icon}</span>
                                {style.id}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-muted-gray mb-3">Difficulty Level</label>
                    <div className="flex gap-2">
                        {DIFFICULTIES.map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium transition-all active:scale-95 border ${
                                    selectedDifficulty === diff 
                                    ? 'bg-aqua-green/20 border-aqua-green text-white' 
                                    : 'bg-slate-800 border-slate-700 text-muted-gray hover:border-slate-500'
                                }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
                onClick={startInterview}
                className="px-8 py-4 bg-gradient-to-r from-electric-blue to-neon-purple text-white font-bold rounded-xl shadow-lg hover:shadow-electric-blue/25 transition-all transform hover:-translate-y-1 active:scale-95"
            >
                Start Virtual Meeting
            </button>
          </div>
        </div>
      )}

      {state === 'interview' && (
        <div className="relative min-h-[600px] flex flex-col">
            {/* Info Badges (Floating) */}
            <div className="absolute top-4 left-4 flex gap-2 z-30">
                 {isIntroPhase && <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-mono border border-yellow-400/30 shadow-lg backdrop-blur-sm">Introduction Phase</span>}
                <span className="px-3 py-1 bg-slate-900/60 rounded-full text-xs font-mono text-muted-gray border border-slate-700 backdrop-blur-sm">
                    {selectedTopic} • {selectedDifficulty}
                </span>
            </div>

            {/* User Video Feed (PiP) - Repositioned inside the Avatar context visually */}
            <div className="absolute top-4 right-4 w-32 h-24 sm:w-48 sm:h-36 bg-black rounded-xl border-2 border-slate-600/50 overflow-hidden shadow-2xl z-30 transition-all hover:scale-105 hover:border-electric-blue">
                {!cameraError && !isCameraOff ? (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-muted-gray p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 opacity-50"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        <span className="text-[10px] text-center leading-tight">Camera Off</span>
                    </div>
                )}
                <div className="absolute bottom-1 left-2 flex items-center gap-1">
                    <span className="text-[8px] font-bold text-white/90 bg-black/50 px-1.5 rounded">You</span>
                    {isMuted && <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <Avatar />

                {isLoading && !currentQuestion ? (
                    <div className="text-center py-6">
                        <p className="text-electric-blue animate-pulse font-medium">Interviewer is thinking...</p>
                    </div>
                ) : (
                    <>
                        {!feedback ? (
                            <div className="max-w-3xl mx-auto w-full px-4 mb-4">
                                <div className="relative">
                                    <textarea
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder={isIntroPhase ? "Introduce yourself (e.g., Hi, I am...)" : "Type your answer or use the microphone..."}
                                        className="w-full h-32 bg-slate-900/50 backdrop-blur-md border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none resize-none shadow-lg"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={toggleRecording}
                                        className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all active:scale-90 ${
                                            isRecording ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/20' : 'bg-slate-700 text-electric-blue hover:bg-slate-600'
                                        }`}
                                        title="Voice Input"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                    </button>
                                </div>
                                {micError && <p className="text-red-400 text-xs mt-2 text-center bg-slate-900/80 inline-block px-2 rounded mx-auto">{micError}</p>}

                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={!userAnswer.trim() || isLoading}
                                        className="px-8 py-3 bg-electric-blue text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                            </>
                                        ) : (
                                            isIntroPhase ? "Submit Introduction" : "Submit Answer"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto w-full px-4 animate-slide-in-bottom mb-4">
                                <div className="bg-slate-800/90 border border-slate-600 rounded-xl p-6 relative overflow-hidden shadow-2xl">
                                    {/* Rating Badge with Remarks */}
                                    <div className="absolute top-0 right-0 p-4 bg-slate-900/80 rounded-bl-xl border-l border-b border-slate-700 text-center w-32 sm:w-48">
                                        <p className="text-xs text-muted-gray uppercase tracking-widest mb-1">Score</p>
                                        <p className={`text-3xl font-bold mb-1 ${feedback.rating >= 7 ? 'text-green-400' : feedback.rating >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {feedback.rating}/10
                                        </p>
                                        <div className={`text-xs font-bold px-2 py-1 rounded mb-2 ${getProficiencyColor(feedback.proficiency)}`}>
                                            {feedback.proficiency}
                                        </div>
                                    </div>

                                    <div className="sm:pr-48"> 
                                        <h3 className="text-xl font-bold text-white mb-4">Feedback Analysis</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-aqua-green uppercase tracking-wide mb-1">Remarks</h4>
                                                <p className="text-slate-300">{feedback.feedback}</p>
                                            </div>
                                            
                                            <div>
                                                <h4 className="text-sm font-semibold text-neon-purple uppercase tracking-wide mb-1">Tone Analysis</h4>
                                                <p className="text-white italic">"{feedback.toneAnalysis}"</p>
                                            </div>

                                            <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50">
                                                <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-2 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="M2 12h20"></path><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path><path d="M22 12h-2.22a2 2 0 0 0-1.78 1 2 2 0 0 1-1.78 1h-8.44a2 2 0 0 1-1.78-1 2 2 0 0 0-1.78-1H2"></path></svg>
                                                    Better Answer
                                                </h4>
                                                <p className="text-sm text-slate-300 leading-relaxed">{feedback.suggestedImprovement}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-center gap-4">
                                    <button
                                        onClick={handleNextQuestion}
                                        className="px-6 py-3 bg-electric-blue text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        Next Question
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Meeting Control Bar */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 flex justify-center items-center gap-6 border-t border-slate-700 mx-auto w-full max-w-2xl mb-4 shadow-2xl">
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
                      onClick={endSession}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg hover:shadow-red-600/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                      End Call
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
            </div>
        </div>
      )}
    </div>
  );
};

export default AiInterview;
