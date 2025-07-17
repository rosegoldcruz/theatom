"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  TrendingUp,
  Network,
  Settings,
  Activity,
  Wallet,
  Bot,
  Zap,
  Shield,
  Cpu
} from 'lucide-react'

interface SidebarContentProps {
  onItemClick?: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: 'Live'
  },
  {
    name: 'Arbitrage',
    href: '/arbitrage',
    icon: TrendingUp,
    badge: '12'
  },
  {
    name: 'Multi-Chain',
    href: '/multi-chain',
    icon: Network
  },
  {
    name: 'AI Copilot',
    href: '/copilot',
    icon: Bot,
    badge: 'AI'
  },
  {
    name: 'Wallet',
    href: '/wallet',
    icon: Wallet
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

export function SidebarContent({ onItemClick }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Holographic overlay */}
      <div className="absolute inset-0 holographic opacity-20 pointer-events-none" />
      
      {/* Logo/Brand */}
      <div className="p-6 border-b border-primary/20 relative">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center animate-glow-pulse relative">
            <Bot className="h-7 w-7 text-white" />
            <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">ArbiBot Pro</h2>
            <p className="text-xs text-primary/70 flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>AI-Powered Trading</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href} onClick={onItemClick}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-12 text-left relative overflow-hidden transition-all duration-300',
                  isActive 
                    ? 'bg-primary/20 font-medium border border-primary/30 animate-glow-pulse' 
                    : 'hover:bg-primary/10 hover:border-primary/20 border border-transparent'
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-data-flow" />
                )}
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0 relative z-10" />
                <span className="flex-1 relative z-10">{item.name}</span>
                {item.badge && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'ml-2 text-xs relative z-10',
                      item.badge === 'AI' && 'bg-primary/20 text-primary border-primary/30 animate-pulse',
                      item.badge === 'Live' && 'bg-green-500/20 text-green-400 border-green-500/30'
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>
      
      {/* AI Status Panel */}
      <div className="p-4 border-t border-primary/20 space-y-4">
        <div className="text-xs text-primary/70 mb-3 flex items-center space-x-2">
          <Cpu className="h-3 w-3" />
          <span>AI System Status</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">Neural Network</span>
            </div>
            <span className="text-xs text-green-400">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm">5 Chains</span>
            </div>
            <span className="text-xs text-blue-400">ONLINE</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center space-x-2">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-sm">Security</span>
            </div>
            <span className="text-xs text-primary">SECURE</span>
          </div>
        </div>
      </div>
    </div>
  )
}