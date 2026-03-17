import React, { useEffect, useRef } from 'react';
import { Bot, Sparkles, ArrowRight, Shield, Zap, Target } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vantaEffect: any = null;
    
    // Safety check: Vanta needs THREE globally or explicitly
    const THREE = (window as any).THREE;
    const VANTA = (window as any).VANTA;

    if (vantaRef.current && THREE && VANTA && VANTA.NET) {
      try {
        vantaEffect = VANTA.NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x4f46e5,
          backgroundColor: 0x0f172a,
          points: 12.0,
          maxDistance: 22.0,
          spacing: 16.0,
          THREE: THREE // Explicitly pass the THREE object
        });
      } catch (err) {
        console.warn("Vanta could not initialize:", err);
      }
    }
    
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <div ref={vantaRef} className="min-h-screen flex flex-col items-center justify-center text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 pointer-events-none"></div>
      
      <div className="z-10 container mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-indigo-300 text-sm font-medium mb-8 animate-bounce">
          <Sparkles size={16} />
          Agentic AI powered Interviewing
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-slate-500 bg-clip-text text-transparent">
          Hiring. <br /> Reimagined.
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
          Master the art of the interview with your personal AI coach. Real-time voice interaction, adaptive questioning, and deep behavioral analysis.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button 
            onClick={onStart}
            className="group px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 shadow-2xl shadow-indigo-600/30"
          >
            Start Free Session
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-lg transition-all">
            Watch Demo
          </button>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            icon={<Zap className="text-yellow-400" />}
            title="Real-time Latency"
            desc="Conversations that feel natural. No awkward pauses, just smooth, human-like dialogue."
          />
          <FeatureCard 
            icon={<Target className="text-indigo-400" />}
            title="Adaptive Testing"
            desc="Our AI adjusts difficulty based on your answers, pushing your boundaries for true growth."
          />
          <FeatureCard 
            icon={<Shield className="text-green-400" />}
            title="Bias-Free"
            desc="Objective feedback purely based on performance and communication metrics."
          />
        </div>
      </div>

      <footer className="z-10 mt-auto py-10 text-slate-500 text-sm flex gap-8">
        <span>© 2025 HireAI Pro</span>
        <a href="#" className="hover:text-white">Privacy</a>
        <a href="#" className="hover:text-white">Terms</a>
        <a href="https://ai.google.dev/gemini-api/docs/billing" className="hover:text-white">Billing Docs</a>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-colors">
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);