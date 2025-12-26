
import React, { useMemo, useState } from 'react';
import { TestResult } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const results: TestResult[] = useMemo(() => {
    const saved = localStorage.getItem('mastery_results');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const classFolders = useMemo(() => {
    const folders: Record<string, TestResult[]> = {};
    results.forEach(r => {
      const classKey = r.config.className;
      if (!folders[classKey]) folders[classKey] = [];
      folders[classKey].push(r);
    });
    return folders;
  }, [results]);

  const studentSubfolders = useMemo(() => {
    if (!selectedClass) return {};
    const folders: Record<string, TestResult[]> = {};
    classFolders[selectedClass].forEach(r => {
      if (!folders[r.studentName]) folders[r.studentName] = [];
      folders[r.studentName].push(r);
    });
    return folders;
  }, [selectedClass, classFolders]);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const avgOneShot = results.reduce((acc, r) => acc + r.oneShotAccuracy, 0) / results.length;
    
    return {
      totalTests: results.length,
      avgAccuracy: Math.round(avgOneShot),
      uniqueStudents: new Set(results.map(r => r.studentName)).size,
      totalLoops: results.reduce((acc, r) => acc + Math.max(...r.attempts.map(a => a.round)), 0)
    };
  }, [results]);

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `aimers_adda_analysis_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleBreadcrumbClick = (view: 'all' | 'class') => {
    if (view === 'all') {
      setSelectedClass(null);
      setSelectedStudent(null);
    } else if (view === 'class') {
      setSelectedStudent(null);
    }
  };

  const handleSmartBack = () => {
    if (selectedStudent) {
      setSelectedStudent(null);
    } else if (selectedClass) {
      setSelectedClass(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      {/* Header & Breadcrumbs */}
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
               <div className="w-3 h-8 bg-indigo-600 rounded-full"></div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Performance Vault</h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <button 
                onClick={() => handleBreadcrumbClick('all')} 
                className={`hover:text-indigo-600 transition-colors cursor-pointer ${!selectedClass ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                Repositories
              </button>
              {selectedClass && (
                <>
                  <span className="text-slate-300">/</span>
                  <button 
                    onClick={() => handleBreadcrumbClick('class')} 
                    className={`hover:text-indigo-600 transition-colors cursor-pointer ${!selectedStudent ? 'text-indigo-600' : 'text-slate-400'}`}
                  >
                    {selectedClass}
                  </button>
                </>
              )}
              {selectedStudent && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-indigo-600">{selectedStudent}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
             {results.length > 0 && (
               <button 
                 onClick={exportData}
                 className="px-6 py-3.5 bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-100 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Export Data
               </button>
             )}
             {(selectedClass || selectedStudent) && (
               <button 
                 onClick={handleSmartBack} 
                 className="px-6 py-3.5 bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-100 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                 Step Back
               </button>
             )}
             <button onClick={onBack} className="px-6 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl cursor-pointer active:scale-95">
              Exit Vault
            </button>
          </div>
        </div>

        {/* Global Statistics (only shown on home view) */}
        {!selectedClass && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50">
            <div className="text-center md:text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Profiles</p>
              <p className="text-3xl font-black text-slate-900">{stats.uniqueStudents}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Accuracy</p>
              <p className="text-3xl font-black text-indigo-600">{stats.avgAccuracy}%</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Missions</p>
              <p className="text-3xl font-black text-slate-900">{stats.totalTests}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Loops</p>
              <p className="text-3xl font-black text-rose-500">{stats.totalLoops}</p>
            </div>
          </div>
        )}
      </div>

      {!stats ? (
        <div className="bg-white p-24 rounded-[4rem] text-center shadow-2xl border border-slate-50">
          <div className="w-32 h-32 bg-slate-50 rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
             <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">Vault is Empty</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Main Repositories Grid */}
          {!selectedClass ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.keys(classFolders).map(className => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className="group bg-white p-10 rounded-[3.5rem] border-2 border-slate-50 hover:border-indigo-600 transition-all text-left shadow-xl hover:-translate-y-2 cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-indigo-100">
                    <svg className="w-10 h-10 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1 leading-none">{className}</h3>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{classFolders[className].length} Records Found</p>
                </button>
              ))}
            </div>
          ) : !selectedStudent ? (
            /* Student Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-right-4 duration-500">
              {Object.keys(studentSubfolders).map(studentName => {
                const studentAttempts = studentSubfolders[studentName];
                const bestAccuracy = Math.max(...studentAttempts.map(r => r.oneShotAccuracy));
                return (
                  <button
                    key={studentName}
                    onClick={() => setSelectedStudent(studentName)}
                    className="group bg-white p-10 rounded-[3.5rem] border-2 border-slate-50 hover:border-indigo-600 transition-all text-left shadow-xl hover:-translate-y-2 relative overflow-hidden cursor-pointer active:scale-[0.98]"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></div>
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center mb-8 font-black text-2xl shadow-xl group-hover:bg-indigo-600 group-hover:rotate-12 transition-all">
                       {studentName.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-none">{studentName}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Best: {bestAccuracy}%</span>
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{studentAttempts.length} Mission Logs</p>
                  </button>
                )
              })}
            </div>
          ) : (
            /* Student Detailed View */
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
               <div className="bg-slate-900 p-10 rounded-[4rem] text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border-4 border-indigo-600/20 shadow-2xl shadow-slate-200">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-white/10 rounded-[3rem] flex items-center justify-center font-black text-5xl border border-white/20 shadow-inner">
                       {selectedStudent.charAt(0)}
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-4xl font-black tracking-tight mb-2 leading-none uppercase">{selectedStudent}</h2>
                      <p className="text-indigo-400 font-black text-xs uppercase tracking-widest">{selectedClass} Arena Member</p>
                    </div>
                  </div>
                  <div className="flex gap-10">
                     <div className="text-center">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Missions</p>
                        <p className="text-4xl font-black">{studentSubfolders[selectedStudent].length}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Peak Accuracy</p>
                        <p className="text-4xl font-black text-emerald-400">{Math.max(...studentSubfolders[selectedStudent].map(r => r.oneShotAccuracy))}%</p>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                 {studentSubfolders[selectedStudent].map((r, i) => {
                    const maxRound = Math.max(...r.attempts.map(a => a.round));
                    return (
                      <div key={i} className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col lg:flex-row items-center gap-10 hover:border-indigo-200 hover:shadow-2xl transition-all group relative">
                        <div className="flex-grow w-full">
                          <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-100">{r.config.subject}</span>
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-100">{r.config.competition}</span>
                            <span className="ml-auto text-slate-300 font-black text-[9px] uppercase tracking-widest">{new Date(r.endTime).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                            {r.config.chapters.join(", ")}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-10 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 pt-6 lg:pt-0">
                           <div className="text-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Accuracy</p>
                              <p className={`text-4xl font-black ${r.oneShotAccuracy > 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{r.oneShotAccuracy}%</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loops</p>
                              <p className="text-4xl font-black text-slate-900">{maxRound}</p>
                           </div>
                           <div className="hidden sm:block">
                              <button className="p-5 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-inner cursor-pointer active:scale-95">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </button>
                           </div>
                        </div>
                      </div>
                    );
                 })}
               </div>
               
               <button onClick={() => setSelectedStudent(null)} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[3.5rem] text-slate-400 font-black uppercase tracking-widest text-[11px] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer">
                  Return to {selectedClass} Class List
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
