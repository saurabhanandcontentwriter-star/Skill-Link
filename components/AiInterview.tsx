
import React, { useState, useRef, useEffect } from 'react';
import { getInterviewQuestion, evaluateInterviewResponse, getInterviewerIntro } from '../services/geminiService';
import { InterviewFeedback } from '../types';

interface AiInterviewProps {
  onBack: () => void;
}

type InterviewState = 'setup' | 'interview' | 'feedback';
type Gender = 'male' | 'female';

const TOPICS = ['React', 'Node.js', 'System Design', 'Behavioral', 'Web3', 'AI Concepts'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const AiInterview: React.FC<AiInterviewProps> = ({ onBack }) => {
  const [state, setState] = useState<InterviewState>('setup');
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[1]);
  const [selectedGender, setSelectedGender] = useState<Gender>('male');
  
  // Interview Logic State
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  
  // Audio/Voice State
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

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
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel previous speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.rate = 0.95; // Slightly slower for better clarity
      utterance.pitch = selectedGender === 'female' ? 1.1 : 0.9;
      
      // Attempt to find Indian English Voices
      const voices = voicesRef.current;
      let preferredVoice;

      if (selectedGender === 'female') {
          // Try to find Indian Female, fallback to generic Female or English
          preferredVoice = voices.find(v => (v.lang === 'en-IN' || v.lang.includes('IN')) && v.name.includes('Female'));
          if (!preferredVoice) preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
      } else {
          // Try to find Indian Male, fallback to generic Male or English
          preferredVoice = voices.find(v => (v.lang === 'en-IN' || v.lang.includes('IN')) && v.name.includes('Male'));
          if (!preferredVoice) preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel'));
      }
      
      // Absolute fallback if specific gendered Indian voice not found
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
    
    const interviewerName = selectedGender === 'male' ? 'Arjun' : 'Aditi';

    try {
      // Get Persona Introduction
      const introText = await getInterviewerIntro(interviewerName, selectedGender, selectedTopic);
      setCurrentQuestion(introText);
      setIsLoading(false);
      speakText(introText);
    } catch (error) {
      console.error(error);
      alert("Failed to start interview. Check API Key.");
      setState('setup');
    }
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
        const firstQuestion = await getInterviewQuestion(selectedTopic, selectedDifficulty, `User just introduced themselves saying: "${userAnswer}". Acknowledge this politely in Indian English style and ask the first question.`);
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
        const question = await getInterviewQuestion(selectedTopic, selectedDifficulty, currentQuestion);
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

  // Avatar Component
  const Avatar = () => {
      // Determine seed based on gender
      const seed = selectedGender === 'male' ? 'Felix' : 'Aneka';
      const interviewerName = selectedGender === 'male' ? 'Arjun' : 'Aditi';

      return (
        <div className="relative flex flex-col justify-center items-center my-6">
            <div className={`relative w-36 h-36 rounded-full overflow-hidden border-4 transition-all duration-300 ${isSpeaking ? 'border-electric-blue shadow-[0_0_30px_rgba(0,102,255,0.6)] scale-105' : 'border-slate-700'}`}>
                <img 
                    src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`} 
                    alt="AI Interviewer" 
                    className="w-full h-full object-cover bg-slate-800"
                />
            </div>
            <div className="mt-3 bg-slate-800 px-4 py-1 rounded-full border border-slate-700">
                <span className="text-white font-semibold">{interviewerName}</span>
                <span className="text-xs text-muted-gray ml-2">({selectedGender === 'male' ? 'He/Him' : 'She/Her'})</span>
            </div>
            {/* Voice Waves Animation */}
            {isSpeaking && (
                <>
                    <div className="absolute top-0 w-36 h-36 rounded-full border border-electric-blue opacity-50 animate-[ping_1.5s_ease-in-out_infinite]"></div>
                    <div className="absolute top-0 w-36 h-36 rounded-full border border-neon-purple opacity-30 animate-[ping_2s_ease-in-out_infinite_0.5s]"></div>
                </>
            )}
        </div>
      );
  };

  return (
    <div className="animate-slide-in-fade max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </button>

      {state === 'setup' && (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">AI Avatar Interview Training</h1>
            <p className="text-muted-gray">Experience a realistic interview with an Indian context. Choose your interviewer and start practicing.</p>
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
                            <img src="https://api.dicebear.com/8.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" className="w-16 h-16 rounded-full mb-2" alt="Male" />
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
                             <img src="https://api.dicebear.com/8.x/avataaars/svg?seed=Aneka&backgroundColor=b6e3f4" className="w-16 h-16 rounded-full mb-2" alt="Female" />
                            <span className="text-white font-semibold">Aditi</span>
                        </button>
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
                Start Interview Session
            </button>
          </div>
        </div>
      )}

      {state === 'interview' && (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="absolute top-4 right-4 flex gap-2">
                 {isIntroPhase && <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-mono border border-yellow-400/30">Introduction Phase</span>}
                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-muted-gray border border-slate-700">
                    {selectedTopic} • {selectedDifficulty}
                </span>
            </div>

            <Avatar />

            {isLoading && !currentQuestion ? (
                <div className="text-center py-10">
                    <p className="text-electric-blue animate-pulse font-medium">Interviewer is thinking...</p>
                </div>
            ) : (
                <>
                    <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-semibold text-white leading-relaxed">"{currentQuestion}"</h2>
                        <button 
                            onClick={() => speakText(currentQuestion)}
                            className="mt-3 text-xs text-electric-blue hover:text-white transition-colors flex items-center justify-center mx-auto gap-1 opacity-80 hover:opacity-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            Repeat
                        </button>
                    </div>

                    {!feedback ? (
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder={isIntroPhase ? "Introduce yourself (e.g., Hi, I am...)" : "Type your answer or use the microphone..."}
                                    className="w-full h-40 bg-slate-800 border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none resize-none"
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
                            {micError && <p className="text-red-400 text-xs mt-2 text-center">{micError}</p>}

                            <div className="mt-6 flex justify-center">
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
                        <div className="max-w-3xl mx-auto animate-slide-in-bottom">
                            <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-6 relative overflow-hidden">
                                {/* Rating Badge */}
                                <div className="absolute top-0 right-0 p-4 bg-slate-900/50 rounded-bl-xl border-l border-b border-slate-700">
                                    <p className="text-xs text-muted-gray uppercase tracking-widest text-center">Score</p>
                                    <p className={`text-3xl font-bold text-center ${feedback.rating >= 7 ? 'text-green-400' : feedback.rating >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {feedback.rating}/10
                                    </p>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4">Feedback & Remarks</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-aqua-green uppercase tracking-wide mb-1">Content Analysis</h4>
                                        <p className="text-muted-gray">{feedback.feedback}</p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-semibold text-neon-purple uppercase tracking-wide mb-1">Voice Tone (Inferred)</h4>
                                        <p className="text-white italic">"{feedback.toneAnalysis}"</p>
                                    </div>

                                    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                                        <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="M2 12h20"></path><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path><path d="M22 12h-2.22a2 2 0 0 0-1.78 1 2 2 0 0 1-1.78 1h-8.44a2 2 0 0 1-1.78-1 2 2 0 0 0-1.78-1H2"></path></svg>
                                            Suggested Answer
                                        </h4>
                                        <p className="text-sm text-slate-300">{feedback.suggestedImprovement}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={() => setState('setup')}
                                    className="px-6 py-3 border border-slate-600 text-muted-gray font-semibold rounded-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95"
                                >
                                    End Session
                                </button>
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
      )}
    </div>
  );
};

export default AiInterview;
