export default function PlatformPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-6 text-[#00a489]">How ATOM Works</h1>
      <ol className="space-y-8 text-lg">
        <li>
          <b>1. Connect:</b> Sign up and link your wallet in seconds.<br/>
          <span className="text-gray-600">No credit card required for 30-day trial.</span>
        </li>
        <li>
          <b>2. Monitor & Trade:</b> Let ATOM's AI engine scan 50+ DEXs for real-time opportunities.  
          <span className="block text-gray-600">Everything is automated and MEV-protected by default.</span>
        </li>
        <li>
          <b>3. Withdraw Profits:</b> Claim profits or reinvest at any time.<br/>
          <span className="text-gray-600">Funds always in your control—no lockups.</span>
        </li>
      </ol>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <div className="bg-gray-100 rounded-xl p-6 flex-1">
          <div className="text-xl font-semibold mb-2">1-Minute Explainer (Video Placeholder)</div>
          <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center text-gray-500 text-3xl">🎥</div>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 flex-1">
          <div className="text-xl font-semibold mb-2">Product Screenshots</div>
          <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center text-gray-400">📸</div>
        </div>
      </div>
    </main>
  )
}
