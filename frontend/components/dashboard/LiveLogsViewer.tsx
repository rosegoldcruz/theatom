'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Download, Trash2, Terminal } from 'lucide-react'

interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  source: string
  message: string
}

export default function LiveLogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bot/logs?limit=200')
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch logs')
      }
    } catch (err) {
      setError('Network error: Unable to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  // Filter logs based on level
  useEffect(() => {
    if (levelFilter === 'all') {
      setFilteredLogs(logs)
    } else {
      setFilteredLogs(logs.filter(log => log.level === levelFilter))
    }
  }, [logs, levelFilter])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [filteredLogs, autoScroll])

  // Poll logs every 5 seconds
  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getLevelBadge = (level: string) => {
    const variants = {
      debug: 'secondary',
      info: 'default',
      warn: 'destructive',
      error: 'destructive'
    } as const

    const colors = {
      debug: 'bg-gray-500',
      info: 'bg-blue-500',
      warn: 'bg-yellow-500',
      error: 'bg-red-500'
    }

    return (
      <Badge 
        variant={variants[level as keyof typeof variants] || 'outline'}
        className={`${colors[level as keyof typeof colors]} text-white text-xs`}
      >
        {level.toUpperCase()}
      </Badge>
    )
  }

  const getSourceBadge = (source: string) => {
    const colors = {
      bot: 'bg-green-600',
      system: 'bg-purple-600',
      error: 'bg-red-600'
    }

    return (
      <Badge 
        variant="outline" 
        className={`${colors[source as keyof typeof colors] || 'bg-gray-600'} text-white text-xs`}
      >
        {source}
      </Badge>
    )
  }

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bot-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/bot/logs', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setLogs([])
        setFilteredLogs([])
      }
    } catch (err) {
      console.error('Failed to clear logs:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Live Bot Logs
            </CardTitle>
            <CardDescription>
              Real-time logs from the arbitrage bot
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLogs}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} log entries
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
          </div>
        </div>

        <ScrollArea className="h-96 w-full rounded-md border p-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? 'Loading logs...' : 'No logs found'}
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 font-mono text-sm"
                >
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className="flex gap-1">
                    {getLevelBadge(log.level)}
                    {getSourceBadge(log.source)}
                  </div>
                  <div className="flex-1 break-words">
                    {log.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Updates every 5 seconds • {autoScroll ? 'Auto-scrolling enabled' : 'Auto-scrolling disabled'}
        </div>
      </CardContent>
    </Card>
  )
}
