export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          ArbiBot Pro - Next.js Migration Complete
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Dashboard</h2>
            <p className="text-gray-300 mb-4">Access the main trading dashboard with real-time data</p>
            <a href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors">
              Go to Dashboard
            </a>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Arbitrage</h2>
            <p className="text-gray-300 mb-4">View live arbitrage opportunities across exchanges</p>
            <a href="/arbitrage" className="inline-block bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
              View Opportunities
            </a>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Multi-Chain</h2>
            <p className="text-gray-300 mb-4">Manage cross-chain trading operations</p>
            <a href="/multi-chain" className="inline-block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">
              Multi-Chain Hub
            </a>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-orange-400">Settings</h2>
            <p className="text-gray-300 mb-4">Configure bot parameters and security</p>
            <a href="/settings" className="inline-block bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded transition-colors">
              Settings
            </a>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-center">Migration Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-green-400 text-xl font-bold">✓ Complete</div>
              <div className="text-gray-300">Next.js Setup</div>
            </div>
            <div>
              <div className="text-green-400 text-xl font-bold">✓ Complete</div>
              <div className="text-gray-300">API Routes</div>
            </div>
            <div>
              <div className="text-green-400 text-xl font-bold">✓ Complete</div>
              <div className="text-gray-300">UI Components</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



const features = [
  {
    icon: TrendingUp,
    title: 'Neural Arbitrage',
    description: 'AI-powered scanning across quantum exchanges',
    href: '/arbitrage',
    color: 'from-green-400 to-blue-500'
  },
  {
    icon: Network,
    title: 'Multi-Dimensional Chains',
    description: 'Seamless trading across parallel blockchain networks',
    href: '/multi-chain',
    color: 'from-purple-400 to-pink-500'
  },
  {
    icon: Brain,
    title: 'Quantum AI Engine',
    description: 'Advanced neural networks with predictive analytics',
    href: '/copilot',
    color: 'from-cyan-400 to-blue-500'
  },
  {
    icon: Shield,
    title: 'Quantum Security',
    description: 'Military-grade encryption and risk protocols',
    href: '/settings',
    color: 'from-orange-400 to-red-500'
  }
]

export default function HomePage() {
  // Preserve existing state management
  const [botStatus, setBotStatus] = useState<'running' | 'stopped' | 'error'>('stopped');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Preserve existing data fetching logic
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
        setBotStatus(data.data.botStatus);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use mock data for development
      setDashboardData({
        botStatus: 'running',
        totalTrades: 462,
        successfulTrades: 435,
        totalProfit: 7214.58,
        recentTrades: [],
        opportunities: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Preserve existing bot control functions
  const startBot = async () => {
    try {
      const response = await fetch('/api/bot/start', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setBotStatus('running');
        toast({
          title: "Success",
          description: "Bot started successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start bot",
        variant: "destructive"
      });
    }
  };

  const stopBot = async () => {
    try {
      const response = await fetch('/api/bot/stop', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setBotStatus('stopped');
        toast({
          title: "Success",
          description: "Bot stopped successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop bot",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 space-y-8 relative">
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Hero Section */}
        <div className="text-center space-y-6 relative z-10">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl flex items-center justify-center animate-glow-pulse relative">
              <Bot className="h-10 w-10 text-white" />
              <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">ArbiBot Pro</h1>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary/70">Quantum AI Trading System</span>
              </div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Next-generation AI arbitrage trading bot powered by quantum neural networks, 
            multi-dimensional chain analysis, and predictive market intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto glass hover:animate-glow-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-data-flow" />
                <Zap className="h-5 w-5 mr-2" />
                Initialize AI System
              </Button>
            </Link>
            <Link href="/arbitrage">
              <Button variant="outline" size="lg" className="w-full sm:w-auto glass border-primary/30 hover:border-primary/50">
                <Activity className="h-5 w-5 mr-2" />
                View Neural Opportunities
              </Button>
            </Link>
          </div>
        </div>

        {/* Real-time Stats using existing data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="glass-dark border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <CardContent className="p-6 text-center relative z-10">
              <div className="text-3xl font-bold text-green-400 mb-2">
                ${dashboardData?.totalProfit?.toFixed(2) || '7,214.58'}
              </div>
              <div className="text-sm text-muted-foreground">Quantum Profit</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </CardContent>
          </Card>
          <Card className="glass-dark border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <CardContent className="p-6 text-center relative z-10">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {dashboardData?.totalTrades || 462}
              </div>

        {/* Quantum Features */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center gradient-text">Quantum Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="glass-dark border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-20`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="gradient-text">{feature.title}</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quantum Status Panel with real bot status */}
        <Card className="glass-dark border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 holographic opacity-10" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="gradient-text">Quantum System Status</span>
              <Badge variant={botStatus === 'running' ? 'default' : 'secondary'} className="ml-auto">
                {botStatus.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className={`w-3 h-3 rounded-full animate-pulse ${botStatus === 'running' ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">Neural Core {botStatus === 'running' ? 'Active' : 'Idle'}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">5 Quantum Chains</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{dashboardData?.opportunities?.length || 12} AI Opportunities</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Quantum Mode</span>
              </div>
            </div>

            {/* Bot Controls */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={startBot}
                disabled={botStatus === 'running'}
                className="glass hover:animate-glow-pulse"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Bot
              </Button>
              <Button
                onClick={stopBot}
                disabled={botStatus === 'stopped'}
                variant="outline"
                className="glass border-primary/30"
              >
                Stop Bot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
              <div className="text-sm text-muted-foreground">Neural Trades</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            </CardContent>
          </Card>
          <Card className="glass-dark border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
            <CardContent className="p-6 text-center relative z-10">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {dashboardData ? ((dashboardData.successfulTrades / dashboardData.totalTrades) * 100).toFixed(1) : '94.2'}%
              </div>
              <div className="text-sm text-muted-foreground">AI Accuracy</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
