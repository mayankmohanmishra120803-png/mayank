
import React, { useState, useEffect } from 'react';

interface OwnerAuthProps {
  onAuthenticated: () => void;
  onCancel: () => void;
}

const OwnerAuth: React.FC<OwnerAuthProps> = ({ onAuthenticated, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isFirstSetup, setIsFirstSetup] = useState(false);

  useEffect(() => {
    const creds = localStorage.getItem('mastery_owner_creds');
    if (!creds) {
      setIsFirstSetup(true);
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3 || password.length < 4) {
      setError('Username (3+) and Password (4+) required.');
      return;
    }

    const storedStr = localStorage.getItem('mastery_owner_creds');
    
    if (!storedStr) {
      // First time setup
      localStorage.setItem('mastery_owner_creds', JSON.stringify({ username, password }));
      onAuthenticated();
    } else {
      // Standard Login
      const stored = JSON.parse(storedStr);
      if (username === stored.username && password === stored.password) {
        onAuthenticated();
      } else {
        setError('Invalid credentials. Access denied.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.4)] relative overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">
            {isFirstSetup ? 'Initialize Vault' : 'Vault Access'}
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
             {isFirstSetup ? 'Create your owner credentials' : 'Enter credentials to continue'}
          </p>
        </div>

        <form onSubmit={handleAction} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-800"
              placeholder="Admin Username"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-800"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 text-[10px] font-black rounded-xl text-center bg-rose-50 text-rose-600 border border-rose-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="pt-4 flex flex-col gap-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs cursor-pointer active:scale-95"
            >
              {isFirstSetup ? 'Create & Enter' : 'Unlock Dashboard'}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="text-[9px] text-slate-400 font-black hover:text-rose-500 transition-colors uppercase tracking-[0.2em] py-2 cursor-pointer"
            >
              Cancel Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerAuth;
