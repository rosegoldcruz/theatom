export default function PricingPage() {
  return (
    <main className="max-w-3xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-6 text-[#00a489]">Pricing & Plans</h1>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-white rounded-xl p-8 shadow border border-gray-200">
          <h2 className="text-2xl font-bold mb-2">Free Trial</h2>
          <div className="text-lg mb-3">30 days. No card required. All features unlocked.</div>
          <div className="text-3xl font-bold text-[#00a489] mb-2">$0</div>
        </div>
        <div className="bg-white rounded-xl p-8 shadow border border-gray-200">
          <h2 className="text-2xl font-bold mb-2">Pro Subscription</h2>
          <div className="text-lg mb-3">Advanced analytics, priority support, unlimited bots.</div>
          <div className="text-3xl font-bold text-[#00a489] mb-2">$59 <span className="text-xl text-gray-600">/mo</span></div>
        </div>
      </div>
      <div className="text-gray-500 mt-10">* Stripe integration coming soon. All payments handled via secure, PCI-compliant flows.</div>
    </main>
  )
}
