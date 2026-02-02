import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, LayoutDashboard, PenLine, Database, Settings, LogOut, MessageSquare, Crown } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

interface DashboardLayoutProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, premium: false },
  { path: '/write', label: 'Writing Studio', icon: PenLine, premium: false },
  { path: '/conversation-reply', label: 'Reply AI', icon: MessageSquare, premium: true },
  { path: '/memory', label: 'Memory', icon: Database, premium: false },
  { path: '/settings', label: 'Settings', icon: Settings, premium: false }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { userName } = useAuthStore()
  const { tier, getRemainingMessages } = useSubscriptionStore()
  const remainingMessages = getRemainingMessages()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">Doppel</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'secondary' : 'ghost'}
                    onClick={() => navigate(item.path)}
                    className={isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {item.premium && (
                      <Crown className="w-3 h-3 ml-1 text-primary" />
                    )}
                  </Button>
                )
              })}
            </nav>

            <div className="flex items-center gap-4">
              {tier === 'free' && remainingMessages !== -1 && (
                <Badge variant="outline" className="hidden sm:flex gap-1">
                  {remainingMessages}/4 messages
                </Badge>
              )}
              {tier === 'premium' && (
                <Badge className="hidden sm:flex gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </Badge>
              )}
              <div className="hidden sm:block text-sm text-muted-foreground">
                {userName}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-border bg-background">
        <div className="container mx-auto px-4 py-2">
          <div className="grid grid-cols-4 gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'secondary' : 'ghost'}
                  onClick={() => navigate(item.path)}
                  size="sm"
                  className={`flex-col h-auto py-2 ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
