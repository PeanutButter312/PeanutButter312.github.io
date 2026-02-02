import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Brain, Shield, Zap, Lock, Eye, MessageSquare } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0 -z-10" />
        
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Privacy-First AI</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Your AI Twin,
              <br />
              <span className="text-gradient">Not Another Bot</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Train an AI that writes, responds, and decides <em>like you</em>. 
              Stay in control while your Doppelgänger handles the rest.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 h-14 gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => navigate('/onboarding')}
              >
                <Brain className="w-5 h-5 mr-2" />
                Create Your Doppel
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 h-14"
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="Learns Your Style"
            description="Train your AI twin with writing samples and personality sliders. The more you teach, the better it understands you."
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Writes Like You"
            description="Draft texts, emails, and messages that match your tone. Get a confidence score for every suggestion."
          />
          <FeatureCard
            icon={<Eye className="w-8 h-8" />}
            title="Always Ask Permission"
            description="Your Doppel never acts alone. Review, approve, or reject every action with full transparency."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Your Data, Your Rules"
            description="End-to-end encryption. Edit or delete memories anytime. No data sold or shared. Ever."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Smart Suggestions"
            description="Get reply suggestions based on context, relationships, and your communication patterns."
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Emergency Shutdown"
            description="One tap to pause all AI activity. Complete control when you need it most."
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            This is you — just faster, calmer, and always available
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-12">
            <Step
              number="1"
              title="Define Your Personality"
              description="Set communication preferences: formal vs casual, brief vs detailed, polite vs direct. Your Doppel adapts to match."
            />
            <Step
              number="2"
              title="Train Your Twin"
              description="Provide writing samples, chat history, or emails. The AI learns your vocabulary, tone, and decision patterns."
            />
            <Step
              number="3"
              title="Let It Assist"
              description="Your Doppel drafts messages, suggests replies, and helps with decisions. You stay in control with approval workflows."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center gradient-primary rounded-3xl p-12 lg:p-16">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to meet your Doppelgänger?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Start training your AI twin in minutes. No credit card required.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 h-14"
            onClick={() => navigate('/onboarding')}
          >
            Get Started Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">Doppel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Doppel. Privacy-first AI assistance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors">
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
