/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TodoSection } from './components/TodoSection';
import { PomodoroTimer } from './components/PomodoroTimer';
import { BgmPlayer } from './components/BgmPlayer';
import { MemoSection } from './components/MemoSection';
import { ShortcutGrid } from './components/ShortcutGrid';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [userName, setUserName] = useState('roa');
  
  // BGM synchronization states
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [bgmTrackId, setBgmTrackId] = useState(1);
  
  // Integration configuration options (persisted locally)
  const [bgmAutoplayFocus, setBgmAutoplayFocus] = useState(() => {
    const saved = localStorage.getItem('roa_workspace_bgm_auto_focus');
    return saved ? saved === 'true' : true; // default true
  });
  
  const [bgmAutopauseBreak, setBgmAutopauseBreak] = useState(() => {
    const saved = localStorage.getItem('roa_workspace_bgm_auto_break');
    return saved ? saved === 'true' : true; // default true
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('roa_workspace_bgm_auto_focus', String(bgmAutoplayFocus));
  }, [bgmAutoplayFocus]);

  useEffect(() => {
    localStorage.setItem('roa_workspace_bgm_auto_break', String(bgmAutopauseBreak));
  }, [bgmAutopauseBreak]);

  // Integration callbacks
  const handleFocusStart = () => {
    if (bgmAutoplayFocus) {
      setBgmPlaying(true);
    }
  };

  const handleBreakStart = () => {
    if (bgmAutopauseBreak) {
      setBgmPlaying(false);
    }
  };

  const handleTimerPauseOrStop = () => {
    if (bgmAutopauseBreak) {
      setBgmPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg text-[#7A2930] p-4 sm:p-6 md:p-8 font-sans selection:bg-[#E7B4B9]/30 select-none pb-12">
      {/* Absolute Decorative Blobs to give a cute clay feel */}
      <div className="fixed -top-16 -left-16 w-80 h-80 rounded-full bg-[#E7B4B9]/55 blur-2xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-20 w-72 h-72 rounded-full bg-[#E8F0A2]/55 blur-2xl pointer-events-none z-0" />
      <div className="fixed -bottom-10 left-1/4 w-96 h-96 rounded-full bg-[#999D4F]/25 blur-2xl pointer-events-none z-0" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Adorable Top Header bar */}
        <Header userName={userName} />



        {/* Dashboard grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Column 1: Focus Module block (Pomodoro & BGM Deck) - span 4 */}
          <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8 justify-between">
            <PomodoroTimer
              onFocusStart={handleFocusStart}
              onBreakStart={handleBreakStart}
              onTimerPauseOrStop={handleTimerPauseOrStop}
              bgmAutoplayFocus={bgmAutoplayFocus}
              setBgmAutoplayFocus={setBgmAutoplayFocus}
              bgmAutopauseBreak={bgmAutopauseBreak}
              setBgmAutopauseBreak={setBgmAutopauseBreak}
            />
          </div>

          {/* Column 2: Ambient Music Console Deck - span 4 */}
          <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8 justify-between">
            <BgmPlayer
              bgmPlaying={bgmPlaying}
              setBgmPlaying={setBgmPlaying}
              trackId={bgmTrackId}
              setTrackId={setBgmTrackId}
            />
          </div>

          {/* Column 3: Checklist Workspace Deck - span 4 */}
          <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8 justify-between">
            <TodoSection />
          </div>

          {/* Row Bottom Blocks: Notepad Shortcuts & quick memos - spans 12 */}
          <div className="lg:col-span-6">
            <MemoSection />
          </div>

          <div className="lg:col-span-6">
            <ShortcutGrid />
          </div>

        </div>

        {/* Adorable dynamic page footer */}
        <footer className="mt-16 border-t-2 border-[#E7B4B9] pt-6 text-center text-xs font-bold text-[#7A2930]/70 flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-[#999D4F]" />
            <span>roa님의 오늘도 반짝반짝 빛나는 하루를 응원합니다!</span>
          </div>
          <span className="hidden sm:inline text-[#999D4F]">•</span>
          <div className="flex items-center gap-1">
            <span>Made with Sweet Claymorphism & TypeScript</span>
            <Heart className="w-3.5 h-3.5 text-[#A4565C] fill-[#A4565C]" />
          </div>
        </footer>

      </div>
    </div>
  );
}
