import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader2, CheckCircle2, Info, Image as ImageIcon, FlipHorizontal, History, Droplets, Clock } from 'lucide-react';
import { AppStage, PhotoState, ExposureLevel, PaperType, BathType } from './types';
import CameraStage from './components/CameraStage';
import DarkroomStage from './components/DarkroomStage';
import DryingStage from './components/DryingStage';
import { GoogleGenAI } from "@google/genai";
import { BATH_DATA } from './constants';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.CAMERA);
  const [userTheme, setUserTheme] = useState<string>('antik csendélet gyümölcsökkel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewAsPositive, setViewAsPositive] = useState(false);
  
  const [photo, setPhoto] = useState<PhotoState>({
    isExposed: false,
    exposureTime: 0,
    exposureLevel: ExposureLevel.CORRECT,
    paperType: PaperType.NEGATIVE,
    developmentLevel: 0,
    fixTime: 0,
    isFixed: false,
    isStopped: false,
    isWashed: false,
    isDry: false,
    bathTimers: {
      [BathType.DEVELOPER]: 0,
      [BathType.STOP]: 0,
      [BathType.FIXER]: 0,
      [BathType.WASH]: 0
    }
  });

  const generateImage = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = "Készíts egy Camera Obscura stílusú fotót. A kép legyen erősen szemcsés, kissé életlen a széleken, lágy kontrasztokkal. Régies, 19. századi fotográfiai stílus, vignettálással. Csak fekete-fehér képet generálj. Kerüld a modern elemeket.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [{ text: `${systemInstruction} Téma: ${prompt}` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      });

      let imageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      
      if (!imageUrl) throw new Error("Nincs generált kép");

      setPhoto(prev => ({ 
        ...prev, 
        baseImageUrl: imageUrl,
        sceneDescription: prompt 
      }));
    } catch (error) {
      console.error("Image generation failed:", error);
      const fallbackUrl = `https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop`;
      setPhoto(prev => ({ ...prev, baseImageUrl: fallbackUrl, sceneDescription: prompt }));
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!photo.baseImageUrl) {
      generateImage(userTheme);
    }
  }, []);

  const handleExposureComplete = (time: number, level: ExposureLevel) => {
    setPhoto(prev => ({ ...prev, exposureTime: time, exposureLevel: level, isExposed: true }));
    setStage(AppStage.DARKROOM);
  };

  const getPhotoFilter = (isReference: boolean = false) => {
    const isNegativeMode = !viewAsPositive;
    let filter = 'grayscale(100%)';
    const t = isReference ? 25 : photo.exposureTime;
    
    let brightness = 1;
    let contrast = 1;
    let opacity = 1;

    // Fényérzékenységi görbe finomítása a felhasználó kérése alapján
    if (t <= 5) {
      // Teljesen alulexponált: pozitívban fekete, negatívban fehér
      brightness = 0; 
      contrast = 1;
    } else if (t < 18) {
      // Alulexponált
      const factor = (t - 5) / 13;
      brightness = factor * 0.5; // Alacsony fényerő pozitívban -> sötét, nem szürke
      contrast = 1.6 + (1 - factor); 
    } else if (t <= 32) {
      // Tökéletes
      brightness = 1;
      contrast = 1.3;
    } else if (t <= 55) {
      // Túlexponált
      const factor = (t - 32) / 23;
      brightness = 1 + (factor * 12); // Erős fehérség pozitívban -> beégés
      contrast = 1.3 - (factor * 0.8); 
    } else {
      // Teljes beégés
      brightness = 100; // Pozitívban tiszta fehér, negatívban fekete
      contrast = 1;
    }

    // Pozitív kép paraméterei
    filter += ` brightness(${brightness}) contrast(${contrast})`;

    // Ha negatívot nézünk, invertáljuk
    if (isNegativeMode) {
      filter += ' invert(100%)';
    }

    // Hibás fixálás hatása (sárgulás/fátyol)
    if (photo.isPoorlyFixed) {
      filter += isNegativeMode ? ' brightness(0.6) contrast(0.5)' : ' brightness(1.4) contrast(0.6) sepia(0.5)';
    }
    
    // Labor folyamat szimulációja
    if (stage === AppStage.DARKROOM && !isReference) {
        const dev = Math.max(0.01, photo.developmentLevel);
        // A hívás során az ezüst válik ki. Negatívban feketedik, pozitívban a kép tűnik elő.
        // Itt az opacityvel szimuláljuk a kép megjelenését a papír alapszínén.
        filter += ` opacity(${dev})`;
    }

    return filter;
  };

  const updatePhoto = (update: Partial<PhotoState>) => {
    setPhoto(prev => ({ ...prev, ...update }));
  };

  const resetApp = () => {
    setPhoto({
      isExposed: false,
      exposureTime: 0,
      exposureLevel: ExposureLevel.CORRECT,
      paperType: PaperType.NEGATIVE,
      developmentLevel: 0,
      fixTime: 0,
      isFixed: false,
      isStopped: false,
      isWashed: false,
      isDry: false,
      bathTimers: {
        [BathType.DEVELOPER]: 0,
        [BathType.STOP]: 0,
        [BathType.FIXER]: 0,
        [BathType.WASH]: 0
      }
    });
    setStage(AppStage.CAMERA);
    setViewAsPositive(false);
  };

  const getExpertAdvice = () => {
    if (photo.exposureTime <= 5) return "A papírt szinte semmi fény nem érte. A negatívod üres (fehér), a pozitív kép tiszta fekete sötétség.";
    if (photo.exposureTime < 18) return "Alulexponált. Kevés ezüst vált ki, ezért a pozitív kép sötét és részletszegény az árnyékokban.";
    if (photo.exposureTime > 32 && photo.exposureTime <= 55) return "Túlexponált. Túl sok ezüst rakódott le, a világos részek (pozitívban) teljesen beégtek.";
    if (photo.exposureTime > 55) return "Teljes beégés. A negatív sűrű fekete tömbbé vált, amin a fény nem tud áthatolni, így a pozitív papír fehér marad.";
    return "Kiváló expozíció! A tónusok gazdagok, a részletek pedig minden tartományban jól látszanak.";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-500/30 font-sans">
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
          <h3 className="text-xl font-black uppercase tracking-widest italic text-red-500">Ezüst-nitrát preparálása...</h3>
        </div>
      )}

      {stage === AppStage.CAMERA && (
        <CameraStage 
          photo={photo}
          onExposureComplete={handleExposureComplete}
          onUpdateTheme={(theme) => {
            setUserTheme(theme);
            generateImage(theme);
          }}
          onRegenerate={generateImage}
          onPaperTypeChange={(type) => setPhoto(prev => ({ ...prev, paperType: type }))}
        />
      )}

      {stage === AppStage.DARKROOM && (
        <DarkroomStage 
          photo={photo}
          getPhotoFilter={() => getPhotoFilter(false)}
          onUpdate={updatePhoto}
          onFinish={() => setStage(AppStage.DRYING)}
        />
      )}

      {stage === AppStage.DRYING && (
        <DryingStage 
          photo={photo}
          getPhotoFilter={() => getPhotoFilter(false)}
          onUpdate={updatePhoto}
          onFinish={() => setStage(AppStage.FINISHED)}
        />
      )}

      {stage === AppStage.FINISHED && (
        <div className="absolute inset-0 bg-[#0d0d0d] overflow-y-auto p-12">
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-red-500 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Laborvizsgálat befejezve</span>
                </div>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter">
                  {viewAsPositive ? 'Pozitív Másolat' : 'Negatív Eredmény'}
                </h2>
              </div>
              <button 
                onClick={resetApp}
                className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                Vissza a kamerához
              </button>
            </header>

            <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-16 items-start">
              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Te előhívásod
                    </h3>
                    <div className="aspect-[3/4] bg-white p-4 shadow-2xl rounded-sm">
                      <div className="w-full h-full overflow-hidden bg-white">
                        <img 
                          src={photo.baseImageUrl} 
                          className="w-full h-full object-cover transition-all duration-700" 
                          style={{ filter: getPhotoFilter(false) }} 
                          alt="Your final result" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Ideális referencia
                    </h3>
                    <div className="aspect-[3/4] bg-white p-4 shadow-2xl rounded-sm">
                      <div className="w-full h-full overflow-hidden bg-white">
                        <img 
                          src={photo.baseImageUrl} 
                          className="w-full h-full object-cover" 
                          style={{ filter: getPhotoFilter(true) }} 
                          alt="Ideal reference" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-600/10 border border-red-600/30 p-8 rounded-[2rem] space-y-4">
                   <div className="flex items-center gap-3 text-red-500">
                      <Info className="w-6 h-6" />
                      <h4 className="font-black uppercase tracking-widest italic text-sm">Laboráns véleménye</h4>
                   </div>
                   <p className="text-lg font-medium text-white/80 leading-relaxed italic">
                      "{getExpertAdvice()}"
                   </p>
                </div>
              </div>

              <div className="space-y-8 sticky top-12">
                <div className="bg-zinc-800/30 rounded-[2.5rem] p-8 border border-white/5 space-y-8 shadow-2xl">
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5 pb-4">Labor napló</h3>
                   
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Expozíció</span>
                         <span className="text-xs font-black text-white">{photo.exposureTime.toFixed(1)}s</span>
                      </div>
                      {(Object.keys(BATH_DATA) as BathType[]).map(type => (
                        <div key={type} className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{BATH_DATA[type].name}</span>
                           <span className={`text-xs font-black ${photo.bathTimers?.[type]! >= BATH_DATA[type].optimalTime * 0.8 ? 'text-zinc-300' : 'text-red-500'}`}>
                              {photo.bathTimers?.[type] || 0}s
                           </span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2rem] shadow-xl">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                         <FlipHorizontal className="w-5 h-5 text-red-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{viewAsPositive ? 'Pozitívnézet' : 'Negatívnézet'}</span>
                      </div>
                      <button 
                        onClick={() => setViewAsPositive(!viewAsPositive)}
                        className={`w-14 h-8 rounded-full transition-colors relative ${viewAsPositive ? 'bg-red-600' : 'bg-zinc-700'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${viewAsPositive ? 'left-7' : 'left-1'}`} />
                      </button>
                   </div>
                   <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-widest text-center opacity-50">
                     Átkapcsolás a látens kép és a kész másolat között.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;