import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, Trash2, Globe, Check, Sparkles } from 'lucide-react';
import { ShortcutItem } from '../types';

const INITIAL_SHORTCUTS: ShortcutItem[] = [
  { id: '1', name: 'Google AI Studio', url: 'https://aistudio.google.com', icon: '🤖' },
  { id: '2', name: 'ChatGPT', url: 'https://chatgpt.com', icon: '💬' },
  { id: '3', name: 'Gmail', url: 'https://mail.google.com', icon: '✉️' },
  { id: '4', name: 'Notion', url: 'https://notion.so', icon: '📓' },
  { id: '5', name: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { id: '6', name: 'YouTube', url: 'https://youtube.com', icon: '📺' }
];

export function ShortcutGrid() {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('roa_workspace_shortcuts');
    if (saved) {
      try {
        setShortcuts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load shortcuts from localStorage', e);
        setShortcuts(INITIAL_SHORTCUTS);
      }
    } else {
      setShortcuts(INITIAL_SHORTCUTS);
      localStorage.setItem('roa_workspace_shortcuts', JSON.stringify(INITIAL_SHORTCUTS));
    }
  }, []);

  // Save to LocalStorage
  const saveShortcuts = (updated: ShortcutItem[]) => {
    setShortcuts(updated);
    localStorage.setItem('roa_workspace_shortcuts', JSON.stringify(updated));
  };

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newShortcutName.trim() || !newShortcutUrl.trim()) {
      setErrorMsg('이름과 URL을 모두 입력해주세요!');
      return;
    }

    // Clean up URL formatting - satisfy anchor standards
    let targetUrl = newShortcutUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Simple URL regex check to alert user if totally invalid
    try {
      new URL(targetUrl);
    } catch (_) {
      setErrorMsg('올바른 형식의 URL 주소를 입력해주세요!');
      return;
    }

    // Assign cute random emoji icon
    const cuteEmojis = ['🧸', '🐳', '🌟', '🍀', '🍎', '🌸', '🍕', '🦊', '⚡', '🚀', '🔮', '🎈', '🍭'];
    const randomEmoji = cuteEmojis[Math.floor(Math.random() * cuteEmojis.length)];

    const newItem: ShortcutItem = {
      id: crypto.randomUUID(),
      name: newShortcutName.trim(),
      url: targetUrl,
      icon: randomEmoji
    };

    const updated = [...shortcuts, newItem];
    saveShortcuts(updated);

    // Reset inputs
    setNewShortcutName('');
    setNewShortcutUrl('');
    setIsAdding(false);
  };

  const handleDeleteShortcut = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open link action
    const updated = shortcuts.filter((item) => item.id !== id);
    saveShortcuts(updated);
  };

  return (
    <div className="clay-card-green p-6 flex flex-col h-full min-h-[420px] justify-between">
      <div>
        {/* Title area */}
        <div className="flex items-center justify-between border-b-2 border-[#999D4F] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#999D4F]" />
            <h2 className="text-xl font-display font-black text-[#5F6420]">바탕화면 단축 바로가기 🔗</h2>
          </div>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setErrorMsg('');
            }}
            aria-label="바로가기 추가 기틀 슬라이더"
            className="clay-btn-green p-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer max-w-[110px]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>바로가기 추가</span>
          </button>
        </div>

        {/* Add shortcut collapse folder form panel */}
        {isAdding && (
          <form onSubmit={handleAddShortcut} className="mb-4 bg-[#FFF7F8]/80 p-4 rounded-2xl border-2 border-[#E8F0A2] flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-[#5F6420] font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-[#A4565C]" />
              <span>새로운 단축키 링크를 채워봅시다!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="사이트 이름 (예: 네이버)"
                value={newShortcutName}
                onChange={(e) => setNewShortcutName(e.target.value)}
                className="clay-inset-input px-3 py-2 text-xs font-bold text-[#5F6420] border-[#999D4F]"
              />
              <input
                type="text"
                placeholder="URL 주소 (예: naver.com)"
                value={newShortcutUrl}
                onChange={(e) => setNewShortcutUrl(e.target.value)}
                className="clay-inset-input px-3 py-2 text-xs font-bold text-[#5F6420] border-[#999D4F]"
              />
            </div>

            {errorMsg && (
              <p className="text-[10px] font-bold text-[#A4565C] text-center">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 bg-[#FDE5E8] text-[#A4565C] rounded-lg hover:bg-[#E7B4B9] cursor-pointer font-bold"
              >
                취소
              </button>
              <button
                type="submit"
                className="clay-btn-green px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-black"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                확인 추가
              </button>
            </div>
          </form>
        )}

        {/* Shortcut Items Grid list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shortcuts.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center p-4 bg-white border-2 border-[#E8F0A2] rounded-2xl shadow-xs hover:border-[#999D4F] hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              {/* Overlay visual badge */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3 h-3 text-[#999D4F]" />
              </div>

              {/* 3D emoji logo block */}
              <div className="w-11 h-11 rounded-2xl bg-[#E8F0A2]/50 flex items-center justify-center text-2xl mb-1.5 shadow-inner transform group-hover:scale-110 transition-transform">
                {item.icon || '🔗'}
              </div>

              {/* Text label */}
              <span className="text-xs font-extrabold text-[#5F6420] text-center truncate w-full px-1">
                {item.name}
              </span>

              {/* Delete button wrapper - visible onhover */}
              <button
                onClick={(e) => handleDeleteShortcut(item.id, e)}
                aria-label={`${item.name} 바로가기 삭제`}
                className="absolute -top-10 group-hover:top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[#FDE5E8] hover:bg-[#E7B4B9] text-[#A4565C] hover:text-[#7A2930] transition-all cursor-pointer z-10 scale-85 border border-[#E7B4B9]"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </a>
          ))}
        </div>
      </div>


    </div>
  );
}
