
import React, { useState, useEffect } from 'react';
import SetupForm from './components/SetupForm';
import QuizEngine from './components/QuizEngine';
import AnalysisDashboard from './components/AnalysisDashboard';
import AdminDashboard from './components/AdminDashboard';
import OwnerAuth from './components/OwnerAuth';
import { TestConfig, TestResult, Question, UserRole } from './types';
import { generateAITest } from './services/geminiService';

const ArcheryLogo = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10 flex items-center justify-center">
       <div className="absolute inset-0 border-[4px] border-indigo-600 rounded-full"></div>
       <div className="absolute inset-0 border-[8px] border-indigo-200 rounded-full scale-[0.6]"></div>
       <div className="absolute inset-0 border-[12px] border-rose-500 rounded-full scale-[0.3]"></div>
       <div className="absolute top-1/2 left-[-8px] w-14 h-1 bg-indigo-900 rotate-[-45deg] origin-left rounded-full">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-900 rotate 45 border-r-2 border-b-2 border-indigo-200"></div>
       </div>
    </div>
    <div className="flex flex-col">
       <span className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Aimer's <span className="text-indigo-600">Adda</span></span>
       <span className="text-[7px] font-black text-slate-400 tracking-[0.3em] uppercase leading-none mt-1">AI Mastery Hub</span>
    </div>
  </div>
);

const MotivationQuotes = [
  "Precision beats power, timing beats speed.",
  "Don't practice until you get it right. Practice until you can't get it wrong.",
  "Consistency is the companion of mastery.",
  "Aim for the moon. If you miss, you'll land among stars."
];

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isOwnerAuthRequired, setIsOwnerAuthRequired] = useState(false);
  const [view, setView] = useState<'setup' | 'quiz' | 'analysis' | 'admin' | 'generating'>('setup');
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [studentName, setStudentName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % MotivationQuotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTest = async (config: TestConfig, name: string) => {
    setStudentName(name);
    setTestConfig(config);
    setView('generating');
    try {
      const generated = await generateAITest(config);
      setQuestions(generated);
      setView('quiz');
    } catch (err) {
      alert("Failed to generate test. Check API configuration.");
      setView('setup');
    }
  };

  const handleTestComplete = (result: TestResult) => {
    setLastResult(result);
    setView('analysis');
  };

  const handleReset = () => {
    setView('setup');
    setTestConfig(null);
    setQuestions([]);
    setLastResult(null);
  };

  // Fix: Added handleReattempt function to allow students to restart the quiz with the existing set of questions
  const handleReattempt = () => {
    setView('quiz');
  };

  const initiateOwnerLogin = () => {
    setIsOwnerAuthRequired(true);
  };

  if (!role && !isOwnerAuthRequired) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12 bg-white">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-indigo-100 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
           <div className="absolute bottom-[10%] right-[5%] w-[35rem] h-[35rem] bg-rose-100 rounded-full blur-[100px] opacity-30 animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl">
          <div className="mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
             <div className="flex flex-col items-center gap-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] rotate-12 shadow-[0_0_40px_rgba(79,70,229,0.3)]"></div>
                    <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border-4 border-white/10">
                       <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Aimer's <span className="text-indigo-600">Adda</span></h1>
                <p className="text-rose-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-in fade-in duration-1000">
                  {MotivationQuotes[quoteIdx]}
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => setRole('student')}
              className="group bg-white p-12 rounded-[4rem] shadow-2xl border-2 border-slate-50 hover:border-indigo-600 transition-all text-center relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all">
                 <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-2">Student</h2>
              <p className="text-slate-400 font-bold text-sm">Launch precision revision</p>
              <div className="mt-8 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Enter Arena</div>
            </button>

            <button 
              onClick={initiateOwnerLogin}
              className="group bg-slate-900 p-12 rounded-[4rem] shadow-2xl transition-all text-center relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all border border-white/10">
                 <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <h2 className="text-4xl font-black text-white mb-2">Owner</h2>
              <p className="text-slate-400 font-bold text-sm">Access analytics vault</p>
              <div className="mt-8 px-6 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl">Secure Login</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdff] relative flex flex-col">
      {isOwnerAuthRequired && (
        <OwnerAuth 
          onAuthenticated={() => { setIsOwnerAuthRequired(false); setRole('owner'); setView('admin'); }} 
          onCancel={() => setIsOwnerAuthRequired(false)} 
        />
      )}

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 px-6 md:px-12 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => { setRole(null); handleReset(); }}><ArcheryLogo /></div>
          {role && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline px-4 py-1.5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">{role} Mode</span>
              <button onClick={() => { setRole(null); handleReset(); }} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg></button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-6">
        {view === 'admin' && role === 'owner' && <AdminDashboard onBack={() => { setRole(null); handleReset(); }} />}
        {view === 'setup' && role === 'student' && <SetupForm onStart={handleStartTest} onSwitchToOwner={initiateOwnerLogin} />}
        {view === 'generating' && (
          <div className="flex flex-col items-center justify-center py-40 animate-in zoom-in duration-500 text-center">
            <div className="relative mb-10">
               <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
               </div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Forging Target...</h2>
            <p className="text-indigo-400 mt-2 font-black uppercase tracking-widest text-[9px]">Aimer's AI is calibrating your paper</p>
          </div>
        )}
        {view === 'quiz' && testConfig && <QuizEngine studentName={studentName} config={testConfig} questions={questions} onComplete={handleTestComplete} onHome={handleReset} />}
        {view === 'analysis' && lastResult && <AnalysisDashboard result={lastResult} questions={questions} onReset={handleReset} onReattempt={handleReattempt} />}
      </main>
    </div>
  );
};

export default App;
