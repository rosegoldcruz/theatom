'use client'
import { useAppContext } from '@/contexts/AppContext'
import { TradingMetrics } from '@/components/TradingMetrics'

export default function Analytics() {
  const { state } = useAppContext()
  const { isDark } = state

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Detailed performance analytics and insights
        </p>
      </div>
      <TradingMetrics />
      <div className={`mt-8 p-8 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} text-center`}>
        <h3 className="text-lg font-medium mb-2">Advanced Analytics Coming Soon</h3>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Detailed charts, performance metrics, and trading insights will be available here.
        </p>
      </div>
    </div>
  )
}
