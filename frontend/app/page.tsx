'use client';

import { useState, useEffect } from 'react';
// IMPORT: lib is inside the app folder
import { supabase } from './lib/supabase';

export default function ReasoningEngine() {
  const [question, setQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(3);
  const [startTime, setStartTime] = useState<number>(0);
  const [participantId, setParticipantId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      const id = 'anon_' + Math.random().toString(36).substr(2, 9);
      setParticipantId(id);
      const { data } = await supabase.from('questions').select('*').order('id', { ascending: true }).limit(1).single();
      if (data) { setQuestion(data); setStartTime(Date.now()); }
      setLoading(false);
    };
    initSession();
  }, []);

  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return;
    const { error } = await supabase.from('responses').insert([{
      participant_id: participantId,
      question_id: question.id,
      response: selectedAnswer,
      correct: selectedAnswer === question.correct_answer,
      confidence: confidence,
      response_time: (Date.now() - startTime) / 1000,
    }]);
    if (!error) setSubmitted(true);
  };

  if (loading) return <div className="p-10" style={{ color: 'black', fontWeight: '900', fontSize: '24px' }}>LOADING CHALLENGE...</div>;

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Main Container with a heavy black border for maximum clarity */}
      <div className="max-w-2xl w-full bg-white border-[6px] border-black p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
       
        {!submitted ? (
          <>
            {/* Header: Forced Black */}
            <h1 className="text-4xl font-black mb-6 uppercase tracking-tighter" style={{ color: 'black' }}>
              Challenge #{question?.id || '1'}
            </h1>

            {/* Question Text: Forced Pure Black and Extra Bold */}
            <p className="text-3xl leading-tight mb-10" style={{ color: 'black', fontWeight: '900' }}>
              {question?.question_text || "Loading your task..."}
            </p>

            {/* Answer Choice Buttons: White boxes, but the LETTERS are forced Black */}
            <div className="space-y-4 mb-10">
              {question?.options?.map((option: string) => (
                <button
                  key={option}
                  onClick={() => setSelectedAnswer(option)}
                  style={{ color: 'black', fontWeight: '800' }}
                  className={`w-full text-left p-6 border-4 rounded-xl text-xl transition-all ${
                    selectedAnswer === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-black bg-white hover:bg-slate-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Confidence Section: All Labels Forced Black */}
            <div className="mb-10 p-6 border-4 border-black bg-slate-50">
              <label className="block text-xl font-black mb-6 uppercase text-center" style={{ color: 'black' }}>
                How confident are you?
              </label>
              <input
                type="range" min="1" max="5" step="1" value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full h-6 bg-black appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-4 text-2xl font-black" style={{ color: 'black' }}>
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              </div>
            </div>

            {/* Submit Button: Black background with White text (keeps it looking like a button) */}
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`w-full py-6 font-black text-2xl uppercase border-4 transition-all ${
                selectedAnswer
                  ? 'bg-black text-white cursor-pointer hover:bg-white hover:text-black border-black'
                  : 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              Confirm Answer
            </button>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-5xl font-black mb-6 uppercase" style={{ color: 'black' }}>Success!</p>
            <p className="text-xl font-bold mb-10" style={{ color: 'black' }}>Data sent to Curiosity Graph.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-12 py-5 bg-black text-white font-black text-xl border-4 border-black"
            >
              NEXT TASK
            </button>
          </div>
        )}
      </div>
    </main>
  );
}