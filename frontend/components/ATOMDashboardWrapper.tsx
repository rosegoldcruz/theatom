'use client'
import { usePathname } from 'next/navigation'
import { useAppContext } from '@/contexts/AppContext'
import { ATOMSidebar } from '@/components/ATOMSidebar'
import { Header } from '@/components/Header'

export function ATOMDashboardWrapper({ children }: { children: React.ReactNode }) {
  const { state, actions } = useAppContext()
  const { isDark, isMobile, isSidebarOpen } = state

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex">
        {/* Your existing sidebar */}
        {!isMobile && <ATOMSidebar />}

        <div className="flex-1">
          {/* Your existing header */}
          <Header />
          <main className="overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Your existing mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={actions.toggleSidebar}
          />
          <ATOMSidebar className="fixed inset-y-0 left-0 z-50" />
        </>
      )}
    </div>
  )
}
