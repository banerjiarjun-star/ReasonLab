'use client';
import { useState, useEffect } from 'react';
import { getExperimentStats } from '../lib/analytics';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
  ComposedChart, Area
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getExperimentStats();
      if (data) setStats(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="p-24 text-center text-purple-600 font-bold animate-pulse">Analyzing Behavioral Patterns...</div>;

  return (
    <main className="p-12 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 font-serif italic mb-2">ReasonLab Analytics</h1>
        <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">Phase 3: Behavioral Research Insights</p>
      </header>

      {/* TOP LEVEL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-purple-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Dataset</p>
          <p className="text-4xl font-black text-gray-800">{stats.reduce((acc, curr) => acc + curr.total_responses, 0)} <span className="text-lg font-normal text-gray-400">Responses</span></p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-green-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Global Accuracy</p>
          <p className="text-4xl font-black text-gray-800">
            {(stats.reduce((acc, curr) => acc + curr.accuracy_rate, 0) / stats.length || 0).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-blue-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Latency</p>
          <p className="text-4xl font-black text-gray-800">
            {(stats.reduce((acc, curr) => acc + curr.avg_response_time, 0) / stats.length || 0).toFixed(2)}s
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
        {/* CHART 1: ACCURACY VS CONFIDENCE (Calibration) */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Metacognitive Calibration</h2>
          <p className="text-sm text-gray-500 mb-8 italic">Comparing how sure people feel vs. how right they actually are.</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="question_id" label={{ value: 'Question', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" domain={[6]} label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" domain={[7]} label={{ value: 'Confidence (1-5)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="accuracy_rate" fill="#9333ea" radius={[10, 10, 0, 0]} name="Accuracy (%)" />
                <Line yAxisId="right" type="monotone" dataKey="avg_confidence" stroke="#ef4444" strokeWidth={4} dot={{ r: 6 }} name="Confidence Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: COGNITIVE EFFORT (Response Time) */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cognitive Effort per Task</h2>
          <p className="text-sm text-gray-500 mb-8 italic">Average time (seconds) spent processing each logic challenge.</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="question_id" />
                <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area type="monotone" dataKey="avg_response_time" stroke="#3b82f6" fill="#dbeafe" strokeWidth={3} name="Processing Time" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </main>
  );
}

// Helper to make AreaChart work since it was missing from original import
import { AreaChart } from 'recharts';