import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/stores/authStore'
import { useActivityStore } from '@/stores/activityStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { Shield, AlertTriangle, Crown, Zap, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { createCheckoutSession, cancelSubscription as cancelStripeSubscription } from '@/services/subscriptionService'

export default function SettingsPage() {
  const { userName, personality, updatePersonality, addTrainingSample } = useAuthStore()
  const { clearActivities } = useActivityStore()
  const { tier, getRemainingMessages, setSubscription, stripeSubscriptionId, isPremium } = useSubscriptionStore()

  const [localPersonality, setLocalPersonality] = useState(personality)
  const [newSample, setNewSample] = useState('')
  const [autoApprove, setAutoApprove] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const remainingMessages = getRemainingMessages()

  const handleSavePersonality = () => {
    updatePersonality(localPersonality)
    toast.success('Personality settings updated')
  }

  const handleAddSample = () => {
    if (!newSample.trim()) {
      toast.error('Please enter a writing sample')
      return
    }
    
    addTrainingSample(newSample)
    setNewSample('')
    toast.success('Training sample added')
  }

  const handleEmergencyShutdown = () => {
    if (confirm('This will pause all AI activity. Continue?')) {
      toast.success('All AI activity paused')
      // In real app, this would disable all automation
    }
  }

  const handleClearHistory = () => {
    if (confirm('This will delete all activity logs. This cannot be undone.')) {
      clearActivities()
      toast.success('Activity history cleared')
    }
  }

  const handleUpgradeToPremium = async () => {
    setIsUpgrading(true)
    try {
      const session = await createCheckoutSession('user-123', 'user@example.com')
      // Redirect to Stripe Checkout
      window.location.href = session.url
    } catch (error) {
      toast.error('Failed to start checkout process')
      console.error(error)
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!stripeSubscriptionId) {
      toast.error('No active subscription found')
      return
    }

    if (confirm('Are you sure you want to cancel your Premium subscription? You will lose access to unlimited messages and premium features.')) {
      try {
        await cancelStripeSubscription(stripeSubscriptionId)
        setSubscription('free')
        toast.success('Subscription canceled successfully')
      } catch (error) {
        toast.error('Failed to cancel subscription')
        console.error(error)
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-xl text-muted-foreground">
            Manage your Doppel's personality and behavior
          </p>
        </div>

        {/* Subscription Section */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-primary mt-1" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-semibold">Subscription</h2>
                  <Badge variant={tier === 'premium' ? 'default' : 'secondary'}>
                    {tier === 'premium' ? 'Premium' : 'Free'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {tier === 'premium'
                    ? 'You have unlimited access to all features'
                    : 'Upgrade to Premium for unlimited messages and exclusive features'}
                </p>
              </div>
            </div>
          </div>

          {tier === 'free' && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 p-4 bg-background rounded-lg border">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">Daily Messages</div>
                  <div className="text-sm text-muted-foreground">
                    {remainingMessages === -1 ? 'Unlimited' : `${remainingMessages} remaining today`}
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {remainingMessages === -1 ? '∞' : remainingMessages}/4
                </div>
              </div>

              <div className="p-6 bg-background rounded-lg border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Premium Features
                </h3>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Unlimited daily messages
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Conversation paste-and-reply feature
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Advanced AI capabilities
                  </li>
                </ul>
                <div className="text-2xl font-bold mb-4">$9.99<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <Button
                  className="w-full"
                  onClick={handleUpgradeToPremium}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? 'Processing...' : 'Upgrade to Premium'}
                </Button>
              </div>
            </div>
          )}

          {tier === 'premium' && (
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Active Premium Benefits</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Unlimited messages
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Conversation paste-and-reply
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Priority support
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </Card>

        {/* Personality Settings */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Personality Profile</h2>
          
          <div className="space-y-8 mb-6">
            <PersonalitySlider
              label="Communication tone"
              leftLabel="Formal"
              rightLabel="Casual"
              value={localPersonality.formalCasual}
              onChange={(val) => setLocalPersonality({ ...localPersonality, formalCasual: val })}
            />
            <PersonalitySlider
              label="Response length"
              leftLabel="Short & concise"
              rightLabel="Detailed & thorough"
              value={localPersonality.shortDetailed}
              onChange={(val) => setLocalPersonality({ ...localPersonality, shortDetailed: val })}
            />
            <PersonalitySlider
              label="Directness"
              leftLabel="Polite & diplomatic"
              rightLabel="Direct & straightforward"
              value={localPersonality.politeDir}
              onChange={(val) => setLocalPersonality({ ...localPersonality, politeDir: val })}
            />
            <PersonalitySlider
              label="Decision style"
              leftLabel="Emotional & empathetic"
              rightLabel="Logical & analytical"
              value={localPersonality.emotionalLogical}
              onChange={(val) => setLocalPersonality({ ...localPersonality, emotionalLogical: val })}
            />
          </div>

          <Button onClick={handleSavePersonality}>
            Save Personality Settings
          </Button>
        </Card>

        {/* Training Data */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Training Data</h2>
          <p className="text-muted-foreground mb-6">
            Add writing samples to improve your Doppel's accuracy
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="sample" className="mb-2 block">
                Writing Sample
              </Label>
              <Textarea
                id="sample"
                placeholder="Paste an email, message, or any text that represents your writing style..."
                value={newSample}
                onChange={(e) => setNewSample(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <Button onClick={handleAddSample}>
              Add Training Sample
            </Button>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Training Samples</div>
                <div className="text-sm text-muted-foreground">
                  {personality.trainingSamples.length} samples added
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {personality.learningProgress}%
              </div>
            </div>
          </div>
        </Card>

        {/* Automation Settings */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Automation</h2>
          <p className="text-muted-foreground mb-6">
            Control how your Doppel assists you
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium">Auto-approve suggestions</div>
                <div className="text-sm text-muted-foreground">
                  Automatically accept high-confidence drafts
                </div>
              </div>
              <Switch
                checked={autoApprove}
                onCheckedChange={setAutoApprove}
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Safety */}
        <Card className="p-6 border-primary/50">
          <div className="flex items-start gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold mb-2">Privacy & Safety</h2>
              <p className="text-muted-foreground">
                Your data is encrypted and never shared. You're in full control.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleClearHistory}
            >
              Clear Activity History
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleEmergencyShutdown}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Shutdown
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function PersonalitySlider({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange
}: {
  label: string
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <Label className="text-base">{label}</Label>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={100}
        step={1}
        className="w-full mb-2"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}
