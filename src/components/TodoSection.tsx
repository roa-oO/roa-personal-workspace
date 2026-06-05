import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Check, ListChecks } from 'lucide-react';
import { TodoItem } from '../types';

export function TodoSection() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('roa_workspace_todos');
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load todos from localStorage', e);
      }
    }
  }, []);

  // Save to local storage on change
  const saveTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    localStorage.setItem('roa_workspace_todos', JSON.stringify(newTodos));
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    const updated = [newTodo, ...todos];
    saveTodos(updated);
    setInputValue('');
  };

  const handleToggleTodo = (id: string) => {
    const updated = todos.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter((item) => item.id !== id);
    saveTodos(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= todos.length) return;

    const newTodos = [...todos];
    const [movedItem] = newTodos.splice(index, 1);
    newTodos.splice(targetIndex, 0, movedItem);
    saveTodos(newTodos);
  };

  const handleClearCompleted = () => {
    const updated = todos.filter((item) => !item.completed);
    saveTodos(updated);
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="clay-card-peach p-6 flex flex-col h-full min-h-[420px]">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-[#E7B4B9] pb-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-[#A4565C]" />
          <h2 className="text-xl font-display font-black text-[#7A2930]">오늘의 할 일 ✍️</h2>
        </div>
        <span className="bg-[#FFF7F8] text-[#A4565C] font-bold text-xs px-3 py-1 rounded-full border-1.5 border-[#E7B4B9] shadow-sm">
          {completedCount} / {todos.length} 완료
        </span>
      </div>

      {/* Todo input Form */}
      <form onSubmit={handleAddTodo} className="flex gap-2.5 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="여기에 할 일을 입력해주세요..."
          className="clay-inset-input flex-1 px-4 py-2.5 text-sm font-semibold text-[#7A2930] placeholder-[#A4565C]/50 border-2 border-[#E7B4B9]"
        />
        <button
          type="submit"
          aria-label="할 일 추가"
          className="clay-btn-peach p-3.5 rounded-2xl flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </form>

      {/* Todo list container */}
      <div className="flex-1 overflow-y-auto pr-1 max-h-[280px] custom-scrollbar space-y-2.5">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#A4565C]">
            <span className="text-4xl mb-2">🎈</span>
            <p className="text-sm font-bold">오예! 할 일이 하나도 없어요!</p>
            <p className="text-xs text-[#7A2930]/60 mt-0.5">새로운 할 일을 추가하고 채워나가봐요.</p>
          </div>
        ) : (
          todos.map((todo, index) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 transition-all duration-200 ${
                todo.completed
                  ? 'border-[#E7B4B9] bg-[#FDE5E8]/55 opacity-75'
                  : 'border-[#FDE5E8] hover:border-[#E7B4B9] hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                {/* Complete icon checkbox trigger */}
                <button
                  onClick={() => handleToggleTodo(todo.id)}
                  aria-label={todo.completed ? "완료 해제" : "완료 표시"}
                  className="shrink-0 focus:outline-none cursor-pointer transform hover:scale-110 active:scale-95 transition-transform"
                >
                  {todo.completed ? (
                    <div className="w-5.5 h-5.5 rounded-full bg-[#A4565C] flex items-center justify-center text-white border-2 border-[#A4565C] shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5.5 h-5.5 rounded-full bg-white border-2 border-[#E7B4B9] hover:border-[#A4565C] transition-colors" />
                  )}
                </button>

                {/* Text Content */}
                <span
                  onClick={() => handleToggleTodo(todo.id)}
                  className={`text-sm font-bold text-[#7A2930] break-words cursor-pointer select-none transition-all ${
                    todo.completed ? 'line-through text-[#A4565C]/60' : ''
                  }`}
                >
                  {todo.text}
                </span>
              </div>

              {/* Action Buttons: up, down, delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  disabled={index === 0}
                  onClick={() => moveItem(index, 'up')}
                  aria-label="위로 이동"
                  className="p-1 px-1.5 rounded-lg border-1.5 border-[#FDE5E8] bg-[#FFF7F8] hover:bg-[#FDE5E8] hover:border-[#E7B4B9] disabled:opacity-20 disabled:hover:bg-[#FFF7F8] disabled:hover:border-[#FDE5E8] text-[#7A2930] cursor-pointer transition-colors"
                >
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  disabled={index === todos.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  aria-label="아래로 이동"
                  className="p-1 px-1.5 rounded-lg border-1.5 border-[#FDE5E8] bg-[#FFF7F8] hover:bg-[#FDE5E8] hover:border-[#E7B4B9] disabled:opacity-20 disabled:hover:bg-[#FFF7F8] disabled:hover:border-[#FDE5E8] text-[#7A2930] cursor-pointer transition-colors"
                >
                  <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  aria-label="삭제"
                  className="p-1.5 rounded-xl border-1.5 border-[#E7B4B9] bg-white hover:bg-[#FDE5E8] hover:border-[#A4565C] text-[#A4565C] hover:text-[#7A2930] cursor-pointer transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clear Completed Area */}
      {completedCount > 0 && (
        <button
          onClick={handleClearCompleted}
          className="mt-4 clay-btn-gray py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ml-auto transition-all"
        >
          완료된 항목 지우기
        </button>
      )}
    </div>
  );
}
