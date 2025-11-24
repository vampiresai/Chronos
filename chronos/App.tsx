
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Clock, 
  Sparkles, 
  Lock, 
  Unlock, 
  Calendar,
  Image as ImageIcon,
  Play,
  ArrowRight,
  X,
  Hourglass,
  LayoutGrid,
  List,
  Send,
  Fingerprint,
  Radio,
  Zap,
  Activity,
  Terminal,
  ShieldCheck,
  Grid3X3,
  PenLine,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { GlassCard, Button, Input, TextArea, Badge, ProgressBar, MetricCard } from './components/UIComponents';
import { Capsule, CapsuleStatus, MediaType, Attachment } from './types';
import { StorageService } from './services/storageService';
import { GeminiService } from './services/geminiService';
import { SoundService } from './services/soundService';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Auth } from './components/Auth';

// --- Utils ---
const formatTimeRemainingDetails = (targetDate: number) => {
  const now = Date.now();
  const diff = targetDate - now;

  if (diff <= 0) return { text: "Ready", progress: 100 };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    text: `${days}d ${hours}h ${minutes}m`,
    days, hours, minutes,
    rawDiff: diff
  };
};

const getRandomFutureDate = () => {
    // Random date between 30 days and 2 years from now
    const now = Date.now();
    const min = 30 * 24 * 60 * 60 * 1000;
    const max = 730 * 24 * 60 * 60 * 1000;
    return now + min + Math.random() * (max - min);
};

// --- Create Capsule Modal ---
interface CreateModalProps {
  onClose: () => void;
  onSave: () => void;
  userId: string;
}

