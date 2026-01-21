
import React, { useState, useCallback } from 'react';
import { AppState, ProfileData } from './types';
import { extractStructuredProfile } from './services/geminiService';
import ProfileDisplay from './components/ProfileDisplay';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAppState(AppState.PROCESSING);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const data = await extractStructuredProfile(base64);
        setProfileData(data);
        setAppState(AppState.RESULT);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to process the screenshot. Please ensure it is a clear LinkedIn profile image.");
        setAppState(AppState.ERROR);
      }
    };
    reader.onerror = () => {
      setError("Error reading the file system.");
      setAppState(AppState.ERROR);
    };
    reader.readAsDataURL(file);
  }, []);

  const reset = () => {
    setAppState(AppState.IDLE);
    setProfileData(null);
    setError(null);
  };

  if (appState === AppState.RESULT && profileData) {
    return <ProfileDisplay data={profileData} onReset={reset} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      <div className="max-w-xl w-full">
        {/* Minimalist Hero */}
        <div className="text-center mb-16">
          <div className="inline-block bg-neutral-950 text-white px-4 py-1 rounded mb-8 text-[10px] font-black uppercase tracking-[0.3em]">
            Website Generator
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-black tracking-tighter mb-6 text-neutral-950">
            LI.Extract
          </h1>
          <p className="text-sm text-neutral-400 font-medium max-w-sm mx-auto leading-relaxed">
            Transform profile screenshots into semantic, article-style websites. 
            Deterministic extraction for professional results.
          </p>
        </div>

        {/* Action Container */}
        <div className={`relative bg-white border-2 rounded-[2.5rem] p-12 sm:p-20 transition-all duration-700 ${appState === AppState.PROCESSING ? 'border-neutral-900 shadow-2xl scale-[1.02]' : 'border-neutral-100 hover:border-neutral-200'}`}>
          {appState === AppState.PROCESSING ? (
            <div className="flex flex-col items-center text-center space-y-10">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-neutral-100 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-neutral-900 rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900">Generating Site</h3>
                <p className="text-xs text-neutral-400 font-serif italic italic-none">Normalizing content to semantic HTML...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <label className="cursor-pointer group flex flex-col items-center">
                <div className="w-24 h-24 bg-neutral-50 rounded-3xl flex items-center justify-center border border-neutral-100 mb-10 group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-all duration-300">
                  <svg className="w-8 h-8 text-neutral-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
                <span className="bg-neutral-950 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] py-5 px-14 rounded-2xl shadow-xl transition-all duration-300 active:scale-95">
                  Select Profile Image
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}
        </div>

        {/* Error States */}
        {appState === AppState.ERROR && error && (
          <div className="mt-10 p-6 bg-neutral-50 border border-neutral-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-neutral-300"></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">System Interruption</h4>
            </div>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed mb-4">{error}</p>
            <button onClick={reset} className="text-[10px] font-black uppercase text-neutral-950 underline hover:text-neutral-600 transition-colors">Re-attempt</button>
          </div>
        )}

        {/* Capability Overview */}
        <div className="mt-24 grid grid-cols-2 gap-x-12 gap-y-12">
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Semantic HTML</h5>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">Valid header, section, and article tags for perfect SEO and accessibility.</p>
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Clean Design</h5>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">Article-like flow with zero icons or UI noise. Pure professional focus.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
