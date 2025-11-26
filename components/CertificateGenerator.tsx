
import React, { useState, useRef, useEffect } from 'react';
import { Certificate } from '../types';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';
import UpgradeModal from './UpgradeModal';

interface CertificateGeneratorProps {
  onBack: () => void;
  isPro?: boolean;
  onUpgrade?: () => void;
}

type TemplateType = 'modern' | 'classic' | 'minimal';
type SignatureMode = 'draw' | 'type' | 'voice';

const SIGNATURE_FONTS = [
  { name: 'Great Vibes', family: '"Great Vibes", cursive' },
  { name: 'Sacramento', family: '"Sacramento", cursive' },
  { name: 'Allura', family: '"Allura", cursive' },
];

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ onBack, isPro = false, onUpgrade }) => {
  const [recipientName, setRecipientName] = useState('SkillLink User');
  const [courseName, setCourseName] = useState('Introduction to AI Mastery');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [generatedCertificate, setGeneratedCertificate] = useState<Certificate | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Upgrade Modal State for Unlock flow
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Signature State
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].name);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Signature pad refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Signature validation refs (Drawing)
  const strokeLengthRef = useRef<number>(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  // Bounding box for complexity check
  const minXRef = useRef<number>(Infinity);
  const maxXRef = useRef<number>(-Infinity);
  const minYRef = useRef<number>(Infinity);
  const maxYRef = useRef<number>(-Infinity);

  const MIN_SIGNATURE_LENGTH = 150; // Minimum total stroke length in pixels
  const MIN_SIGNATURE_WIDTH = 50;   // Minimum width coverage
  const MIN_SIGNATURE_HEIGHT = 20;  // Minimum height coverage

  useEffect(() => {
    // Initialize drawing canvas context settings when mode is draw
    if (signatureMode === 'draw' && isPro) {
        const canvas = canvasRef.current;
        if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';
        }
        }
    }
  }, [signatureMode, isPro]);

  // Effect to handle Text Signature Generation (Type AND Voice)
  useEffect(() => {
    if ((signatureMode === 'type' || signatureMode === 'voice') && isPro) {
        generateTextSignature();
    }
  }, [typedSignature, selectedFont, signatureMode, isPro]);

  const generateTextSignature = () => {
    if (!typedSignature.trim()) {
        setSignaturePreview(null);
        setHasSignature(false);
        setValidationError(null);
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontObj = SIGNATURE_FONTS.find(f => f.name === selectedFont);
    const fontFamily = fontObj ? fontObj.family : 'cursive';
    const fontSize = 60; 

    // Set font to measure
    ctx.font = `${fontSize}px ${fontFamily}`;
    const textMetrics = ctx.measureText(typedSignature);
    
    // Add padding
    const width = Math.max(textMetrics.width + 40, 300); 
    const height = fontSize * 2.5;

    canvas.width = width;
    canvas.height = height;

    // Redefine context props after resize
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Draw text
    ctx.fillText(typedSignature, width / 2, height / 2);

    const dataUrl = canvas.toDataURL('image/png');
    setSignaturePreview(dataUrl);
    setHasSignature(true);
    setValidationError(null);
  };

  const updateSignaturePreviewDraw = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSignaturePreview(canvas.toDataURL('image/png'));
    }
  };

  const updateBounds = (x: number, y: number) => {
      minXRef.current = Math.min(minXRef.current, x);
      maxXRef.current = Math.max(maxXRef.current, x);
      minYRef.current = Math.min(minYRef.current, y);
      maxYRef.current = Math.max(maxYRef.current, y);
  };

  const validateDrawSignature = (): string | null => {
    const width = maxXRef.current - minXRef.current;
    const height = maxYRef.current - minYRef.current;

    if (strokeLengthRef.current < MIN_SIGNATURE_LENGTH) {
        return "Signature is too short/simple. Please provide a full signature.";
    }
    if (!isFinite(width) || !isFinite(height) || width < MIN_SIGNATURE_WIDTH || height < MIN_SIGNATURE_HEIGHT) {
         return "Signature is too small. Please ensure your signature is clearly visible.";
    }
    return null;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPro) return;
    setIsDrawing(true);
    setValidationError(null); // Clear errors when user starts drawing/fixing
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    lastPointRef.current = { x: offsetX, y: offsetY };
    updateBounds(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isPro) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    updateBounds(offsetX, offsetY);

    // Calculate distance for validation
    if (lastPointRef.current) {
        const dx = offsetX - lastPointRef.current.x;
        const dy = offsetY - lastPointRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        strokeLengthRef.current += distance;
    }
    lastPointRef.current = { x: offsetX, y: offsetY };

    if (!hasSignature) setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.closePath();
        lastPointRef.current = null;
        updateSignaturePreviewDraw();

        // Validate on stop
        const error = validateDrawSignature();
        setValidationError(error);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const clearSignature = () => {
    if (signatureMode === 'draw') {
        const canvas = canvasRef.current;
        if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasSignature(false);
            setSignaturePreview(null);
            setValidationError(null);
            
            // Reset validation metrics
            strokeLengthRef.current = 0;
            lastPointRef.current = null;
            minXRef.current = Infinity;
            maxXRef.current = -Infinity;
            minYRef.current = Infinity;
            maxYRef.current = -Infinity;
        }
        }
    } else {
        setTypedSignature('');
        setSignaturePreview(null);
        setHasSignature(false);
        setValidationError(null);
    }
  };
  
  const startListening = () => {
    if (!isPro) return;
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Capitalize first letters for name-like appearance
      const formattedName = transcript.replace(/\b\w/g, (char: string) => char.toUpperCase());
      setTypedSignature(formattedName);
      setValidationError(null);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError("Microphone access denied.");
      } else {
          setVoiceError("Could not recognize speech. Please try again.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };


  const getDisplayDate = () => {
    if (!date) return '';
    try {
        const dateObj = new Date(`${date}T${time || '00:00'}`);
        if (isNaN(dateObj.getTime())) return date;
        // Use toLocaleString to ensure time is included
        return dateObj.toLocaleString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });
    } catch (e) {
        return date;
    }
  };

  const handleGenerate = () => {
    if (!isPro) return;
    let error = null;

    if (!hasSignature) {
        setValidationError(signatureMode === 'draw' ? "Please sign the certificate first!" : "Please provide a signature.");
        return;
    }

    if (signatureMode === 'draw') {
        error = validateDrawSignature();
    } else {
        if (typedSignature.trim().length < 3) {
            error = "Signature is too short.";
        }
    }

    if (error) {
        setValidationError(error);
        return;
    }

    // Use the signaturePreview (Data URL) directly for both modes
    if (signaturePreview) {
      const newCert: Certificate = {
        id: Math.random().toString(36).substr(2, 9),
        recipientName,
        courseName,
        date: getDisplayDate(),
        signatureImage: signaturePreview
      };
      setGeneratedCertificate(newCert);
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    
    try {
        // Wait a small tick to ensure rendering is stable
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(certificateRef.current, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // For cross-origin images
            backgroundColor: '#ffffff', // Ensure white background
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Use jsPDF
        // landscape, points/pixels, dimensions
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        // Clean filename
        const safeName = (generatedCertificate?.recipientName || 'Certificate').replace(/[^a-z0-9]/gi, '_');
        pdf.save(`SkillLink_Certificate_${safeName}.pdf`);
        
        // Feedback
        alert("Certificate downloaded successfully!");

    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Could not generate PDF. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  // Render logic based on template
  const renderCertificateContent = (rName: string, cName: string, dDate: string, sigUrl: string | null, template: TemplateType) => {
    switch (template) {
      case 'classic':
        return (
          <div className="relative w-full bg-[#FFF8E1] text-[#2c1a0e] p-8 sm:p-12 shadow-2xl border-8 border-double border-[#854d0e] text-center overflow-hidden aspect-[1.414/1] flex flex-col justify-between font-serif">
             {/* Decorative Corner Elements */}
             <div className="absolute top-4 left-4 w-20 h-20 border-t-2 border-l-2 border-[#854d0e] rounded-tl-3xl opacity-60"></div>
             <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-[#854d0e] rounded-tr-3xl opacity-60"></div>
             <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-[#854d0e] rounded-bl-3xl opacity-60"></div>
             <div className="absolute bottom-4 right-4 w-20 h-20 border-b-2 border-r-2 border-[#854d0e] rounded-br-3xl opacity-60"></div>

             {/* Header */}
             <div className="mt-4">
                <div className="inline-block border-b-2 border-[#854d0e] pb-2 mb-2">
                   <h2 className="text-4xl sm:text-6xl font-extrabold tracking-widest text-[#713f12] uppercase font-serif">Certificate</h2>
                </div>
                <p className="text-xl italic text-[#92400e] mt-2">of Achievement</p>
             </div>

             {/* Content */}
             <div className="flex-grow flex flex-col justify-center my-6">
                <p className="text-lg sm:text-xl text-gray-700 italic mb-6">This certificate is proudly presented to</p>
                
                <h3 className="text-3xl sm:text-5xl font-bold text-[#451a03] font-serif border-b border-gray-400 inline-block mx-auto px-10 pb-2 mb-8 italic">
                    {rName || "Recipient Name"}
                </h3>

                <p className="text-lg sm:text-xl text-gray-700 italic mb-6">For the successful completion of the course</p>

                <h4 className="text-2xl sm:text-3xl font-bold text-[#713f12] uppercase tracking-wide">
                    {cName || "Course Name"}
                </h4>
             </div>

             {/* Footer with Seal */}
             <div className="flex justify-between items-end px-4 sm:px-12 pb-4 relative">
                 <div className="text-center z-10">
                     <p className="text-lg font-bold text-[#451a03] border-t-2 border-[#854d0e] pt-2 px-6">{dDate}</p>
                     <p className="text-xs uppercase tracking-widest text-[#92400e] mt-1">Date & Time</p>
                 </div>
                 
                 {/* Gold Seal Effect */}
                 <div className="absolute left-1/2 bottom-6 transform -translate-x-1/2 text-[#ca8a04] opacity-20 sm:opacity-90">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
                    </svg>
                 </div>

                 <div className="text-center z-10">
                    <div className="flex flex-col items-center justify-end h-16 mb-1">
                         {sigUrl ? <img src={sigUrl} alt="Signature" className="max-h-16 max-w-[200px] object-contain" /> : null}
                    </div>
                     <div className="h-0.5 w-40 bg-[#854d0e] mx-auto"></div>
                     <p className="text-xs uppercase tracking-widest text-[#92400e] mt-1">Authorized Signature</p>
                 </div>
             </div>
          </div>
        );
      
      case 'minimal':
        return (
          <div className="relative w-full bg-white text-slate-900 p-10 sm:p-16 shadow-2xl border border-slate-200 overflow-hidden aspect-[1.414/1] flex flex-col justify-between font-sans">
             {/* Simple Accent Bar */}
             <div className="absolute top-0 left-0 bottom-0 w-3 sm:w-6 bg-slate-900"></div>

             <div className="ml-6 sm:ml-10">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-slate-400 mb-2">SkillLink Certification</h2>
                        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900">Certificate of<br/><span className="font-bold">Completion</span></h1>
                    </div>
                    {/* Minimal Logo Placeholder */}
                    <div className="w-12 h-12 border-2 border-slate-900 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold">S</span>
                    </div>
                 </div>

                 <div className="mt-16 sm:mt-24">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Presented to</p>
                    <h3 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                       {rName || "Recipient Name"}
                    </h3>
                 </div>

                 <div className="mt-8">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">For Course</p>
                    <h4 className="text-2xl sm:text-3xl font-medium text-slate-800">
                       {cName || "Course Name"}
                    </h4>
                 </div>
             </div>

             <div className="ml-6 sm:ml-10 flex gap-12 sm:gap-24 items-end mt-auto">
                 <div>
                     <p className="text-lg font-mono text-slate-900">{dDate}</p>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Date & Time</p>
                 </div>
                 <div>
                    <div className="h-12 flex items-end mb-2">
                        {sigUrl ? <img src={sigUrl} alt="Signature" className="max-h-full max-w-[150px] object-contain" /> : null}
                    </div>
                     <div className="w-48 h-px bg-slate-300"></div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Signature</p>
                 </div>
             </div>
          </div>
        );

      case 'modern':
      default:
        return (
          <div className="relative w-full bg-white text-slate-800 rounded-xl overflow-hidden shadow-2xl aspect-[1.414/1] flex flex-row">
            {/* Sidebar Gradient */}
            <div className="w-1/4 h-full bg-gradient-to-b from-[#0066FF] to-[#8B5CF6] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-20"></div>
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/30 flex items-center justify-center mb-6">
                    <span className="text-white text-2xl sm:text-4xl font-bold">SL</span>
                </div>
                <div className="text-center text-white/90">
                    <p className="text-xs uppercase tracking-widest mb-1">Verified By</p>
                    <p className="font-bold tracking-wider">SKILLLINK</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-3/4 p-8 sm:p-12 flex flex-col justify-center relative bg-white">
                {/* Background Watermark */}
                 <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                    <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor" className="transform translate-x-1/3 translate-y-1/3 text-slate-900">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                 </div>

                <div className="mb-2">
                    <h6 className="text-[#0066FF] font-bold tracking-widest uppercase text-sm sm:text-base mb-2">Certificate of Completion</h6>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Congratulations</h1>
                </div>

                <div className="my-8 sm:my-12">
                    <p className="text-slate-500 font-medium">This document certifies that</p>
                    <h2 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] py-2">
                        {rName || "Recipient Name"}
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">has demonstrated mastery in the topic</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 border-l-4 border-[#8B5CF6] pl-4">
                        {cName || "Course Name"}
                    </h3>
                </div>

                <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-6">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Date & Time</p>
                        <p className="text-lg font-semibold text-slate-700">{dDate}</p>
                    </div>
                    <div className="text-right">
                         <div className="flex justify-end mb-2 h-10">
                            {sigUrl ? <img src={sigUrl} alt="Signature" className="max-h-full max-w-[140px] object-contain" /> : null}
                         </div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Instructor Signature</p>
                    </div>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-slide-in-fade max-w-6xl mx-auto relative">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      {/* Locked Overlay for Non-Pro Users */}
      {!isPro && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-dark-slate/80 backdrop-blur-sm rounded-2xl mt-12">
            <div className="text-center p-8 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg animate-pop-in">
                <div className="flex justify-center mb-4">
                    <span className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Premium Feature</h2>
                <p className="text-muted-gray mb-6">Upgrade to SkillLink Pro to generate unlimited verified certificates, access AI interviews, and more.</p>
                <button 
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="px-8 py-3 bg-gradient-to-r from-aqua-green to-neon-purple text-white font-bold rounded-lg shadow-lg hover:shadow-neon-purple/40 transition-all transform hover:scale-105 active:scale-95"
                >
                    Unlock Now
                </button>
            </div>
        </div>
      )}

      <div className={`bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-electric-blue/10 ${!isPro ? 'filter blur-sm pointer-events-none select-none opacity-50' : ''}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-electric-blue/20 text-electric-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Certificate Generator</h1>
            <p className="text-muted-gray">Create, sign, and preview official certificates.</p>
          </div>
        </div>

        {!generatedCertificate ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Form & Signature */}
            <div className="space-y-6">
              <div className="space-y-4">
                 <div>
                  <label className="block text-sm font-medium text-muted-gray mb-2">Select Template</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['modern', 'classic', 'minimal'].map((template) => (
                      <button
                        key={template}
                        onClick={() => setSelectedTemplate(template as TemplateType)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all active:scale-95 border-2 ${
                          selectedTemplate === template
                            ? 'bg-electric-blue/20 border-electric-blue text-white'
                            : 'bg-slate-800 border-slate-700 text-muted-gray hover:border-slate-500'
                        }`}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-gray mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-gray mb-1">Course Name</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-gray mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-gray mb-1">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-muted-gray">Digital Signature</label>
                    {/* Signature Mode Toggle */}
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                        <button
                            onClick={() => { setSignatureMode('draw'); setValidationError(null); }}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all active:scale-95 ${signatureMode === 'draw' ? 'bg-electric-blue text-white shadow-sm' : 'text-muted-gray hover:text-white'}`}
                        >
                            Draw
                        </button>
                        <button
                             onClick={() => { setSignatureMode('type'); setValidationError(null); }}
                             className={`px-3 py-1 text-xs font-medium rounded-md transition-all active:scale-95 ${signatureMode === 'type' ? 'bg-electric-blue text-white shadow-sm' : 'text-muted-gray hover:text-white'}`}
                        >
                            Type
                        </button>
                         <button
                             onClick={() => { setSignatureMode('voice'); setValidationError(null); }}
                             className={`px-3 py-1 text-xs font-medium rounded-md transition-all active:scale-95 flex items-center gap-1 ${signatureMode === 'voice' ? 'bg-electric-blue text-white shadow-sm' : 'text-muted-gray hover:text-white'}`}
                        >
                            Voice
                        </button>
                    </div>
                </div>

                {signatureMode === 'draw' && (
                     <div className="relative group">
                         {/* Drawing Area */}
                        <div className={`border rounded-lg overflow-hidden bg-white touch-none shadow-inner transition-colors ${validationError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'}`}>
                        <canvas
                            ref={canvasRef}
                            width={400}
                            height={150}
                            className="w-full h-auto cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        </div>
                         {/* Tooltip for Draw Mode */}
                         <div className="absolute top-2 right-2 group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 cursor-help opacity-50 hover:opacity-100 transition-opacity"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-muted-gray hidden group-hover:block z-10 pointer-events-none">
                                <p className="font-semibold text-white mb-1">Validity Guidelines:</p>
                                <ul className="list-disc list-inside space-y-1 text-slate-400">
                                    <li>Sign your full name</li>
                                    <li>Avoid simple lines or dots</li>
                                    <li>Cover enough space</li>
                                </ul>
                            </div>
                        </div>
                     </div>
                )}
                
                {signatureMode === 'type' && (
                    <div className="space-y-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                        {/* Typing Area */}
                        <div>
                             <input
                                type="text"
                                value={typedSignature}
                                onChange={(e) => setTypedSignature(e.target.value)}
                                placeholder="Type your full name..."
                                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition font-serif text-lg ${validationError ? 'border-red-500' : 'border-slate-600'}`}
                             />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-gray mb-2">Select Signature Style</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {SIGNATURE_FONTS.map((font) => (
                                    <button
                                        key={font.name}
                                        onClick={() => setSelectedFont(font.name)}
                                        className={`px-2 py-3 rounded border text-center transition-all active:scale-95 ${
                                            selectedFont === font.name 
                                            ? 'bg-white text-black border-electric-blue ring-2 ring-electric-blue/30' 
                                            : 'bg-slate-900 text-muted-gray border-slate-600 hover:border-slate-400'
                                        }`}
                                        style={{ fontFamily: font.family }}
                                    >
                                        <span className="text-lg">{font.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {signatureMode === 'voice' && (
                    <div className="space-y-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
                        <div className="flex flex-col items-center justify-center py-4">
                            <button
                                onClick={startListening}
                                disabled={isListening}
                                className={`p-6 rounded-full transition-all active:scale-95 transform hover:scale-105 ${
                                    isListening 
                                    ? 'bg-red-500/20 text-red-500 ring-4 ring-red-500/20 animate-pulse' 
                                    : 'bg-electric-blue/20 text-electric-blue hover:bg-electric-blue hover:text-white'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                            </button>
                            <p className="mt-3 text-sm font-medium text-white">
                                {isListening ? 'Listening...' : (typedSignature ? 'Tap to Record Again' : 'Tap to Speak Name')}
                            </p>
                            {voiceError && <p className="text-xs text-red-400 mt-2">{voiceError}</p>}
                        </div>

                        {typedSignature && (
                            <div className="animate-fade-in text-left border-t border-slate-700 pt-4 w-full">
                                <label className="block text-xs font-medium text-muted-gray mb-2">Recognized Text (Editable)</label>
                                 <input
                                    type="text"
                                    value={typedSignature}
                                    onChange={(e) => setTypedSignature(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg bg-slate-900 border text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition font-serif text-lg ${validationError ? 'border-red-500' : 'border-slate-600'}`}
                                 />
                                 
                                 <div className="mt-4">
                                    <label className="block text-xs font-medium text-muted-gray mb-2">Select Signature Style</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {SIGNATURE_FONTS.map((font) => (
                                            <button
                                                key={font.name}
                                                onClick={() => setSelectedFont(font.name)}
                                                className={`px-2 py-3 rounded border text-center transition-all active:scale-95 ${
                                                    selectedFont === font.name 
                                                    ? 'bg-white text-black border-electric-blue ring-2 ring-electric-blue/30' 
                                                    : 'bg-slate-900 text-muted-gray border-slate-600 hover:border-slate-400'
                                                }`}
                                                style={{ fontFamily: font.family }}
                                            >
                                                <span className="text-lg">{font.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                <div className="flex justify-between items-start text-sm mt-1">
                   <div className="flex-1 mr-4">
                       {validationError ? (
                           <span className="block text-red-400 text-xs font-semibold animate-pulse">{validationError}</span>
                       ) : (
                           <span className="block text-muted-gray text-xs">
                                {signatureMode === 'draw' ? 'Draw inside the box.' : (signatureMode === 'voice' ? 'Speak clearly to sign.' : 'Type your name above.')}
                           </span>
                       )}
                   </div>
                  <button 
                    onClick={clearSignature}
                    className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 hover:text-red-300 transition-all active:scale-95"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!hasSignature || !!validationError}
                className="w-full mt-4 px-6 py-4 font-semibold rounded-lg text-white bg-gradient-to-r from-electric-blue to-neon-purple shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Generate Final Certificate
              </button>
            </div>

            {/* Right Column: Live Preview */}
            <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    Live Preview
                </h3>
                <div className="sticky top-24">
                    {renderCertificateContent(recipientName, courseName, getDisplayDate(), signaturePreview, selectedTemplate)}
                    <p className="text-center text-muted-gray text-xs mt-4">
                        This is a preview. Fill out the details and sign to see updates in real-time.
                    </p>
                </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fade-in">
             <div className="w-full max-w-3xl" ref={certificateRef}>
                {renderCertificateContent(
                    generatedCertificate.recipientName, 
                    generatedCertificate.courseName, 
                    generatedCertificate.date, 
                    generatedCertificate.signatureImage,
                    selectedTemplate
                )}
             </div>

             <div className="mt-8 flex gap-4">
               <button
                  onClick={() => {
                      setGeneratedCertificate(null);
                      // Don't clear signature state so they can edit easily
                  }}
                  className="px-6 py-2.5 font-medium text-muted-gray bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-white transition-all active:scale-95"
               >
                  Edit Details
               </button>
               <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`px-6 py-2.5 font-bold text-white bg-green-600 rounded-lg shadow-lg transition-all transform active:scale-95 ${isDownloading ? 'opacity-75 cursor-wait' : 'hover:bg-green-700 hover:-translate-y-1'}`}
               >
                  {isDownloading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating PDF...
                    </span>
                  ) : (
                     'Download PDF'
                  )}
               </button>
             </div>
          </div>
        )}
      </div>
      {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={onUpgrade} />}
    </div>
  );
};

export default CertificateGenerator;
