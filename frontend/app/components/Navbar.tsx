import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-purple-600 font-serif italic">ReasonLab</Link>
        <div className="space-x-6 font-bold text-sm uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
          <Link href="/dashboard" className="hover:text-purple-600 transition-colors">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}
