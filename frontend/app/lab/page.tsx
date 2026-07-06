'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Path fix for /app/lab structure

export default function ReasonLab() {
  const [question, setQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [startTime, setStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [participantId] = useState(`anon_${Math.floor(Math.random() * 10000)}`);
 
  // SESSION & RANDOMIZATION STATE
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [shownQuestionIds, setShownQuestionIds] = useState<number[]>([]);

  useEffect(() => { fetchNewQuestion(); }, []);

  const fetchNewQuestion = async () => {
    if (sessionCount >= 10) {
      setSessionFinished(true);
      return;
    }

    const { data } = await supabase.from('questions').select('*');
   
    if (data) {
      // RANDOMIZATION FIX: Filter out questions already shown in this session [Our conversation]
      const availableQuestions = data.filter((q: any) => !shownQuestionIds.includes(q.id));
     
      if (availableQuestions.length === 0) {
        setSessionFinished(true);
        return;
      }

      // Pick random from the pool (initial 1/20 = 5% chance per question)
      const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
     
      setQuestion(randomQ);
      setShownQuestionIds(prev => [...prev, randomQ.id]);
      setStartTime(Date.now());
      setShowFeedback(false);
      setSelectedAnswer('');
    }
  };

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

  if (sessionFinished) {
    return (
      <main className="min-h-screen bg-white p-8 flex flex-col items-center justify-center text-black">
        <div className="max-w-2xl w-full border-[10px] border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] text-center">
          <h1 className="text-5xl font-black uppercase mb-4">Session Complete</h1>
          <div className="mb-12 border-[6px] border-black p-10 bg-slate-50 inline-block">
             <p className="text-xl font-black uppercase mb-2">Final Logic Score:</p>
             <p className={`text-9xl font-black ${getScoreColor()}`}>{sessionScore}/10</p>
          </div>
          <button onClick={() => window.location.href = '/dashboard'} className="w-full bg-black text-white p-8 font-black text-4xl uppercase border-4 border-black hover:bg-white hover:text-black transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            Finish Session
          </button>
        </div>
      </main>
    );
  }

  if (!question) return <div className="p-20 font-black text-4xl uppercase animate-pulse">Initializing Core...</div>;

  return (
    <main className="min-h-screen bg-white p-8 flex flex-col items-center justify-center text-black">
      <div className="max-w-2xl w-full border-[10px] border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] bg-white">
        <header className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
          <h1 className="text-4xl font-black uppercase">Task #{question.id}</h1>
          <span className="font-black text-xl bg-black text-white px-4 py-2">Step {sessionCount + 1}/10</span>
        </header>
        <p className="text-3xl font-bold mb-10 leading-tight">{question.question_text}</p>
       
        <div className="grid grid-cols-1 gap-4 mb-10">
          {question.options.map((opt: string) => (
            <button key={opt} onClick={() => setSelectedAnswer(opt)} className={`p-6 border-4 border-black font-black text-xl uppercase transition-all text-left ${selectedAnswer === opt ? 'bg-black text-white translate-x-2' : 'bg-white text-black hover:bg-slate-50'}`}>{opt}</button>
          ))}
        </div>

        <div className="mb-10">
          <label className="block font-black text-xl uppercase mb-4 tracking-tighter">Confidence: {confidence}/5</label>
          <input type="range" min="1" max="5" value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))} className="w-full h-6 accent-black cursor-pointer" />
        </div>

        {!showFeedback ? (
          <button onClick={handleSubmit} disabled={!selectedAnswer} className="w-full p-8 bg-black text-white font-black text-3xl uppercase border-4 border-black hover:bg-white hover:text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1">Submit Answer</button>
        ) : (
          <div className="text-center">
            {/* FEEDBACK REVERTED TO CORRECT/INCORRECT [Our conversation] */}
            <p className={`text-6xl font-black uppercase mb-10 p-6 border-8 border-black ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </p>
            <button onClick={fetchNewQuestion} className="w-full bg-blue-600 text-white p-8 font-black text-3xl uppercase border-4 border-black hover:bg-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">Next Task</button>
          </div>
        )}
      </div>
    </main>
  );
}