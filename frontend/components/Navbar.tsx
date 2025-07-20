import Link from "next/link";

export function Navbar({ onSignIn, onStartTrading }: { onSignIn: () => void, onStartTrading: () => void }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 bg-[#00a489] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </Link>
            <span className="text-xl font-bold text-[#383838]">ATOM</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/platform" className="text-gray-600 hover:text-[#00a489] transition-colors">Platform</Link>
            <Link href="/security" className="text-gray-600 hover:text-[#00a489] transition-colors">Security</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-[#00a489] transition-colors">Pricing</Link>
            <button
              onClick={onSignIn}
              className="bg-[#00a489] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#008a73] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onStartTrading}
              className="bg-[#4c82f7] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#3b72e6] transition-colors"
            >
              Start Trading
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
