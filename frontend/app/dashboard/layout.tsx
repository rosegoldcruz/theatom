import { AppProvider } from '@/contexts/AppContext'
import { ATOMDashboardWrapper } from '@/components/ATOMDashboardWrapper'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProvider>
      <ATOMDashboardWrapper>
        {children}
      </ATOMDashboardWrapper>
    </AppProvider>
  )
}
