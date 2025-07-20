'use client'
import { useAppContext } from '@/contexts/AppContext'

export default function History() {
  const { state } = useAppContext()
  const { isDark } = state

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Trade History</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Complete history of all executed trades
        </p>
      </div>
      <div className={`p-8 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} text-center`}>
        <h3 className="text-lg font-medium mb-2">Trade History Coming Soon</h3>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Detailed trade history with filters, search, and export functionality will be available here.
        </p>
      </div>
    </div>
  )
}
