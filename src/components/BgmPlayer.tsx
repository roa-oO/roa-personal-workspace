import { useState, useEffect } from 'react';
import { Music, Play, Square, Volume2, Disc } from 'lucide-react';
import { soundEngine } from '../audioEngine';

interface BgmPlayerProps {
  bgmPlaying: boolean;
  setBgmPlaying: (val: boolean) => void;
  trackId: number;
  setTrackId: (id: number) => void;
}

const BGM_TRACKS = [
  { id: 1, name: "Peaceful CCM 🎹", desc: "흩어진 마음을 모으는 찬양" },
  { id: 2, name: "Kyoto vibes ☀️", desc: "지난 여름 교토의 말차맛이 떠올라" },
  { id: 3, name: "Paris's Morning 🗼", desc: "파리의 아침, 산책이나 나가볼까" },
  { id: 4, name: "Calm Dawn 🌆", desc: "구름 잔뜩 낀 잠 못드는 새벽 " },
  { id: 5, name: "Forest of Amimals 🌳", desc: "가로막히면 세로하면 돼!" }
];

export function BgmPlayer({ bgmPlaying, setBgmPlaying, trackId, setTrackId }: BgmPlayerProps) {
  const [volume, setVolume] = useState(0.4); // default 40%

  // Apply volume changes on mount and adjust
  useEffect(() => {
    soundEngine.setVolume(volume);
  }, [volume]);

  // Synchronize playing states with Sound Engine
  useEffect(() => {
    if (bgmPlaying) {
      soundEngine.playBgm(trackId);
    } else {
      soundEngine.stopBgm();
    }
    // Cleanup on unmount
    return () => {
      soundEngine.stopBgm();
    };
  }, [bgmPlaying, trackId]);

  const handleTogglePlay = () => {
    setBgmPlaying(!bgmPlaying);
  };

  const handleTrackChange = (id: number) => {
    setTrackId(id);
    setBgmPlaying(true); // Auto play if changed
  };

  return (
    <div className="clay-card p-6 flex flex-col h-full justify-between min-h-[420px] bg-[#FFF7F8] border-3 border-[#E7B4B9]">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1 border-b-2 border-[#E7B4B9] pb-3">
          <Music className="w-6 h-6 text-[#A4565C]" />
          <h2 className="text-xl font-display font-black text-[#7A2930]">코지 사운드 BGM 🎶</h2>
        </div>

      </div>

      {/* Visual Rotating Vinyl Disc / Sound Wave visual progress */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative flex items-center justify-center">
          {/* Vinyl mock */}
          <div className={`w-28 h-28 rounded-full bg-[#5F6420] border-4 border-white shadow-md flex items-center justify-center ${
            bgmPlaying ? 'animate-spin' : ''
          }`} style={{ animationDuration: '6s' }}>
            {/* Center decoration label */}
            <div className="w-10 h-10 rounded-full bg-[#999D4F] border-3 border-white flex items-center justify-center">
              <Disc className="w-4 h-4 text-white" />
            </div>
          </div>
          {/* Tone-arm stylus indicator */}
          <div className="absolute -top-3 right-4 w-12 h-14 pointer-events-none transition-transform duration-300 origin-top"
               style={{ transform: bgmPlaying ? 'rotate(15deg)' : 'rotate(0deg)' }}>
            <div className="w-1.5 h-10 bg-[#E7B4B9] ml-5 rounded-full" />
            <div className="w-3.5 h-3 bg-[#A4565C] ml-4 rounded-sm" />
          </div>
        </div>

        {/* Animated Bouncing Waves bar container */}
        <div className="flex items-end justify-center gap-1 mt-4 h-6">
          {bgmPlaying ? (
            Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-[#999D4F] rounded-t-full transition-all duration-300 animate-pulse"
                style={{
                  height: `${25 + Math.random() * 75}%`,
                  animationDuration: `${0.4 + Math.random() * 0.8}s`,
                  animationDelay: `${idx * 0.05}s`
                }}
              />
            ))
          ) : (
            Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-[#E7B4B9] rounded-t-full"
                style={{ height: '4px' }}
              />
            ))
          )}
        </div>
      </div>

      {/* Track List Button Selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-[#999D4F] tracking-widest uppercase">Select Atmosphere</span>
        <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
          {BGM_TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => handleTrackChange(track.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                trackId === track.id
                  ? 'bg-[#FDE5E8] border-[#E7B4B9] text-[#7A2930] scale-[1.01] shadow-xs'
                  : 'bg-[#FFF7F8] border-[#FDE5E8] hover:bg-[#FDE5E8]/70 text-[#A4565C] hover:border-[#E7B4B9]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{track.name}</span>
                {trackId === track.id && bgmPlaying && (
                  <span className="text-[9px] bg-[#999D4F] text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">Playing</span>
                )}
              </div>
              <p className="text-[9px] text-[#A4565C]/70 font-normal mt-0.5">{track.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Play Controls and Volume bar */}
      <div className="mt-5 border-t border-[#E7B4B9] pt-4 flex items-center justify-between gap-4">
        {/* Toggle play btn */}
        <button
          onClick={handleTogglePlay}
          aria-label={bgmPlaying ? "BGM 정지" : "BGM 재생"}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-1.5 cursor-pointer text-xs font-black transition-all ${
            bgmPlaying ? 'clay-btn-gray bg-[#A4565C] hover:bg-[#7A2930] text-white' : 'clay-btn-blue'
          }`}
        >
          {bgmPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white stroke-none" />
              <span>사운드 정지</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white stroke-none" />
              <span>BGM 시작하기</span>
            </>
          )}
        </button>

        {/* Volume slider */}
        <div className="flex items-center gap-2 flex-1 max-w-[140px] bg-[#FDE5E8] px-3 py-2 rounded-xl border border-[#E7B4B9]">
          <Volume2 className="w-4 h-4 text-[#999D4F] shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#E7B4B9] rounded-lg appearance-none cursor-pointer accent-[#999D4F]"
            aria-label="BGM 볼륨 조절"
          />
          <span className="text-[10px] font-mono font-bold text-[#5F6420] w-6 text-right">
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}
