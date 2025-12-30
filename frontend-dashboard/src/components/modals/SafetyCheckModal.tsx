import { useState, useEffect, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { ScanFace, CheckCircle, ShieldAlert, Loader2, X, Eye } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: string;
  onSuccess: (status: 'SAFE' | 'AT_RISK') => void;
}

export const SafetyCheckModal = ({ isOpen, onClose, workerId, onSuccess }: SafetyCheckModalProps) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState<'SCANNING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('SCANNING');
  const [timeLeft, setTimeLeft] = useState(20);
  const [currentDetections, setCurrentDetections] = useState<string[]>([]);
  const [missingGear, setMissingGear] = useState<string[]>([]);

  const [helmetFrames, setHelmetFrames] = useState(0);
  const [vestFrames, setVestFrames] = useState(0);
  const [, setPersonFrames] = useState(0);

  const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY;
  const MODEL_ID = import.meta.env.VITE_ROBOFLOW_MODEL || "construction-site-safety-v5wfl/1";
  const MODEL_ENDPOINT = `https://serverless.roboflow.com/${MODEL_ID}`;

  useEffect(() => {
    if (!API_KEY && isOpen) {
        console.error("❌ Configuration Error: VITE_ROBOFLOW_API_KEY is missing.");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || status !== 'SCANNING') return;

    if (timeLeft <= 0) {
        finalizeAnalysis();
        return;
    }

    const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isOpen, status]);

  useEffect(() => {
    let intervalId: any;

    const detectFrame = async () => {
      if (status !== 'SCANNING') return;

      if (webcamRef.current && webcamRef.current.getScreenshot) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        try {
          const response = await axios({
            method: "POST",
            url: MODEL_ENDPOINT,
            params: { api_key: API_KEY, confidence: 0.4 },
            data: imageSrc,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          });

          const predictions = response.data.predictions;

          drawBoxes(predictions);
          
          processPredictions(predictions);

        } catch (err) {
          console.error("AI Error:", err);
        }
      }
    };

    if (isOpen && status === 'SCANNING') {
        intervalId = setInterval(detectFrame, 500); 
    }

    return () => clearInterval(intervalId);
  }, [isOpen, status]);


  const drawBoxes = (predictions: any[]) => {
      const canvas = canvasRef.current;
      const video = webcamRef.current?.video;
      if (!canvas || !video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const seenItems: string[] = [];

      predictions.forEach((p: any) => {
        const label = p.class.toLowerCase();
        seenItems.push(`${p.class} (${(p.confidence * 100).toFixed(0)}%)`);

        let color = '#3b82f6';
        if (label.includes('helmet') || label.includes('hard') || label.includes('vest')) {
            color = '#22c55e';
        } else if (label.includes('no-') || label.includes('head')) {
            color = '#ef4444';
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);

        ctx.fillStyle = color;
        ctx.font = "bold 16px Arial";
        ctx.fillText(
          p.class, 
          p.x - p.width / 2, 
          p.y - p.height / 2 - 10
        );
      });

      setCurrentDetections(seenItems);
  };


  const processPredictions = (predictions: any[]) => {
      predictions.forEach((p: any) => {
          const label = p.class.toLowerCase();
          
          if (label === 'person') setPersonFrames(prev => prev + 1);
          
          if (label.includes('helmet') || label.includes('hard') || label.includes('hat')) {
              if (!label.includes('no-')) setHelmetFrames(prev => prev + 1);
          }

          if (label.includes('vest')) {
              if (!label.includes('no-')) setVestFrames(prev => prev + 1);
          }
      });
  };

  const finalizeAnalysis = async () => {
    setStatus('PROCESSING');

    const MIN_FRAMES = 5; 
    
    const hasHelmet = helmetFrames > MIN_FRAMES;
    const hasVest = vestFrames > MIN_FRAMES;

    const missing = [];
    if (!hasHelmet) missing.push("Hard Hat");
    if (!hasVest) missing.push("Safety Vest");

    setMissingGear(missing);

    const isSafe = hasHelmet && hasVest; 
    const finalStatus = isSafe ? 'SAFE' : 'AT_RISK';

    try {
        await apiClient.post(`/workers/${workerId}/safety-check`, { status: finalStatus });
        
        setStatus(finalStatus === 'SAFE' ? 'SUCCESS' : 'FAILED');
        if (finalStatus === 'SAFE') {
            setTimeout(() => {
                onSuccess('SAFE');
                onClose();
            }, 3000);
        } else {
            onSuccess('AT_RISK');
        }

    } catch (error) {
        console.error("API Error", error);
        setStatus('FAILED');
    }
  };


  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-gray-900 border border-white/10 p-6 text-left shadow-xl">

              <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-xl font-bold text-white flex items-center gap-2">
                    <ScanFace className="text-blue-500" /> AI Safety Analysis
                  </Dialog.Title>
                  {status === 'SCANNING' && (
                      <span className="text-2xl font-mono font-bold text-yellow-400">{timeLeft}s</span>
                  )}
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black aspect-video border-2 border-dashed border-gray-700">
                {status === 'SUCCESS' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/20 z-20">
                        <CheckCircle size={64} className="text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-white">COMPLIANT</h2>
                        <p className="text-green-300 font-mono text-sm mt-2">All PPE Verified</p>
                    </div>
                )}
                
                {status === 'FAILED' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20 z-20">
                        <ShieldAlert size={64} className="text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-white">NON-COMPLIANT</h2>
                        <div className="mt-4 bg-black/60 px-4 py-2 rounded text-center">
                            <p className="text-red-300 text-sm uppercase font-bold mb-1">Missing Required Gear:</p>
                            {missingGear.map(item => (
                                <div key={item} className="text-white font-mono flex items-center gap-2">
                                    <X size={14} className="text-red-500" /> {item}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {status === 'PROCESSING' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                        <p className="text-gray-300">Calculating Verdict...</p>
                    </div>
                )}

                {(status === 'SCANNING' || status === 'PROCESSING') && (
                    <>
                        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" muted className="absolute inset-0 w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
                    </>
                )}
              </div>

              <div className="mt-4">
                {status === 'SCANNING' ? (
                    <div className="bg-gray-800 p-3 rounded-lg border border-white/5 h-24 overflow-y-auto">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-2">
                            <Eye size={12} /> Live AI Detections
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {currentDetections.map((det, i) => (
                                <span key={i} className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
                                    {det}
                                </span>
                            ))}
                            {currentDetections.length === 0 && <span className="text-xs text-gray-600 italic">Analyzing frames...</span>}
                        </div>
                    </div>
                ) : status === 'FAILED' ? (
                    <button 
                        onClick={onClose} 
                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg mt-2"
                    >
                        Acknowledge & Close
                    </button>
                ) : null}
              </div>

            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};