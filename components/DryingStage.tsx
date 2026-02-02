
import React, { useState, useEffect, useRef } from 'react';
import { PhotoState } from '../types';
import { Thermometer, CheckCircle2, Waves } from 'lucide-react';

interface DryingStageProps {
  photo: PhotoState;
  getPhotoFilter: () => string;
  onUpdate: (update: Partial<PhotoState>) => void;
  onFinish: () => void;
}

const DryingStage: React.FC<DryingStageProps> = ({ photo, getPhotoFilter, onUpdate, onFinish }) => {
  const [dryingProgress, setDryingProgress] = useState(0);
  const [isCovered, setIsCovered] = useState(false);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const startTimer = setTimeout(() => setIsCovered(true), 500);
    
    let dryInterval: ReturnType<typeof setInterval>;
    
    const waitTimer = setTimeout(() => {
      dryInterval = setInterval(() => {
        setDryingProgress(prev => {
          if (prev >= 100) {
            clearInterval(dryInterval);
            setIsCovered(false);
            onUpdate({ isDry: true });
            return 100;
          }
          return prev + 0.5;
        });
      }, 30);
    }, 1500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(waitTimer);
      if (dryInterval) clearInterval(dryInterval);
    };
  }, [onUpdate]);

  return (
    <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 text-white">
            <Thermometer className="text-orange-500 animate-pulse" />
            Fényesítő Szárítógép
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            A fémlemezre simított képet a feszített vászon szorítja le, miközben a hő eltávolítja a nedvességet.
          </p>
        </div>

        <div className="relative w-80 h-96 mx-auto bg-zinc-800 rounded-xl border-8 border-zinc-700 shadow-2xl p-4 overflow-hidden">
          <div className="absolute inset-4 bg-gradient-to-br from-zinc-400 via-zinc-200 to-zinc-500 rounded-lg shadow-inner flex items-center justify-center">
            
            <div className="relative w-48 h-64 shadow-lg group">
              <img 
                src={photo.baseImageUrl} 
                className={`w-full h-full object-cover grayscale transition-opacity duration-1000 ${dryingProgress < 100 && isCovered ? 'opacity-50' : 'opacity-100'}`} 
                style={{
                  filter: getPhotoFilter() 
                }}
                alt="Drying print"
              />
              {dryingProgress > 0 && dryingProgress < 100 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <Waves className="w-12 h-12 text-white/20 animate-bounce" />
                </div>
              )}
            </div>
          </div>

          <div 
            className={`absolute inset-4 bg-[#e5e7eb] border-x-4 border-zinc-300 shadow-2xl transition-transform duration-1000 ease-in-out origin-top z-20 flex flex-col items-center justify-center pointer-events-none`}
            style={{ 
              transform: isCovered ? 'translateY(0)' : 'translateY(-110%)',
              backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
              backgroundSize: '4px 4px'
            }}
          >
             <div className="w-full h-full bg-black/5 flex items-center justify-center">
                <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest rotate-90 opacity-30">Vászon borítás</span>
             </div>
          </div>

          <div className="absolute top-0 inset-x-0 h-4 bg-zinc-600 rounded-t-lg z-30" />
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-white/30">
            <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> Hőmérséklet: 65°C</span>
            <span>Haladás: {Math.floor(dryingProgress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-orange-500 transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
              style={{ width: `${dryingProgress}%` }}
            />
          </div>
        </div>

        {dryingProgress === 100 && !isCovered && (
          <button 
            onClick={onFinish}
            className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] animate-in zoom-in duration-500"
          >
            <CheckCircle2 className="text-green-600 w-5 h-5" />
            ELKÉSZÜLT KÉP MEGTEKINTÉSE
          </button>
        )}
      </div>
    </div>
  );
};

export default DryingStage;
