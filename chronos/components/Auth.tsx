
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../services/firebase';
import { UserService } from '../services/userService';
import { GlassCard, Button, Input } from './UIComponents';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { SoundService } from '../services/soundService';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    SoundService.playClick();

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Update last login time
        await UserService.saveUser(userCredential.user);
        SoundService.playSuccess();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name for welcome message
        if (username) {
            await updateProfile(userCredential.user, {
                displayName: username
            });
        }
        // Save user data to Realtime Database
        await UserService.saveUser(userCredential.user, username);
        SoundService.playSuccess();
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]" />

      <GlassCard className="w-full max-w-md p-8 relative z-10" borderLevel="highlight" variant="holo">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 transform rotate-3">
             <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Chronos Access</h1>
          <p className="text-gray-400 text-sm">Secure your timeline across eternity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input 
              placeholder="Display Name" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              variant="terminal"
              required
            />
          )}
          <Input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            variant="terminal"
            required
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            variant="terminal"
            required
          />

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            variant="glow" 
            isLoading={loading}
            icon={isLogin ? <Lock size={16} /> : <User size={16} />}
          >
            {isLogin ? 'Authenticate' : 'Initialize Identity'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); SoundService.playClick(); }}
            className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isLogin ? "New Traveler? Create Profile" : "Existing Identity? Login"}
            <ArrowRight size={12} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
