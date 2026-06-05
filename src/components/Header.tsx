import { useState, useEffect } from 'react';
import { RefreshCw, Smile, Clock, Calendar } from 'lucide-react';

const CUTE_QUOTES = [
  "가로 막히면 세로 시작하면 돼 🦄",
  "오늘도 기분 좋은 하루 시작! 화이팅 🍀",
  "완벽하지 않아도 괜찮아, 일단 해보는 거야 ✨",
  "먼지 같은 일도 쌓이면 먼지더미가 된다구! 화이팅 🐾",
  "가장 늦었다고 생각할 때가 진짜 그냥 재미있는 시작일 뿐 ⏰",
  "개발, 디자인, 공부... 뭐든 잘해낼 수 있는 'roa'니까! 🧸",
  "커피 한 잔 마시고 심호흡 한 번 할까? ☕",
  "쉬엄쉬엄해, 너는 지치지 않는 귀여운 별이야! 🌟",
  "오늘의 할 일은 내일의 내가 다 해결해 줄 거야 (아마도) 🤭",
  "실패는 성공의 어... 부모님 같은 거라고 하자! 🌱",
  "쉬어가는 것도 집중의 한 과정이라구! 물 한 모금 마셔요 💧"
];

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Live update time every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Soft random rotate quotes
  const handleRotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % CUTE_QUOTES.length);
  };

  // Format date Korean style
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const day = dayNames[d.getDay()];
    return `${year}년 ${month}월 ${date}일 (${day})`;
  };

  // Format time (HH:MM:SS)
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <header className="w-full relative z-10 clay-card bg-[#FDE5E8] border-3 border-[#E7B4B9] p-6 mb-8 mt-4 transition-all duration-300 transform hover:scale-[1.01] overflow-hidden">
      {/* Decorative floating bubbles for the header */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#E8F0A2] opacity-35 pointer-events-none animate-bubble" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#E7B4B9] opacity-35 pointer-events-none animate-bubble" style={{ animationDelay: '2s' }} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
        {/* User Greet Area */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-md border-2 border-white transform hover:rotate-12 transition-transform duration-200 cursor-pointer bg-[#E7B4B9]">
            <img
              src="/input_file_0.png"
              alt="Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallbackEl = document.createElement('span');
                  fallbackEl.className = 'text-4xl';
                  fallbackEl.textContent = '🧸';
                  parent.appendChild(fallbackEl);
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-[#7A2930] tracking-tight">
              안녕, <span className="text-[#A4565C]">{userName}</span>! 🌸
            </h1>
            <p className="text-sm font-semibold text-[#7A2930]/75 mt-1 md:mt-0">
              오늘도 나만의 아늑한 워크플레이스에서 행복하게 시작해볼까? ✨
            </p>
          </div>
        </div>

        {/* Live Clock & Calendar */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Calendar Block */}
          <div className="flex items-center gap-2 bg-[#FFF7F8] px-4 py-2.5 rounded-2xl border-2 border-[#E7B4B9] shadow-sm">
            <Calendar className="w-5 h-5 text-[#A4565C]" />
            <span className="text-sm font-bold text-[#7A2930]">{formatDate(time)}</span>
          </div>

          {/* Real-time seconds clock */}
          <div className="flex items-center gap-2 bg-[#FFF7F8] px-4 py-2.5 rounded-2xl border-2 border-[#E8F0A2] shadow-sm transform hover:scale-105 transition-transform duration-200">
            <Clock className="w-5 h-5 text-[#999D4F] animate-pulse" />
            <span className="text-md font-extrabold text-[#5F6420] tracking-widest font-mono">
              {formatTime(time)}
            </span>
          </div>
        </div>
      </div>

      {/* Humorous and Sweet Quote Bar */}
      <div className="mt-5 pt-4 border-t-2 border-[#E7B4B9] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Smile className="w-5 h-5 text-[#A4565C] shrink-0" />
          <span className="text-sm font-black text-[#7A2930] transition-all duration-300 animate-pulse-subtle">
            "{CUTE_QUOTES[quoteIndex]}"
          </span>
        </div>
        <button
          onClick={handleRotateQuote}
          aria-label="새로운 문구 보기"
          className="clay-btn-peach p-2.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transform scale-90"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-bold">기분전환</span>
        </button>
      </div>
    </header>
  );
}
