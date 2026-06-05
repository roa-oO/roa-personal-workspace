import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Award, Flame } from 'lucide-react';
import { soundEngine } from '../audioEngine';

interface PomodoroTimerProps {
  onFocusStart: () => void;
  onBreakStart: () => void;
  onTimerPauseOrStop: () => void;
  bgmAutoplayFocus: boolean;
  setBgmAutoplayFocus: (val: boolean) => void;
  bgmAutopauseBreak: boolean;
  setBgmAutopauseBreak: (val: boolean) => void;
}

export function PomodoroTimer({
  onFocusStart,
  onBreakStart,
  onTimerPauseOrStop,
  bgmAutoplayFocus,
  setBgmAutoplayFocus,
  bgmAutopauseBreak,
  setBgmAutopauseBreak,
}: PomodoroTimerProps) {
  // Configs
  const FOCUS_SECONDS = 40 * 60; // 40 minutes (2400s)
  const BREAK_SECONDS = 10 * 60; // 10 minutes (600s)

  // Dev Quick Test Configs
  const [isTestMode, setIsTestMode] = useState(false);
  const targetFocusSecs = isTestMode ? 40 : FOCUS_SECONDS;
  const targetBreakSecs = isTestMode ? 10 : BREAK_SECONDS;

  // Primary State
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(2400);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef<any>(null);

  // Helper: Get Current Date String YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // 1. Initial State Sync & Date Reset Check
  useEffect(() => {
    const today = getTodayString();
    const savedDate = localStorage.getItem('roa_workspace_timer_date');
    
    if (savedDate !== today) {
      // Date changed: reset state for new day
      setCompletedSessions(0);
      setMode('focus');
      setTimeLeft(targetFocusSecs);
      setIsRunning(false);
      localStorage.setItem('roa_workspace_timer_date', today);
      localStorage.setItem('roa_workspace_completed_sessions', '0');
    } else {
      // Same date: load saved states
      const savedSessions = localStorage.getItem('roa_workspace_completed_sessions');
      if (savedSessions) {
        setCompletedSessions(parseInt(savedSessions, 10));
      }
      const savedMode = localStorage.getItem('roa_workspace_timer_mode') as 'focus' | 'break';
      if (savedMode) {
        setMode(savedMode);
      }
      const savedTimeLeft = localStorage.getItem('roa_workspace_timer_timeleft');
      if (savedTimeLeft) {
        setTimeLeft(parseInt(savedTimeLeft, 10));
      }
    }
  }, []);

  // Sync test mode values dynamically
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === 'focus' ? targetFocusSecs : targetBreakSecs);
    }
  }, [isTestMode, mode]);

  // 2. LocalStorage Persistence helper
  const persistState = (newMode: 'focus' | 'break', newTime: number) => {
    localStorage.setItem('roa_workspace_timer_mode', newMode);
    localStorage.setItem('roa_workspace_timer_timeleft', String(newTime));
    localStorage.setItem('roa_workspace_timer_date', getTodayString());
  };

  // 3. Audio / State Handler for Completion
  const handleSessionComplete = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      const nextSessions = completedSessions + 1;
      setCompletedSessions(nextSessions);
      localStorage.setItem('roa_workspace_completed_sessions', String(nextSessions));

      // SFX for Full Session End (100% completed)
      soundEngine.playSFX('allCompleted');

      // Auto switch to Break Mode
      setMode('break');
      setTimeLeft(targetBreakSecs);
      persistState('break', targetBreakSecs);

      // Trigger automatic pause if option checked
      if (bgmAutopauseBreak) {
        onTimerPauseOrStop();
      }

      // Automatically trigger break sounds in soundEngine
      setTimeout(() => {
        soundEngine.playSFX('breakStart');
        if (bgmAutoplayFocus === false) {
          // Play break notification
        }
      }, 1000);
    } else {
      // Break Finished -> Back to Focus mode
      soundEngine.playSFX('focusStart');
      setMode('focus');
      setTimeLeft(targetFocusSecs);
      persistState('focus', targetFocusSecs);
    }
  };

  // 4. Timer ticking loop engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSessionComplete();
            return 0;
          }
          const nextTime = prev - 1;
          localStorage.setItem('roa_workspace_timer_timeleft', String(nextTime));
          return nextTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, completedSessions, isTestMode]);

  // Controls
  const handleTogglePlay = () => {
    const nextIsRunning = !isRunning;
    setIsRunning(nextIsRunning);

    if (nextIsRunning) {
      if (mode === 'focus') {
        soundEngine.playSFX('focusStart');
        if (bgmAutoplayFocus) {
          onFocusStart();
        }
      } else {
        soundEngine.playSFX('breakStart');
      }
    } else {
      onTimerPauseOrStop();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    onTimerPauseOrStop();
    const defaultTime = mode === 'focus' ? targetFocusSecs : targetBreakSecs;
    setTimeLeft(defaultTime);
    persistState(mode, defaultTime);
  };

  const handleModeSwitch = (newMode: 'focus' | 'break') => {
    setIsRunning(false);
    onTimerPauseOrStop();
    setMode(newMode);
    const defaultTime = newMode === 'focus' ? targetFocusSecs : targetBreakSecs;
    setTimeLeft(defaultTime);
    persistState(newMode, defaultTime);
  };

  // Format Helper MM:SS
  const formatTimerDigital = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculating Circular Ring Percentage
  const maxSecs = mode === 'focus' ? targetFocusSecs : targetBreakSecs;
  const percentage = maxSecs > 0 ? (timeLeft / maxSecs) * 100 : 0;
  const dashArray = 2 * Math.PI * 80; // Stroke radius is 80

  return (
    <div className="clay-card-blue p-6 flex flex-col h-full min-h-[420px] justify-between relative overflow-hidden">
      {/* Test Mode cute ribbon on top corner */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#FFF7F8]/70 px-2 py-1 rounded-lg border border-[#999D4F] text-[10px] font-bold">
        <span className="text-[#5F6420]">⏱️ 60배 고속</span>
        <input
          type="checkbox"
          checked={isTestMode}
          onChange={(e) => setIsTestMode(e.target.checked)}
          className="rounded cursor-pointer checked:bg-[#999D4F]"
        />
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1 border-b-2 border-[#999D4F] pb-3">
          <Flame className="w-6 h-6 text-[#A4565C] animate-pulse" />
          <h2 className="text-xl font-display font-black text-[#7A2930]">뽀모도로 포커스 ⏱️</h2>
        </div>

        {/* Tab mode toggle button */}
        <div className="flex gap-2.5 mt-4 p-1 bg-[#FFF7F8]/70 border border-[#999D4F] rounded-xl self-center max-w-xs mx-auto">
          <button
            onClick={() => handleModeSwitch('focus')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-[#A4565C] text-white shadow-sm'
                : 'text-[#7A2930] hover:bg-[#FDE5E8]/70'
            }`}
          >
            집중 모드 (40분)
          </button>
          <button
            onClick={() => handleModeSwitch('break')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
              mode === 'break'
                ? 'bg-[#999D4F] text-white shadow-sm'
                : 'text-[#7A2930] hover:bg-[#FDE5E8]/70'
            }`}
          >
            휴식 모드 (10분)
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex flex-col items-center justify-center my-6 relative">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background circle outline */}
          <circle
            cx="96"
            cy="96"
            r="80"
            className="stroke-[#FDE5E8] fill-[#FFF7F8]"
            strokeWidth="10"
          />
          {/* Active progress ring */}
          <circle
            cx="96"
            cy="96"
            r="80"
            className={`transition-all duration-300 fill-transparent ${
              mode === 'focus' ? 'stroke-[#A4565C]' : 'stroke-[#999D4F]'
            }`}
            strokeWidth="10"
            strokeDasharray={dashArray}
            strokeDashoffset={dashArray - (percentage / 100) * dashArray}
            strokeLinecap="round"
          />
        </svg>

        {/* Floating Digital Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold font-mono tracking-wider ${
            mode === 'focus' ? 'text-[#7A2930]' : 'text-[#5F6420]'
          }`}>
            {formatTimerDigital(timeLeft)}
          </span>
          <span className={`text-[10px] font-black tracking-widest uppercase mt-0.5 px-2 py-0.5 rounded-full ${
            mode === 'focus' ? 'bg-[#E7B4B9] text-[#7A2930]' : 'bg-[#E8F0A2] text-[#5F6420]'
          }`}>
            {mode === 'focus' ? '집중하는 시간' : '토닥토닥 휴식'}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={handleReset}
          aria-label="타이머 리셋"
          className="clay-btn-gray p-3.5 rounded-2xl cursor-pointer hover:bg-[#E7B4B9]"
        >
          <RotateCcw className="w-5 h-5 text-[#7A2930]" />
        </button>

        <button
          onClick={handleTogglePlay}
          aria-label={isRunning ? "일시 정지" : "타이머 시작"}
          className={`p-4 rounded-3xl cursor-pointer ${
            mode === 'focus' ? 'clay-btn-blue' : 'clay-btn-green'
          }`}
        >
          {isRunning ? <Pause className="w-7 h-7 fill-white stroke-none" /> : <Play className="w-7 h-7 fill-white stroke-none ml-0.5" />}
        </button>
      </div>

      {/* Auto Integration Options */}
      <div className="mt-4 border-t border-[#999D4F] pt-3.5 flex flex-col gap-2 bg-[#FFF7F8]/40 p-2.5 rounded-xl text-[11px] font-bold text-[#7A2930]">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={bgmAutoplayFocus}
            onChange={(e) => setBgmAutoplayFocus(e.target.checked)}
            className="rounded border-[#999D4F] text-[#A4565C] focus:ring-[#A4565C] cursor-pointer"
          />
          <span>집중 시작 시 BGM 자동 재생 🎶</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={bgmAutopauseBreak}
            onChange={(e) => setBgmAutopauseBreak(e.target.checked)}
            className="rounded border-[#999D4F] text-[#999D4F] focus:ring-[#999D4F] cursor-pointer"
          />
          <span>휴식/종료 시 BGM 일시정지 💤</span>
        </label>
      </div>

      {/* Session History Block Cumulative Area */}
      <div className="mt-4 border-t-2 border-[#999D4F] pt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Award className="w-5 h-5 text-[#999D4F]" />
          <span className="text-xs font-black text-[#7A2930]">오늘의 달성 세션 수:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {completedSessions === 0 ? (
            <span className="text-[10px] font-bold text-[#5F6420]/70 italic">아직 첫 세션 완료 전! 화이팅 🔥</span>
          ) : (
            // Visual Star Badge pile-up
            Array.from({ length: Math.min(completedSessions, 10) }).map((_, index) => (
              <span
                key={index}
                className="inline-block transform hover:scale-125 transition-transform cursor-help"
                title={`${completedSessions}개 세션 달성`}
              >
                ⭐
              </span>
            ))
          )}
          {completedSessions > 10 && (
            <span className="text-xs font-black text-[#A4565C] ml-1 bg-white border border-[#E7B4B9] px-1.5 rounded-full">
              +{completedSessions - 10}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
