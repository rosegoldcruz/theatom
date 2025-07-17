"use client"

import React from 'react'
import { AppLayout } from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, MessageSquare, Zap, Activity } from 'lucide-react'

export default function CopilotPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Quantum AI Engine</h1>
          <p className="text-muted-foreground mt-2">Advanced neural networks with predictive analytics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="glass-dark border-primary/20 h-96">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="gradient-text">AI Chat Interface</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                    <p>AI Copilot interface coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="glass-dark border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">AI Status</p>
                    <p className="font-bold text-primary">ACTIVE</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Neural Processing</p>
                    <p className="font-bold text-green-400">98.7%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
