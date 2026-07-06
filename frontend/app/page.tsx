'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // Adjust path if lib is elsewhere

export default function ReasonLabUnified() {
  // --- UI STATE ---
  const [view, setView] = useState<'home' | 'lab' | 'finished'>('home');
  
  // --- ENGINE STATE ---
  const [question, setQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [startTime, setStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [participantId] = useState(`anon_${Math.floor(Math.random() * 10000)}`);
  
  // --- SESSION & RANDOMIZATION ---
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [shownQuestionIds, setShownQuestionIds] = useState<number[]>([]);

  // 1. START SESSION TRIGGER
  const startSession = () => {
    setView('lab');
    fetchNewQuestion();
  };

  // 2. RANDOMIZATION LOGIC (Unique questions only) [13, Our conversation]
  const fetchNewQuestion = async () => {
    if (sessionCount >= 10) {
      setView('finished');
      return;
    }

    const { data } = await supabase.from('questions').select('*');
    
    if (data) {
      // Filter out questions already shown to ensure no duplicates [Our conversation]
      const availableQuestions = data.filter((q: any) => !shownQuestionIds.includes(q.id));
      
      if (availableQuestions.length === 0) {
        setView('finished');
        return;
      }

      // 5% chance logic: Pick from the pool of 20 questions
      const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      
      setQuestion(randomQ);
      setShownQuestionIds(prev => [...prev, randomQ.id]);
      setStartTime(Date.now());
      setShowFeedback(false);
      setSelectedAnswer('');
    }
  };

  // 3. SUBMISSION LOGIC [541, Our conversation]
  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return;

    const actualCorrectResult = selectedAnswer.trim() === question.correct_answer.trim();
    setIsCorrect(actualCorrectResult);
    setShowFeedback(true);
    
    setSessionCount(prev => prev + 1);
    if (actualCorrectResult) setSessionScore(prev => prev + 1);

    await supabase.from('responses').insert([{
      participant_id: participantId,
      question_id: question.id,
      response: selectedAnswer,
      is_correct: actualCorrectResult, 
      confidence: confidence,
      response_time: (Date.now() - startTime) / 1000,
    }]);
  };

  const getScoreColor = () => {
    if (sessionScore <= 3) return 'text-red-600';
    if (sessionScore <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  // --- UI RENDER: HOMEPAGE ---
  if (view === 'home') {
    return (
      <main className="min-h-screen bg-white p-8 flex flex-col items-center justify-center text-black">
        <div className="max-w-4xl w-full border-[10px] border-black p-16 shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] bg-white text-center">
          <h1 className="text-8xl font-black uppercase tracking-tighter mb-6">ReasonLab</h1>
          <p className="text-3xl font-bold mb-12 border-b-4 border-black pb-6 inline-block">Metacognitive Research Architecture v1.0</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={startSession} className="p-8 bg-black text-white font-black text-3xl uppercase border-4 border-black hover:bg-white hover:text-black transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-1">Start Session</button>
            <button onClick={() => window.location.href = '/dashboard'} className="p-8 bg-white text-black font-black text-3xl uppercase border-4 border-black hover:bg-black hover:text-white transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-1">View Data</button>
          </div>
        </div>
      </main>
    );
  }

  // --- UI RENDER: SESSION COMPLETE ---
  if (view === 'finished') {
    return (
      <main className="min-h-screen bg-white p-8 flex flex-col items-center justify-center text-black">
        <div className="max-w-2xl w-full border-[10px] border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] text-center bg-white">
          <h1 className="text-5xl font-black uppercase mb-4">Session Complete</h1>
          <div className="mb-12 border-[6px] border-black p-10 bg-slate-50 inline-block">
             <p className="text-xl font-black uppercase mb-2">Final Score:</p>
             <p className={`text-9xl font-black ${getScoreColor()}`}>{sessionScore}/10</p>
          </div>
          <button onClick={() => window.location.href = '/dashboard'} className="w-full bg-black text-white p-8 font-black text-4xl uppercase border-4 border-black hover:bg-white hover:text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">Finish Session</button>
        </div>
      </main>
    );
  }

  // --- UI RENDER: REASONING ENGINE (LAB) ---
  if (!question) return <div className="min-h-screen flex items-center justify-center font-black text-4xl uppercase animate-pulse">Initializing...</div>;

  return (
    <main className="min-h-screen bg-white p-8 flex flex-col items-center justify-center text-black">
      <div className="max-w-3xl w-full border-[10px] border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] bg-white">
        <header className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
          <h1 className="text-4xl font-black uppercase">Task #{question.id}</h1>
          <span className="font-black text-xl bg-black text-white px-4 py-2">Challenge {sessionCount + 1}/10</span>
        </header>
        <p className="text-3xl font-bold mb-10 leading-tight">{question.question_text}</p>
        <div className="grid grid-cols-1 gap-4 mb-10">
          {question.options.map((opt: string) => (
            <button key={opt} onClick={() => setSelectedAnswer(opt)} className={`p-6 border-4 border-black font-black text-xl uppercase transition-all text-left ${selectedAnswer === opt ? 'bg-black text-white translate-x-2' : 'bg-white text-black hover:bg-slate-50'}`}>{opt}</button>
          ))}
        </div>
        <div className="mb-10">
          <label className="block font-black text-xl uppercase mb-4 tracking-tighter">Confidence: {confidence}/5</label>
          <input type="range" min="1" max="5" value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))} className="w-full h-6 accent-black cursor-pointer bg-gray-200" />
        </div>
        {!showFeedback ? (
          <button onClick={handleSubmit} disabled={!selectedAnswer} className={`w-full p-8 font-black text-3xl uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${selectedAnswer ? 'bg-black text-white hover:bg-white hover:text-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 shadow-none'}`}>Submit Answer</button>
        ) : (
          <div className="text-center">
            {/* RESTORED CORRECT/INCORRECT TEXT [Our conversation] */}
            <p className={`text-6xl font-black uppercase mb-10 p-6 border-8 border-black ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{isCorrect ? 'Correct' : 'Incorrect'}</p>
            <button onClick={fetchNewQuestion} className="w-full bg-blue-600 text-white p-8 font-black text-3xl uppercase border-4 border-black hover:bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">Continue Session</button>
          </div>
        )}
      </div>
    </main>
  );
}