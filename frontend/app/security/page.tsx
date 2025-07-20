export default function SecurityPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-6 text-[#00a489]">Security & Compliance</h1>
      <ul className="space-y-6 text-lg">
        <li>
          <span className="font-semibold">256-bit SSL encryption:</span> All traffic secured end-to-end.
        </li>
        <li>
          <span className="font-semibold">SOC 2 Type II certified:</span> Independent audits, rigorous controls.
        </li>
        <li>
          <span className="font-semibold">Non-custodial & fully transparent:</span> You keep control of your funds and keys.
        </li>
        <li>
          <span className="font-semibold">99.9% uptime:</span> Global distributed infrastructure, full backups, 24/7 monitoring.
        </li>
        <li>
          <span className="font-semibold">MEV protection:</span> All trades routed privately to avoid frontrunning and sandwich attacks.
        </li>
      </ul>
    </main>
  )
}