const CreateModal: React.FC<CreateModalProps> = ({ onClose, onSave, userId }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [isSealing, setIsSealing] = useState(false);

  const handleGenerateLetter = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    SoundService.playClick();
    try {
      const unlockDate = date ? new Date(date).toDateString() : "the future";
      const response = await GeminiService.generateFutureLetter(aiPrompt, unlockDate);
      setTitle(response.subject);
      setMessage(response.content);
      setShowAiInput(false);
      SoundService.playSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Firebase Storage can handle larger files, but we'll limit to 10MB for free tier efficiency
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("Please use files smaller than 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const type = file.type.startsWith('image') ? MediaType.IMAGE : 
                       file.type.startsWith('video') ? MediaType.VIDEO : 
                       file.type.startsWith('audio') ? MediaType.AUDIO : MediaType.FILE;
          setAttachments(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            type,
            url: ev.target!.result as string,
            name: file.name
          }]);
          SoundService.playClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title || !date) return;
    setIsSealing(true);
    
    try {
      // Fake sealing delay for effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const unlockTime = new Date(date).getTime();
      const newCapsule: Omit<Capsule, 'id'> = {
        userId,
        title,
        message,
        createdAt: Date.now(),
        unlockAt: unlockTime,
        status: CapsuleStatus.LOCKED,
        attachments: attachments || [], // Ensure attachments is always an array
        themeColor: 'indigo',
      };

      // Save capsule - this will save immediately even with base64 media
      await StorageService.saveCapsule(newCapsule);
      SoundService.playSuccess();
      onSave();
    } catch (error) {
      console.error("Error saving capsule:", error);
      alert("Failed to save capsule. Please check your connection and try again.");
    } finally {
      // Always reset sealing state, even if there's an error
      setIsSealing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {isSealing ? (
        <div className="text-center relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse-glow" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-4 border-t-purple-500 border-r-indigo-500 border-b-cyan-500 border-l-transparent animate-spin mx-auto mb-8 shadow-[0_0_50px_rgba(139,92,246,0.3)]" />
                <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">Sealing Timeline</h2>
                <p className="text-gray-400 font-mono text-sm tracking-widest animate-pulse">ENCRYPTING MEMORIES...</p>
            </div>
        </div>
      ) : (
      <div className="w-full max-w-2xl bg-[#0f172a] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2">
            <Sparkles className="text-purple-400" size={18} />
            {step === 1 ? "Compose Memory" : "Set Destination"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</label>
                <button 
                  onClick={() => setShowAiInput(!showAiInput)}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20"
                >
                  <Sparkles size={12} />
                  {showAiInput ? "Switch to Manual" : "AI Assistant"}
                </button>
              </div>

              {showAiInput ? (
                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl border border-indigo-500/30 shadow-inner">
                  <h3 className="text-indigo-300 font-medium mb-2 flex items-center gap-2"><Sparkles size={16}/> AI Letter Assistant</h3>
                  <p className="text-sm text-gray-400 mb-4">Pour your raw thoughts here. We'll craft them into a poetic letter for your future self.</p>
                  <TextArea 
                    placeholder="E.g., I'm feeling nervous about my new job, but excited about moving to the city..." 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="mb-4 bg-black/40 border-indigo-500/20"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="glow"
                      onClick={handleGenerateLetter} 
                      isLoading={isGenerating}
                      disabled={!aiPrompt}
                      className="text-sm py-2"
                    >
                      Generate Letter
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Input 
                    label="Title" 
                    placeholder="E.g., To me, on my 30th birthday" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                  <TextArea 
                    label="Message" 
                    placeholder="What do you want to tell your future self?" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[200px]"
                  />
                </>
              )}

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Artifacts</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  <label className="flex-shrink-0 w-20 h-20 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-white/5 transition-all group">
                    <Plus size={20} className="text-gray-400 group-hover:text-purple-400" />
                    <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Add</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                  </label>
                  
                  {attachments.map((att) => (
                    <div key={att.id} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
                      {att.type === MediaType.IMAGE ? (
                        <img src={att.url} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/40">
                          <Play size={20} />
                        </div>
                      )}
                      <button 
                        onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                        className="absolute top-1 right-1 bg-black/60 backdrop-blur-md p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fadeIn text-center py-4">
              <div className="mx-auto w-32 h-32 relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse-glow" />
                <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border border-white/20">
                    <Clock size={48} className="text-white drop-shadow-md" />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-display font-bold mb-2">When shall we meet again?</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">Choose a moment in time to unlock these memories.</p>
              </div>

              <div className="max-w-xs mx-auto">
                 <Input 
                   type="datetime-local" 
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="text-center text-lg py-4 font-mono tracking-tighter"
                 />
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                {[
                  { label: "1 Year", val: 365 }, 
                  { label: "5 Years", val: 365 * 5 }, 
                  { label: "10 Years", val: 365 * 10 }
                ].map((opt) => (
                  <button 
                    key={opt.label}
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + opt.val);
                      setDate(d.toISOString().slice(0, 16));
                    }}
                    className="bg-white/5 border border-white/10 rounded-xl py-3 text-sm hover:bg-white/10 hover:border-indigo-500/50 transition-all font-medium"
                  >
                    + {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-between bg-black/20 backdrop-blur-xl">
          {step === 2 ? (
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
          ) : (
             <span />
          )}
          
          {step === 1 ? (
             <Button variant="glow" onClick={() => setStep(2)} disabled={!title}>
                Next Step <ArrowRight size={16} />
             </Button>
          ) : (
             <Button variant="glow" onClick={handleSave} disabled={!date}>
               Seal Capsule <Lock size={16} />
             </Button>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

// --- View Capsule Modal ---
interface ViewerProps {
  capsule: Capsule;
  onClose: () => void;
}

const CapsuleViewer: React.FC<ViewerProps> = ({ capsule, onClose }) => {
  const [stage, setStage] = useState<'aligning' | 'harmonizing' | 'reveal'>('aligning');
  
  useEffect(() => {
    // Stage 1: Alignment (Cosmic buildup)
    SoundService.playUnlockStart();
    
    // Sequence timers
    const t1 = setTimeout(() => setStage('harmonizing'), 1500);
    const t2 = setTimeout(() => {
        SoundService.playUnlockReveal();
        setStage('reveal');
    }, 2800);
    
    return () => {
        clearTimeout(t1);
        clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] backdrop-blur-3xl">
      
      {/* Background Cosmic Atmosphere */}
      <div className={`absolute inset-0 transition-all duration-[2000ms] ${stage === 'reveal' ? 'opacity-0' : 'opacity-100'}`}>
         {/* Deep space gradient */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(49,46,129,0.3),_rgba(2,6,23,1)_80%)]" />
         {/* Star field overlay */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse" />
      </div>

      {stage !== 'reveal' && (
        <div className="relative z-10 flex flex-col items-center justify-center">
             
             {/* Central Cosmic Core */}
             <div className="relative w-64 h-64 flex items-center justify-center">
                 {/* Main Core */}
                 <div className={`absolute w-16 h-16 bg-white rounded-full blur-[2px] transition-all duration-[1300ms] ease-in-out
                     ${stage === 'aligning' ? 'scale-100 shadow-[0_0_40px_rgba(99,102,241,0.5)]' : 'scale-[10] opacity-0'} 
                     animate-cosmic-pulse
                 `} />
                 
                 {/* Inner Ring */}
                 <div className={`absolute w-32 h-32 border border-indigo-400/30 rounded-full animate-orbit-slow transition-all duration-[1000ms]
                     ${stage === 'harmonizing' ? 'scale-50 opacity-0 border-white' : 'opacity-100'}
                 `} />
                 
                 {/* Outer Ring */}
                 <div className={`absolute w-48 h-48 border border-purple-400/20 rounded-full animate-orbit-reverse transition-all duration-[1000ms]
                     ${stage === 'harmonizing' ? 'scale-0 opacity-0 border-white' : 'opacity-100'}
                 `} />
                 
                 {/* Particle debris (optional visual flair) */}
                 <div className="absolute w-full h-full animate-spin-slow opacity-30">
                     <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
                     <div className="absolute bottom-10 right-10 w-0.5 h-0.5 bg-cyan-300 rounded-full" />
                 </div>
             </div>
             
             <div className={`mt-8 text-center transition-opacity duration-500 ${stage === 'harmonizing' ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-indigo-300 font-display tracking-[0.3em] text-xs uppercase animate-pulse">
                    Aligning Chronology
                </p>
             </div>
        </div>
      )}

      {/* Content Reveal Stage */}
      {stage === 'reveal' && (
        <div className="w-full max-w-4xl h-[85vh] bg-[#0f172a] rounded-3xl border border-white/10 overflow-hidden flex flex-col animate-slide-up shadow-2xl relative">
          
          {/* Header Image or Gradient */}
          <div className="h-48 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 relative group">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
             <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0f172a] to-transparent" />
             <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors z-20">
               <X size={24} />
             </button>
             {/* Sparkles visual */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-10 -mt-20 relative z-10 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-4 animate-zoom-in-subtle">
                 <Badge color="bg-green-500" className="mx-auto mb-4">Memory Unlocked</Badge>
                 <h1 className="text-5xl font-display font-bold text-white leading-tight drop-shadow-lg">{capsule.title}</h1>
                 <div className="flex justify-center items-center gap-4 text-sm text-gray-400 font-mono">
                    <span>SEALED: {new Date(capsule.createdAt).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full" />
                    <span>OPENED: {new Date().toLocaleDateString()}</span>
                 </div>
              </div>

              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 leading-relaxed text-lg text-gray-200 shadow-inner font-serif italic tracking-wide animate-zoom-in-subtle" style={{animationDelay: '0.2s'}}>
                {capsule.message.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>

              {capsule.attachments && capsule.attachments.length > 0 && (
                <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Recovered Artifacts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {capsule.attachments.map((att, idx) => (
                      <div key={att.id} className="rounded-2xl overflow-hidden border border-white/10 shadow-lg group cursor-pointer hover:scale-[1.02] transition-transform">
                        {att.type === MediaType.IMAGE && (
                          <img src={att.url} alt="artifact" className="w-full h-64 object-cover" />
                        )}
                        {att.type === MediaType.VIDEO && (
                           <video src={att.url} controls className="w-full h-64 bg-black object-contain" />
                        )}
                        <div className="p-3 bg-white/5 backdrop-blur-md">
                          <p className="text-xs text-gray-400 truncate">{att.name || `Artifact #${idx+1}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Timeline Component ---
const TimelineView: React.FC<{ capsules: Capsule[], onSelect: (c: Capsule) => void }> = ({ capsules, onSelect }) => {
  const sortedCapsules = useMemo(() => {
    return [...capsules].sort((a, b) => a.unlockAt - b.unlockAt);
  }, [capsules]);

  const grouped = useMemo(() => {
    return sortedCapsules.reduce((acc, cap) => {
      const year = new Date(cap.unlockAt).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(cap);
      return acc;
    }, {} as Record<number, Capsule[]>);
  }, [sortedCapsules]);

  const years = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  // Background ambient twinkling stars
  const stars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      animationDelay: Math.random() * 5 + 's',
      animationDuration: Math.random() * 3 + 2 + 's',
      size: Math.random() * 2 + 1 + 'px'
  })), []);

  // Shooting stars state - controlled to trigger every 2 minutes
  const [shootingStars, setShootingStars] = useState<{id: number, style: React.CSSProperties}[]>([]);

  useEffect(() => {
    const spawnStars = () => {
        // Spawn 2 stars
        const newStars = Array.from({ length: 2 }).map((_, i) => ({
            id: Date.now() + i,
            style: {
                left: Math.random() * 90 + '%',
                top: Math.random() * 60 + '%',
                // Randomize duration and delay slightly so they don't look like clones
                animationDuration: (Math.random() * 1.5 + 2) + 's',
                animationDelay: (Math.random() * 3) + 's', 
            } as React.CSSProperties
        }));
        setShootingStars(newStars);

        // Clear after animation completes to keep DOM light
        // Max duration approx 2+3 = 5s, so 6s is safe
        setTimeout(() => {
            setShootingStars([]);
        }, 6000); 
    };

    // Trigger immediately so user sees it once, then every 2 minutes
    spawnStars();
    
    // 2 minutes = 120,000 ms
    const interval = setInterval(spawnStars, 120000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto py-10 px-4 min-h-[60vh]">
       
       {/* Background Stars & Shooting Stars */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {stars.map((s, i) => (
              <div key={i} className="star-twinkle" style={{
                  left: s.left, top: s.top, 
                  width: s.size, height: s.size, 
                  animationDelay: s.animationDelay,
                  animationDuration: s.animationDuration
              }} />
          ))}
          {shootingStars.map((s) => (
              <div key={s.id} className="shooting-star" style={s.style} />
          ))}
       </div>

       {/* Central Line */}
       <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent z-0" />
       
       {years.map((year, yearIdx) => (
         <div key={year} className="mb-20 animate-slide-up relative z-10" style={{ animationDelay: `${yearIdx * 0.1}s` }}>
           <div className="flex items-center justify-start md:justify-center mb-10 relative">
             <div className="bg-[#020617] border border-indigo-500/30 px-6 py-2 rounded-full z-10 shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-md">
               <span className="text-2xl font-display font-bold text-indigo-400">{year}</span>
             </div>
           </div>
           <div className="space-y-12">
             {grouped[year].map((capsule, idx) => {
               const isLocked = Date.now() < capsule.unlockAt;
               const isLeft = idx % 2 === 0;
               return (
                 <div key={capsule.id} className="relative md:flex md:justify-between md:items-center group">
                    <div className="absolute left-[29px] md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${isLocked ? 'border-gray-600 bg-[#020617]' : 'border-green-400 bg-green-500 shadow-[0_0_15px_rgba(74,222,128,0.6)]'}`}>
                         {!isLocked && <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />}
                      </div>
                    </div>
                    <div className="md:hidden absolute left-[31px] top-1/2 w-8 h-px bg-white/10" />
                    <div className={`pl-20 md:pl-0 md:w-[45%] ${isLeft ? 'md:mr-auto md:text-right md:pr-10' : 'md:ml-auto md:pl-10'} transition-all duration-500 group-hover:-translate-y-1`}>
                       <GlassCard 
                         onClick={() => onSelect(capsule)}
                         hoverEffect={true}
                         className={`relative overflow-hidden group-card ${isLocked ? 'opacity-80' : 'opacity-100'}`}
                         borderLevel={isLocked ? 'subtle' : 'highlight'}
                       >
                         <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-px w-10 bg-gradient-to-r from-indigo-500/50 to-transparent ${isLeft ? '-right-10 rotate-0' : '-left-10 rotate-180'}`} />
                         <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
                           <div className="flex items-center gap-2 mb-2">
                             {isLocked ? <Lock size={14} className="text-gray-500" /> : <Unlock size={14} className="text-green-400" />}
                             <span className="text-xs font-mono text-gray-500">{new Date(capsule.unlockAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                           </div>
                           <h3 className="text-lg font-bold text-white mb-1">{capsule.title}</h3>
                           {!isLocked ? (
                              <p className="text-sm text-gray-400 line-clamp-2">{capsule.message}</p>
                           ) : (
                              <p className="text-sm text-gray-600 italic">This memory is sealed in time.</p>
                           )}
                           <div className={`flex gap-2 mt-4 ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                              {capsule.attachments && capsule.attachments.length > 0 && (
                                <Badge color="bg-indigo-500" className="flex items-center gap-1"><ImageIcon size={10} /> {capsule.attachments.length}</Badge>
                              )}
                           </div>
                         </div>
                       </GlassCard>
                    </div>
                    <div className="hidden md:block md:w-[45%]" />
                 </div>
               );
             })}
           </div>
         </div>
       ))}
       {years.length === 0 && (
         <div className="text-center py-20 opacity-50 relative z-10">
            <p>The timeline is empty. Create your first moment.</p>
         </div>
       )}
    </div>
  );
};

// --- Gallery View Component ---
const GalleryView: React.FC<{ capsules: Capsule[] }> = ({ capsules }) => {
  const artifacts = useMemo(() => {
    return capsules
      .filter(c => Date.now() >= c.unlockAt) // Only show unlocked artifacts
      .flatMap(c => (c.attachments || []).map(att => ({
        ...att,
        unlockDate: c.unlockAt,
        sourceTitle: c.title
      })))
      .sort((a, b) => b.unlockDate - a.unlockDate); // Newest first
  }, [capsules]);

  const groupedArtifacts = useMemo(() => {
    const groups: Record<string, typeof artifacts> = {};
    artifacts.forEach(art => {
        const year = new Date(art.unlockDate).getFullYear();
        if (!groups[year]) groups[year] = [];
        groups[year].push(art);
    });
    return groups;
  }, [artifacts]);

  const years = Object.keys(groupedArtifacts).sort((a, b) => Number(b) - Number(a));

  if (artifacts.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] text-center opacity-50 animate-fadeIn">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
            <ImageIcon size={40} className="text-indigo-400" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">No Artifacts Discovered</h3>
          <p className="max-w-xs text-gray-400">Unlock time capsules to populate your personal gallery with recovered memories.</p>
       </div>
    );
  }

  return (
    <div className="animate-fadeIn pb-20 max-w-6xl mx-auto">
       <div className="mb-12 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-2 flex items-center justify-center gap-3">
             <Grid3X3 className="text-purple-400" /> Memory Gallery
          </h2>
          <p className="text-gray-400">A visual timeline of unlocked photos and videos.</p>
       </div>

       {years.map(year => (
         <div key={year} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
               <span className="text-4xl font-display font-bold text-white/10">{year}</span>
               <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            
            {/* Masonry-like Layout */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {groupedArtifacts[year].map((art, i) => (
                   <div key={i} className="break-inside-avoid">
                       <GlassCard 
                         className="p-0 overflow-hidden relative group cursor-zoom-in border-0 rounded-2xl" 
                         hoverEffect={false}
                       >
                         {art.type === MediaType.IMAGE ? (
                           <img src={art.url} alt="artifact" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                         ) : (
                           <div className="w-full aspect-video bg-black/50 flex items-center justify-center relative">
                             <Play size={32} className="text-white relative z-10 drop-shadow-lg" />
                             <video src={art.url} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
                           </div>
                         )}
                         
                         {/* Aesthetic Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                            <span className="text-[10px] text-purple-300 font-mono tracking-wider mb-1 uppercase">{new Date(art.unlockDate).toLocaleDateString()}</span>
                            <span className="text-sm font-bold truncate text-white leading-tight">{art.sourceTitle}</span>
                            {art.name && <span className="text-[10px] text-gray-400 truncate mt-1 opacity-80">{art.name}</span>}
                         </div>
                       </GlassCard>
                   </div>
                ))}
            </div>
         </div>
       ))}
    </div>
  );
};

// --- Quick Note Widget (Restyled to match Glass aesthetic) ---
const QuickNoteWidget: React.FC<{ onSave: () => void, userId: string }> = ({ onSave, userId }) => {
    const [note, setNote] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);

    const handleSend = () => {
        if(!note.trim()) return;
        setIsSending(true);
        SoundService.playClick();
        
        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            setSendProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                finalizeSend();
            }
        }, 50);
    };

    const finalizeSend = async () => {
        // Save to a random date
        const randomDate = getRandomFutureDate();
        const newCapsule: Omit<Capsule, 'id'> = {
            userId,
            title: "Quick Log: " + new Date().toLocaleTimeString(),
            message: note,
            createdAt: Date.now(),
            unlockAt: randomDate,
            status: CapsuleStatus.LOCKED,
            attachments: [],
            themeColor: 'cyan',
        };
        await StorageService.saveCapsule(newCapsule);
        SoundService.playSuccess();
        setTimeout(() => {
            setNote('');
            setIsSending(false);
            setSendProgress(0);
            onSave();
        }, 500);
    };

    return (
        <GlassCard className="h-full flex flex-col justify-between relative overflow-hidden" hoverEffect={true} borderLevel="highlight">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="mb-4 flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <PenLine size={18} className="text-purple-400"/> Memory Log
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Capture a thought for the future.</p>
                </div>
            </div>
            
            {isSending ? (
                <div className="flex-1 flex flex-col justify-center items-center gap-4 text-purple-300 font-medium text-sm">
                    <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                    <span className="animate-pulse">Sending to timeline...</span>
                    <ProgressBar progress={sendProgress} color="bg-purple-500" animate />
                </div>
            ) : (
                <>
                    <TextArea 
                        variant="default"
                        className="w-full text-xs flex-1 mb-4 bg-white/5 border-white/10 text-gray-200 placeholder-gray-500 resize-none"
                        placeholder="Write something to remember..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <Button 
                        variant="glow" 
                        className="w-full text-xs py-2" 
                        onClick={handleSend}
                        disabled={!note.trim()}
                        icon={<Send size={14}/>}
                    >
                        Send to Future
                    </Button>
                </>
            )}
        </GlassCard>
    );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // View state
  const [view, setView] = useState<'dashboard' | 'timeline' | 'gallery'>('dashboard');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [tick, setTick] = useState(0);

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return unsubscribe;
  }, []);

  // Data Subscription (only when user is logged in)
  useEffect(() => {
    if (!user) {
        setCapsules([]);
        return;
    }
    const unsubscribe = StorageService.subscribeToCapsules(user.uid, (data) => {
        setCapsules(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Tick for timer updates
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000); 
    return () => clearInterval(interval);
  }, []);

  const handleOpenCapsule = (capsule: Capsule) => {
    const isLocked = Date.now() < capsule.unlockAt;
    if (isLocked) {
      SoundService.playClick(); 
      alert(`This capsule is sealed until ${new Date(capsule.unlockAt).toLocaleString()}`);
      return;
    }
    if (capsule.status === CapsuleStatus.LOCKED && user) {
      StorageService.updateCapsuleStatus(capsule.id, user.uid, CapsuleStatus.UNLOCKED);
    }
    SoundService.playClick();
    setSelectedCapsule(capsule);
  };

  const handleLogout = async () => {
    SoundService.playClick();
    await signOut(auth);
  };

  const getNextUnlock = () => {
    const locked = capsules.filter(c => c.unlockAt > Date.now());
    if (locked.length === 0) return null;
    return locked.sort((a, b) => a.unlockAt - b.unlockAt)[0];
  };

  const nextUnlock = getNextUnlock();
  const nextUnlockDetails = nextUnlock ? formatTimeRemainingDetails(nextUnlock.unlockAt) : null;
  const progressPercent = nextUnlock ? 
    Math.min(100, Math.max(0, ((Date.now() - nextUnlock.createdAt) / (nextUnlock.unlockAt - nextUnlock.createdAt)) * 100)) 
    : 0;

  if (loadingUser) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
            <div className="animate-pulse">Loading Chronos...</div>
        </div>
    );
  }

  // If not logged in, show Auth Screen
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen text-white relative flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute top-[40%] right-[-20%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-[#020617]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Clock className="text-white" size={20} />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Chronos</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => { setView('dashboard'); SoundService.playClick(); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${view === 'dashboard' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutGrid size={16} />
              Dashboard
            </button>
            <button 
              onClick={() => { setView('timeline'); SoundService.playClick(); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${view === 'timeline' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <List size={16} />
              Timeline
            </button>
            <button 
              onClick={() => { setView('gallery'); SoundService.playClick(); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${view === 'gallery' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Grid3X3 size={16} />
              Gallery
            </button>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="glow" onClick={() => { setIsCreateOpen(true); SoundService.playClick(); }} icon={<Plus size={18} />} className="shadow-indigo-500/20 hidden md:inline-flex">
                Create
             </Button>
             <button 
                onClick={handleLogout} 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Logout"
             >
                 <LogOut size={20} />
             </button>
          </div>
        </div>
        
        <div className="md:hidden flex justify-center pb-4 border-b border-white/5 space-x-4 bg-[#020617]/80 backdrop-blur-xl">
             <button onClick={() => setView('dashboard')} className={`text-xs uppercase font-bold tracking-wider ${view === 'dashboard' ? 'text-indigo-400' : 'text-gray-500'}`}>Dashboard</button>
             <button onClick={() => setView('timeline')} className={`text-xs uppercase font-bold tracking-wider ${view === 'timeline' ? 'text-indigo-400' : 'text-gray-500'}`}>Timeline</button>
             <button onClick={() => setView('gallery')} className={`text-xs uppercase font-bold tracking-wider ${view === 'gallery' ? 'text-indigo-400' : 'text-gray-500'}`}>Gallery</button>
             <button onClick={() => setIsCreateOpen(true)} className={`text-xs uppercase font-bold tracking-wider text-white`}>Create</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-28 pb-12 px-6 max-w-7xl mx-auto w-full relative z-10">
        
        {view === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Welcome Message */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div>
                 <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                    Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user.displayName || 'Traveler'}</span>
                 </h1>
                 <p className="text-gray-400 mt-2">Your timeline awaits.</p>
               </div>
               <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                 ID: {user.uid.slice(0, 8)}...
               </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                
                {/* Hero / Next Unlock - Spans 2 cols, 2 rows */}
                <GlassCard className="md:col-span-2 md:row-span-2 min-h-[360px] flex flex-col justify-between relative overflow-hidden group border-highlight" hoverEffect>
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32 mix-blend-screen animate-pulse-glow" />
                  
                  {nextUnlock ? (
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                           <Badge color="bg-indigo-500" className="mb-4">Next Arrival</Badge>
                           <h2 className="text-4xl font-display font-bold text-white mb-2 leading-tight">{nextUnlock.title}</h2>
                           <p className="text-gray-400 flex items-center gap-2">
                             <Lock size={16} /> {new Date(nextUnlock.unlockAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                           </p>
                        </div>
                      </div>
                      <div className="mt-8">
                        <div className="flex justify-between items-end mb-4 font-mono">
                           <div className="text-center">
                              <span className="block text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">{nextUnlockDetails?.days}</span>
                              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Days</span>
                           </div>
                           <div className="text-2xl font-light text-gray-700 mb-4">:</div>
                           <div className="text-center">
                              <span className="block text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">{nextUnlockDetails?.hours}</span>
                              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Hours</span>
                           </div>
                           <div className="text-2xl font-light text-gray-700 mb-4">:</div>
                           <div className="text-center">
                              <span className="block text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">{nextUnlockDetails?.minutes}</span>
                              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Mins</span>
                           </div>
                        </div>
                        <ProgressBar progress={progressPercent} />
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center py-12">
                       <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                          <Sparkles size={32} className="text-indigo-400" />
                       </div>
                       <h3 className="text-3xl font-display font-bold text-white mb-2">Timeline Clear</h3>
                       <p className="text-gray-400 mb-8 max-w-xs">No pending messages. Revisit the past or begin a new journey.</p>
                       <div className="flex gap-2">
                           <Button variant="glow" onClick={() => setView('gallery')}>View Album</Button>
                           <Button variant="secondary" onClick={() => setIsCreateOpen(true)}><Plus size={16}/></Button>
                       </div>
                    </div>
                  )}
                </GlassCard>

                {/* Quick Note - Spans 1 col, 1 row */}
                <div className="md:col-span-1 md:row-span-2">
                    <QuickNoteWidget onSave={() => setTick(t => t + 1)} userId={user.uid} />
                </div>

                {/* Locked Stats - Replaces System Status */}
                <div className="md:col-span-1 md:row-span-1">
                    <MetricCard 
                        label="Sealed Memories" 
                        value={capsules.filter(c => Date.now() < c.unlockAt).length}
                        icon={<Lock size={24} />}
                        trend="Secure"
                    />
                </div>

                {/* Ready to Open Stats */}
                <MetricCard 
                    label="Ready to Open" 
                    value={capsules.filter(c => Date.now() >= c.unlockAt).length}
                    icon={<Unlock size={24} />}
                    trend="Available Now"
                    trendUp={true}
                />

                {/* Recent - Spans full width or remaining */}
                <div className="md:col-span-3 lg:col-span-4 mt-6">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-display font-bold flex items-center gap-2"><Clock size={24} className="text-gray-500"/> Recent Activity</h2>
                        <Button variant="ghost" className="text-sm" onClick={() => setView('timeline')}>View Full Timeline <ArrowRight size={14} /></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {capsules.slice(-3).reverse().map((capsule, i) => {
                            const isLocked = Date.now() < capsule.unlockAt;
                            return (
                                <div key={capsule.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                                    <GlassCard hoverEffect={true} onClick={() => handleOpenCapsule(capsule)} className="h-40 flex flex-col justify-between group">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold truncate pr-4 text-white group-hover:text-indigo-300 transition-colors">{capsule.title}</h3>
                                            {isLocked ? <Lock size={16} className="text-gray-500" /> : <Unlock size={16} className="text-green-400" />}
                                        </div>
                                        <div className="flex justify-between items-end text-xs text-gray-500 font-mono mt-2">
                                            <span>CREATED: {new Date(capsule.createdAt).toLocaleDateString()}</span>
                                            <Badge color={isLocked ? "bg-gray-700" : "bg-green-600"}>{isLocked ? 'LOCKED' : 'OPEN'}</Badge>
                                        </div>
                                    </GlassCard>
                                </div>
                            );
                        })}
                        {capsules.length === 0 && (
                             <div className="col-span-3 h-32 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-gray-500 bg-white/5">
                                Start by creating your first capsule.
                             </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        )}

        {view === 'timeline' && (
          <TimelineView capsules={capsules} onSelect={handleOpenCapsule} />
        )}

        {view === 'gallery' && (
          <GalleryView capsules={capsules} />
        )}

      </main>

      {/* Modals */}
      {isCreateOpen && (
        <CreateModal 
          onClose={() => setIsCreateOpen(false)} 
          onSave={() => { setIsCreateOpen(false); setView('dashboard'); }} 
          userId={user.uid}
        />
      )}

      {selectedCapsule && (
        <CapsuleViewer 
          capsule={selectedCapsule} 
          onClose={() => setSelectedCapsule(null)} 
        />
      )}
      
      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-[10px] font-mono border-t border-white/5 bg-[#020617] relative z-20">
        <p className="tracking-[0.2em]">CHRONOS SYSTEM v2.0 // MEMORY ARCHIVE</p>
      </footer>
    </div>
  );
}
