"use client"

import React, { useState } from 'react'
import { SidebarContent } from './SidebarContent'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Bell, Search, User, Menu, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden lg:flex w-72 flex-shrink-0 relative z-10">
        <div className="w-full glass-dark border-r border-primary/20">
          <SidebarContent />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Futuristic Top Bar */}
        <header className="h-16 glass-dark border-b border-primary/20 flex items-center justify-between px-4 relative">
          {/* Scan line effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile Sidebar Toggle */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-primary/20 animate-glow-pulse">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 glass-dark border-primary/20">
                <SidebarContent onItemClick={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            
            {/* AI Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium gradient-text">AI ACTIVE</span>
            </div>
            
            {/* Search Bar */}
            <div className="hidden sm:flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/70" />
                <Input
                  placeholder="Search trades, pairs..."
                  className="pl-10 h-9 glass border-primary/20 focus:border-primary/50 bg-background/50"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/20 relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/20">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}