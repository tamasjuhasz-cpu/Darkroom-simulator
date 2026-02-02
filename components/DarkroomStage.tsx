import React, { useState, useEffect } from 'react';
import { BathType, PhotoState } from '../types';
import { BATH_DATA } from '../constants';
import { ArrowRight, Sun, Moon, AlertTriangle, Hand } from 'lucide-react';

interface DarkroomStageProps {
  photo: PhotoState;
  getPhotoFilter: () => string;
  onUpdate: (update: Partial<PhotoState>) => void;
  onFinish: () => void;
}

const DarkroomStage: React.FC<DarkroomStageProps> = ({ photo, getPhotoFilter, onUpdate, onFinish }) => {
  const [currentBath, setCurrentBath] = useState<BathType | null>(null);
  const [isPhotoHeld, setIsPhotoHeld] = useState(false); 
  const [isWhiteLightOn, setIsWhiteLightOn] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredBath, setHoveredBath] = useState<BathType | null>(null);
  
  const [timers, setTimers] = useState<Record<BathType, number>>({
    [BathType.DEVELOPER]: 0,
    [BathType.STOP]: 0,
    [BathType.FIXER]: 0,
    [BathType.WASH]: 0
  });

  // Gyorsított idő: 100ms = 1mp a laborban (10x sebesség)
  useEffect(() => {
    let interval: number;
    if (currentBath && !isPhotoHeld) {
      interval = window.setInterval(() => {
        setTimers(prev => {
          const newTime = prev[currentBath] + 1;
          
          if (currentBath === BathType.DEVELOPER) {
            onUpdate({ developmentLevel: Math.min(1, newTime / (BATH_DATA[BathType.DEVELOPER].optimalTime * 0.7)) });
          }
          if (currentBath === BathType.FIXER && newTime >= 40) {
            onUpdate({ isFixed: true, isPoorlyFixed: false });
          }
          if (currentBath === BathType.WASH && newTime >= 60) {
            onUpdate({ isWashed: true });
          }

          onUpdate({ bathTimers: { ...prev, [currentBath]: newTime } });
          return { ...prev, [currentBath]: newTime };
        });
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [currentBath, isPhotoHeld, onUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPhotoHeld(true);
    if (currentBath === BathType.FIXER && timers[BathType.FIXER] < 40) {
      onUpdate({ isPoorlyFixed: true });
    }
    setCurrentBath(null);
  };

  const handleMouseUp = () => {
    if (isPhotoHeld) {
      setIsPhotoHeld(false);
      if (hoveredBath) {
        setCurrentBath(hoveredBath);
      }
    }
  };

  const isCriticalFix = currentBath === BathType.FIXER && timers[BathType.FIXER] < 40;

  return (
    <div 
      className={`absolute inset-0 flex flex-col transition-colors duration-1000 overflow-hidden ${isWhiteLightOn ? 'bg-zinc-100 text-black' : 'bg-[#0d0000] text-red-500'}`}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="p-8 flex justify-between items-start z-20">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Sötétkamra Labor</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
              Vonszold a papírt a tálcákba. (10x Gyorsított idő)
            </p>
          </div>
          <button 
            onClick={() => setIsWhiteLightOn(!isWhiteLightOn)} 
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${isWhiteLightOn ? 'bg-black text-white border-black shadow-xl' : 'bg-red-600/10 border-red-600/30 text-red-600 hover:bg-red-600/20'}`}
          >
            {isWhiteLightOn ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Munkalámpa kapcsolása
          </button>
        </div>

        <div>
          {(photo.isWashed || timers[BathType.WASH] > 30) && (
            <button 
              onClick={onFinish}
              className="flex items-center gap-4 bg-white text-black px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-all animate-bounce border-4 border-zinc-200"
            >
              Szárítás és kiértékelés <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Kezdő asztal, ha nincs tálcában és nincs megfogva */}
      {!currentBath && !isPhotoHeld && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2 italic">Exponált papír</div>
          <div 
            onMouseDown={handleMouseDown}
            className="w-56 aspect-[3/4] bg-white shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-zinc-300 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform p-1.5"
          >
             <div className="relative w-full h-full overflow-hidden bg-white">
                <img src={photo.baseImageUrl} className="w-full h-full object-cover" style={{ filter: getPhotoFilter(), opacity: 0.1 }} alt="Waiting print" />
                <div className="absolute inset-0 bg-white" style={{ opacity: 0.95 }} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Hand className="w-8 h-8 text-black/5" />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Megfogott kép vizuálja */}
      {isPhotoHeld && (
        <div 
          className="fixed pointer-events-none z-[100] transition-transform duration-75"
          style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%) rotate(2deg)' }}
        >
          <div className="w-52 aspect-[3/4] bg-white shadow-[0_60px_120px_rgba(0,0,0,0.8)] border border-zinc-200 overflow-hidden p-1.5">
            <img 
              src={photo.baseImageUrl} 
              className="w-full h-full object-cover"
              style={{ filter: getPhotoFilter() }}
              alt="Held print"
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 overflow-y-auto">
        
        {/* Kritikus állapot jelzés a tálcák felett */}
        <div className="h-24 flex items-center justify-center w-full mb-4">
          {isCriticalFix ? (
            <div className="flex items-center gap-6 px-12 py-6 bg-red-600 text-white rounded-3xl text-[14px] font-black uppercase animate-bounce shadow-[0_30px_70px_rgba(220,38,38,0.7)] border border-red-400/40">
              <AlertTriangle className="w-7 h-7" /> 
              VIGYÁZAT! KRITIKUS FIXÁLÁSI IDŐ - NE VEDD KI! ({timers[BathType.FIXER]}/40s)
            </div>
          ) : (
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 flex items-center gap-10">
              <span>HÍVÁS</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
              <span>STOP</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
              <span>FIXÁLÁS</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
              <span>MOSÁS</span>
            </div>
          )}
        </div>

        <div className="flex items-start justify-center gap-8 w-full max-w-7xl">
          {(Object.keys(BATH_DATA) as BathType[]).map((type) => {
            const bath = BATH_DATA[type];
            const hasPhoto = currentBath === type && !isPhotoHeld;
            const isTarget = hoveredBath === type && isPhotoHeld;
            const progress = timers[type];
            const percentage = Math.min(100, (progress / bath.optimalTime) * 100);
            
            return (
              <div key={type} className="flex flex-col items-center gap-5 flex-1 max-w-[280px]">
                
                {/* Tálca adatai felül */}
                <div className="w-full text-center space-y-2 px-1 mb-2">
                   <h3 className={`text-[12px] font-black uppercase tracking-[0.25em] ${hasPhoto || isTarget ? 'text-white' : 'text-white/20'}`}>{bath.name}</h3>
                   
                   <div className="flex justify-between items-center px-2">
                      <div className="flex flex-col items-start text-left">
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Javasolt</span>
                        <span className="text-[10px] font-black text-white/30">{bath.optimalTime}s</span>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Eltelt</span>
                        <span className={`text-[10px] font-black ${hasPhoto ? 'text-red-500 animate-pulse' : 'text-white/30'}`}>{progress}s</span>
                      </div>
                   </div>

                   <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className={`h-full transition-all duration-300 ${type === BathType.FIXER && progress < 40 ? 'bg-amber-500 animate-pulse' : 'bg-red-600'}`} 
                        style={{ width: `${percentage}%` }} 
                      />
                   </div>
                </div>

                {/* Tálca vizuál */}
                <div 
                  onMouseEnter={() => setHoveredBath(type)}
                  onMouseLeave={() => setHoveredBath(null)}
                  className={`relative w-full aspect-[4/5] rounded-[2.5rem] border-[6px] transition-all duration-500 overflow-hidden
                    ${hasPhoto ? 'border-red-600 scale-105 shadow-[0_0_60px_rgba(220,38,38,0.5)] bg-red-950/30' : isTarget ? 'border-red-500 scale-110 bg-red-900/10 shadow-3xl' : 'border-white/5 bg-white/5 shadow-inner'}`}
                >
                  <div className={`absolute inset-0 ${bath.color} opacity-30`} />
                  
                  {hasPhoto && (
                    <div 
                      onMouseDown={handleMouseDown}
                      className="absolute inset-8 cursor-grab active:cursor-grabbing group animate-in fade-in zoom-in duration-300"
                    >
                      <div className="relative w-full h-full bg-white shadow-2xl overflow-hidden rounded-sm group-hover:rotate-1 transition-transform p-1.5">
                         <img src={photo.baseImageUrl} className="w-full h-full object-cover" style={{ filter: getPhotoFilter() }} alt="In bath" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DarkroomStage;