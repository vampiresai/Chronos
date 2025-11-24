import React from 'react';
import { SoundService } from '../services/soundService';

// --- Glass Card ---
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  borderLevel?: 'subtle' | 'highlight' | 'neon';
  variant?: 'default' | 'holo';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  onClick, 
  hoverEffect = false,
  borderLevel = 'subtle',
  variant = 'default'
}) => {
  const handleMouseEnter = () => {
    if (hoverEffect) SoundService.playHover();
  };

  const handleClick = () => {
    if (onClick) {
        SoundService.playClick();
        onClick();
    }
  };

  const borderStyles = {
    subtle: 'border-white/[0.08]',
    highlight: 'border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]',
    neon: 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
  };

  const variantStyles = {
    default: "bg-gradient-to-br from-white/[0.07] to-white/[0.02]",
    holo: "bg-gradient-to-br from-cyan-900/20 to-indigo-900/20 bg-grid relative"
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={`
        backdrop-blur-xl 
        border ${borderStyles[borderLevel]}
        ${variantStyles[variant]}
        rounded-3xl p-6 relative overflow-hidden
        shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
        ${hoverEffect ? 'hover:bg-white/[0.09] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-primary/20 hover:border-white/20 cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Glossy Reflection */}
      <div className="absolute -top-[100%] -left-[100%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 to-transparent rotate-45 pointer-events-none transition-transform duration-1000 group-hover:translate-y-10" />
      {/* Holo Grid Overlay */}
      {variant === 'holo' && (
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,27,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none" />
      )}
      <div className="relative z-10">
          {children}
      </div>
    </div>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glow' | 'neon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  className = "", 
  onMouseEnter,
  onClick,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 overflow-hidden group";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
    glow: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/30",
    neon: "bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-900 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
  };

  return (
    <button 
        className={`${baseStyles} ${variants[variant]} ${className}`} 
        onMouseEnter={(e) => {
            SoundService.playHover();
            if(onMouseEnter) onMouseEnter(e);
        }}
        onClick={(e) => {
            SoundService.playClick();
            if(onClick) onClick(e);
        }}
        {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="w-5 h-5 transition-transform group-hover:scale-110">{icon}</span>}
          <span className="relative z-10">{children}</span>
        </>
      )}
      {/* Button Shine Animation */}
      {variant !== 'ghost' && (
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
      )}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: 'default' | 'terminal';
}

export const Input: React.FC<InputProps> = ({ label, className = "", variant = 'default', ...props }) => {
  const styles = {
    default: "bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 focus:ring-primary/50",
    terminal: "bg-black/40 border-cyan-900/30 font-mono text-cyan-300 placeholder-cyan-900 focus:border-cyan-500/50 focus:bg-black/60 focus:ring-cyan-500/20"
  };

  return (
    <div className="flex flex-col gap-2 w-full group">
      {label && <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold ml-1 group-focus-within:text-primary transition-colors">{label}</label>}
      <input 
        className={`
          border rounded-xl px-4 py-4 text-white
          focus:outline-none focus:ring-1 transition-all duration-300
          ${styles[variant]}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  variant?: 'default' | 'terminal';
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = "", variant = 'default', ...props }) => {
  const styles = {
      default: "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-primary/50 focus:bg-white/10 focus:ring-primary/50",
      terminal: "bg-black/40 border-cyan-900/30 font-mono text-cyan-300 placeholder-cyan-900 focus:border-cyan-500/50 focus:bg-black/60 focus:ring-cyan-500/20 scrollbar-thin scrollbar-thumb-cyan-900"
  };

  return (
    <div className="flex flex-col gap-2 w-full group">
      {label && <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold ml-1 group-focus-within:text-primary transition-colors">{label}</label>}
      <textarea 
        className={`
          border rounded-xl px-4 py-4
          focus:outline-none focus:ring-1 transition-all duration-300
          min-h-[140px] resize-none
          ${styles[variant]}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = "bg-primary", className = "" }) => (
  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/90 shadow-sm ${color} bg-opacity-20 border border-white/10 backdrop-blur-sm ${className}`}>
    {children}
  </span>
);

// --- Progress Bar ---
export const ProgressBar: React.FC<{ progress: number; color?: string; animate?: boolean }> = ({ progress, color = "bg-gradient-to-r from-indigo-500 to-purple-500", animate = false }) => (
  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
    <div 
      className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${animate ? 'animate-pulse' : ''}`}
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

// --- Metric Card ---
export const MetricCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; trend?: string; trendUp?: boolean }> = ({ label, value, icon, trend, trendUp }) => (
  <GlassCard className="flex flex-col items-start justify-between min-h-[140px] group hover:border-primary/30">
    <div className="flex justify-between w-full mb-4">
      <div className="p-3 rounded-xl bg-white/5 text-gray-300 group-hover:text-white group-hover:bg-primary/20 transition-all">
        {icon}
      </div>
      {trend && (
          <span className={`text-xs px-2 py-1 rounded-lg border flex items-center gap-1 ${trendUp ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'}`}>
              {trend}
          </span>
      )}
    </div>
    <div>
      <div className="text-3xl font-display font-bold text-white mb-1 group-hover:scale-110 origin-left transition-transform">{value}</div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </div>
  </GlassCard>
);