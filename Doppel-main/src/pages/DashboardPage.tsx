import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useActivityStore } from '@/stores/activityStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  Brain, 
  PenLine, 
  Calendar, 
  Database, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { userName, personality } = useAuthStore()
  const { activities } = useActivityStore()

  const pendingActions = activities.filter(a => a.status === 'pending').length
  const completedToday = activities.filter(a => 
    a.status === 'completed' && 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            What would you like your Doppel to handle today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={<Brain className="w-6 h-6" />}
            label="Learning Progress"
            value={`${personality.learningProgress}%`}
            description="Based on training data"
            color="text-primary"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Pending Approvals"
            value={pendingActions.toString()}
            description="Awaiting your review"
            color="text-yellow-500"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Completed Today"
            value={completedToday.toString()}
            description="Actions approved"
            color="text-green-500"
          />
        </div>

        {/* Primary Actions */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ActionCard
              icon={<PenLine className="w-8 h-8" />}
              title="Writing Studio"
              description="Draft messages, emails, and texts that sound like you"
              action="Start Writing"
              onClick={() => navigate('/write')}
              gradient
            />
            <ActionCard
              icon={<Database className="w-8 h-8" />}
              title="Memory & Context"
              description="Manage what your Doppel knows about you"
              action="View Memories"
              onClick={() => navigate('/memory')}
            />
          </div>
        </div>

        {/* Personality Overview */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Your Personality Profile</h2>
              <p className="text-muted-foreground">
                How your Doppel understands your communication style
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/settings')}
            >
              Edit Profile
            </Button>
          </div>

          <div className="space-y-6">
            <PersonalityBar
              label="Communication Tone"
              leftLabel="Formal"
              rightLabel="Casual"
              value={personality.formalCasual}
            />
            <PersonalityBar
              label="Response Length"
              leftLabel="Short"
              rightLabel="Detailed"
              value={personality.shortDetailed}
            />
            <PersonalityBar
              label="Directness"
              leftLabel="Polite"
              rightLabel="Direct"
              value={personality.politeDir}
            />
            <PersonalityBar
              label="Decision Style"
              leftLabel="Emotional"
              rightLabel="Logical"
              value={personality.emotionalLogical}
            />
          </div>
        </Card>

        {/* Recent Activity */}
        {activities.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      activity.status === 'approved' || activity.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {activity.status === 'pending' ? <Clock className="w-5 h-5" /> :
                       activity.status === 'approved' || activity.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                       <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold mb-1">{activity.title}</h3>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        {activity.confidence && (
                          <div className="text-right">
                            <div className="text-sm font-medium">{activity.confidence}%</div>
                            <div className="text-xs text-muted-foreground">confidence</div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, label, value, description, color }: {
  icon: React.ReactNode
  label: string
  value: string
  description: string
  color: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </Card>
  )
}

function ActionCard({ icon, title, description, action, onClick, gradient }: {
  icon: React.ReactNode
  title: string
  description: string
  action: string
  onClick: () => void
  gradient?: boolean
}) {
  return (
    <Card className={`p-6 ${gradient ? 'gradient-primary text-white border-0' : ''}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
        gradient ? 'bg-white/20' : 'bg-primary/10 text-primary'
      }`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className={`mb-6 ${gradient ? 'text-white/90' : 'text-muted-foreground'}`}>
        {description}
      </p>
      <Button 
        onClick={onClick}
        variant={gradient ? 'secondary' : 'default'}
        className="w-full"
      >
        {action}
      </Button>
    </Card>
  )
}

function PersonalityBar({ label, leftLabel, rightLabel, value }: {
  label: string
  leftLabel: string
  rightLabel: string
  value: number
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}
