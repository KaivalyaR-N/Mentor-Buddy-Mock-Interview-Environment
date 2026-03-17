
import React from 'react';
import { InterviewSession, QAPair } from '../types';
import { 
  Trophy, ArrowLeft, Target, TrendingUp, Sparkles, 
  MessageSquare, CheckCircle2, AlertCircle, Quote, 
  Bot, User as UserIcon, Zap, Activity, Heart, ShieldCheck,
  Download, FileText, Lightbulb, BookOpen, UserPlus, Printer,
  BarChart3, PieChart, Info
} from 'lucide-react';

interface FeedbackReportProps {
  session: InterviewSession;
  onDone: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({ session, onDone }) => {
  const feedback = session.detailedFeedback!;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'negative': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'High Resonance';
      case 'negative': return 'Tension Detected';
      default: return 'Neutral Flow';
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  // Calculate sentiment distribution for the chart
  const totalPairs = feedback.qaPairs.length;
  const sentimentCounts = feedback.qaPairs.reduce((acc, pair) => {
    const s = pair.sentiment.toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 } as Record<string, number>);

  const sentimentData = [
    { label: 'Positive', value: (sentimentCounts.positive / totalPairs) * 100, color: 'bg-emerald-500' },
    { label: 'Neutral', value: (sentimentCounts.neutral / totalPairs) * 100, color: 'bg-amber-500' },
    { label: 'Negative', value: (sentimentCounts.negative / totalPairs) * 100, color: 'bg-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-[#07080a] text-white p-6 md:p-14 overflow-y-auto animate-in fade-in duration-1000 scroll-smooth print:bg-white print:text-black print:p-0">
      <div className="max-w-6xl mx-auto space-y-16 print:space-y-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-12 print:border-black/10 print:pb-6">
          <div className="space-y-4 print:space-y-2">
            <button onClick={onDone} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-4 text-[10px] font-black uppercase tracking-[0.2em] group print:hidden">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Terminal
            </button>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-300 to-slate-600 bg-clip-text text-transparent print:text-black print:bg-none print:text-5xl">Analysis Report</h1>
            <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest print:text-black/60">
              <span>{session.role}</span>
              <span className="text-slate-800 print:text-black/20">|</span>
              <span>{session.date}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 items-end">
            <div className="flex items-center gap-6">
               <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agent Persona</p>
                  <p className="text-sm font-bold text-indigo-400">{feedback.persona}</p>
               </div>
               <div className="bg-indigo-600 px-10 py-8 rounded-[40px] text-center shadow-[0_20px_60px_-15px_rgba(79,70,229,0.4)] relative group overflow-hidden transition-all hover:scale-105 print:bg-white print:border-2 print:border-black print:text-black print:shadow-none print:py-4 print:px-6 print:rounded-2xl">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2 print:text-black/60">Aggregate Score</p>
                 <p className="text-6xl font-black print:text-4xl">{feedback.score}<span className="text-2xl text-indigo-300 opacity-40 print:text-black/40">/100</span></p>
               </div>
            </div>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-indigo-600/20 print:hidden"
            >
              <Download size={18} />
              Export Full PDF Report
            </button>
          </div>
        </header>

        {/* Visual Analytics Dashboard Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2">
          <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[40px] p-8 space-y-8 print:bg-none print:border-black/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-indigo-400">
                <BarChart3 size={20} />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Performance Metrics</h2>
              </div>
              <Info size={14} className="text-slate-600" />
            </div>
            <div className="space-y-6">
              <MetricProgress label="Vocal Clarity" value={feedback.metrics.clarity} color="bg-blue-500" />
              <MetricProgress label="Self Confidence" value={feedback.metrics.confidence} color="bg-emerald-500" />
              <MetricProgress label="Response Conciseness" value={feedback.metrics.conciseness} color="bg-indigo-500" />
              <MetricProgress label="Lexical Complexity" value={feedback.metrics.vocabulary} color="bg-amber-500" />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center text-center space-y-6 print:bg-none print:border-black/10">
            <div className="text-indigo-400 mb-2"><PieChart size={24} /></div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sentiment Gauge</h2>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * feedback.metrics.sentiment) / 100} className="text-indigo-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{feedback.metrics.sentiment}%</span>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Overall Positivity</p>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 flex flex-col space-y-6 print:bg-none print:border-black/10">
            <div className="text-indigo-400 mb-2"><Activity size={24} /></div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tone Distribution</h2>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {sentimentData.map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">{s.label}</span>
                    <span>{Math.round(s.value)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} transition-all duration-1000`} style={{ width: `${s.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 print:block">
          {/* Main Insights Column */}
          <div className="lg:col-span-8 space-y-10 print:space-y-8">
            
            {/* Summary Section */}
            <section className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-white/5 p-10 rounded-[48px] space-y-6 print:bg-none print:border-black/10 print:p-6 print:rounded-3xl">
              <div className="flex items-center gap-3 text-indigo-400 print:text-black">
                <ShieldCheck size={24} />
                <h2 className="text-lg font-black uppercase tracking-widest">Executive Summary</h2>
              </div>
              <p className="text-xl md:text-2xl font-medium text-slate-100 leading-relaxed print:text-black print:text-lg">
                {feedback.summary}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 print:grid-cols-3">
                <StatusPill label="Interview Pacing" value="Stable" color="text-emerald-400" />
                <StatusPill label="Agent Resonance" value="Synchronized" color="text-indigo-400" />
                <StatusPill label="Pressure Handling" value="Resilient" color="text-amber-400" />
              </div>
            </section>

            {/* Preparation Cheatsheet Section */}
            <section className="bg-indigo-600/5 border border-indigo-500/20 p-10 rounded-[48px] space-y-8 print:border-black print:p-6 print:rounded-3xl print:bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-indigo-400 print:text-black">
                  <FileText size={28} />
                  <h2 className="text-xl font-black uppercase tracking-widest">Growth Cheatsheet</h2>
                </div>
                <div className="hidden print:block text-[10px] font-bold text-black/40">HIREAI PRO SYSTEM REPORT</div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 print:text-black">
                    <AlertCircle size={14} className="text-rose-400" /> Improvement Targets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedback.metrics.clarity < 85 && (
                      <GapCard 
                        skill="Structural Clarity" 
                        impact="High" 
                        fix="Enforce the STAR method strictly. Start with the outcome to anchor the listener."
                      />
                    )}
                    <GapCard 
                      skill="Technical Depth" 
                      impact="Medium" 
                      fix={`Provide more granular implementation details specific to ${session.role}.`}
                    />
                    <GapCard 
                      skill="Vocal Modulation" 
                      impact="Low" 
                      fix="Vary your pitch to emphasize key achievements and maintain engagement."
                    />
                    <GapCard 
                      skill="Lexical Density" 
                      impact="High" 
                      fix="Incorporate more industry-specific terminology to demonstrate seniority."
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 print:text-black">
                    <Lightbulb size={14} className="text-amber-400" /> Expert Answer Templates
                  </h3>
                  <div className="space-y-4">
                    {feedback.qaPairs.slice(0, 2).map((q, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 p-6 rounded-3xl space-y-4 print:bg-white print:border-black/20 print:p-4">
                        <div className="flex justify-between items-start border-b border-white/5 pb-3 print:border-black/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 print:text-black/60">Topic: {q.question.split(' ').slice(0, 3).join(' ')}...</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Original Answer</p>
                            <p className="text-xs text-slate-400 leading-relaxed italic print:text-black/70">"{q.answer.slice(0, 100)}..."</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Expert Refinement</p>
                            <p className="text-xs text-slate-200 bg-white/5 p-3 rounded-xl border border-white/5 print:text-black print:bg-black/5 print:border-none">
                              "Actually, a stronger approach would be to frame this as a scalable solution: 'I implemented [X] using [Y], achieving [Z]% efficiency...'"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Transcript Breakdown Section */}
            <section className="space-y-8 print:break-before-page">
               <div className="flex items-center gap-3 text-amber-400 px-4 print:text-black">
                  <MessageSquare size={28} />
                  <h2 className="text-xl font-black uppercase tracking-widest">Full Conversation Analysis</h2>
               </div>
               
               <div className="space-y-6">
                  {feedback.qaPairs.map((qa, i) => {
                    const sentimentStyles = getSentimentColor(qa.sentiment);
                    return (
                      <div key={i} className="group bg-slate-900/20 border border-white/5 p-10 rounded-[48px] hover:bg-slate-900/40 transition-all duration-500 border-l-4 border-l-indigo-500/50 relative overflow-hidden print:bg-white print:border-black/10 print:p-6 print:rounded-3xl print:border-l-black">
                         <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
                            <div className="flex gap-2">
                               <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 print:bg-black/5 print:text-black print:border-black/10">Turn {i + 1}</span>
                               <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${sentimentStyles} print:text-black print:border-black/10 print:bg-none`}>
                                 {getSentimentLabel(qa.sentiment)}
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 print:text-black/60">Power Rating</span>
                              <span className={`text-sm font-black ${qa.strengthScore > 80 ? 'text-emerald-400' : 'text-amber-400'} print:text-black`}>{qa.strengthScore}%</span>
                            </div>
                         </div>
                         
                         <div className="space-y-8">
                            <div className="space-y-3">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 print:text-black/60">
                                 <Bot size={14} className="text-indigo-400 print:text-black" /> Agent Question
                               </p>
                               <p className="text-lg font-bold text-slate-200 leading-relaxed print:text-black print:text-base">{qa.question}</p>
                            </div>
                            
                            <div className="space-y-3 p-6 bg-black/40 rounded-3xl border border-white/5 print:bg-black/5 print:border-none print:p-4">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 print:text-black/40">
                                 <UserIcon size={14} className="text-emerald-400 print:text-black" /> Candidate Response
                               </p>
                               <p className="text-slate-400 leading-relaxed italic print:text-black/70 print:text-sm">"{qa.answer}"</p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-4">
                               <div className="flex-1 bg-white/5 p-5 rounded-2xl flex items-start gap-3 print:bg-none print:border print:border-black/10">
                                  <TrendingUp size={18} className="text-emerald-400 shrink-0 mt-1 print:text-black" />
                                  <div>
                                     <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1 print:text-black">AI Evaluation</p>
                                     <p className="text-xs text-slate-300 font-medium leading-relaxed print:text-black/80">{qa.analysis}</p>
                                  </div>
                               </div>
                               <div className={`w-full md:w-48 p-5 rounded-2xl flex items-start gap-3 border ${sentimentStyles} print:border-black/10 print:bg-none`}>
                                  <Heart size={18} className="shrink-0 mt-1 print:text-black" />
                                  <div>
                                     <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1 print:text-black/40">Sentiment</p>
                                     <p className="text-xs font-bold uppercase print:text-black">{qa.sentiment}</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </section>
          </div>

          {/* Sidebar Recommendations */}
          <div className="lg:col-span-4 space-y-10 print:hidden">
             <section className="bg-gradient-to-b from-indigo-900/20 to-transparent border border-indigo-500/20 p-10 rounded-[48px] space-y-8 sticky top-14">
                <div className="flex items-center gap-3 text-indigo-400">
                  <Target size={28} />
                  <h2 className="text-xl font-black uppercase tracking-widest">Growth Plan</h2>
                </div>
                
                <div className="space-y-6">
                  {feedback.improvements.map((imp, i) => (
                    <div key={i} className="space-y-3 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                             <CheckCircle2 size={18} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Milestone {i + 1}</span>
                       </div>
                       <p className="text-sm font-medium text-slate-300 leading-relaxed">{imp}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 space-y-4">
                   <div className="bg-indigo-600 rounded-[32px] p-8 text-center shadow-xl group overflow-hidden relative">
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <Trophy size={40} className="mx-auto mb-4 text-white/50" />
                        <h4 className="text-xl font-black mb-2">Continue Training</h4>
                        <p className="text-xs text-indigo-200/60 mb-8 leading-relaxed">System data suggests 3 more sessions to reach Expert status.</p>
                        <button onClick={onDone} className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg transition-transform active:scale-95 mb-4">Re-Launch Terminal</button>
                      </div>
                   </div>
                   
                   <button 
                     onClick={handleDownloadPDF}
                     className="w-full py-5 rounded-3xl border border-white/10 bg-white/5 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
                   >
                     <Printer size={16} />
                     Generate Printable PDF
                   </button>
                </div>
             </section>
          </div>
        </div>

        {/* Print Footer */}
        <footer className="hidden print:block border-t border-black/10 pt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-black uppercase tracking-[0.3em] text-xs">
            <Bot size={20} />
            HIREAI PRO PREP SYSTEM - CONFIDENTIAL
          </div>
          <p className="text-[10px] text-black/40 mt-2 italic">Generated by Agentic AI for {session.candidateName}</p>
        </footer>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          @page { margin: 20mm; }
          .animate-in { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

const MetricProgress = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
      <span className="text-slate-500">{label}</span>
      <span className="text-white">{value}%</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const GapCard = ({ skill, impact, fix }: { skill: string, impact: string, fix: string }) => (
  <div className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-3 hover:border-indigo-500/20 transition-all group print:bg-none print:border-black/10 print:p-4">
    <div className="flex justify-between items-center">
      <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 print:text-black">{skill}</h4>
      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${impact === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'} print:border print:border-black/10 print:text-black`}>
        {impact} IMPACT
      </span>
    </div>
    <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-300 print:text-black/80">{fix}</p>
  </div>
);

const StatusPill = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-1 print:bg-none print:border-black/10 print:p-4">
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 print:text-black/40">{label}</p>
    <p className={`text-lg font-bold ${color} print:text-black print:text-sm`}>{value}</p>
  </div>
);
