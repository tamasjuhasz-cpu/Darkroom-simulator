
import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Square, Info, Clock, Box, EyeOff } from 'lucide-react';
import { PhotoState, ExposureLevel, PaperType } from '../types';

interface CameraStageProps {
  photo: PhotoState;
  onExposureComplete: (time: number, level: ExposureLevel) => void;
  onUpdateTheme: (theme: string) => void;
  onRegenerate: (theme?: string) => void;
  onPaperTypeChange: (type: PaperType) => void;
}

const CameraStage: React.FC<CameraStageProps> = ({ 
  photo, 
  onExposureComplete, 
  onUpdateTheme, 
  onRegenerate,
  onPaperTypeChange 
}) => {
  const [isExposing, setIsExposing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [localTheme, setLocalTheme] = useState('antik csendélet gyümölcsökkel');
  const timerRef = useRef<number | null>(null);

  const startExposure = () => {
    setIsExposing(true);
    setElapsedTime(0);
    timerRef.current = window.setInterval(() => {
      setElapsedTime(prev => {
        if (prev >= 60) {
          stopExposure(60);
          return 60;
        }
        return prev + 0.1;
      });
    }, 100);
  };

  const stopExposure = (finalTime?: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const time = finalTime !== undefined ? finalTime : elapsedTime;
    setIsExposing(false);
    
    let level = ExposureLevel.CORRECT;
    if (time < 18) level = ExposureLevel.UNDER;
    else if (time > 32) level = ExposureLevel.OVER;
    
    onExposureComplete(time, level);
  };

  const getTimerColor = () => {
    if (elapsedTime < 18) return 'text-blue-500';
    if (elapsedTime <= 32) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (elapsedTime < 5) return 'Túl kevés fény...';
    if (elapsedTime < 18) return 'Alulexponált (Kevés ezüst rakódik le)';
    if (elapsedTime < 20) return 'Már majdnem jó...';
    if (elapsedTime <= 32) return 'TÖKÉLETES EXPOZÍCIÓ!';
    if (elapsedTime < 45) return 'Túlexponált (Sötétedő negatív)';
    if (elapsedTime < 55) return 'Veszélyesen túlexponált...';
    return 'Teljesen beégett!';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0d0d0d]">
      <div className="max-w-4xl w-full flex flex-col items-center gap-12">
        
        {/* CAMERA UNIT (No Viewfinder) */}
        <div className="relative w-full max-w-2xl aspect-video bg-zinc-900 rounded-[3rem] border-[12px] border-zinc-800 shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
          
          {/* Static Lens Graphic */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={`w-32 h-32 rounded-full border-8 transition-colors duration-500 ${isExposing ? 'border-zinc-100 bg-zinc-200' : 'border-zinc-700 bg-zinc-800'} flex items-center justify-center shadow-inner`}>
               <div className={`w-12 h-12 rounded-full transition-all duration-500 ${isExposing ? 'bg-white scale-125 blur-md' : 'bg-black shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]'}`} />
            </div>
            <div className="text-center space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Objektív állapota</p>
               <h3 className={`text-sm font-black uppercase tracking-widest italic transition-colors ${isExposing ? 'text-white' : 'text-zinc-500'}`}>
                 {isExposing ? 'ZÁR NYITVA • FÉNY ÉRI A PAPÍRT' : 'ZÁR ZÁRVA • SÖTÉTSÉG'}
               </h3>
            </div>
          </div>

          {/* Shutter Effect Overlay */}
          {isExposing && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
              <div className="absolute top-12 left-12 flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">EXPOZÍCIÓ</span>
              </div>
            </div>
          )}

          {/* Blindfolded/Darkness Icon when not exposing */}
          {!isExposing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <EyeOff className="w-64 h-64 text-white" />
            </div>
          )}
        </div>

        {/* CONTROLS & DESCRIPTION */}
        <div className="w-full max-w-2xl space-y-8">
           <div className="bg-zinc-800/30 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-8">
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <Box className="w-5 h-5 text-red-600" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">A kamera előtti téma</h3>
                 </div>
                 <div className="relative">
                    <input 
                      type="text"
                      value={localTheme}
                      onChange={(e) => setLocalTheme(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onRegenerate(localTheme)}
                      disabled={isExposing}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-lg font-black italic placeholder:text-zinc-700 focus:border-red-600 transition-all outline-none pr-16 disabled:opacity-50"
                      placeholder="Mit lássak a lencse előtt?"
                    />
                    <button 
                      onClick={() => onRegenerate(localTheme)}
                      disabled={isExposing || localTheme.trim() === ''}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Expozíciós idő</span>
                      </div>
                      <div className={`text-5xl font-black italic tabular-nums ${getTimerColor()}`}>
                        {elapsedTime.toFixed(1)}<span className="text-xl ml-1">s</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Státusz</div>
                      <div className={`text-xs font-bold uppercase tracking-wider ${getTimerColor()}`}>
                        {getStatusText()}
                      </div>
                   </div>
                </div>

                {!isExposing ? (
                  <button 
                    onClick={startExposure}
                    className="w-full py-8 bg-white text-black rounded-[2rem] font-black text-xl italic uppercase tracking-tighter hover:scale-[1.02] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4"
                  >
                    <Camera className="w-8 h-8" />
                    Expozíció indítása
                  </button>
                ) : (
                  <button 
                    onClick={() => stopExposure()}
                    className="w-full py-8 bg-red-600 text-white rounded-[2rem] font-black text-xl italic uppercase tracking-tighter hover:scale-[1.02] transition-all shadow-[0_20px_50px_rgba(220,38,38,0.3)] flex items-center justify-center gap-4 animate-pulse"
                  >
                    <Square className="w-8 h-8 fill-current" />
                    Zár lezárása
                  </button>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 flex items-start gap-4">
                 <Info className="w-5 h-5 text-zinc-600 mt-1" />
                 <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                   A Camera Obscura (lyukkamera) elvén működő gépbe helyezett fényérzékeny papírra vetül a kép. 
                   Mivel az emulzió érzékenysége alacsony, hosszú (20-30 másodperces) expozícióra van szükség az ezüst-sók aktiválásához.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CameraStage;
