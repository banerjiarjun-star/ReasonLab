'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const REASONING_TASKS = [
  { id: 1, question: "If all Bloops are Rips and all Rips are Zips, are all Bloops definitely Zips?", options: ["Yes", "No", "Maybe"], correct: "Yes", category: "Logic", curiosityLinks: ["Logic Chains", "Syllogisms"] },
  { id: 2, question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?", options: ["$0.10", "$0.05", "$0.01"], correct: "$0.05", category: "Cognitive Reflection", curiosityLinks: ["Intuitive Errors", "Math Logic"] },
  { id: 3, question: "In a race, you pass the person in second place. What place are you in now?", options: ["1st", "2nd", "3rd"], correct: "2nd", category: "Cognitive Reflection", curiosityLinks: ["Spatial Logic", "Quick Thinking"] },
  { id: 4, question: "If you flip a fair coin 3 times and get Heads every time, what is the chance the next flip is Tails?", options: ["50%", "75%", "100%"], correct: "50%", category: "Probability", curiosityLinks: ["Gambler's Fallacy", "Independence"] },
  { id: 5, question: "Which number comes next: 2, 4, 8, 16, ...?", options: ["20", "24", "32"], correct: "32", category: "Pattern Recognition", curiosityLinks: ["Binary Growth", "Sequences"] },
  { id: 6, question: "All roses are flowers. Some flowers fade quickly. Does it follow that some roses fade quickly?", options: ["Yes", "No", "Not necessarily"], correct: "No", category: "Logic", curiosityLinks: ["Logical Validity", "Venn Diagrams"] },
  { id: 7, question: "Sally has 3 brothers. Each brother has 2 sisters. How many sisters does Sally have?", options: ["1", "2", "3"], correct: "1", category: "Logic", curiosityLinks: ["Family Trees", "Set Theory"] },
  { id: 8, question: "A lake has lily pads that double in size every day. It takes 48 days to cover the lake. How long for half the lake?", options: ["24 days", "47 days", "48 days"], correct: "47 days", category: "Cognitive Reflection", curiosityLinks: ["Exponential Growth", "Time Scales"] },
  { id: 9, question: "If 5 machines take 5 minutes to make 5 widgets, how long would 100 machines take to make 100 widgets?", options: ["5 minutes", "100 minutes", "500 minutes"], correct: "5 minutes", category: "Cognitive Reflection", curiosityLinks: ["Rate Logic", "Scaling"] },
  { id: 10, question: "What is more likely: rolling a 6 on a die, or flipping two heads in a row on a coin?", options: ["Rolling a 6", "Two heads", "Equally likely"], correct: "Two heads", category: "Probability", curiosityLinks: ["Joint Probability", "Dice vs Coins"] }
];

export default function QuestionEngine() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('reasonlab_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('reasonlab_id', id);
    }
    setParticipantId(id);
  }, []);

  const currentQuestion = REASONING_TASKS[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex < REASONING_TASKS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null); setConfidence(3); setShowFeedback(false); setStartTime(Date.now());
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleSubmit = async () => {
    const responseTime = (Date.now() - startTime) / 1000;
    const isCorrect = selectedAnswer === currentQuestion.correct;

    // THE MASTER ALIGNMENT: These labels MUST match your Supabase columns exactly
    const { error } = await supabase
      .from('responses')
      .insert([
        {
          participant_id: participantId,
          question_id: currentQuestion.id,
          response_text: selectedAnswer,
          is_correct: isCorrect,          
          confidence: confidence, // Updated to your confirmed label 'confidence'
          response_time: responseTime      
        }
      ]);

    if (error) {
      console.error("Critical Save Error:", error);
      alert("Database error: Check your console (Right-click > Inspect > Console)");
    } else {
      setShowFeedback(true);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <p className="text-purple-600 font-bold uppercase tracking-widest text-sm">Challenge {currentQuestionIndex + 1} of 10</p>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">{currentQuestion.question}</h2>
      </div>
      <div className="space-y-4 mb-8">
        {currentQuestion.options.map((opt) => (
          <button key={opt} onClick={() => !showFeedback && setSelectedAnswer(opt)} disabled={showFeedback} className={`w-full p-6 rounded-2xl text-left font-bold transition-all border-4 ${selectedAnswer === opt ? 'border-purple-500 bg-purple-50' : 'border-white bg-white'}`}>
            {opt}
          </button>
        ))}
      </div>
      {!showFeedback && selectedAnswer && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 animate-in fade-in zoom-in duration-300">
          <p className="font-bold text-gray-700 mb-4">How sure are you? (1=Guessing, 5=Certain)</p>
          <input type="range" min="1" max="5" step="1" value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))} className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600" />
          <div className="flex justify-between mt-2 font-bold text-gray-300"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
          <button onClick={handleSubmit} className="mt-8 w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg">Confirm Answer</button>
        </div>
      )}
      {showFeedback && (
        <div className="bg-white border-4 border-purple-200 p-8 rounded-3xl shadow-xl">
          <p className={`text-2xl font-black mb-2 ${selectedAnswer === currentQuestion.correct ? 'text-green-600' : 'text-red-500'}`}>{selectedAnswer === currentQuestion.correct ? "✅ Correct!" : "❌ Not Quite."}</p>
          <button onClick={handleNextQuestion} className="mt-4 p-4 bg-purple-600 text-white rounded-xl font-bold w-full">Next Challenge →</button>
        </div>
      )}
    </main>
  );
}