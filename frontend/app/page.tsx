'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4 font-serif italic">ReasonLab</h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl">
        Mapping the architecture of human cognition through logic, confidence, and curiosity.
      </p>
      <Link
        href="/task"
        className="bg-purple-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-purple-700 transition-all active:scale-95"
      >
        Enter the Research Lab →
      </Link>
    </main>
  );
}