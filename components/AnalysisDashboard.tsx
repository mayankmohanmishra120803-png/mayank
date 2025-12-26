
import React, { useEffect, useState, useMemo } from 'react';
import { TestResult, MasteryAnalysis, Question } from '../types';
import { analyzeTestPerformance } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisDashboardProps {
  result: TestResult;
  questions: Question[];
  onReset: () => void;
  onReattempt: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, questions, onReset, onReattempt }) => {
  const [analysis, setAnalysis] = useState<MasteryAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'mistakes'>('all');

  useEffect(() => {
    // Scroll to top for analysis
    window.scrollTo(0, 0);

    // Save to local storage for Owner Portal
    const existing = JSON.parse(localStorage.getItem('mastery_results') || '[]');
    localStorage.setItem('mastery_results', JSON.stringify([result, ...existing].slice(0, 500)));

    const fetchAnalysis = async () => {
      const data = await analyzeTestPerformance(result, questions);
      setAnalysis(data);
      setLoading(false);
    };
    fetchAnalysis();
  }, [result]);

  const attemptedQuestionIds = Array.from(new Set(result.attempts.map(a => a.questionId)));

  const chartData = useMemo(() => {
    const topics: Record<string, { total: number; firstTry: number }> = {};
    questions.forEach(q => {
      if (attemptedQuestionIds.includes(q.id)) {
        if (!topics[q.topic]) topics[q.topic] = { total: 0, firstTry: 0 };
        topics[q.topic].total += 1;
        const firstAttempt = result.attempts.find(a => a.questionId === q.id && a.round === 1);
        if (firstAttempt?.isCorrect) topics[q.topic].firstTry += 1;
      }
    });
    return Object.entries(topics).map(([name, data]) => ({
      name: name.toUpperCase(),
      mastery: Math.round((data.firstTry / data.total) * 100),
      raw: `${data.firstTry}/${data.total}`
    }));
  }, [result, questions]);

  const leaderboardData = useMemo(() => {
    const allResults: TestResult[] = JSON.parse(localStorage.getItem('mastery_results') || '[]');
    const classResults = allResults.filter(r => 
      r.config.className === result.config.className && 
      r.config.subject === result.config.subject
    );

    const scores: Record<string, number> = {};
    classResults.forEach(r => {
      if (!scores[r.studentName] || r.oneShotAccuracy > scores[r.studentName]) {
        scores[r.studentName] = r.oneShotAccuracy;
      }
    });

    return Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [result]);

  // Prepare data for the review section
  const questionReviews = useMemo(() => {
    return attemptedQuestionIds.map(id => {
      const question = questions.find(q => q.id === id);
      const firstAttempt = result.attempts.find(a => a.questionId === id && a.round === 1);
      return { question, firstAttempt };
    }).filter(item => {
      if (reviewFilter === 'mistakes') return item.firstAttempt && !item.firstAttempt.isCorrect;
      return true;
    });
  }, [attemptedQuestionIds, questions, result, reviewFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-10 text-center">
        <div className="relative mb-10">
          <div className="w-24 h-24 border-8 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 w-24 h-24 border-t-8 border-indigo-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Calculating Trajectory</h2>
        <p className="text-slate-400 mt-2 font-black text-xs uppercase tracking-[0.3em]">AI processing attempted hits...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 animate-in fade-in duration-700 pb-24">
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 -mr-10 -mt-10">
           <svg className="w-60 h-60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
        </div>
        <div className="relative z-10">
          <span className="px-4 py-1.5 bg-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] mb-4 inline-block shadow-lg">Session Complete</span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-tight uppercase">{result.studentName}</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-white/10 px-6 py-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-white/50 block mb-1">Attempted Accuracy</span>
              <span className="text-3xl font-black">{result.oneShotAccuracy}%</span>
            </div>
            <div className="bg-white/10 px-6 py-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-white/50 block mb-1">Hits / Attempts</span>
              <span className="text-3xl font-black">{attemptedQuestionIds.length} <span className="text-lg opacity-30">/ {questions.length}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hit Statistics</h3>
               <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="w-full sm:w-auto text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-6 py-3 rounded-2xl hover:bg-indigo-100 transition-all">
                 {showLeaderboard ? 'Performance Profile' : 'Subject Leaderboard'}
               </button>
            </div>

            {showLeaderboard ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                {leaderboardData.map((entry, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${entry.name === result.studentName ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-400 text-amber-900 shadow-xl' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-orange-300 text-orange-900' : 'bg-white text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <p className="font-black text-slate-800 uppercase text-sm tracking-tight">{entry.name}</p>
                    </div>
                    <span className="text-xl font-black text-indigo-600">{entry.score}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[350px] w-full animate-in fade-in duration-500">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="mastery" radius={[0, 10, 10, 0]} barSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.mastery > 70 ? '#10b981' : entry.mastery > 40 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* New Question Review Section */}
          <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Mission Debrief</h3>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                <button 
                  onClick={() => setReviewFilter('all')}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${reviewFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setReviewFilter('mistakes')}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${reviewFilter === 'mistakes' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Mistakes
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {questionReviews.map(({ question, firstAttempt }, idx) => {
                if (!question) return null;
                const isCorrect = firstAttempt?.isCorrect;
                return (
                  <div key={question.id} className={`p-6 md:p-8 rounded-[2rem] border-2 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${isCorrect ? 'border-emerald-50 bg-white hover:border-emerald-100' : 'border-rose-50 bg-rose-50/20 hover:border-rose-100'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{question.topic}</span>
                    </div>
                    
                    <p className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">
                      {question.question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {question.options.map((opt, i) => {
                        const isCorrectOption = i === question.correctAnswer;
                        const isUserSelection = i === firstAttempt?.userSelection;
                        
                        let style = "bg-white border-slate-100 text-slate-500";
                        if (isCorrectOption) style = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                        else if (isUserSelection && !isCorrect) style = "bg-rose-50 border-rose-500 text-rose-900 font-bold";

                        return (
                          <div key={i} className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${style}`}>
                            <span className="text-[10px] font-black opacity-40">{String.fromCharCode(65 + i)}</span>
                            {opt}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        Brief Solution
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        {question.explanation || "No explanation provided."}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {questionReviews.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No records found for this filter</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-black mb-6 text-slate-800 uppercase tracking-tight">Tactical Improvements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis?.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center mr-4 shrink-0 font-black text-xs">
                    {i + 1}
                  </span>
                  <p className="text-slate-600 text-xs font-bold leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-lg font-black mb-6 text-slate-800 uppercase tracking-tight">Psychometric Intel</h3>
            <p className="text-slate-500 leading-relaxed text-xs font-bold italic mb-8 bg-indigo-50 p-5 rounded-2xl">
              "{analysis?.cognitiveSummary}"
            </p>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Green Zones</span>
                <div className="flex flex-wrap gap-2">
                  {analysis?.strengths.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl uppercase">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Critical Vulnerabilities</span>
                <div className="flex flex-wrap gap-2">
                  {analysis?.weaknesses.map((w, i) => (
                    <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl uppercase">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onReattempt}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl uppercase tracking-widest text-xs"
            >
              Reattempt Mission
            </button>
            <button 
              onClick={onReset}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl uppercase tracking-widest text-xs"
            >
              Start New Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
