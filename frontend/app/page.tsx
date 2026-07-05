'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function ReasonLab() {
  const [view, setView] = useState<'home' | 'task' | 'complete'>('home');
  const [question, setQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(3);
  const [startTime, setStartTime] = useState<number>(0);
  const [participantId, setParticipantId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
 
  // RANDOMIZATION STATE
  const [sessionQueue, setSessionQueue] = useState<number[]>([]);

  useEffect(() => {
    setParticipantId('anon_' + Math.random().toString(36).substr(2, 9));
  }, []);

  // 1. SESSION INITIALIZATION: Get 10 random IDs
  const startSession = async () => {
    setLoading(true);
    const { data } = await supabase.from('questions').select('id');
    if (data) {
      // Shuffle all available IDs and take the first 10
      const shuffled = data.map(q => q.id).sort(() => Math.random() - 0.5);
      setSessionQueue(shuffled.slice(0, 10));
      setView('task');
    }
    setLoading(false);
  };

  // 2. FETCH CURRENT TASK FROM QUEUE
  useEffect(() => {
    if (view === 'task' && sessionQueue.length > 0) {
      const fetchQuestion = async () => {
        setLoading(true);
        const currentId = sessionQueue[questionsAnswered];
        const { data } = await supabase.from('questions').select('*').eq('id', currentId).single();
        if (data) {
          setQuestion(data);
          setStartTime(Date.now());
        }
        setLoading(false);
      };
      fetchQuestion();
    }
  }, [view, questionsAnswered, sessionQueue]);

  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return;

    // 1. Force accuracy to 'true' for this test to see if it reaches the DB
    const testCorrect = true;
   
    setIsCorrect(true);
    setShowFeedback(true);

    // 2. Send the row and FORCE Supabase to return the result
    const { data, error } = await supabase
      .from('responses')
      .insert([{
        participant_id: participantId,
        question_id: question.id,
        response: selectedAnswer,
        is_correct: testCorrect, // <--- Sending literal 'true'
        confidence: confidence,
        response_time: (Date.now() - startTime) / 1000,
      }])
      .select(); // This tells Supabase: "Tell me what you actually saved."

    if (error) {
      console.error("SYNC ERROR:", error.message);
    } else {
      console.log("DB CONFIRMED SAVED DATA:", data);
    }
  };


  const handleNext = () => {
    const nextCount = questionsAnswered + 1;
    if (nextCount >= 10) {
      setView('complete');
    } else {
      setQuestionsAnswered(nextCount);
      setShowFeedback(false);
      setSelectedAnswer(null);
      setConfidence(3);
    }
  };

  if (view === 'home') return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full border-[10px] border-black p-12 text-center shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-7xl font-black uppercase mb-6" style={{ color: 'black' }}>ReasonLab</h1>
        <button onClick={startSession} className="w-full py-8 bg-black text-white text-3xl font-black border-4 border-black hover:bg-white hover:text-black transition-all">Begin Session</button>
      </div>
    </main>
  );

  if (view === 'complete') return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full border-[10px] border-black p-12 text-center">
        <h1 className="text-6xl font-black uppercase mb-6" style={{ color: 'black' }}>Session Complete</h1>
        <button onClick={() => window.location.href = '/dashboard'} className="px-12 py-5 bg-black text-white font-black text-xl border-4 border-black">View Dashboard</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white border-[6px] border-black p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        {loading ? (
          <div className="text-center font-black text-2xl animate-pulse" style={{ color: 'black' }}>SYNCING...</div>
        ) : !showFeedback ? (
          <>
            <h1 className="text-4xl font-black uppercase mb-6" style={{ color: 'black' }}>Task #{questionsAnswered + 1}/10</h1>
            <p className="text-3xl font-black mb-10" style={{ color: 'black' }}>{question?.question_text}</p>
            <div className="space-y-4 mb-10">
              {question?.options?.map((option: string) => (
                <button
                  key={option}
                  onClick={() => setSelectedAnswer(option)}
                  style={{ color: 'black' }}
                  className={`w-full text-left p-6 border-4 rounded-xl text-xl font-bold transition-all ${
                    selectedAnswer === option ? 'border-blue-600 bg-blue-50' : 'border-black bg-white hover:bg-slate-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mb-10 p-6 border-4 border-black bg-slate-50 text-center">
              <label className="block text-xl font-black mb-4 uppercase" style={{ color: 'black' }}>Confidence: {confidence}</label>
              <input type="range" min="1" max="5" step="1" value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))} className="w-full h-6 bg-black cursor-pointer accent-blue-600" />
            </div>
            <button onClick={handleSubmit} disabled={!selectedAnswer} className={`w-full py-6 font-black text-2xl uppercase border-4 transition-all ${selectedAnswer ? 'bg-black text-white cursor-pointer' : 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'}`}>Confirm Answer</button>
          </>
        ) : (
          <div className="text-center py-12">
            {isCorrect ? (
              <p className="text-7xl font-black mb-6 uppercase" style={{ color: '#16a34a' }}>✓ Correct!</p>
            ) : (
              <p className="text-7xl font-black mb-6 uppercase" style={{ color: '#dc2626' }}>✗ Incorrect</p>
            )}
            <button onClick={handleNext} className="px-12 py-5 bg-black text-white font-black text-xl border-4 border-black hover:bg-white hover:text-black transition-all">
              {questionsAnswered + 1 >= 10 ? "FINISH SESSION" : "NEXT TASK"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}