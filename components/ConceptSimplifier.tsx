
import React, { useState } from 'react';
import { simplifyConcept } from '../services/geminiService';
import { SimplifiedConcept } from '../types';

const ConceptSimplifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<SimplifiedConcept | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('simple');

  const handleSimplify = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const simplified = await simplifyConcept(input, mode);
      setResult(simplified);
    } catch (error) {
      console.error(error);
      alert("Failed to simplify concept. Try a shorter snippet.");
    } finally {
      setIsLoading(false);
    }
  };

  const modes = [
    { id: 'simple', label: 'Plain English', icon: 'fa-comment-dots' },
    { id: 'analogy', label: 'Use Analogies', icon: 'fa-bridge' },
    { id: 'eli5', label: 'Explain Like I\'m 5', icon: 'fa-child' },
    { id: 'spartan', label: 'Spartan Style', icon: 'fa-shield-halved' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Concept Simplifier</h2>
        <p className="text-gray-500">Transform complex SJSU lecture jargon into understandable ideas.</p>
      </header>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Complex Concept or Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a difficult paragraph from your textbook or lecture notes here..."
            className="w-full h-40 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-sjsu-blue outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all border ${
                  mode === m.id 
                    ? 'bg-sjsu-blue text-white border-sjsu-blue shadow-md' 
                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                }`}
              >
                <i className={`fa-solid ${m.icon}`}></i>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSimplify}
            disabled={isLoading || !input.trim()}
            className="w-full md:w-auto px-8 py-3 bg-sjsu-gold text-sjsu-blue font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-wand-magic-sparkles animate-spin"></i>
                <span>Simplifying...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>Simplify Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold text-sjsu-blue uppercase tracking-widest mb-2 flex items-center">
                  <i className="fa-solid fa-lightbulb mr-2 text-sjsu-gold"></i>
                  Simple Explanation
                </h3>
                <p className="text-lg text-gray-800 leading-relaxed font-medium">
                  {result.simpleExplanation}
                </p>
              </div>

              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <h3 className="text-xs font-bold text-sjsu-blue uppercase tracking-widest mb-2 flex items-center">
                  <i className="fa-solid fa-bridge mr-2"></i>
                  The Analogy
                </h3>
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  "{result.analogy}"
                </p>
              </div>
            </div>

            <div className="bg-sjsu-blue text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-6">Key Takeaways</h3>
                <ul className="space-y-4">
                  {result.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <div className="mt-1 w-5 h-5 bg-sjsu-gold rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-sjsu-blue font-bold">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <i className="fa-solid fa-brain absolute -right-6 -bottom-6 text-9xl text-white/5 rotate-12"></i>
            </div>
          </div>
          
          <button 
            onClick={() => {setResult(null); setInput('');}}
            className="text-gray-400 hover:text-sjsu-blue text-sm font-semibold flex items-center space-x-2 mx-auto"
          >
            <i className="fa-solid fa-arrow-rotate-left"></i>
            <span>Start Over</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConceptSimplifier;
