
import React, { useState, useEffect } from 'react';
import { Question, Attempt, TestResult, TestConfig, QuizState } from '../types';
import { translateQuestion } from '../services/geminiService';

interface QuizEngineProps {
  studentName: string;
  config: TestConfig;
  questions: Question[];
  onComplete: (result: TestResult) => void;
  onHome: () => void;
}

const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Urdu'];

const QuizEngine: React.FC<QuizEngineProps> = ({ studentName, config, questions, onComplete, onHome }) => {
  const [activePool, setActivePool] = useState<Question[]>([]);
  const [incorrectQueue, setIncorrectQueue] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [language, setLanguage] = useState('English');
  const [translatedQuestion, setTranslatedQuestion] = useState<Question | null>(null);
  const [translating, setTranslating] = useState(false);

  const storageKey = `aimer_adda_resume_${studentName.replace(/\s+/g, '_').toLowerCase()}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const state: QuizState = JSON.parse(saved);
      if (state.config.subject === config.subject) {
        setActivePool(state.activePool);
        setIncorrectQueue(state.incorrectQueue);
        setCurrentIdx(state.currentIdx);
        setRoundNumber(state.roundNumber);
        setAttempts(state.attempts);
        setStartTime(state.startTime);
        setIsPaused(state.isPaused);
        setLanguage(state.language || 'English');
      } else {
        setActivePool([...questions]);
      }
    } else {
      setActivePool([...questions]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const state: QuizState = {
      config,
      studentName,
      activePool,
      incorrectQueue,
      currentIdx,
      roundNumber,
      attempts,
      startTime,
      questions,
      isPaused,
      language
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [activePool, incorrectQueue, currentIdx, roundNumber, attempts, isPaused, language]);

  useEffect(() => {
    const performTranslation = async () => {
      const current = activePool[currentIdx];
      if (!current) return;
      if (language === 'English') {
        setTranslatedQuestion(null);
        return;
      }
      setTranslating(true);
      const translated = await translateQuestion(current, language);
      setTranslatedQuestion(translated);
      setTranslating(false);
    };
    if (isInitialized) performTranslation();
  }, [language, currentIdx, activePool, isInitialized]);

  const currentQuestion = translatedQuestion || activePool[currentIdx];
  const totalAttemptedCount = new Set(attempts.map(a => a.questionId)).size;
  const progress = Math.min(100, (totalAttemptedCount / questions.length) * 100);

  const handleAnswer = (selectedIndex: number) => {
    if (feedback?.show || !activePool[currentIdx] || isPaused) return;

    const actualQuestion = activePool[currentIdx];
    const isCorrect = selectedIndex === actualQuestion.correctAnswer;
    const newAttempt: Attempt = {
      questionId: actualQuestion.id,
      isCorrect,
      round: roundNumber,
      timestamp: Date.now(),
      userSelection: selectedIndex
    };

    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    setFeedback({ isCorrect, show: true });

    setTimeout(() => {
      setFeedback(null);
      // Automatically scroll to top for new question
      window.scrollTo({ top: 0, behavior: 'smooth' });

      let nextIncorrectQueue = [...incorrectQueue];
      if (!isCorrect) {
        nextIncorrectQueue.push(actualQuestion);
        setIncorrectQueue(nextIncorrectQueue);
      }

      if (currentIdx < activePool.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        if (nextIncorrectQueue.length > 0) {
          setActivePool(nextIncorrectQueue);
          setIncorrectQueue([]);
          setCurrentIdx(0);
          setRoundNumber(prev => prev + 1);
        } else {
          finishTest(updatedAttempts);
        }
      }
    }, 1200);
  };

  const finishTest = (finalAttempts = attempts) => {
    localStorage.removeItem(storageKey);
    // Calculate accuracy only based on attempted questions as requested
    const uniqueAttemptedIds = Array.from(new Set(finalAttempts.map(a => a.questionId)));
    const oneShotCount = finalAttempts.filter(a => a.round === 1 && a.isCorrect).length;
    
    // Total questions used for analysis is whatever they attempted
    const denominator = uniqueAttemptedIds.length || 1;
    const accuracy = Math.round((oneShotCount / denominator) * 100);

    onComplete({
      id: crypto.randomUUID(),
      studentName,
      config,
      attempts: finalAttempts,
      startTime,
      endTime: Date.now(),
      oneShotAccuracy: accuracy
    });
  };

  if (!isInitialized || !currentQuestion) return (
    <div className="flex items-center justify-center py-40">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 relative min-h-[80vh] flex flex-col">
      
      {/* FLOATING CORNER CONTROLS (Icon Type) */}
      <div className="fixed bottom-6 right-6 md:top-24 md:bottom-auto z-50 flex flex-col gap-3">
        <button 
          onClick={onHome} 
          className="w-14 h-14 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all border border-slate-100"
          title="Return Home"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button 
          onClick={() => setIsPaused(!isPaused)} 
          className={`w-14 h-14 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl flex items-center justify-center transition-all border border-slate-100 ${isPaused ? 'text-amber-500 bg-amber-50' : 'text-slate-500'}`}
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
        </button>
        <button 
          onClick={() => { if(confirm("Finish now? Evaluation will be based on attempted questions.")) finishTest(); }} 
          className="w-14 h-14 bg-rose-600 shadow-2xl rounded-2xl flex items-center justify-center text-white hover:bg-rose-700 transition-all"
          title="Finish Test"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
        </button>
      </div>

      {/* LANGUAGE PICKER */}
      <div className="fixed bottom-6 left-6 z-50">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 outline-none appearance-none pr-8 cursor-pointer"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
        >
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* MAIN PROGRESS INFO */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 block">Attempt Tracking</span>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-slate-800 tracking-tight">{totalAttemptedCount}</span>
              <span className="text-slate-300 font-bold text-lg">/ {questions.length}</span>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1 block">Precision Round</span>
             <span className="text-2xl font-black text-slate-800">Target {roundNumber}</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 p-1 shadow-inner border border-slate-200 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.2)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-md rounded-[3rem] flex items-center justify-center p-10 animate-in fade-in duration-300">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-amber-600 animate-pulse">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Arrow on Hold</h3>
            <p className="text-slate-500 font-medium mb-8">Take a breath. Your progress is frozen and safe.</p>
            <button 
              onClick={() => setIsPaused(false)}
              className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
            >
              Resume Mission
            </button>
          </div>
        </div>
      )}

      {/* QUESTION CARD */}
      <div className={`flex-grow bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.12)] border border-slate-100 p-8 md:p-14 transition-all duration-500 ${isPaused ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-indigo-100">
              {currentQuestion.topic}
            </span>
            {translating && <span className="text-[9px] font-black text-slate-400 animate-pulse uppercase tracking-[0.2em]">Translating...</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-[1.25] tracking-tight">
            {currentQuestion.question}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={feedback?.show || translating}
              className={`w-full text-left p-6 md:p-8 rounded-[2.5rem] border-2 transition-all duration-300 flex items-center group
                ${feedback?.show && idx === activePool[currentIdx].correctAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xl' : ''}
                ${feedback?.show && idx !== activePool[currentIdx].correctAnswer ? 'opacity-40 grayscale pointer-events-none' : 'bg-white border-slate-50 hover:border-indigo-400 hover:bg-slate-50 text-slate-700 shadow-sm'}
              `}
            >
              <span className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center mr-6 text-sm font-black transition-all ${
                feedback?.show && idx === activePool[currentIdx].correctAnswer ? 'bg-emerald-500 text-white scale-110 shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-bold text-lg md:text-xl leading-relaxed flex-grow">{option}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`mt-10 p-6 rounded-[2.5rem] text-center font-black animate-in slide-in-from-bottom-5 duration-300 flex items-center justify-center gap-4 text-sm tracking-[0.2em] shadow-2xl
            ${feedback.isCorrect ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-rose-600 text-white shadow-rose-200'}
          `}>
            {feedback.isCorrect ? "BULLSEYE!" : "RE-AIMING..."}
          </div>
        )}
      </div>

      {/* DECORATIVE INFOGRAPHIC (Visible in background) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.03] pointer-events-none">
        <svg className="w-[40rem] h-[40rem] rotate-45" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
      </div>
    </div>
  );
};

export default QuizEngine;
