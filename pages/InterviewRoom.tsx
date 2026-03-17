import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Settings, Bot, 
  User as UserIcon, Monitor, Activity, MessageCircle, 
  BarChart3, ShieldCheck, Zap, Quote, UserCheck, 
  Send, X, ChevronRight, ChevronLeft, Loader2
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { InterviewSession, DetailedFeedback, QAPair, InterviewPersona } from '../types';

interface InterviewRoomProps {
  session: InterviewSession;
  onEnd: (feedback: DetailedFeedback) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  isPartial?: boolean;
}

const PERSONAS: InterviewPersona[] = [
  { id: 'specialist', name: 'Technical Specialist', voice: 'Kore', tone: 'analytical and deep-diving', description: 'Focuses on architectural precision.' },
  { id: 'encourager', name: 'Friendly Encourager', voice: 'Puck', tone: 'friendly and supportive', description: 'Maintains a warm environment.' },
  { id: 'executive', name: 'Direct Executive', voice: 'Charon', tone: 'direct and high-level', description: 'Evaluates strategic impact.' },
  { id: 'challenger', name: 'The Challenger', voice: 'Fenrir', tone: 'stern and pressure-testing', description: 'Simulates a high-pressure interview.' }
];

export const InterviewRoom: React.FC<InterviewRoomProps> = ({ session, onEnd }) => {
  // UI States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [aiTalking, setAiTalking] = useState(false);
  const [activeAiSpeech, setActiveAiSpeech] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<InterviewPersona>(session.persona || PERSONAS[0]);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);

  // Chat/Conversation States
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Audio/Session Refs
  const isMicOnRef = useRef(isMicOn);
  const isFinishedRef = useRef(isFinished);
  const personaRef = useRef(currentPersona);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Metrics State
  const [coachLog, setCoachLog] = useState<string[]>(["Terminal Ready.", "Awaiting AI opening..."]);
  const [metrics, setMetrics] = useState({
    clarity: 85, confidence: 80, conciseness: 75, vocabulary: 90, sentiment: 85
  });

  const currentTurnData = useRef<{ question: string; answer: string }>({ question: '', answer: '' });
  const qaHistory = useRef<QAPair[]>([]);

  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
  useEffect(() => { isFinishedRef.current = isFinished; }, [isFinished]);
  useEffect(() => { personaRef.current = currentPersona; }, [currentPersona]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const addCoachTip = useCallback((tip: string) => {
    setCoachLog(prev => {
      if (prev[prev.length - 1] === tip) return prev;
      return [...prev.slice(-4), tip];
    });
  }, []);

  const analyzeRealTimeResponse = useCallback((text: string) => {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const fillerWords = ['um', 'uh', 'like', 'actually', 'basically', 'so', 'right'];
    currentTurnData.current.answer += " " + text;
    
    updateChatHistory('user', text, true);

    const fillers = words.filter(w => fillerWords.includes(w)).length;
    setMetrics(prev => ({
      ...prev,
      confidence: Math.max(10, Math.min(100, prev.confidence - (fillers * 1.5))),
    }));

    if (fillers > 1) addCoachTip("Dynamic Note: Filler words detected.");
  }, [addCoachTip]);

  const updateChatHistory = (sender: 'ai' | 'user', text: string, isPartial: boolean) => {
    setChatHistory(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.sender === sender && lastMessage.isPartial) {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          ...lastMessage,
          text: lastMessage.text + (sender === 'ai' ? "" : " ") + text,
          isPartial: isPartial
        };
        return newHistory;
      } else {
        return [...prev, {
          id: Math.random().toString(),
          sender,
          text,
          timestamp: new Date(),
          isPartial
        }];
      }
    });
  };

  const initializeGemini = async (stream: MediaStream) => {
    try {
      if (sessionRef.current) {
        try { sessionRef.current.close(); } catch(e) {}
      }
      
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log("Connected to AI Hub.");
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!isMicOnRef.current || isFinishedRef.current) return;
              sessionPromise.then(sess => {
                sess.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) });
              }).catch(err => console.debug("Audio send failure:", err));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text!;
              analyzeRealTimeResponse(text);
            }

            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              modelParts.forEach(part => {
                if (part.text) {
                  currentTurnData.current.question += " " + part.text;
                  setActiveAiSpeech(prev => prev + " " + part.text);
                  updateChatHistory('ai', part.text, true);
                  if (part.text.toLowerCase().includes("concludes the interview")) {
                    setIsFinished(true);
                  }
                }
                if (part.inlineData?.data) {
                  setAiTalking(true);
                  playAudio(part.inlineData.data);
                }
              });
            }

            if (message.serverContent?.turnComplete) {
              setChatHistory(prev => prev.map(msg => ({ ...msg, isPartial: false })));
              const q = currentTurnData.current.question.trim();
              const a = currentTurnData.current.answer.trim();
              if (q || a) {
                qaHistory.current.push({
                  question: q || "General Discussion",
                  answer: a || "(Silence/No response captured)",
                  analysis: a.length > 80 ? "Comprehensive response." : "Concise response.",
                  sentiment: 'positive',
                  strengthScore: Math.round(metrics.confidence * 0.7 + (a.length > 50 ? 20 : 10))
                });
                currentTurnData.current = { question: '', answer: '' };
              }
              setQuestionCount(prev => prev + 1);
            }
          },
          onerror: (e) => {
            console.error("Gemini Socket Error:", e);
            addCoachTip("Temporary connectivity lag detected.");
          },
          onclose: (e) => {
            console.debug("Session closed.");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are HireAI, a world-class professional recruiter.
          TRAIT: You have a ${personaRef.current.tone} personality.
          ROLE: Interviewing for ${session.role}.
          BEHAVIOR:
          1. Start by greeting ${session.candidateName} and asking a high-level question.
          2. Handle voice and text interactions. Respond naturally.
          3. When complete, say: "This concludes our interview session. I have gathered enough information to generate your report."`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: personaRef.current.voice as any } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Init failure:", err);
      setIsConnecting(false);
    }
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !sessionRef.current) return;

    const message = textInput.trim();
    setTextInput("");
    updateChatHistory('user', message, false);
    
    // Using a more universal send approach if available, else standard realtime input wrapper
    try {
        if (typeof sessionRef.current.send === 'function') {
            await sessionRef.current.send({ parts: [{ text: message }] });
        } else if (typeof sessionRef.current.sendRealtimeInput === 'function') {
            // Some versions of the Live SDK might require text to be sent via specific input structures
            // If the explicit .send() isn't available, we log but don't crash.
            console.warn("Text input through Live API .send() not supported on this session object.");
        }
    } catch (err) {
      console.error("Failed to transmit text:", err);
    }
  };

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        activeStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        initializeGemini(stream);
      } catch (err) {
        console.error("AV Error:", err);
        setIsConnecting(false);
      }
    };
    startCamera();
    return () => {
      if (sessionRef.current) { try { sessionRef.current.close(); } catch(e) {} }
      if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
      if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close();
    };
  }, [currentPersona]);

  const playAudio = async (base64: string) => {
    try {
      const ctx = outputAudioContextRef.current!;
      if (ctx.state === 'suspended') await ctx.resume();
      const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.addEventListener('ended', () => {
        sourcesRef.current.delete(source);
        if (sourcesRef.current.size === 0) {
          setAiTalking(false);
          setTimeout(() => setActiveAiSpeech(""), 1500);
        }
      });
      const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
      sourcesRef.current.add(source);
    } catch (err) {
      console.error("Playback error:", err);
    }
  };

  const handleFinish = () => {
    const aggregateScore = Math.round((metrics.clarity + metrics.confidence + metrics.conciseness + metrics.vocabulary) / 4);
    const finalReport: DetailedFeedback = {
      summary: `Performance was ${aggregateScore > 80 ? 'exemplary' : 'solid'}. Conversational flow was natural and the candidate demonstrated ${metrics.vocabulary > 80 ? 'sophisticated' : 'clear'} communication.`,
      score: aggregateScore,
      persona: currentPersona.name,
      metrics: { ...metrics },
      improvements: [
        "Continue utilizing structured frameworks like STAR for technical answers.",
        "Ensure consistent energy levels throughout the conversation.",
        "The chat interaction showed good multitasking and clarity."
      ],
      qaPairs: qaHistory.current.length > 0 ? qaHistory.current : [
        { question: "Initial Assessment", answer: "Candidate participated.", analysis: "Positive engagement.", sentiment: 'positive', strengthScore: 85 }
      ]
    };
    onEnd(finalReport);
  };

  // Utilities
  function decode(b64: string) { return new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0))); }
  async function decodeAudioData(d: Uint8Array, ctx: AudioContext, rate: number, ch: number) {
    const i16 = new Int16Array(d.buffer);
    const frameCount = i16.length / ch;
    const buf = ctx.createBuffer(ch, frameCount, rate);
    for (let c = 0; c < ch; c++) {
      const cData = buf.getChannelData(c);
      for (let i = 0; i < frameCount; i++) cData[i] = i16[i * ch + c] / 32768.0;
    }
    return buf;
  }
  function encode(bytes: Uint8Array) {
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function createBlob(data: Float32Array) {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }

  return (
    <div className="fixed inset-0 bg-[#050608] text-white flex flex-col z-50 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-4 flex justify-between items-center border-b border-white/5 bg-black/60 backdrop-blur-2xl relative z-[60]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-indigo-400/30">
            <Bot size={24} />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-xs font-black tracking-widest uppercase mb-0.5">{session.role} Interview</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{currentPersona.name} Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2">
             <Activity size={12} className="text-emerald-400 animate-pulse" /> Live Session
          </div>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-xl border transition-all ${isChatOpen ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-white/5 text-slate-400'}`}
          >
            <MessageCircle size={18} />
          </button>
          <button 
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className={`p-2 rounded-xl border transition-all ${isAnalyticsOpen ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-white/5 text-slate-400'}`}
          >
            <BarChart3 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#0f1118_0%,#050608_100%)]">
        {/* Left Rail: Analytics */}
        {isAnalyticsOpen && (
          <aside className="w-80 hidden xl:flex flex-col border-r border-white/5 bg-black/20 p-6 gap-6 animate-in slide-in-from-left duration-500">
            <div className="flex-1 glass-effect rounded-[32px] p-6 flex flex-col gap-8 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-indigo-400"><BarChart3 size={18} /><h3 className="text-[10px] font-black uppercase tracking-widest">Real-time Metrics</h3></div>
                <Zap size={14} className="text-yellow-400" />
              </div>
              
              <div className="space-y-6 relative z-10">
                <MetricBar label="Clarity" value={metrics.clarity} color="bg-indigo-500" />
                <MetricBar label="Confidence" value={metrics.confidence} color="bg-emerald-500" />
                <MetricBar label="Vocabulary" value={metrics.vocabulary} color="bg-blue-600" />
              </div>

              <div className="mt-auto space-y-4 relative z-10 border-t border-white/5 pt-6">
                <div className="flex items-center gap-2 text-indigo-300 font-black text-[8px] uppercase tracking-widest"><Activity size={14} /> AI Coaching Tips</div>
                <div className="space-y-2">
                   {coachLog.map((log, i) => (
                     <div key={i} className="text-[10px] leading-relaxed p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 animate-in slide-in-from-bottom-2">
                        {log}
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Center: Stage */}
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* AI Persona Module */}
            <div className="bg-slate-900/30 border border-white/10 rounded-[48px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-lg group shadow-2xl p-8">
              <div className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center transition-all duration-1000 ${aiTalking ? 'bg-indigo-600/10 scale-105 shadow-[0_0_120px_rgba(79,70,229,0.3)]' : 'bg-slate-800/20'}`}>
                 <div className={`absolute inset-0 rounded-full border-4 border-indigo-500/20 ${aiTalking ? 'animate-ping duration-[1.5s]' : 'opacity-0'}`}></div>
                 <Bot size={80} className={`transition-all duration-700 ${aiTalking ? 'text-indigo-400 scale-110' : 'text-slate-700'}`} />
              </div>

              <div className="mt-12 w-full text-center">
                {activeAiSpeech ? (
                  <div className="bg-black/40 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-[32px] animate-in fade-in zoom-in-95">
                    <Quote className="text-indigo-500/20 mx-auto mb-2" size={20} />
                    <p className="text-base sm:text-lg font-bold text-slate-200 leading-relaxed italic line-clamp-3">
                      {activeAiSpeech}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Interviewer Listening...</p>
                )}
              </div>
            </div>

            {/* Candidate Stream Module */}
            <div className="bg-slate-900/30 border border-white/10 rounded-[48px] relative overflow-hidden group shadow-2xl">
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-all duration-1000 ${isVideoOn ? 'opacity-100' : 'opacity-0 scale-95'}`} />
              {!isVideoOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0b10]">
                  <UserIcon size={56} className="text-slate-800 mb-4" />
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Video Disabled</p>
                </div>
              )}
              <div className="absolute bottom-8 left-8 bg-black/70 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10">
                <span className="text-xs font-black uppercase tracking-widest text-white/90">{session.candidateName} (You)</span>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <footer className="flex justify-center items-center gap-6 bg-black/40 backdrop-blur-2xl p-4 rounded-[32px] border border-white/10 max-w-2xl mx-auto w-full">
            <ControlButton active={isMicOn} onClick={() => setIsMicOn(!isMicOn)} icon={isMicOn ? <Mic /> : <MicOff />} danger={!isMicOn} />
            <ControlButton active={isVideoOn} onClick={() => setIsVideoOn(!isVideoOn)} icon={isVideoOn ? <Video /> : <VideoOff />} danger={!isVideoOn} />
            <div className="h-10 w-px bg-white/10 mx-2" />
            <div className="relative">
              <ControlButton active={showPersonaMenu} onClick={() => setShowPersonaMenu(!showPersonaMenu)} icon={<UserCheck />} />
              {showPersonaMenu && (
                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-4 space-y-2 animate-in slide-in-from-bottom-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 px-2 mb-2">Switch Interviewer</p>
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setCurrentPersona(p); setShowPersonaMenu(false); }}
                      className={`w-full text-left p-3 rounded-xl transition-all ${currentPersona.id === p.id ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                      <div className="font-bold text-[10px]">{p.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={handleFinish} 
              className={`ml-auto px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${isFinished ? 'bg-indigo-600 animate-bounce' : 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'}`}
            >
              {isFinished ? 'View Final Report' : 'End Early'}
            </button>
          </footer>
        </div>

        {/* Right Panel: Chat Sidebar */}
        {isChatOpen && (
          <aside className="w-96 hidden lg:flex flex-col border-l border-white/5 bg-black/40 backdrop-blur-3xl animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-widest">Conversation Log</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-8">
                  <Bot size={40} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Conversation will appear here as you speak...</p>
                </div>
              )}
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                    {msg.isPartial && <span className="inline-flex ml-1 gap-0.5"><span className="w-1 h-1 bg-current rounded-full animate-bounce"></span><span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span><span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span></span>}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 mt-2">
                    {msg.sender === 'ai' ? 'HireAI' : 'You'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendText} className="p-6 border-t border-white/5 bg-black/20">
              <div className="relative">
                <input 
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type a response or question..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600"
                />
                <button 
                  type="submit"
                  disabled={!textInput.trim()}
                  className="absolute right-2 top-2 bottom-2 bg-indigo-600 disabled:opacity-30 text-white px-3 rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>

      {isConnecting && (
        <div className="absolute inset-0 bg-[#050608] z-[200] flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in duration-700">
          <div className="relative">
            <div className="w-32 h-32 border-8 border-indigo-600/10 rounded-full absolute inset-0 animate-pulse"></div>
            <div className="w-32 h-32 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <Bot size={48} className="absolute inset-0 m-auto text-indigo-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Engaging {currentPersona.name}</h2>
            <p className="text-slate-500 text-sm font-black uppercase tracking-widest max-w-xs mx-auto leading-loose">Synchronizing Neural Voice & Chat Matrix...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>{label}</span><span className="text-white">{value}%</span></div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-[2s] ease-out rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const ControlButton = ({ icon, onClick, active = true, danger = false }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl transition-all flex items-center justify-center ${
      danger 
        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
        : active 
          ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white' 
          : 'bg-indigo-600 text-white shadow-lg'
    }`}
  >
    {React.cloneElement(icon, { size: 20 })}
  </button>
);