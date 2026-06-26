export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-purple-800 italic">ReasonLab</h1>
      <p className="mt-4 text-2xl text-gray-700">Mapping the Curiosity Graph</p>
      <div className="mt-12 space-x-6">
        <a href="/task" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all">
          Start Task
        </a>
        <a href="/dashboard" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-xl text-lg font-semibold transition-all">
          View Data
        </a>
      </div>
    </main>
  )
}