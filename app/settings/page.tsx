"use client"

import React from 'react'
import { AppLayout } from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Shield, Palette, Bell } from 'lucide-react'

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Quantum Security</h1>
          <p className="text-muted-foreground mt-2">Configure your AI trading parameters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-dark border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span className="gradient-text">Trading Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure bot parameters, risk levels, and trading strategies.</p>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="gradient-text">Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage API keys, wallet connections, and security protocols.</p>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-primary" />
                <span className="gradient-text">Theme Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Customize the interface theme and visual preferences.</p>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span className="gradient-text">Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure alerts, notifications, and reporting preferences.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
