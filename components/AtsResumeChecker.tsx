
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { analyzeResume } from '../services/geminiService';
import { AtsAnalysis } from '../types';

interface AtsResumeCheckerProps {
  onBack: () => void;
}

type InputMode = 'text' | 'file';

const AtsResumeChecker: React.FC<AtsResumeCheckerProps> = ({ onBack }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ name: string, base64: string } | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsAnalysis | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
          alert('Please upload a PDF file.');
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          const result = event.target?.result as string;
          // Extract base64 part (remove "data:application/pdf;base64," prefix)
          const base64 = result.split(',')[1];
          setResumeFile({
              name: file.name,
              base64: base64
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
        alert("Please enter a Job Description.");
        return;
    }

    if (inputMode === 'text' && !resumeText.trim()) {
        alert("Please paste your resume text.");
        return;
    }

    if (inputMode === 'file' && !resumeFile) {
        alert("Please upload a PDF resume.");
        return;
    }
    
    setIsAnalyzing(true);
    try {
        let resumeContent;
        if (inputMode === 'file' && resumeFile) {
            resumeContent = {
                type: 'file' as const,
                data: resumeFile.base64,
                mimeType: 'application/pdf'
            };
        } else {
            resumeContent = {
                type: 'text' as const,
                content: resumeText
            };
        }

        const analysis = await analyzeResume(jobDescription, resumeContent);
        setResult(analysis);
        setShowModal(true);
    } catch (error) {
        console.error(error);
        alert("Failed to analyze resume. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-500';
    if (score >= 60) return 'text-yellow-400 border-yellow-500';
    return 'text-red-400 border-red-500';
  };

  return (
    <div className="animate-slide-in-fade max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">ATS Resume Checker</h1>
        <p className="text-muted-gray">Optimize your resume for Applicant Tracking Systems with AI-powered analysis.</p>
      </div>

      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-electric-blue/20 text-electric-blue p-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </span>
                Job Description (JD)
            </h2>
            <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-40 bg-slate-800 border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none resize-none mb-6"
            />

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="bg-neon-purple/20 text-neon-purple p-1.5 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </span>
                    Resume
                </h2>
                <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex">
                    <button
                        onClick={() => setInputMode('text')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all active:scale-95 ${inputMode === 'text' ? 'bg-neon-purple text-white shadow-sm' : 'text-muted-gray hover:text-white'}`}
                    >
                        Paste Text
                    </button>
                    <button
                        onClick={() => setInputMode('file')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all active:scale-95 ${inputMode === 'file' ? 'bg-neon-purple text-white shadow-sm' : 'text-muted-gray hover:text-white'}`}
                    >
                        Upload PDF
                    </button>
                </div>
            </div>

            {inputMode === 'text' ? (
                <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste the text content of your resume here..."
                    className="w-full h-40 bg-slate-800 border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none resize-none"
                />
            ) : (
                <div className="w-full h-40 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center p-4 transition-colors hover:border-neon-purple hover:bg-slate-800/80">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="application/pdf"
                        className="hidden" 
                    />
                    
                    {!resumeFile ? (
                        <>
                            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-gray mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <p className="text-sm text-white font-medium">Click to Upload PDF</p>
                                <p className="text-xs text-muted-gray mt-1">Max file size 5MB</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neon-purple mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                             <p className="text-sm text-white font-medium truncate max-w-[200px]">{resumeFile.name}</p>
                             <button 
                                onClick={() => {
                                    setResumeFile(null);
                                    if(fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                             >
                                Remove
                             </button>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobDescription || (inputMode === 'text' ? !resumeText : !resumeFile)}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-electric-blue to-neon-purple text-white font-bold rounded-xl shadow-lg hover:shadow-electric-blue/25 transition-all transform hover:-translate-y-1 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isAnalyzing ? (
                     <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Analyzing Resume...
                     </>
                ) : 'Run ATS Scan'}
            </button>
      </div>

      {/* Result Modal */}
      {showModal && result && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={() => setShowModal(false)}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-pop-in"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-muted-gray hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">📊</span> Analysis Results
                </h2>

                {/* Score Card */}
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-700 pb-6 mb-6">
                        <div className={`relative w-28 h-28 flex-shrink-0 rounded-full border-4 flex items-center justify-center shadow-lg ${getScoreColor(result.matchScore)}`}>
                        <span className="text-4xl font-extrabold">{result.matchScore}%</span>
                        <div className="absolute -bottom-3 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs text-muted-gray uppercase tracking-widest font-bold">Match</div>
                        </div>
                        <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-white">Summary</h3>
                        <p className="text-sm text-muted-gray mt-2 leading-relaxed">{result.summary}</p>
                        </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                     {/* Missing Keywords */}
                    <div>
                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                             Missing Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {result.missingKeywords.length > 0 ? (
                                result.missingKeywords.map((kw, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded-full text-xs font-medium">
                                        {kw}
                                    </span>
                                ))
                            ) : (
                                <p className="text-green-400 text-sm">Great job! No major keywords missing.</p>
                            )}
                        </div>
                    </div>

                     {/* Tips */}
                    <div>
                         <h3 className="text-sm font-bold text-aqua-green uppercase tracking-widest mb-3 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                             Actionable Tips
                        </h3>
                        <ul className="space-y-3">
                            {result.improvementTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 bg-slate-700/30 p-3 rounded-lg">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-aqua-green flex-shrink-0"></span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Formatting Issues */}
                    {result.formattingIssues.length > 0 && (
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                             <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">Formatting Check</h3>
                             <ul className="space-y-1">
                                {result.formattingIssues.map((issue, idx) => (
                                    <li key={idx} className="text-xs text-muted-gray">• {issue}</li>
                                ))}
                            </ul>
                        </div>
                     )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all active:scale-95"
                    >
                        Close Results
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AtsResumeChecker;
