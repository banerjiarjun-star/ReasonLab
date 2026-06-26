'use client';
import { useState, useEffect } from 'react';

export default function TaskPage() {
  const [step, setStep] = useState(1); // 1: Answer, 2: Confidence, 3: Feedback
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
 
  // Day 10: Timing State
  const [startTime, setStartTime] = useState<number>(0);
  const [finalTime, setFinalTime] = useState<number>(0);

  const currentQuestion = {
    text: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    correct_answer: "0.05"
  };

  // Start the timer as soon as the page loads
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   
    // Stop the timer
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    setFinalTime(durationInSeconds);

    setIsCorrect(answer.trim() === currentQuestion.correct_answer);
    setStep(2); // Move to Confidence Slider
  };

  const handleConfidenceSubmit = () => {
    // DATA BUNDLE READY FOR DAY 12:
    // { answer, isCorrect, confidence, response_time: finalTime }
    setStep(3);
  };

  return (
    <main className="p-24 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-purple-600 mb-8 font-serif italic">ReasonLab</h1>

      <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-purple-50">
       
        {step === 1 && (
          <form onSubmit={handleAnswerSubmit} className="space-y-6">
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-widest">Logic Task</h2>
            <p className="text-2xl text-gray-800 leading-relaxed font-medium">{currentQuestion.text}</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none text-xl"
              required
            />
            <button type="submit" className="w-full bg-purple-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-purple-700">
              Submit Answer
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-10 text-center py-4">
            <h2 className="text-3xl font-bold text-gray-800">How sure are you?</h2>
            <input
              type="range" min="1" max="5" step="1"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full h-4 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between font-black text-2xl text-purple-800 px-2">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
            <button onClick={handleConfidenceSubmit} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-purple-700">
              Confirm My Confidence
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 text-center">
            <div className={`p-10 rounded-3xl border-4 ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <p className="text-4xl font-black mb-4">{isCorrect ? "✅ SUCCESS" : "❌ INCORRECT"}</p>
              <p className="text-xl font-medium mb-2">Confidence: **{confidence}/5**</p>
              {/* Day 10 Display */}
              <p className="text-lg text-gray-600 italic">Thinking Time: **{finalTime.toFixed(2)} seconds**</p>
            </div>
            <button onClick={() => window.location.reload()} className="text-purple-600 font-bold text-lg hover:underline">
              Try Another Challenge
            </button>
          </div>
        )}
      </div>
    </main>
  );
}