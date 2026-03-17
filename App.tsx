
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateInterview } from './pages/CreateInterview';
import { InterviewRoom } from './pages/InterviewRoom';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { FeedbackReport } from './pages/FeedbackReport';
import { InterviewSession, InterviewStatus, User, DetailedFeedback } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'LANDING' | 'AUTH' | 'DASHBOARD' | 'CREATE' | 'ROOM' | 'REPORT'>('LANDING');
  const [user, setUser] = useState<User | null>(null);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);

  const handleLogin = (name: string, email: string) => {
    setUser({ name, email, isLoggedIn: true });
    setCurrentPage('DASHBOARD');
  };

  const createInterview = (session: Omit<InterviewSession, 'id' | 'status' | 'date'>) => {
    const newSession: InterviewSession = {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
      status: InterviewStatus.SCHEDULED,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setInterviews([newSession, ...interviews]);
    return newSession;
  };

  const startInterview = (session: InterviewSession) => {
    setActiveSession(session);
    setCurrentPage('ROOM');
  };

  const completeInterview = (detailedFeedback: DetailedFeedback) => {
    if (activeSession) {
      setInterviews(prev => prev.map(inv => 
        inv.id === activeSession.id 
          ? { ...inv, status: InterviewStatus.COMPLETED, detailedFeedback, score: detailedFeedback.score } 
          : inv
      ));
      setActiveSession({ ...activeSession, detailedFeedback, status: InterviewStatus.COMPLETED });
    }
    setCurrentPage('REPORT');
  };

  if (currentPage === 'LANDING') {
    return <LandingPage onStart={() => setCurrentPage('AUTH')} />;
  }

  if (currentPage === 'AUTH') {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentPage === 'ROOM' && activeSession) {
    return <InterviewRoom session={activeSession} onEnd={completeInterview} />;
  }

  if (currentPage === 'REPORT' && activeSession?.detailedFeedback) {
    return <FeedbackReport session={activeSession} onDone={() => setCurrentPage('DASHBOARD')} />;
  }

  return (
    <Layout user={user} onNavigate={setCurrentPage} currentPage={currentPage}>
      {currentPage === 'DASHBOARD' && (
        <Dashboard 
          interviews={interviews} 
          onStartInterview={startInterview} 
          onNewClick={() => setCurrentPage('CREATE')}
        />
      )}
      {currentPage === 'CREATE' && (
        <CreateInterview 
          onCreate={createInterview} 
          onBack={() => setCurrentPage('DASHBOARD')}
        />
      )}
    </Layout>
  );
};

export default App;
