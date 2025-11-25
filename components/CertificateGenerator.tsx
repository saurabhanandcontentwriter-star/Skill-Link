
import React, { useState, useRef, useEffect } from 'react';
import { Certificate } from '../types';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';

interface CertificateGeneratorProps {
  onBack: () => void;
}

type TemplateType = 'modern' | 'classic' | 'minimal';

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ onBack }) => {
  const [recipientName, setRecipientName] = useState('SkillLink User');
  const [courseName, setCourseName] = useState('Introduction to AI Mastery');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatedCertificate, setGeneratedCertificate] = useState<Certificate | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Signature pad refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Signature validation refs
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
    // Initialize canvas context settings
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
      }
    }
  }, []);

  const updateSignaturePreview = () => {
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

  const validateSignature = (): string | null => {
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
    if (!isDrawing) return;
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
        updateSignaturePreview();

        // Validate on stop
        const error = validateSignature();
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
  };

  const handleGenerate = () => {
    if (!hasSignature) {
      setValidationError("Please sign the certificate first!");
      return;
    }

    const error = validateSignature();
    if (error) {
        setValidationError(error);
        return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL('image/png');
      const newCert: Certificate = {
        id: Math.random().toString(36).substr(2, 9),
        recipientName,
        courseName,
        date,
        signatureImage: signatureData
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
          <div className="relative w-full bg-[#fdfbf7] text-[#1f2937] p-6 sm:p-10 rounded-sm shadow-xl border-[12px] border-double border-[#b45309] text-center overflow-hidden aspect-[1.414/1] flex flex-col justify-center font-serif">
             {/* Ornate corners */}
             <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-[#b45309]"></div>
             <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-[#b45309]"></div>
             <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-[#b45309]"></div>
             <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-[#b45309]"></div>

             <div className="mb-4">
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#78350f] uppercase mb-2">Certificate</h2>
                <span className="text-lg italic text-[#92400e]">of Completion</span>
             </div>

             <p className="text-base sm:text-lg mb-4">This certifies that</p>
             
             <h3 className="text-3xl sm:text-4xl font-bold text-[#1f2937] border-b border-[#b45309] inline-block px-8 pb-2 mb-6 mx-auto font-serif italic">
                 {rName || "Recipient Name"}
             </h3>

             <p className="text-base sm:text-lg mb-4">has successfully completed the curriculum for</p>

             <h4 className="text-2xl sm:text-3xl font-bold text-[#78350f] mb-8">
                 {cName || "Course Name"}
             </h4>

             <div className="flex justify-between items-end mt-4 px-4 sm:px-16">
                 <div className="flex flex-col items-center">
                     <span className="text-lg font-semibold border-t border-gray-400 pt-2 px-6">{dDate}</span>
                     <span className="text-xs uppercase tracking-wider text-gray-500 mt-1">Date</span>
                 </div>
                 <div className="flex flex-col items-center">
                    {sigUrl ? <img src={sigUrl} alt="Signature" className="h-12 mb-[-10px]" /> : <div className="h-12"></div>}
                     <span className="text-lg font-semibold border-t border-gray-400 pt-2 px-6 min-w-[150px]"></span>
                     <span className="text-xs uppercase tracking-wider text-gray-500 mt-1">Signature</span>
                 </div>
             </div>
          </div>
        );
      
      case 'minimal':
        return (
          <div className="relative w-full bg-white text-slate-900 p-8 sm:p-14 shadow-xl border border-slate-200 text-left overflow-hidden aspect-[1.414/1] flex flex-col justify-center font-sans">
             <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>
             
             <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black mb-1">CERTIFICATE</h2>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Of Achievement</p>
             </div>

             <div className="mb-8">
                <p className="text-sm text-slate-500 mb-2 uppercase tracking-wide">Presented To</p>
                <h3 className="text-3xl sm:text-5xl font-light text-black">
                   {rName || "Recipient Name"}
                </h3>
             </div>

             <div className="mb-12">
                <p className="text-sm text-slate-500 mb-2 uppercase tracking-wide">For Completing</p>
                <h4 className="text-xl sm:text-2xl font-medium text-black">
                   {cName || "Course Name"}
                </h4>
             </div>

             <div className="flex justify-start gap-16 items-end mt-auto">
                 <div>
                     <p className="text-sm font-medium text-black">{dDate}</p>
                     <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Date</p>
                 </div>
                 <div>
                    {sigUrl ? <img src={sigUrl} alt="Signature" className="h-10 mb-[-5px]" /> : <div className="h-10"></div>}
                     <div className="w-40 border-b border-black"></div>
                     <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Instructor Signature</p>
                 </div>
             </div>
          </div>
        );

      case 'modern':
      default:
        return (
          <div className="relative w-full bg-white text-dark-slate p-6 sm:p-10 rounded-lg shadow-xl border-4 border-double border-electric-blue text-center overflow-hidden aspect-[1.414/1] flex flex-col justify-center">
            {/* Certificate Border Decorations */}
            <div className="absolute top-0 left-0 w-12 sm:w-20 h-12 sm:h-20 border-t-4 sm:border-t-8 border-l-4 sm:border-l-8 border-neon-purple rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-12 sm:w-20 h-12 sm:h-20 border-t-4 sm:border-t-8 border-r-4 sm:border-r-8 border-neon-purple rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-12 sm:w-20 h-12 sm:h-20 border-b-4 sm:border-b-8 border-l-4 sm:border-l-8 border-neon-purple rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-12 sm:w-20 h-12 sm:h-20 border-b-4 sm:border-b-8 border-r-4 sm:border-r-8 border-neon-purple rounded-br-lg"></div>

            <div className="mb-2 sm:mb-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark-slate tracking-wider uppercase mb-1 sm:mb-2">Certificate</h2>
                <span className="text-xs sm:text-lg text-electric-blue font-semibold tracking-widest uppercase">of Achievement</span>
            </div>

            <p className="text-sm sm:text-base text-gray-500 mb-1 sm:mb-2 font-serif italic">This is to certify that</p>
            
            <h3 className="text-xl sm:text-3xl font-bold text-dark-slate mb-2 sm:mb-6 border-b-2 border-gray-300 inline-block px-6 sm:px-12 pb-1 sm:pb-2 font-serif break-words max-w-full">
                {rName || "Recipient Name"}
            </h3>

            <p className="text-sm sm:text-base text-gray-500 mb-1 sm:mb-2 font-serif italic">has successfully completed the course</p>

            <h4 className="text-lg sm:text-2xl font-bold text-neon-purple mb-4 sm:mb-8 font-serif break-words max-w-full">
                {cName || "Course Name"}
            </h4>

            <div className="flex justify-between items-end mt-4 sm:mt-8 px-2 sm:px-10">
                <div className="flex flex-col items-center">
                    <span className="text-xs sm:text-base font-bold text-dark-slate border-t border-gray-400 pt-1 sm:pt-2 px-4 sm:px-8">{dDate}</span>
                    <span className="text-xs sm:text-lg text-gray-500 mt-1 uppercase tracking-wide">Date</span>
                </div>
                
                <div className="flex flex-col items-center">
                    {sigUrl ? (
                        <img src={sigUrl} alt="Signature" className="h-8 sm:h-12 mb-[-5px] sm:mb-[-10px]" />
                    ) : (
                        <div className="h-8 sm:h-12"></div>
                    )}
                    <span className="text-xs sm:text-base font-bold text-dark-slate border-t border-gray-400 pt-1 sm:pt-2 px-4 sm:px-8 min-w-[80px] sm:min-w-[150px]"></span>
                    <span className="text-[10px] sm:text-xs text-gray-500 mt-1 uppercase tracking-wide">Signature</span>
                </div>
            </div>

            {/* Watermark/Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-80 sm:h-80 fill-current text-dark-slate">
                    <path d="M100 20l30 80 80 10-60 50 20 80-70-50-70 50 20-80-60-50 80-10z" />
                </svg>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-slide-in-fade max-w-6xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </button>

      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-electric-blue/10">
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
                        className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all border-2 ${
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
                <div>
                  <label className="block text-sm font-medium text-muted-gray mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-medium text-muted-gray">Digital Signature</label>
                    <div className="relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-gray cursor-help opacity-70 hover:opacity-100 transition-opacity"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-muted-gray hidden group-hover:block z-10 pointer-events-none">
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
                            <p className="font-semibold text-white mb-1">Validity Guidelines:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-400">
                                <li>Sign your full name</li>
                                <li>Avoid simple lines or dots</li>
                                <li>Cover enough space (width/height)</li>
                            </ul>
                        </div>
                    </div>
                </div>
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
                <div className="flex justify-between items-start text-sm">
                   <div>
                       {validationError ? (
                           <span className="block text-red-400 text-xs font-semibold animate-pulse">{validationError}</span>
                       ) : (
                           <span className="block text-muted-gray text-xs mb-1">Draw your full signature inside the box.</span>
                       )}
                   </div>
                  <button 
                    onClick={clearSignature}
                    className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 hover:text-red-300 transition-colors"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!hasSignature || !!validationError}
                className="w-full mt-4 px-6 py-4 font-semibold rounded-lg text-white bg-gradient-to-r from-electric-blue to-neon-purple shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                    {renderCertificateContent(recipientName, courseName, date, signaturePreview, selectedTemplate)}
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
                      setHasSignature(false);
                      setValidationError(null);
                      // Keep form data so they can edit
                  }}
                  className="px-6 py-2.5 font-medium text-muted-gray bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
               >
                  Edit Details
               </button>
               <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`px-6 py-2.5 font-bold text-white bg-green-600 rounded-lg shadow-lg transition-all transform ${isDownloading ? 'opacity-75 cursor-wait' : 'hover:bg-green-700 hover:-translate-y-1'}`}
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
    </div>
  );
};

export default CertificateGenerator;
