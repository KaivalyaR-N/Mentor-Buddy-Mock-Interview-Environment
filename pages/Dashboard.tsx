
import React, { useState } from 'react';
import { Search, Calendar, Trophy, ChevronRight, Play, Link, Loader2, AlertCircle } from 'lucide-react';
import { InterviewSession, InterviewStatus } from '../types';

interface DashboardProps {
  interviews: InterviewSession[];
  onStartInterview: (session: InterviewSession) => void;
  onNewClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ interviews, onStartInterview, onNewClick }) => {
  const [callLink, setCallLink] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const stats = {
    total: interviews.length,
    average: interviews.filter(i => i.score).length > 0 
      ? Math.round(interviews.reduce((acc, i) => acc + (i.score || 0), 0) / interviews.filter(i => i.score).length)
      : 0,
    upcoming: interviews.filter(i => i.status === InterviewStatus.SCHEDULED).length
  };

  const handleConnectCall = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!callLink.trim()) {
      setError('Please enter a valid call link');
      return;
    }

    setIsConnecting(true);
    
    // Simulate finding the session from the link
    setTimeout(() => {
      const match = callLink.match(/\/meet\/([a-z0-9]+)/);
      const sessionId = match ? match[1] : null;
      
      const foundSession = interviews.find(i => i.id === sessionId);
      
      if (foundSession) {
        onStartInterview(foundSession);
      } else if (sessionId) {
        // If it's a valid ID but not in our list, create a temp session for demo purposes
        onStartInterview({
          id: sessionId,
          candidateName: 'Guest Candidate',
          role: 'AI Training Session',
          experienceLevel: 'Mid Level',
          status: InterviewStatus.SCHEDULED,
          date: new Date().toLocaleDateString()
        });
      } else {
        setError('Invalid interview link. Please check and try again.');
        setIsConnecting(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-400">Track your interview preparation progress.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search interviews..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Connect Call Feature */}
      <section className="bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border border-indigo-500/20 rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Link size={14} />
              Instant Connection
            </div>
            <h2 className="text-2xl font-bold">Connect to a Call</h2>
            <p className="text-slate-400 max-w-md">
              Received a link for a mock interview? Paste it below to start your real-time voice session with Mentor Buddy.
            </p>
          </div>
          
          <form onSubmit={handleConnectCall} className="w-full lg:w-1/2 space-y-3">
            <div className="relative group">
              <input 
                type="text" 
                value={callLink}
                onChange={(e) => setCallLink(e.target.value)}
                placeholder="https://hire-ai.pro/meet/xxxxxxxxx"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl px-6 py-4 pr-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
              <button 
                type="submit"
                disabled={isConnecting}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-6 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                Connect
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Interviews" value={stats.total.toString()} icon={<Calendar className="text-blue-400" />} />
        <StatCard label="Average Score" value={`${stats.average}%`} icon={<Trophy className="text-yellow-400" />} />
        <StatCard label="Upcoming Sessions" value={stats.upcoming.toString()} icon={<Play className="text-green-400" />} />
      </div>

      {/* Recent Interviews */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Sessions</h2>
          <button 
            onClick={onNewClick}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            Schedule New <ChevronRight size={16} />
          </button>
        </div>

        <div className="bg-slate-800/30 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
          {interviews.map((inv) => (
            <div key={inv.id} className="p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                  inv.status === InterviewStatus.COMPLETED ? 'bg-indigo-500/10 text-indigo-400' : 'bg-green-500/10 text-green-400'
                }`}>
                  {inv.role[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{inv.role}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{inv.experienceLevel}</span>
                    <span>•</span>
                    <span>{inv.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {inv.status === InterviewStatus.COMPLETED && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{inv.score}% Score</p>
                    <p className="text-xs text-slate-500">Feedback Generated</p>
                  </div>
                )}
                
                {inv.status === InterviewStatus.SCHEDULED ? (
                  <button 
                    onClick={() => onStartInterview(inv)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all transform active:scale-95 flex items-center gap-2"
                  >
                    <Play size={16} fill="currentColor" />
                    Start Now
                  </button>
                ) : (
                  <button className="text-slate-400 hover:text-white p-2 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {interviews.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500">No interviews found. Start your journey today!</p>
              <button 
                onClick={onNewClick}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl"
              >
                Create First Interview
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
    <div className="p-3 bg-slate-900 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </div>
);
