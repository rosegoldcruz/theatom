import Link from "next/link";

export function Navbar() {
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
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/platform" className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-[#00a489] hover:text-[#00a489] transition-all transform hover:scale-105">Platform</Link>
            <Link href="/security" className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-[#00a489] hover:text-[#00a489] transition-all transform hover:scale-105">Security</Link>
            <Link href="/pricing" className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-[#00a489] hover:text-[#00a489] transition-all transform hover:scale-105">Pricing</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
