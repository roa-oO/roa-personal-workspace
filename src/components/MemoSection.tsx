import { useState } from 'react';
import { StickyNote, EyeOff, Pin } from 'lucide-react';

export function MemoSection() {
  const [content, setContent] = useState('');

  const charactersCount = content.length;

  return (
    <div className="clay-card-yellow p-6 flex flex-col h-full min-h-[420px] justify-between relative overflow-hidden">
      {/* Adorable little pushpin icon on top center representing a real sticky pad notes post-it */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 transform -rotate-12 hover:rotate-0 transition-transform cursor-pointer">
        <Pin className="w-6 h-6 text-[#A4565C] fill-[#A4565C] drop-shadow-sm" />
      </div>

      <div>
        {/* Title area */}
        <div className="flex items-center justify-between border-b-2 border-[#999D4F] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-[#999D4F]" />
            <h2 className="text-xl font-display font-black text-[#5F6420]">빠른 메모패드 💭</h2>
          </div>
          <span className="text-[10px] bg-[#FDE5E8] text-[#7A2930] px-2 py-0.5 rounded-full border border-[#E7B4B9] font-bold flex items-center gap-1">
            <EyeOff className="w-3 h-3 text-[#A4565C]" /> 휘발성 메모
          </span>
        </div>



        {/* Text area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`• 여기에 오늘의 떠오르는 짧은 생각이나 일기, 임시 링크들을 자유롭게 적어보세요...\n• 공부/디자인 아이디어를 끄적거리기에 좋습니다!\n• 예: https://ai.studio.build`}
          className="clay-inset-input w-full h-[180px] p-4 text-sm font-bold text-[#5F6420] bg-[#FFF7F8]/90 border-2 border-[#E8F0A2] placeholder-[#999D4F]/60 leading-relaxed resize-none focus:ring-2 focus:ring-[#999D4F] custom-scrollbar"
        />
      </div>

      {/* Characters ticker and wipe action */}
      <div className="mt-4 pt-3 border-t border-[#999D4F] flex items-center justify-between text-xs font-bold text-[#5F6420]">
        <span>글자 수: <b>{charactersCount}</b> 자</span>

        {content.trim() && (
          <button
            onClick={() => setContent('')}
            className="text-[10px] font-black text-[#A4565C] hover:text-[#7A2930] bg-[#FDE5E8] border border-[#E7B4B9] hover:bg-[#E7B4B9] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            모두 지우기
          </button>
        )}
      </div>
    </div>
  );
}
