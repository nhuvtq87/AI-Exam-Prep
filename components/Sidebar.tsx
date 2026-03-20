
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const items: { id: View; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'fa-table-columns', label: 'Home' },
    { id: 'flashcards', icon: 'fa-clone', label: 'Cards' },
    { id: 'quiz', icon: 'fa-clipboard-question', label: 'Quiz' },
    { id: 'simplifier', icon: 'fa-wand-magic-sparkles', label: 'Simple' },
    { id: 'faq', icon: 'fa-clipboard-list', label: 'FAQs' },
    { id: 'planner', icon: 'fa-calendar-days', label: 'Plan' },
    { id: 'notes', icon: 'fa-note-sticky', label: 'Notes' },
    { id: 'timer', icon: 'fa-stopwatch', label: 'Timer' },
    { id: 'tutor', icon: 'fa-robot', label: 'AI' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-sjsu-blue text-white flex-shrink-0 flex-col h-screen sticky top-0 shadow-2xl">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-sjsu-gold rounded-full flex items-center justify-center font-bold text-sjsu-blue text-xl">S</div>
          <h1 className="text-xl font-bold tracking-tight">Spartan Prep</h1>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
          {items.filter(item => item.label && item.icon).map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200 border h-auto ${
                currentView === item.id 
                  ? 'bg-white/20 backdrop-blur-md border-white/20 text-white shadow-lg font-bold' 
                  : 'border-transparent hover:bg-white/10 text-blue-100/80 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-sm`}></i>
              <span className="text-sm tracking-tight">
                {item.label === 'Home' ? 'Dashboard' : 
                 item.label === 'Cards' ? 'Flashcards' : 
                 item.label === 'Plan' ? 'Study Planner' : 
                 item.label === 'AI' ? 'AI Tutor' : 
                 item.label === 'FAQs' ? 'FAQ Matrix' : 
                 item.label === 'Simple' ? 'Simplifier' : 
                 item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-blue-900 mt-auto border-t border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
              <i className="fa-solid fa-user text-xs"></i>
            </div>
            <div>
              <p className="text-xs font-semibold">SJSU Student</p>
              <p className="text-[10px] text-blue-300">San Jose State University</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sjsu-blue text-white z-50 flex items-center justify-around px-2 py-2 border-t border-blue-800 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        {items.filter(item => item.label && item.icon).map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 transition-all py-1 ${
              currentView === item.id ? 'text-sjsu-gold' : 'text-blue-300 opacity-70'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-base mb-0.5`}></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
