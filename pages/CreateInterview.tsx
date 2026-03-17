
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, UserCheck, Cpu, Briefcase, Zap } from 'lucide-react';
import { InterviewSession, InterviewStatus, InterviewPersona } from '../types';

interface CreateInterviewProps {
  onCreate: (session: Omit<InterviewSession, 'id' | 'status' | 'date'>) => InterviewSession;
  onBack: () => void;
}

const PERSONAS: InterviewPersona[] = [
  { id: 'specialist', name: 'Technical Specialist', voice: 'Kore', tone: 'analytical and deep-diving', description: 'Focuses on deep technical knowledge and architectural precision.' },
  { id: 'encourager', name: 'Friendly Encourager', voice: 'Puck', tone: 'friendly and supportive', description: 'Maintains a warm environment, perfect for early-career confidence building.' },
  { id: 'executive', name: 'Direct Executive', voice: 'Charon', tone: 'direct and high-level', description: 'Evaluates leadership, strategic thinking, and business impact.' },
  { id: 'challenger', name: 'The Challenger', voice: 'Fenrir', tone: 'stern and pressure-testing', description: 'Simulates a high-pressure interview with critical follow-up questions.' }
];

export const CreateInterview: React.FC<CreateInterviewProps> = ({ onCreate, onBack }) => {
  const [formData, setFormData] = useState({
    candidateName: '',
    role: '',
    experienceLevel: 'Entry Level',
    persona: PERSONAS[0]
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session = onCreate(formData);
    setGeneratedLink(`https://hire-ai.pro/meet/${session.id}`);
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">New Interview Session</h1>
        <p className="text-slate-400">Set up your AI mock interviewer with custom parameters.</p>
      </div>

      {!generatedLink ? (
        <form onSubmit={handleSubmit} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-800 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Full Name</label>
              <input 
                required
                value={formData.candidateName}
                onChange={e => setFormData({ ...formData, candidateName: e.target.value })}
                type="text" 
                placeholder="e.g. Alex Johnson"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Target Role</label>
              <input 
                required
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                type="text" 
                placeholder="e.g. Senior Backend Engineer"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Zap size={16} className="text-indigo-400" /> Choose Your Interviewer
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, persona: p })}
                  className={`p-5 rounded-2xl border text-left transition-all relative group ${
                    formData.persona.id === p.id 
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-lg' 
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${formData.persona.id === p.id ? 'text-indigo-300' : 'text-slate-200'}`}>{p.name}</span>
                    {formData.persona.id === p.id && <Check size={16} className="text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Experience Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['Entry Level', 'Mid Level', 'Senior'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, experienceLevel: level })}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    formData.experienceLevel === level 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 group"
          >
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            Generate Interview Session
          </button>
        </form>
      ) : (
        <div className="bg-slate-800/30 p-10 rounded-3xl border border-slate-800 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <Check size={40} />
          </div>
          <h2 className="text-2xl font-bold">Your session is ready!</h2>
          <p className="text-slate-400">Copy the link below and paste it in the browser or send it to yourself.</p>
          
          <div className="relative group">
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-indigo-400 font-mono text-sm break-all pr-12">
              {generatedLink}
            </div>
            <button 
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
            </button>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onBack}
              className="flex-1 border border-slate-700 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 bg-indigo-600 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
            >
              Start Session Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
