'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ResearchDashboard() {
  const [stats, setStats] = useState({ totalTasks: 0, accuracy: '0.0', avgConfidence: 0, avgTime: '0.0' });
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('responses').select('question_id, is_correct, confidence, response_time').order('question_id', { ascending: true });

      if (data && (data as any[]).length > 0) {
        const res = data as any[];
        let correctCount = 0, confSum = 0, timeSum = 0;

        for (let i = 0; i < res.length; i++) {
          if (res[i].is_correct === true) correctCount++;
          confSum += (res[i].confidence || 0);
          timeSum += (res[i].response_time || 0);
        }

        setStats({
          totalTasks: res.length,
          accuracy: ((correctCount / res.length) * 100).toFixed(1),
          avgConfidence: parseFloat((confSum / res.length).toFixed(1)),
          avgTime: (timeSum / res.length).toFixed(2)
        });

        // AGGREGATE CHART LOGIC: Calculates % correct for each Question ID (1-20)
        // Ratio logic: 1/1 = 100%, 1/2 = 50%, 1/3 = 33.3% [Our conversation]
        const chartRows = [];
        for (let i = 1; i <= 20; i++) {
          const taskRes = res.filter((r: any) => r.question_id === i);
          const totalForTask = taskRes.length;
          const correctForTask = taskRes.filter((r: any) => r.is_correct === true).length;
          const taskAcc = totalForTask > 0 ? (correctForTask / totalForTask) * 100 : 0;
          chartRows.push({ name: `${i}`, accuracy: taskAcc });
        }
        setPerformanceData(chartRows);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const yLabels = ['100%', '80%', '60%', '40%', '20%', '0%'];

  return (
    <main className="min-h-screen bg-white p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b-[10px] border-black pb-6 flex justify-between items-end">
          <h1 className="text-6xl font-black uppercase tracking-tighter">Research Dashboard</h1>
          <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-black text-white font-black border-4 border-black hover:bg-white hover:text-black transition-all">Back to Lab</button>
        </header>

        {loading ? ( <div className="text-4xl font-black animate-pulse text-center py-20">SYNCING DATA...</div> ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[ {l:'TOTAL', v:stats.totalTasks}, {l:'ACCURACY', v:stats.accuracy+'%'}, {l:'CONF', v:stats.avgConfidence}, {l:'AVG. TIME', v:stats.avgTime+'s'} ].map((s) => (
                <div key={s.l} className="border-[6px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <h2 className="text-xl font-black uppercase">{s.l}</h2>
                  <p className="text-5xl font-black">{s.v}</p>
                </div>
              ))}
            </div>

            {/* PERFORMANCE CHART: Professional Bar Chart UI */}
            <div className="border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
              <h2 className="text-3xl font-black uppercase mb-10 border-b-4 border-black pb-2">Global Performance Profile (Tasks 1-20)</h2>
              <div className="flex h-[400px]">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between pr-6 pb-12 text-[12px] font-black text-gray-500 uppercase">
                  {yLabels.map(l => <span key={l}>{l}</span>)}
                </div>
               
                {/* Bar Area with Background Grid */}
                <div className="flex-1 flex items-end justify-between border-l-[6px] border-b-[6px] border-black pb-4 px-4 gap-2 relative bg-[linear-gradient(to_top,#f1f5f9_1px,transparent_1px)] bg-[length:100%_20%]">
                  {performanceData.map((t) => (
                    <div key={t.name} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* TOOLTIP ON HOVER */}
                      <div className="absolute -top-10 bg-black text-white text-[10px] px-2 py-1 font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 uppercase">
                        Acc: {Math.round(t.accuracy)}%
                      </div>
                      {/* THE BAR */}
                      <div
                        className="w-full bg-black transition-all duration-500 group-hover:bg-blue-600 border-x-2 border-white"
                        style={{ height: `${t.accuracy}%`, minHeight: '2px' }}
                      ></div>
                      {/* X-AXIS LABEL */}
                      <span className="absolute -bottom-10 text-[10px] font-black">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-14 text-center font-black uppercase text-sm tracking-widest text-gray-400">Numerical Question Sequence</div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
